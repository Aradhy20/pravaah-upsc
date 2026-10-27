import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    // Find the latest published daily quiz
    const quiz = await prisma.dailyQuiz.findFirst({
      where: { isPublished: true },
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
      return NextResponse.json(
        { success: false, error: "No published daily quiz available for today." },
        { status: 404 }
      );
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
    console.error("Error fetching daily quiz:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch daily quiz" },
      { status: 500 }
    );
  }
}
