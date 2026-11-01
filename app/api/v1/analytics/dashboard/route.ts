import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuthenticatedUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

/**
 * Returns formatted calendar date string (YYYY-MM-DD) in Asia/Kolkata (IST).
 */
function getISTDateString(d: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

/**
 * Returns short day name (e.g. Mon, Tue) in Asia/Kolkata (IST).
 */
function getISTDayName(d: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Kolkata",
    weekday: "short",
  }).format(d);
}

export async function GET(request: NextRequest) {
  try {
    // 1. Strict Server-Side Session Authentication Guard
    const auth = await requireAuthenticatedUser(request);
    if (auth.error) {
      return auth.error;
    }
    const user = auth.user;

    // 2. Fetch user profile
    const profile = await prisma.userProfile.findUnique({
      where: { userId: user.id },
    });

    const targetYear = profile?.targetYear ?? 2027;
    const optionalSubject = profile?.optionalSubject ?? null;
    const dailyGoalMinutes = profile?.dailyGoalMinutes ?? 60;

    // 3. Fetch user attempts with strictly scoped fields
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

    // 4. Fetch study activities to capture complete study session time
    const activities = await prisma.studyActivity.findMany({
      where: { userId: user.id },
      select: { durationSeconds: true, timestamp: true },
    });

    const totalAttempts = attempts.length;
    const correctAttempts = attempts.filter((a) => a.isCorrect).length;
    const incorrectAttempts = totalAttempts - correctAttempts;
    const overallAccuracy =
      totalAttempts > 0 ? Number(((correctAttempts / totalAttempts) * 100).toFixed(1)) : 0;

    // Question Practice Time calculation
    const questionPracticeSeconds = attempts.reduce((acc, curr) => acc + (curr.timeSpentSeconds || 0), 0);
    const activitySeconds = activities.reduce((acc, curr) => acc + (curr.durationSeconds || 0), 0);
    const totalPracticeSeconds = questionPracticeSeconds + activitySeconds;
    const totalStudyHours = Number((totalPracticeSeconds / 3600).toFixed(1));

    // Preparation stage dynamic classification
    let preparationStage = "Prelims Foundation & PYQ Orientation";
    if (totalAttempts >= 300) {
      preparationStage = "Advanced Mock Simulation & Spaced Revision";
    } else if (totalAttempts >= 50) {
      preparationStage = "Subject Consolidation & PYQ Mastery";
    }

    // 5. Unique questions attempted and coverage
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

    // 6. Strict Paper-wise Breakdown: GS1 vs CSAT (Zero Category Overlap)
    // GS1 is canonically GS Paper 1 ("GS1")
    // CSAT is canonically GS Paper 2 ("GS2" or "CSAT")
    const gs1Attempts = attempts.filter((a) => a.question.paper?.code === "GS1");
    const csatAttempts = attempts.filter(
      (a) => a.question.paper?.code === "GS2" || a.question.paper?.code === "CSAT"
    );
    const otherAttempts = attempts.filter(
      (a) =>
        a.question.paper?.code !== "GS1" &&
        a.question.paper?.code !== "GS2" &&
        a.question.paper?.code !== "CSAT"
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
      otherCount: otherAttempts.length,
    };

    // 7. Timezone-Consistent "Today" Calculations (Asia/Kolkata)
    const now = new Date();
    const todayIST = getISTDateString(now);

    const todayAttempts = attempts.filter((a) => getISTDateString(new Date(a.createdAt)) === todayIST);
    const todayActivities = activities.filter((act) => getISTDateString(new Date(act.timestamp)) === todayIST);

    const todayQuestionSeconds = todayAttempts.reduce((acc, curr) => acc + (curr.timeSpentSeconds || 0), 0);
    const todayActivitySeconds = todayActivities.reduce((acc, curr) => acc + (curr.durationSeconds || 0), 0);
    const todayTotalSeconds = todayQuestionSeconds + todayActivitySeconds;

    const todayStudyMinutes = Math.round(todayTotalSeconds / 60);
    const todayQuestionPracticeMinutes = Math.round(todayQuestionSeconds / 60);
    const todayGoalPercent =
      dailyGoalMinutes > 0
        ? Math.min(100, Math.round((todayStudyMinutes / dailyGoalMinutes) * 100))
        : 0;

    // 8. Last 7 Days Weekly Activity Breakdown in Asia/Kolkata (IST)
    const weeklyActivity = [];
    let weeklyTotalSeconds = 0;

    for (let i = 6; i >= 0; i--) {
      // Calculate day anchor in IST
      const pastDate = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStringIST = getISTDateString(pastDate);
      const dayNameIST = getISTDayName(pastDate);

      const dayAttempts = attempts.filter((a) => getISTDateString(new Date(a.createdAt)) === dateStringIST);
      const dayActs = activities.filter((act) => getISTDateString(new Date(act.timestamp)) === dateStringIST);

      const dayCorrect = dayAttempts.filter((a) => a.isCorrect).length;
      const daySeconds =
        dayAttempts.reduce((acc, curr) => acc + (curr.timeSpentSeconds || 0), 0) +
        dayActs.reduce((acc, curr) => acc + (curr.durationSeconds || 0), 0);

      weeklyTotalSeconds += daySeconds;

      weeklyActivity.push({
        date: dateStringIST,
        dayName: dayNameIST,
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

    // 9. Aggregate by Subject
    const subjectStatsMap: Record<
      string,
      { subject: string; attempted: number; correct: number }
    > = {};

    // 10. Aggregate by Topic to find Weak Areas
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
        topicStatsMap[topicName] = { topic: topicName, subject: subj, attempted: 0, correct: 0 };
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

    // Identify weak topics: minimum 3 attempts and accuracy < 60%
    const weakTopics = Object.values(topicStatsMap)
      .filter((t) => t.attempted >= 3 && (t.correct / t.attempted) < 0.6)
      .map((t) => ({
        topic: t.topic,
        subject: t.subject,
        attempted: t.attempted,
        accuracy: Number(((t.correct / t.attempted) * 100).toFixed(1)),
      }))
      .sort((a, b) => a.accuracy - b.accuracy)
      .slice(0, 5);

    // 11. Mock Test History
    const mockSessions = await prisma.testSession.findMany({
      where: { userId: user.id, status: "COMPLETED" },
      orderBy: { submittedAt: "desc" },
      take: 5,
      include: {
        test: {
          select: {
            title: true,
            paper: { select: { code: true, name: true } },
          },
        },
      },
    });

    const mockHistory = mockSessions.map((ms) => ({
      id: ms.id,
      title: ms.test.title,
      paperCode: ms.test.paper.code,
      netScore: ms.netScore,
      accuracy:
        ms.attemptedCount > 0
          ? Number(((ms.correctCount / ms.attemptedCount) * 100).toFixed(1))
          : 0,
      submittedAt: ms.submittedAt,
    }));

    // 12. Active Revision Queue Count
    const revisionQueueCount = await prisma.reviewSchedule.count({
      where: {
        userId: user.id,
        isResolved: false,
      },
    });

    // 13. Active Bookmarks Count
    const bookmarksCount = await prisma.bookmark.count({
      where: { userId: user.id },
    });

    return NextResponse.json({
      success: true,
      data: {
        aspirant: {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          targetYear,
          optionalSubject,
          dailyGoalMinutes,
          preparationStage,
          reportingTimezone: "Asia/Kolkata",
        },
        today: {
          studyMinutes: todayStudyMinutes,
          questionPracticeMinutes: todayQuestionPracticeMinutes,
          goalMinutes: dailyGoalMinutes,
          completionPercent: todayGoalPercent,
          date: todayIST,
          metricLabel: "Question Practice & Revision Activity Time",
        },
        weekly: {
          totalMinutes: weeklyTotalMinutes,
          targetMinutes: weeklyTargetMinutes,
          completionPercent: weeklyCompletionPercent,
          activity: weeklyActivity,
        },
        summary: {
          totalAttempted: totalAttempts,
          correct: correctAttempts,
          incorrect: incorrectAttempts,
          overallAccuracy,
          totalStudyHours,
          revisionQueueCount,
          bookmarksCount,
          metricScope: "Derived from interactive PYQ practice duration and recorded study activities",
        },
        coverage: {
          totalPublishedQuestions,
          uniqueAttempted: uniqueAttemptedCount,
          remaining: remainingQuestions,
          coveragePercent,
        },
        paperBreakdown,
        subjectPerformance,
        weakTopics,
        mockHistory,
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
