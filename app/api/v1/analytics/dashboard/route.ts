import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);

    // 1. Fetch all attempts by this user
    const attempts = await prisma.userAttempt.findMany({
      where: { userId: user.id },
      include: {
        question: {
          include: {
            topics: {
              include: {
                topic: { include: { subject: true } },
              },
            },
          },
        },
      },
    });

    const totalAttempts = attempts.length;
    const correctAttempts = attempts.filter((a) => a.isCorrect).length;
    const incorrectAttempts = totalAttempts - correctAttempts;
    const overallAccuracy =
      totalAttempts > 0 ? Number(((correctAttempts / totalAttempts) * 100).toFixed(1)) : 0;

    const totalSeconds = attempts.reduce((acc, curr) => acc + (curr.timeSpentSeconds || 0), 0);
    const totalHours = Number((totalSeconds / 3600).toFixed(1));

    // 2. Aggregate by Subject
    const subjectStatsMap: Record<
      string,
      { subject: string; attempted: number; correct: number }
    > = {};

    // 3. Aggregate by Topic to find Weak Areas
    const topicStatsMap: Record<
      string,
      { topic: string; subject: string; attempted: number; correct: number }
    > = {};

    for (const a of attempts) {
      const top = a.question.topics[0]?.topic;
      const subj = top?.subject?.name || "General Studies";
      const topicName = top?.name || "General Concept";

      if (!subjectStatsMap[subj]) {
        subjectStatsMap[subj] = { subject: subj, attempted: 0, correct: 0 };
      }
      subjectStatsMap[subj].attempted++;
      if (a.isCorrect) subjectStatsMap[subj].correct++;

      if (!topicStatsMap[topicName]) {
        topicStatsMap[topicName] = {
          topic: topicName,
          subject: subj,
          attempted: 0,
          correct: 0,
        };
      }
      topicStatsMap[topicName].attempted++;
      if (a.isCorrect) topicStatsMap[topicName].correct++;
    }

    const subjectPerformance = Object.values(subjectStatsMap).map((s) => ({
      subject: s.subject,
      attempted: s.attempted,
      correct: s.correct,
      accuracy: s.attempted > 0 ? Number(((s.correct / s.attempted) * 100).toFixed(1)) : 0,
    }));

    // Weak topics (accuracy < 60% with at least 1 attempt)
    const weakTopics = Object.values(topicStatsMap)
      .map((t) => ({
        topic: t.topic,
        subject: t.subject,
        attempted: t.attempted,
        correct: t.correct,
        accuracy: t.attempted > 0 ? Number(((t.correct / t.attempted) * 100).toFixed(1)) : 0,
      }))
      .filter((t) => t.accuracy < 60)
      .sort((a, b) => a.accuracy - b.accuracy)
      .slice(0, 5);

    // 4. Revision queue count
    const revisionCount = await prisma.reviewSchedule.count({
      where: { userId: user.id, isResolved: false },
    });

    // 5. Recent test sessions
    const recentSessions = await prisma.testSession.findMany({
      where: { userId: user.id, status: "COMPLETED" },
      take: 5,
      orderBy: { submittedAt: "desc" },
      include: {
        test: { include: { paper: true } },
      },
    });

    const formattedSessions = recentSessions.map((s) => ({
      sessionId: s.id,
      title: s.test.title,
      paperCode: s.test.paper.code,
      netScore: s.netScore,
      accuracy:
        s.attemptedCount > 0
          ? Number(((s.correctCount / s.attemptedCount) * 100).toFixed(1))
          : 0,
      submittedAt: s.submittedAt,
    }));

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          totalAttempted: totalAttempts,
          correctCount: correctAttempts,
          incorrectCount: incorrectAttempts,
          overallAccuracy,
          totalStudyHours: totalHours,
          revisionQueueCount: revisionCount,
        },
        subjectPerformance,
        weakTopics,
        recentSessions: formattedSessions,
      },
    });
  } catch (error: any) {
    console.error("Error in GET /api/v1/analytics/dashboard:", error);
    return NextResponse.json(
      { success: false, error: { code: "ANALYTICS_FAILED", message: error.message } },
      { status: 500 }
    );
  }
}
