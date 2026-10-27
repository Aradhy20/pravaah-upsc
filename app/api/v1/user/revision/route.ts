import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);

    const items = await prisma.reviewSchedule.findMany({
      where: {
        userId: user.id,
        isResolved: false,
      },
      orderBy: { nextReviewDate: "asc" },
      include: {
        question: {
          include: {
            paper: true,
            options: { orderBy: { optionCode: "asc" } },
            explanation: true,
            topics: {
              include: {
                topic: { include: { subject: true } },
              },
            },
          },
        },
      },
    });

    const data = items.map((item) => ({
      scheduleId: item.id,
      repetitionCount: item.repetitionCount,
      intervalDays: item.intervalDays,
      nextReviewDate: item.nextReviewDate,
      question: {
        id: item.question.id,
        year: item.question.year,
        questionNumber: item.question.questionNumber,
        paperCode: item.question.paper.code,
        questionText: item.question.questionText,
        subject: item.question.topics[0]?.topic?.subject?.name || "General Studies",
        topic: item.question.topics[0]?.topic?.name || "Concept",
        options: item.question.options.map((o) => ({
          code: o.optionCode,
          text: o.optionText,
          isCorrect: o.isCorrect,
        })),
        correctOption: item.question.options.find((o) => o.isCorrect)?.optionCode || "A",
        explanation: item.question.explanation
          ? {
              summary: item.question.explanation.summary,
              detailedExplanation: item.question.explanation.detailedExplanation,
              eliminationTechnique: item.question.explanation.eliminationTechnique,
              sourceCitation: item.question.explanation.sourceCitation,
            }
          : null,
      },
    }));

    return NextResponse.json({
      success: true,
      data,
      meta: { total: data.length },
    });
  } catch (error: any) {
    console.error("Error in GET /api/v1/user/revision:", error);
    return NextResponse.json(
      { success: false, error: { code: "REVISION_FETCH_FAILED", message: error.message } },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    const body = await request.json();
    const { scheduleId, questionId, action } = body; // action: "resolve" | "reschedule"

    const whereClause: any = { userId: user.id };
    if (scheduleId) whereClause.id = scheduleId;
    else if (questionId) whereClause.questionId = questionId;
    else {
      return NextResponse.json(
        { success: false, error: { code: "INVALID_PAYLOAD", message: "scheduleId or questionId is required" } },
        { status: 400 }
      );
    }

    if (action === "resolve") {
      await prisma.reviewSchedule.updateMany({
        where: whereClause,
        data: {
          isResolved: true,
          updatedAt: new Date(),
        },
      });

      return NextResponse.json({
        success: true,
        message: "Question marked as resolved/mastered from revision queue.",
      });
    } else {
      // Reschedule for 3 days later
      await prisma.reviewSchedule.updateMany({
        where: whereClause,
        data: {
          repetitionCount: { increment: 1 },
          nextReviewDate: new Date(Date.now() + 3 * 86400000),
          updatedAt: new Date(),
        },
      });

      return NextResponse.json({
        success: true,
        message: "Question rescheduled for review in 3 days.",
      });
    }
  } catch (error: any) {
    console.error("Error in POST /api/v1/user/revision:", error);
    return NextResponse.json(
      { success: false, error: { code: "REVISION_UPDATE_FAILED", message: error.message } },
      { status: 500 }
    );
  }
}
