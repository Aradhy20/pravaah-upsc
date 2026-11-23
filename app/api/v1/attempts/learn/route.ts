import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    const body = await request.json();
    const { questionId, selectedOption, timeSpentSeconds = 30 } = body;

    if (!questionId || !selectedOption) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_PAYLOAD",
            message: "questionId and selectedOption are required",
          },
        },
        { status: 400 }
      );
    }

    const question = await prisma.orm.public.Question
      .include("options")
      .include("explanation")
      .first({ id: questionId });

    if (!question) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "QUESTION_NOT_FOUND",
            message: "Question not found",
          },
        },
        { status: 404 }
      );
    }

    const correctOptionObj = question.options.find((o) => o.isCorrect);
    const correctOption = correctOptionObj?.optionCode || "A";
    const isCorrect = selectedOption.toUpperCase() === correctOption.toUpperCase();

    // 1. Record Attempt
    await prisma.orm.public.UserAttempt.create({
      userId: user.id,
      questionId: question.id,
      selectedOption: selectedOption.toUpperCase(),
      isCorrect,
      timeSpentSeconds,
      mode: "LEARN",
    });

    // 2. If incorrect, add or update in ReviewSchedule (Mistake Queue)
    if (!isCorrect) {
      const existingSchedule = await prisma.orm.public.ReviewSchedule
        .where({ userId: user.id, questionId: question.id })
        .first();
      if (existingSchedule) {
        await prisma.orm.public.ReviewSchedule.where({ id: existingSchedule.id }).update({
          repetitionCount: existingSchedule.repetitionCount + 1,
          isResolved: false,
          nextReviewDate: new Date(Date.now() + 86400000), // Next review in 24 hours
        });
      } else {
        await prisma.orm.public.ReviewSchedule.create({
          userId: user.id,
          questionId: question.id,
          repetitionCount: 1,
          intervalDays: 1,
          nextReviewDate: new Date(Date.now() + 86400000),
          isResolved: false,
        });
      }
    }

    // 3. Record Study Activity
    await prisma.orm.public.StudyActivity.create({
      userId: user.id,
      activityType: "mcq_attempted",
      label: `Solved Q.${question.questionNumber} (${question.year})`,
      refId: question.id,
      durationSeconds: timeSpentSeconds,
    });

    return NextResponse.json({
      success: true,
      data: {
        questionId: question.id,
        selectedOption: selectedOption.toUpperCase(),
        isCorrect,
        correctOption,
        explanation: question.explanation
          ? {
              summary: question.explanation.summary,
              detailedExplanation: question.explanation.detailedExplanation,
              eliminationTechnique: question.explanation.eliminationTechnique,
              sourceCitation: question.explanation.sourceCitation,
              relatedConcept: question.explanation.relatedConcept,
            }
          : null,
      },
    });
  } catch (error: any) {
    console.error("Error in POST /api/v1/attempts/learn:", error);
    return NextResponse.json(
      {
        success: false,
        error: { code: "ATTEMPT_RECORD_FAILED", message: error.message },
      },
      { status: 500 }
    );
  }
}
