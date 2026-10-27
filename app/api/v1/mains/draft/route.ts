import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Authentication required to save answer drafts" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      mainsQuestionId,
      userAnswer,
      wordCount,
      timeSpentSeconds,
      selfEvaluationScore,
      selfEvaluationNotes,
      isSubmitted,
    } = body;

    if (!mainsQuestionId || typeof userAnswer !== "string") {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const question = await prisma.mainsQuestion.findUnique({
      where: { id: mainsQuestionId },
    });

    if (!question) {
      return NextResponse.json(
        { success: false, error: "Mains question not found" },
        { status: 404 }
      );
    }

    const draft = await prisma.mainsDraft.upsert({
      where: {
        userId_mainsQuestionId: {
          userId: user.id,
          mainsQuestionId,
        },
      },
      update: {
        userAnswer,
        wordCount: wordCount || userAnswer.trim().split(/\s+/).filter(Boolean).length,
        timeSpentSeconds: timeSpentSeconds || 0,
        selfEvaluationScore: selfEvaluationScore !== undefined ? selfEvaluationScore : undefined,
        selfEvaluationNotes: selfEvaluationNotes || undefined,
        isSubmitted: isSubmitted || false,
        updatedAt: new Date(),
      },
      create: {
        userId: user.id,
        mainsQuestionId,
        userAnswer,
        wordCount: wordCount || userAnswer.trim().split(/\s+/).filter(Boolean).length,
        timeSpentSeconds: timeSpentSeconds || 0,
        selfEvaluationScore: selfEvaluationScore || null,
        selfEvaluationNotes: selfEvaluationNotes || null,
        isSubmitted: isSubmitted || false,
      },
    });

    // Record activity
    await prisma.studyActivity.create({
      data: {
        userId: user.id,
        activityType: "mains_draft_saved",
        label: `Mains Practice: ${question.paperCode} ${question.year} Q#${question.questionNumber}`,
        refId: draft.id,
        durationSeconds: timeSpentSeconds || 600,
      },
    });

    return NextResponse.json({
      success: true,
      draft,
    });
  } catch (error: any) {
    console.error("Error saving Mains draft:", error);
    return NextResponse.json(
      { success: false, error: "Failed to save Mains draft" },
      { status: 500 }
    );
  }
}
