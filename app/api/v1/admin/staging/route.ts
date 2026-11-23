import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkAdminAccess } from "@/lib/auth";
import {
  stageQuestionRecord,
  approveStagedRecord,
  rejectStagedRecord,
  publishStagedRecord,
} from "@/scripts/pyq/stage-questions";

export const dynamic = "force-dynamic";

/**
 * GET /api/v1/admin/staging
 * Lists staged questions with filtering and workflow status counts
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await checkAdminAccess(request);
    if (!auth.authorized) {
      return auth.response;
    }

    const { searchParams } = new URL(request.url);
    const workflowStatus = searchParams.get("status");
    const year = searchParams.get("year");
    const paperCode = searchParams.get("paperCode");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const skip = (page - 1) * limit;

    const where: any = {};
    if (workflowStatus) where.workflowStatus = workflowStatus;
    if (year) where.year = parseInt(year, 10);
    if (paperCode) where.paperCode = paperCode.toUpperCase();

    const [total, records, statusCounts] = await Promise.all([
      prisma.questionStagingRecord.count({ where }),
      prisma.questionStagingRecord.findMany({
        where,
        orderBy: [{ year: "desc" }, { questionNumber: "asc" }],
        skip,
        take: limit,
      }),
      prisma.questionStagingRecord.groupBy({
        by: ["workflowStatus"],
        _count: { _all: true },
      }),
    ]);

    const summary = {
      totalStaged: 0,
      imported: 0,
      awaitingVerification: 0,
      verified: 0,
      approvedForPublication: 0,
      published: 0,
      rejectedOrArchived: 0,
    };

    for (const sc of statusCounts) {
      summary.totalStaged += sc._count._all;
      if (sc.workflowStatus === "IMPORTED") summary.imported = sc._count._all;
      else if (sc.workflowStatus === "AWAITING_VERIFICATION") summary.awaitingVerification = sc._count._all;
      else if (sc.workflowStatus === "VERIFIED") summary.verified = sc._count._all;
      else if (sc.workflowStatus === "APPROVED_FOR_PUBLICATION") summary.approvedForPublication = sc._count._all;
      else if (sc.workflowStatus === "PUBLISHED") summary.published = sc._count._all;
      else if (sc.workflowStatus === "REJECTED_OR_ARCHIVED") summary.rejectedOrArchived = sc._count._all;
    }

    return NextResponse.json({
      success: true,
      data: {
        summary,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
        records,
      },
    });
  } catch (error: any) {
    console.error("Error in GET /api/v1/admin/staging:", error);
    return NextResponse.json(
      { success: false, error: { code: "STAGING_FETCH_FAILED", message: error.message } },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v1/admin/staging
 * Admin actions: STAGE, APPROVE, REJECT, PUBLISH
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await checkAdminAccess(request);
    if (!auth.authorized) {
      return auth.response;
    }
    const user = auth.user;

    const body = await request.json();
    const { action, stagingId, input, reason } = body;

    if (!action) {
      return NextResponse.json(
        { success: false, error: { code: "INVALID_PAYLOAD", message: "action is required" } },
        { status: 400 }
      );
    }

    if (action === "STAGE") {
      if (!input) {
        return NextResponse.json(
          { success: false, error: { code: "INVALID_PAYLOAD", message: "input object is required for STAGE" } },
          { status: 400 }
        );
      }
      const result = await stageQuestionRecord(prisma, input);
      return NextResponse.json({ success: true, data: result });
    }

    if (!stagingId) {
      return NextResponse.json(
        { success: false, error: { code: "INVALID_PAYLOAD", message: "stagingId is required for " + action } },
        { status: 400 }
      );
    }

    if (action === "APPROVE") {
      const updated = await approveStagedRecord(prisma, stagingId, user.id);
      return NextResponse.json({ success: true, data: updated });
    }

    if (action === "REJECT") {
      const updated = await rejectStagedRecord(prisma, stagingId, reason || "Rejected by administrator", user.id);
      return NextResponse.json({ success: true, data: updated });
    }

    if (action === "PUBLISH") {
      const published = await publishStagedRecord(prisma, stagingId, user.id);
      return NextResponse.json({ success: true, data: published });
    }

    return NextResponse.json(
      { success: false, error: { code: "UNKNOWN_ACTION", message: `Unknown staging action: ${action}` } },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("Error in POST /api/v1/admin/staging:", error);
    return NextResponse.json(
      { success: false, error: { code: "STAGING_ACTION_FAILED", message: error.message } },
      { status: 500 }
    );
  }
}
