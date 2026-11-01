import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);

    // 1. Fetch user profile
    const profile = await prisma.userProfile.findUnique({
      where: { userId: user.id },
    });

    const targetYear = profile?.targetYear ?? 2027;
    const optionalSubject = profile?.optionalSubject ?? null;
    const dailyGoalMinutes = profile?.dailyGoalMinutes ?? 60;

    // 2. Fetch all attempts by this user with paper and subject details
    const attempts = await prisma.userAttempt.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "asc" },
      include: {
        question: {
          select: {
            id: true,
            year: true,
            paper: { select: { code: true } },
            topics: {
              select: {
                topic: {
                  select: {
                    name: true,
                    subject: { select: { name: true } },
                  },
                },
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

    // Determine Preparation Stage dynamically
    let preparationStage = "Prelims Foundation & PYQ Orientation";
    if (totalAttempts >= 300) {
      preparationStage = "Advanced Mock Simulation & Spaced Revision";
    } else if (totalAttempts >= 50) {
      preparationStage = "Subject Consolidation & PYQ Mastery";
    }

    // 3. Unique questions attempted and coverage
    const uniqueQuestionsAttemptedSet = new Set(attempts.map((a) => a.question.id));
    const uniqueAttemptedCount = uniqueQuestionsAttemptedSet.size;

    const totalPublishedQuestions = await prisma.question.count({
      where: { status: "PUBLISHED" },
    });
    const remainingQuestions = Math.max(0, totalPublishedQuestions - uniqueAttemptedCount);
    const coveragePercent =
      totalPublishedQuestions > 0
        ? Number(((uniqueAttemptedCount / totalPublishedQuestions) * 100).toFixed(1))
        : 0;

    // 4. Paper-wise breakdown: GS1 vs CSAT
    const gs1Attempts = attempts.filter(
      (a) => a.question.paper?.code === "GS1" || a.question.paper?.code?.startsWith("GS")
    );
    const csatAttempts = attempts.filter(
      (a) => a.question.paper?.code === "GS2" || a.question.paper?.code === "CSAT"
    );

    const gs1Correct = gs1Attempts.filter((a) => a.isCorrect).length;
    const csatCorrect = csatAttempts.filter((a) => a.isCorrect).length;

    const paperBreakdown = {
      gs1: {
        attempted: gs1Attempts.length,
        correct: gs1Correct,
        incorrect: gs1Attempts.length - gs1Correct,
        accuracy:
          gs1Attempts.length > 0
            ? Number(((gs1Correct / gs1Attempts.length) * 100).toFixed(1))
            : 0,
      },
      csat: {
        attempted: csatAttempts.length,
        correct: csatCorrect,
        incorrect: csatAttempts.length - csatCorrect,
        accuracy:
          csatAttempts.length > 0
            ? Number(((csatCorrect / csatAttempts.length) * 100).toFixed(1))
            : 0,
      },
    };

    // 5. Today's study metrics
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const todayAttempts = attempts.filter((a) => new Date(a.createdAt) >= startOfToday);
    const todaySeconds = todayAttempts.reduce((acc, curr) => acc + (curr.timeSpentSeconds || 0), 0);
    const todayStudyMinutes = Math.round(todaySeconds / 60);
    const todayGoalPercent =
      dailyGoalMinutes > 0
        ? Math.min(100, Math.round((todayStudyMinutes / dailyGoalMinutes) * 100))
        : 0;

    // 6. Last 7 Days Weekly Activity Breakdown
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const weeklyActivity = [];
    let weeklyTotalSeconds = 0;

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const nextD = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i + 1);

      const dayAttempts = attempts.filter((a) => {
        const at = new Date(a.createdAt);
        return at >= d && at < nextD;
      });

      const dayCorrect = dayAttempts.filter((a) => a.isCorrect).length;
      const daySeconds = dayAttempts.reduce((acc, curr) => acc + (curr.timeSpentSeconds || 0), 0);
      weeklyTotalSeconds += daySeconds;

      weeklyActivity.push({
        date: d.toISOString().split("T")[0],
        dayName: dayNames[d.getDay()],
        attempted: dayAttempts.length,
        correct: dayCorrect,
        accuracy:
          dayAttempts.length > 0
            ? Number(((dayCorrect / dayAttempts.length) * 100).toFixed(1))
            : 0,
        minutes: Math.round(daySeconds / 60),
      });
    }

    const weeklyTotalMinutes = Math.round(weeklyTotalSeconds / 60);
    const weeklyTargetMinutes = dailyGoalMinutes * 7;
    const weeklyCompletionPercent =
      weeklyTargetMinutes > 0
        ? Math.min(100, Math.round((weeklyTotalMinutes / weeklyTargetMinutes) * 100))
        : 0;

    // 7. Aggregate by Subject
    const subjectStatsMap: Record<
      string,
      { subject: string; attempted: number; correct: number }
    > = {};

    // 8. Aggregate by Topic to find Weak Areas
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

    const subjectPerformance = Object.values(subjectStatsMap)
      .map((s) => ({
        subject: s.subject,
        attempted: s.attempted,
        correct: s.correct,
        accuracy: s.attempted > 0 ? Number(((s.correct / s.attempted) * 100).toFixed(1)) : 0,
      }))
      .sort((a, b) => b.attempted - a.attempted);

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

    // Strong topics (accuracy >= 70% with at least 2 attempts)
    const strongTopics = Object.values(topicStatsMap)
      .map((t) => ({
        topic: t.topic,
        subject: t.subject,
        attempted: t.attempted,
        correct: t.correct,
        accuracy: t.attempted > 0 ? Number(((t.correct / t.attempted) * 100).toFixed(1)) : 0,
      }))
      .filter((t) => t.accuracy >= 70 && t.attempted >= 2)
      .sort((a, b) => b.accuracy - a.accuracy)
      .slice(0, 5);

    // 9. Revision queue count
    const revisionCount = await prisma.reviewSchedule.count({
      where: { userId: user.id, isResolved: false },
    });

    // 10. Completed Mock Test sessions
    const completedSessions = await prisma.testSession.findMany({
      where: { userId: user.id, status: "COMPLETED" },
      orderBy: { submittedAt: "asc" },
      include: {
        test: { include: { paper: true } },
      },
    });

    const mockScoreProgression = completedSessions.map((s) => ({
      sessionId: s.id,
      title: s.test.title,
      paperCode: s.test.paper.code,
      netScore: s.netScore,
      totalMarks: s.test.paper.totalMarks || 200,
      accuracy:
        s.attemptedCount > 0
          ? Number(((s.correctCount / s.attemptedCount) * 100).toFixed(1))
          : 0,
      submittedAt: s.submittedAt,
    }));

    const recentSessions = [...mockScoreProgression].reverse().slice(0, 5);

    const averageMockScore =
      mockScoreProgression.length > 0
        ? Number(
            (
              mockScoreProgression.reduce((acc, curr) => acc + curr.netScore, 0) /
              mockScoreProgression.length
            ).toFixed(1)
          )
        : 0;

    const highestMockScore =
      mockScoreProgression.length > 0
        ? Math.max(...mockScoreProgression.map((s) => s.netScore))
        : 0;

    return NextResponse.json({
      success: true,
      data: {
        aspirant: {
          fullName: user.fullName,
          email: user.email,
          targetYear,
          optionalSubject,
          preparationStage,
          dailyGoalMinutes,
        },
        today: {
          todayAttemptsCount: todayAttempts.length,
          studyMinutes: todayStudyMinutes,
          goalMinutes: dailyGoalMinutes,
          completionPercent: todayGoalPercent,
        },
        weekly: {
          totalMinutes: weeklyTotalMinutes,
          targetMinutes: weeklyTargetMinutes,
          completionPercent: weeklyCompletionPercent,
          activity: weeklyActivity,
        },
        coverage: {
          totalPublishedQuestions,
          uniqueAttempted: uniqueAttemptedCount,
          remaining: remainingQuestions,
          coveragePercent,
        },
        summary: {
          totalAttempted: totalAttempts,
          correctCount: correctAttempts,
          incorrectCount: incorrectAttempts,
          overallAccuracy,
          totalStudyHours: totalHours,
          revisionQueueCount: revisionCount,
          completedMocksCount: completedSessions.length,
          averageMockScore,
          highestMockScore,
        },
        paperBreakdown,
        subjectPerformance,
        weakTopics,
        strongTopics,
        mockScoreProgression,
        recentSessions,
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
