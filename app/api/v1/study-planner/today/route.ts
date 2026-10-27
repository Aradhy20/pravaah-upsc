import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);

    // 1. What to study today: Latest verified current affairs story + syllabus theme
    const [todayStory, latestQuiz] = await Promise.all([
      prisma.currentAffairsStory.findFirst({
        where: { status: "PUBLISHED" },
        orderBy: { publishedAt: "desc" },
        include: {
          topics: true,
          questionLinks: {
            include: {
              question: {
                select: {
                  id: true,
                  year: true,
                  questionNumber: true,
                  paper: { select: { code: true } },
                  questionText: true,
                },
              },
            },
          },
        },
      }),
      prisma.dailyQuiz.findFirst({
        where: { isPublished: true },
        orderBy: { quizDate: "desc" },
        include: {
          questions: { select: { id: true } },
        },
      }),
    ]);

    // 2. What is important for UPSC: Top high-yield connected PYQs
    let highYieldPyqs: any[] = [];
    if (todayStory && todayStory.questionLinks.length > 0) {
      highYieldPyqs = todayStory.questionLinks.map((ql) => ({
        id: ql.question.id,
        year: ql.question.year,
        paper: ql.question.paper.code,
        questionNumber: ql.question.questionNumber,
        questionText: ql.question.questionText,
        rationale: ql.relationshipRationale,
      }));
    } else {
      const fallbackQuestions = await prisma.question.findMany({
        where: { status: "PUBLISHED" },
        take: 3,
        orderBy: { year: "desc" },
        include: { paper: true },
      });
      highYieldPyqs = fallbackQuestions.map((q) => ({
        id: q.id,
        year: q.year,
        paper: q.paper.code,
        questionNumber: q.questionNumber,
        questionText: q.questionText,
        rationale: "Core high-yield syllabus fundamental from latest exam cycle.",
      }));
    }

    // 3. What to revise next: Items from ReviewSchedule (or recent mistakes)
    let revisionItemsDue: any[] = [];
    if (user) {
      const now = new Date();
      const schedules = await prisma.reviewSchedule.findMany({
        where: {
          userId: user.id,
          isResolved: false,
          nextReviewDate: { lte: now },
        },
        take: 5,
        include: {
          question: {
            select: {
              id: true,
              year: true,
              questionNumber: true,
              questionText: true,
              paper: { select: { code: true } },
            },
          },
        },
      });

      revisionItemsDue = schedules.map((s) => ({
        scheduleId: s.id,
        questionId: s.question.id,
        year: s.question.year,
        paper: s.question.paper.code,
        questionNumber: s.question.questionNumber,
        questionText: s.question.questionText,
        repetitionCount: s.repetitionCount,
        intervalDays: s.intervalDays,
      }));
    }

    return NextResponse.json({
      success: true,
      studyPlan: {
        date: new Date().toISOString().split("T")[0],
        todayStudy: {
          title: todayStory?.title || "Indian Polity & Constitutional Dynamics",
          syllabusPaper: todayStory?.topics[0]?.syllabusPaper || "GS2",
          topic: todayStory?.topics[0]?.topicName || "Constitutional Bodies & Governance",
          summary: todayStory?.summary || "Review core statutory safeguards and electoral reforms.",
          importancePrelims: todayStory?.importancePrelims,
          importanceMains: todayStory?.importanceMains,
          sourceName: todayStory?.sourceName,
          slug: todayStory?.slug,
          dailyQuizAvailable: Boolean(latestQuiz),
          dailyQuizId: latestQuiz?.id,
          dailyQuizCount: latestQuiz?.questions.length || 0,
        },
        importantForUpsc: {
          heading: "How this theme has appeared in historical UPSC examinations",
          connectedPyqs: highYieldPyqs,
        },
        revisionNext: {
          heading: "Personalized Spaced-Repetition Queue",
          dueCount: revisionItemsDue.length,
          items: revisionItemsDue,
          instructions:
            revisionItemsDue.length === 0
              ? "All caught up! Practice the daily quiz or PYQ explorer to populate your mistake revision queue."
              : "Review these questions today to reinforce memory retention based on the SuperMemo-2 algorithm.",
        },
      },
    });
  } catch (error: any) {
    console.error("Error generating daily study plan:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate daily study plan" },
      { status: 500 }
    );
  }
}
