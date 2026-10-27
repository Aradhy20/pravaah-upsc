import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "Admin privileges required" } },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status"); // DRAFT, NEEDS_REVIEW, VERIFIED, PUBLISHED
    const year = searchParams.get("year");
    const paper = searchParams.get("paper");

    const where: any = {};
    if (status) where.status = status;
    if (year) where.year = parseInt(year);
    if (paper) where.paper = { code: paper };

    const questions = await prisma.question.findMany({
      where,
      orderBy: [{ year: "desc" }, { questionNumber: "asc" }],
      include: {
        paper: true,
        options: { orderBy: { optionCode: "asc" } },
        explanation: true,
        answerKeys: { take: 1, orderBy: { createdAt: "desc" } },
        topics: {
          include: {
            topic: { include: { subject: true } },
          },
        },
      },
    });

    const data = questions.map((q) => ({
      id: q.id,
      year: q.year,
      questionNumber: q.questionNumber,
      paperCode: q.paper.code,
      questionText: q.questionText,
      difficulty: q.difficulty,
      status: q.status,
      subject: q.topics[0]?.topic?.subject?.name || "Uncategorized",
      topic: q.topics[0]?.topic?.name || "General",
      correctOption: q.options.find((o) => o.isCorrect)?.optionCode || "A",
      explanation: q.explanation?.summary || "",
      optionsCount: q.options.length,
      createdAt: q.createdAt,
    }));

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error("Error in GET /api/v1/admin/questions:", error);
    return NextResponse.json(
      { success: false, error: { code: "ADMIN_QUESTIONS_FAILED", message: error.message } },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "Admin privileges required" } },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { questionId, questionText, difficulty, status, explanationSummary, correctOption } = body;

    if (!questionId) {
      return NextResponse.json(
        { success: false, error: { code: "INVALID_ID", message: "questionId is required" } },
        { status: 400 }
      );
    }

    // Update question
    const updateData: any = {};
    if (questionText) updateData.questionText = questionText;
    if (difficulty) updateData.difficulty = difficulty;
    if (status) updateData.status = status;

    await prisma.question.update({
      where: { id: questionId },
      data: updateData,
    });

    // Update options if correctOption specified
    if (correctOption) {
      await prisma.questionOption.updateMany({
        where: { questionId },
        data: { isCorrect: false },
      });
      await prisma.questionOption.updateMany({
        where: { questionId, optionCode: correctOption.toUpperCase() },
        data: { isCorrect: true },
      });
    }

    // Update explanation if provided
    if (explanationSummary) {
      await prisma.explanation.upsert({
        where: { questionId },
        update: { summary: explanationSummary },
        create: {
          questionId,
          summary: explanationSummary,
          detailedExplanation: explanationSummary,
        },
      });
    }

    // Audit Log
    await prisma.auditLog.create({
      data: {
        adminId: user.id,
        action: "UPDATE",
        entityType: "QUESTION",
        entityId: questionId,
        detailsJson: JSON.stringify({ updatedFields: Object.keys(body) }),
      },
    });

    return NextResponse.json({ success: true, message: "Question updated successfully" });
  } catch (error: any) {
    console.error("Error in PUT /api/v1/admin/questions:", error);
    return NextResponse.json(
      { success: false, error: { code: "ADMIN_UPDATE_FAILED", message: error.message } },
      { status: 500 }
    );
  }
}
