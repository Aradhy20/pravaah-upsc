import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const CRON_SECRET = process.env.CRON_SECRET || (process.env.NODE_ENV !== "production" ? "pravaah_cron_secret_2026" : undefined);

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const { searchParams } = new URL(request.url);
    const querySecret = searchParams.get("secret");

    const providedSecret = authHeader?.startsWith("Bearer ")
      ? authHeader.slice(7).trim()
      : querySecret;

    if (!providedSecret || providedSecret !== CRON_SECRET) {
      return NextResponse.json(
        { success: false, error: "Unauthorized cron access" },
        { status: 401 }
      );
    }

    const todayStart = new Date();
    todayStart.setUTCHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setUTCHours(23, 59, 59, 999);

    // 1. Check if Daily Quiz for today exists
    let dailyQuiz = await prisma.dailyQuiz.findFirst({
      where: {
        quizDate: {
          gte: todayStart,
          lte: todayEnd,
        },
      },
      include: { questions: true },
    });

    let quizCreated = false;

    if (!dailyQuiz) {
      // Create today's Daily Quiz
      const randomQuestions = await prisma.question.findMany({
        where: { status: "PUBLISHED" },
        include: {
          options: true,
          explanation: true,
          paper: true,
        },
        take: 15,
        orderBy: { createdAt: "desc" },
      });

      // Select 5 questions
      const selected = randomQuestions.slice(0, 5);

      if (selected.length >= 3) {
        const formattedDate = todayStart.toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        });

        dailyQuiz = await prisma.dailyQuiz.create({
          data: {
            quizDate: todayStart,
            title: `Daily Prelims Diagnostic (${formattedDate})`,
            description: "5 curated high-yield questions covering core constitutional, economic, and environmental concepts.",
            totalQuestions: selected.length,
            isPublished: true,
            questions: {
              create: selected.map((q, idx) => {
                const optA = q.options.find((o) => o.optionCode === "A")?.optionText || "Option A";
                const optB = q.options.find((o) => o.optionCode === "B")?.optionText || "Option B";
                const optC = q.options.find((o) => o.optionCode === "C")?.optionText || "Option C";
                const optD = q.options.find((o) => o.optionCode === "D")?.optionText || "Option D";
                const correct = q.options.find((o) => o.isCorrect)?.optionCode || "A";

                return {
                  orderIndex: idx + 1,
                  questionText: q.questionText,
                  optionA: optA,
                  optionB: optB,
                  optionC: optC,
                  optionD: optD,
                  correctOption: correct,
                  explanation: q.explanation?.summary || "Official UPSC question and key.",
                };
              }),
            },
          },
          include: { questions: true },
        });
        quizCreated = true;
      }
    }

    // 2. Housekeeping: expire abandoned test sessions older than 48 hours
    const staleCutoff = new Date(Date.now() - 48 * 60 * 60 * 1000);
    const staleSessions = await prisma.testSession.updateMany({
      where: {
        status: "IN_PROGRESS",
        startedAt: { lt: staleCutoff },
      },
      data: {
        status: "EXPIRED",
      },
    });

    // 3. Platform Telemetry Metrics
    const [publishedCount, activeSubs, storiesCount] = await Promise.all([
      prisma.question.count({ where: { status: "PUBLISHED" } }),
      prisma.subscription.count({ where: { status: "ACTIVE" } }),
      prisma.currentAffairsStory.count({ where: { status: "PUBLISHED" } }),
    ]);

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      cronExecution: {
        dailyQuizReady: !!dailyQuiz,
        dailyQuizId: dailyQuiz?.id,
        quizNewlyCreated: quizCreated,
        staleSessionsCleaned: staleSessions.count,
        telemetry: {
          publishedQuestions: publishedCount,
          activeSubscriptions: activeSubs,
          publishedStories: storiesCount,
        },
      },
    });
  } catch (error: any) {
    console.error("Cron execution error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Cron job failed" },
      { status: 500 }
    );
  }
}
