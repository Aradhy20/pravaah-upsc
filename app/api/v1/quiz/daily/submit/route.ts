import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    const body = await request.json();
    const { quizId, answers } = body; // answers: { [questionId: string]: string }

    if (!quizId || !answers || typeof answers !== "object") {
      return NextResponse.json(
        { success: false, error: "Missing quizId or answers map" },
        { status: 400 }
      );
    }

    const quiz = await prisma.dailyQuiz.findUnique({
      where: { id: quizId },
      include: {
        questions: {
          orderBy: { orderIndex: "asc" },
        },
      },
    });

    if (!quiz) {
      return NextResponse.json(
        { success: false, error: "Quiz not found" },
        { status: 404 }
      );
    }

    let correctCount = 0;
    let incorrectCount = 0;
    let unattemptedCount = 0;
    const gradedQuestions: any[] = [];

    for (const q of quiz.questions) {
      const selected = answers[q.id];
      const isAttempted = Boolean(selected);
      const isCorrect = isAttempted && selected.toUpperCase() === q.correctOption.toUpperCase();

      if (!isAttempted) {
        unattemptedCount += 1;
      } else if (isCorrect) {
        correctCount += 1;
      } else {
        incorrectCount += 1;
      }

      gradedQuestions.push({
        id: q.id,
        orderIndex: q.orderIndex,
        questionText: q.questionText,
        options: [
          { code: "A", text: q.optionA },
          { code: "B", text: q.optionB },
          { code: "C", text: q.optionC },
          { code: "D", text: q.optionD },
        ],
        selectedOption: selected || null,
        correctOption: q.correctOption,
        isCorrect,
        isAttempted,
        explanation: q.explanation,
      });
    }

    // Standard scoring: +2 for correct, -0.66 for incorrect
    const rawScore = correctCount * 2 - incorrectCount * 0.66;
    const netScore = Math.max(0, Math.round(rawScore * 100) / 100);
    const accuracyPercent =
      quiz.questions.length > 0
        ? Math.round((correctCount / quiz.questions.length) * 100)
        : 0;

    // If authenticated user, record attempt
    if (user) {
      await prisma.dailyQuizAttempt.upsert({
        where: {
          userId_dailyQuizId: {
            userId: user.id,
            dailyQuizId: quiz.id,
          },
        },
        update: {
          score: netScore,
          accuracyPercent,
          answersJson: JSON.stringify(answers),
          completedAt: new Date(),
        },
        create: {
          userId: user.id,
          dailyQuizId: quiz.id,
          score: netScore,
          totalMarks: quiz.questions.length * 2,
          accuracyPercent,
          answersJson: JSON.stringify(answers),
        },
      });

      // Log study activity
      await prisma.studyActivity.create({
        data: {
          userId: user.id,
          activityType: "daily_quiz_completed",
          label: `Completed Daily Quiz: ${quiz.title}`,
          refId: quiz.id,
          durationSeconds: 300,
        },
      });
    }

    return NextResponse.json({
      success: true,
      result: {
        quizId: quiz.id,
        quizTitle: quiz.title,
        totalQuestions: quiz.questions.length,
        correctCount,
        incorrectCount,
        unattemptedCount,
        score: netScore,
        totalPossibleScore: quiz.questions.length * 2,
        accuracyPercent,
        gradedQuestions,
      },
    });
  } catch (error: any) {
    console.error("Error submitting daily quiz:", error);
    return NextResponse.json(
      { success: false, error: "Failed to submit daily quiz" },
      { status: 500 }
    );
  }
}
