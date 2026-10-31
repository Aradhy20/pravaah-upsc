import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

const VALID_MISTAKE_REASONS = [
  "Concept not clear",
  "Forgotten fact",
  "Misread question",
  "Incorrect option elimination",
  "Guess",
] as const;

type MistakeReason = (typeof VALID_MISTAKE_REASONS)[number];

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);

    // Retrieve user's mistake records from review schedules
    const schedules = await prisma.reviewSchedule.findMany({
      where: { userId: user.id },
      include: {
        question: {
          include: {
            paper: true,
            topics: {
              include: {
                topic: {
                  include: { subject: true },
                },
              },
            },
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    // Retrieve mistake activity logs
    const activities = await prisma.studyActivity.findMany({
      where: {
        userId: user.id,
        activityType: "mistake_tagged",
      },
      orderBy: { timestamp: "desc" },
      take: 100,
    });

    // Map questionId -> latest tagged mistake reason
    const mistakeMap = new Map<string, string>();
    for (const act of activities) {
      if (act.refId && !mistakeMap.has(act.refId)) {
        // Label format: "Mistake Tag: [Reason]"
        const reason = act.label.replace("Mistake Tag: ", "").trim();
        mistakeMap.set(act.refId, reason);
      }
    }

    // Reason frequency aggregation
    const reasonDistribution: Record<string, number> = {
      "Concept not clear": 0,
      "Forgotten fact": 0,
      "Misread question": 0,
      "Incorrect option elimination": 0,
      "Guess": 0,
    };

    const items = schedules.map((s) => {
      const reason = mistakeMap.get(s.questionId) || "Concept not clear";
      if (reasonDistribution[reason] !== undefined) {
        reasonDistribution[reason] += 1;
      }
      return {
        scheduleId: s.id,
        questionId: s.question.id,
        year: s.question.year,
        questionNumber: s.question.questionNumber,
        paperCode: s.question.paper?.code || "GS1",
        subject: s.question.topics[0]?.topic?.subject?.name || "General Studies",
        topic: s.question.topics[0]?.topic?.name || "General Topic",
        mistakeReason: reason,
        repetitionCount: s.repetitionCount,
        intervalDays: s.intervalDays,
        nextReviewDate: s.nextReviewDate,
        isResolved: s.isResolved,
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        totalMistakes: items.length,
        pendingReviewCount: items.filter((i) => !i.isResolved).length,
        resolvedCount: items.filter((i) => i.isResolved).length,
        reasonDistribution,
        items,
      },
    });
  } catch (error: any) {
    console.error("Error in GET /api/v1/user/mistakes:", error);
    return NextResponse.json(
      { success: false, error: { code: "MISTAKE_FETCH_FAILED", message: error.message } },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    const body = await request.json();
    const { questionId, mistakeReason, intervalDays = 1, notes } = body;

    if (!questionId) {
      return NextResponse.json(
        { success: false, error: { code: "INVALID_QUESTION_ID", message: "questionId is required" } },
        { status: 400 }
      );
    }

    const verifiedReason = VALID_MISTAKE_REASONS.includes(mistakeReason)
      ? mistakeReason
      : "Concept not clear";

    // 1. Upsert ReviewSchedule
    const reviewSchedule = await prisma.reviewSchedule.upsert({
      where: {
        userId_questionId: {
          userId: user.id,
          questionId,
        },
      },
      update: {
        repetitionCount: { increment: 1 },
        intervalDays: Number(intervalDays) || 1,
        nextReviewDate: new Date(Date.now() + (Number(intervalDays) || 1) * 86400000),
        isResolved: false,
        updatedAt: new Date(),
      },
      create: {
        userId: user.id,
        questionId,
        repetitionCount: 1,
        intervalDays: Number(intervalDays) || 1,
        nextReviewDate: new Date(Date.now() + (Number(intervalDays) || 1) * 86400000),
        isResolved: false,
      },
    });

    // 2. Log StudyActivity
    await prisma.studyActivity.create({
      data: {
        userId: user.id,
        activityType: "mistake_tagged",
        label: `Mistake Tag: ${verifiedReason}`,
        refId: questionId,
        durationSeconds: 0,
      },
    });

    // 3. If student added notes, record in UserNote
    if (notes && typeof notes === "string") {
      await prisma.userNote.upsert({
        where: {
          userId_questionId: {
            userId: user.id,
            questionId,
          },
        },
        update: {
          content: `[Root Cause: ${verifiedReason}] ${notes}`,
          updatedAt: new Date(),
        },
        create: {
          userId: user.id,
          questionId,
          content: `[Root Cause: ${verifiedReason}] ${notes}`,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        questionId,
        mistakeReason: verifiedReason,
        intervalDays: reviewSchedule.intervalDays,
        nextReviewDate: reviewSchedule.nextReviewDate,
        message: `Tagged as '${verifiedReason}'. Added to spaced revision queue for review in ${reviewSchedule.intervalDays} day(s).`,
      },
    });
  } catch (error: any) {
    console.error("Error in POST /api/v1/user/mistakes:", error);
    return NextResponse.json(
      { success: false, error: { code: "MISTAKE_LOG_FAILED", message: error.message } },
      { status: 500 }
    );
  }
}
