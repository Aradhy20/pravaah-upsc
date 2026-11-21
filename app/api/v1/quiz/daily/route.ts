import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getFallbackDailyQuiz } from "@/lib/data-fallback";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const archive = searchParams.get("archive") === "true";
    const quizId = searchParams.get("quizId");
    const dateStr = searchParams.get("date");

    // If caller requests the archive catalog of daily quizzes
    if (archive) {
      const pastQuizzes = await prisma.dailyQuiz.findMany({
        where: { isPublished: true },
        orderBy: { quizDate: "desc" },
        take: 30,
        select: {
          id: true,
          quizDate: true,
          title: true,
          description: true,
          totalQuestions: true,
        },
      });

      return NextResponse.json({
        success: true,
        archive: pastQuizzes,
      });
    }

    const where: any = { isPublished: true };
    if (quizId) {
      where.id = quizId;
    } else if (dateStr) {
      where.quizDate = new Date(dateStr);
    }

    // Find the requested or latest published daily quiz
    const quiz = await prisma.dailyQuiz.findFirst({
      where,
      orderBy: { quizDate: "desc" },
      include: {
        questions: {
          orderBy: { orderIndex: "asc" },
          include: {
            story: {
              select: {
                id: true,
                title: true,
                slug: true,
              },
            },
          },
        },
      },
    });

    if (!quiz) {
      return NextResponse.json(getFallbackDailyQuiz(quizId, dateStr));
    }

    // Do not reveal correctOption or explanation before submission
    return NextResponse.json({
      success: true,
      quiz: {
        id: quiz.id,
        quizDate: quiz.quizDate,
        title: quiz.title,
        description: quiz.description,
        totalQuestions: quiz.totalQuestions,
        questions: quiz.questions.map((q) => ({
          id: q.id,
          orderIndex: q.orderIndex,
          questionText: q.questionText,
          options: [
            { code: "A", text: q.optionA },
            { code: "B", text: q.optionB },
            { code: "C", text: q.optionC },
            { code: "D", text: q.optionD },
          ],
          relatedStory: q.story
            ? {
                title: q.story.title,
                slug: q.story.slug,
              }
            : null,
        })),
      },
    });
  } catch (error: any) {
    console.warn("Graceful fallback in GET /api/v1/quiz/daily:", error.message);
    const { searchParams } = new URL(request.url);
    return NextResponse.json(
      getFallbackDailyQuiz(searchParams.get("quizId"), searchParams.get("date"))
    );
  }
}
