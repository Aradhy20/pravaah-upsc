import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "Admin privileges required" } },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { questionId, targetStatus } = body; // "NEEDS_REVIEW" | "VERIFIED" | "PUBLISHED" | "ARCHIVED"

    if (!questionId || !targetStatus) {
      return NextResponse.json(
        { success: false, error: { code: "INVALID_PAYLOAD", message: "questionId and targetStatus are required" } },
        { status: 400 }
      );
    }

    const question = await prisma.question.findUnique({
      where: { id: questionId },
      include: {
        options: true,
        explanation: true,
      },
    });

    if (!question) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Question not found" } },
        { status: 404 }
      );
    }

    // STRICT GUARDRAIL: Cannot publish directly from DRAFT or without at least 4 options and verified explanation!
    if (targetStatus === "PUBLISHED") {
      if (question.status === "DRAFT") {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "GUARDRAIL_VIOLATION",
              message: "Cannot publish directly from DRAFT. Question must be thoroughly reviewed and marked VERIFIED first.",
            },
          },
          { status: 400 }
        );
      }

      if (question.options.length < 4) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "INCOMPLETE_OPTIONS",
              message: "Question must have at least 4 options to be published.",
            },
          },
          { status: 400 }
        );
      }

      const hasCorrect = question.options.some((o) => o.isCorrect);
      if (!hasCorrect) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "MISSING_CORRECT_KEY",
              message: "Question must have an authorized correct answer key to be published.",
            },
          },
          { status: 400 }
        );
      }
    }

    // Update status
    await prisma.question.update({
      where: { id: questionId },
      data: {
        status: targetStatus,
        verifiedAt: targetStatus === "VERIFIED" || targetStatus === "PUBLISHED" ? new Date() : question.verifiedAt,
      },
    });

    // Audit Log
    await prisma.auditLog.create({
      data: {
        adminId: user.id,
        action: targetStatus === "PUBLISHED" ? "PUBLISH" : "STATUS_CHANGE",
        entityType: "QUESTION",
        entityId: questionId,
        detailsJson: JSON.stringify({
          fromStatus: question.status,
          toStatus: targetStatus,
        }),
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        questionId,
        previousStatus: question.status,
        newStatus: targetStatus,
      },
    });
  } catch (error: any) {
    console.error("Error in POST /api/v1/admin/publish:", error);
    return NextResponse.json(
      { success: false, error: { code: "STATUS_UPDATE_FAILED", message: error.message } },
      { status: 500 }
    );
  }
}
