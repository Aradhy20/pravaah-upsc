import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkAdminAccess } from "@/lib/auth";

export const dynamic = "force-dynamic";

/**
 * POST /api/v1/admin/pyqs/publish
 * Fast publishing endpoint for verified PYQ batches
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await checkAdminAccess(request);
    if (!auth.authorized) {
      return auth.response;
    }
    const user = auth.user;

    const body = await request.json();
    const { questionIds, year, paperCode } = body;

    const where: any = {
      status: { not: "PUBLISHED" },
      options: { some: { isCorrect: true } },
    };

    if (Array.isArray(questionIds) && questionIds.length > 0) {
      where.id = { in: questionIds };
    } else if (year || paperCode) {
      if (year) where.year = parseInt(year);
      if (paperCode) where.paper = { code: paperCode };
    } else {
      return NextResponse.json(
        { success: false, error: { code: "INVALID_REQUEST", message: "Provide questionIds[] or year/paperCode" } },
        { status: 400 }
      );
    }

    // Ensure they have 4 options
    const candidates = await prisma.question.findMany({
      where,
      include: { options: true },
    });

    const eligible = candidates.filter((q) => q.options.length >= 4);

    if (eligible.length === 0) {
      const alreadyPublished = await prisma.question.count({
        where: {
          status: "PUBLISHED",
          ...(year ? { year: parseInt(year) } : {}),
          ...(paperCode ? { paper: { code: paperCode } } : {}),
        },
      });

      if (alreadyPublished > 0) {
        return NextResponse.json({
          success: true,
          data: {
            message: `All ${alreadyPublished} questions matching criteria are already verified and published.`,
            publishedCount: alreadyPublished,
            alreadyPublished: true,
          },
        });
      }

      return NextResponse.json({
        success: false,
        error: {
          code: "NO_QUALIFIED_QUESTIONS",
          message: "No questions meeting quality standards (4 options + answer key) were found.",
        },
      });
    }

    const eligibleIds = eligible.map((q) => q.id);

    const updateRes = await prisma.question.updateMany({
      where: { id: { in: eligibleIds } },
      data: {
        status: "PUBLISHED",
        verifiedAt: new Date(),
      },
    });

    await prisma.auditLog.create({
      data: {
        adminId: user.id,
        action: "BATCH_PUBLISH_PYQS",
        entityType: "QUESTION_BATCH",
        entityId: eligibleIds[0],
        detailsJson: JSON.stringify({
          publishedCount: updateRes.count,
          eligibleIds,
          criteria: { year, paperCode },
        }),
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        message: `Successfully published ${updateRes.count} verified questions.`,
        publishedCount: updateRes.count,
        questionIds: eligibleIds,
      },
    });
  } catch (error: any) {
    console.error("Error in POST /api/v1/admin/pyqs/publish:", error);
    return NextResponse.json(
      { success: false, error: { code: "PUBLISH_FAILED", message: error.message } },
      { status: 500 }
    );
  }
}
