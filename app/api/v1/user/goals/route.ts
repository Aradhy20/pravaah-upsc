import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuthenticatedUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

const VALID_UPSC_SUBJECTS = [
  "Polity & Governance",
  "History & Art & Culture",
  "Geography",
  "Economy & Social Development",
  "Environment & Ecology",
  "Science & Technology",
  "CSAT & Reasoning",
  "Current Affairs",
  "Mains Answer Writing",
] as const;

type ValidUPSCSubject = (typeof VALID_UPSC_SUBJECTS)[number];

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuthenticatedUser(request);
    if (auth.error) return auth.error;
    const user = auth.user;

    const { searchParams } = new URL(request.url);
    const subjectParam = searchParams.get("subject");

    const whereClause: any = { userId: user.id };
    if (subjectParam && subjectParam !== "All") {
      whereClause.subject = subjectParam;
    }

    const goals = await prisma.studyGoal.findMany({
      where: whereClause,
      orderBy: [{ isAchieved: "asc" }, { targetDate: "asc" }, { createdAt: "desc" }],
    });

    const now = new Date();
    const enriched = goals.map((g) => ({
      id: g.id,
      title: g.title,
      subject: g.subject || null,
      targetDate: g.targetDate,
      targetHours: g.targetHours,
      isAchieved: g.isAchieved,
      isOverdue: g.targetDate ? g.targetDate < now && !g.isAchieved : false,
      daysRemaining: g.targetDate
        ? Math.ceil((g.targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        : null,
      createdAt: g.createdAt,
    }));

    return NextResponse.json({ success: true, data: enriched });
  } catch (error: any) {
    console.error("Error in GET /api/v1/user/goals:", error);
    return NextResponse.json(
      { success: false, error: { code: "GOALS_FETCH_FAILED", message: error.message } },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuthenticatedUser(request);
    if (auth.error) return auth.error;
    const user = auth.user;

    const body = await request.json();
    const { title, subject, targetDate, targetHours = 2 } = body;

    // 1. Title validation
    if (!title || typeof title !== "string" || title.trim().length < 3 || title.trim().length > 120) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_TITLE",
            message: "Goal title must be a non-empty string between 3 and 120 characters.",
          },
        },
        { status: 400 }
      );
    }

    // 2. Subject validation
    let sanitizedSubject: string | null = null;
    if (subject) {
      if (typeof subject !== "string" || !VALID_UPSC_SUBJECTS.includes(subject as any)) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "INVALID_SUBJECT",
              message: `Subject must be one of the recognized UPSC subjects: ${VALID_UPSC_SUBJECTS.join(", ")}`,
            },
          },
          { status: 400 }
        );
      }
      sanitizedSubject = subject;
    }

    // 3. Target hours validation
    const hoursNum = Number(targetHours);
    if (isNaN(hoursNum) || !isFinite(hoursNum) || hoursNum < 0.5 || hoursNum > 100) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_TARGET_HOURS",
            message: "Target hours must be a positive finite number between 0.5 and 100 hours.",
          },
        },
        { status: 400 }
      );
    }

    // 4. Target date validation
    let parsedTargetDate: Date | null = null;
    if (targetDate) {
      parsedTargetDate = new Date(targetDate);
      if (isNaN(parsedTargetDate.getTime())) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "INVALID_TARGET_DATE",
              message: "Target date must be a valid ISO date string.",
            },
          },
          { status: 400 }
        );
      }
    }

    // 5. Active goal limit check
    const existingCount = await prisma.studyGoal.count({
      where: { userId: user.id, isAchieved: false },
    });
    if (existingCount >= 30) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "GOALS_LIMIT_EXCEEDED",
            message: "You have reached the maximum of 30 active goals. Mark some as complete to add new ones.",
          },
        },
        { status: 429 }
      );
    }

    const goal = await prisma.studyGoal.create({
      data: {
        userId: user.id,
        title: title.trim(),
        subject: sanitizedSubject,
        targetDate: parsedTargetDate,
        targetHours: hoursNum,
        isAchieved: false,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          id: goal.id,
          title: goal.title,
          subject: goal.subject,
          targetDate: goal.targetDate,
          targetHours: goal.targetHours,
          isAchieved: goal.isAchieved,
          createdAt: goal.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error in POST /api/v1/user/goals:", error);
    return NextResponse.json(
      { success: false, error: { code: "GOAL_CREATE_FAILED", message: error.message } },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const auth = await requireAuthenticatedUser(request);
    if (auth.error) return auth.error;
    const user = auth.user;

    const body = await request.json();
    const { id, title, subject, targetDate, targetHours, isAchieved } = body;

    if (!id || typeof id !== "string") {
      return NextResponse.json(
        { success: false, error: { code: "INVALID_PAYLOAD", message: "Goal id is required." } },
        { status: 400 }
      );
    }

    // Verify ownership before update
    const existing = await prisma.studyGoal.findUnique({ where: { id } });
    if (!existing || existing.userId !== user.id) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Goal not found or access denied." } },
        { status: 404 }
      );
    }

    const updateData: any = {};

    if (title !== undefined) {
      if (typeof title !== "string" || title.trim().length < 3 || title.trim().length > 120) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "INVALID_TITLE",
              message: "Goal title must be a non-empty string between 3 and 120 characters.",
            },
          },
          { status: 400 }
        );
      }
      updateData.title = title.trim();
    }

    if (subject !== undefined) {
      if (subject !== null && (!VALID_UPSC_SUBJECTS.includes(subject as any) || typeof subject !== "string")) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "INVALID_SUBJECT",
              message: `Subject must be one of the recognized UPSC subjects: ${VALID_UPSC_SUBJECTS.join(", ")}`,
            },
          },
          { status: 400 }
        );
      }
      updateData.subject = subject;
    }

    if (targetHours !== undefined) {
      const hoursNum = Number(targetHours);
      if (isNaN(hoursNum) || !isFinite(hoursNum) || hoursNum < 0.5 || hoursNum > 100) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "INVALID_TARGET_HOURS",
              message: "Target hours must be a positive finite number between 0.5 and 100 hours.",
            },
          },
          { status: 400 }
        );
      }
      updateData.targetHours = hoursNum;
    }

    if (targetDate !== undefined) {
      if (targetDate === null) {
        updateData.targetDate = null;
      } else {
        const parsed = new Date(targetDate);
        if (isNaN(parsed.getTime())) {
          return NextResponse.json(
            {
              success: false,
              error: { code: "INVALID_TARGET_DATE", message: "Target date must be a valid ISO date string." },
            },
            { status: 400 }
          );
        }
        updateData.targetDate = parsed;
      }
    }

    if (isAchieved !== undefined) {
      updateData.isAchieved = Boolean(isAchieved);
    }

    const updated = await prisma.studyGoal.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      data: {
        id: updated.id,
        title: updated.title,
        subject: updated.subject,
        targetDate: updated.targetDate,
        targetHours: updated.targetHours,
        isAchieved: updated.isAchieved,
      },
    });
  } catch (error: any) {
    console.error("Error in PATCH /api/v1/user/goals:", error);
    return NextResponse.json(
      { success: false, error: { code: "GOAL_UPDATE_FAILED", message: error.message } },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const auth = await requireAuthenticatedUser(request);
    if (auth.error) return auth.error;
    const user = auth.user;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: { code: "INVALID_PAYLOAD", message: "Goal id query param is required." } },
        { status: 400 }
      );
    }

    // Verify ownership before delete
    const existing = await prisma.studyGoal.findUnique({ where: { id } });
    if (!existing || existing.userId !== user.id) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Goal not found or access denied." } },
        { status: 404 }
      );
    }

    await prisma.studyGoal.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: "Study goal deleted successfully.",
    });
  } catch (error: any) {
    console.error("Error in DELETE /api/v1/user/goals:", error);
    return NextResponse.json(
      { success: false, error: { code: "GOAL_DELETE_FAILED", message: error.message } },
      { status: 500 }
    );
  }
}
