import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { questionId, reason, description } = body;

    if (!questionId || !reason) {
      return NextResponse.json(
        { success: false, error: "Question ID and reporting reason are required." },
        { status: 400 }
      );
    }

    // Verify question exists
    const question = await prisma.question.findUnique({
      where: { id: questionId },
      select: { id: true, questionNumber: true, year: true },
    });

    if (!question) {
      return NextResponse.json(
        { success: false, error: "Question not found." },
        { status: 404 }
      );
    }

    // Record issue in ContentReview for editorial audit
    const reviewerId = "aspirant_community_feedback";
    await prisma.contentReview.create({
      data: {
        questionId: question.id,
        reviewerId,
        action: "FLAGGED_BY_STUDENT",
        comments: `Reason: ${reason} | Details: ${description || "None provided"}`,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Issue report submitted successfully. Our editorial review team will verify the official question wording and key.",
    });
  } catch (error: any) {
    console.error("Failed to submit question issue report:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred while logging the report." },
      { status: 500 }
    );
  }
}
