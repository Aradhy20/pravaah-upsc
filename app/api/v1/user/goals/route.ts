import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

const VALID_SUBJECTS = [
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

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    const goals = await prisma.studyGoal.findMany({
      where: { userId: user.id },
      orderBy: [{ isAchieved: "asc" }, { targetDate: "asc" }, { createdAt: "desc" }],
    });

    const now = new Date();
    const enriched = goals.map((g) => ({
      id: g.id,
      title: g.title,
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
    const user = await getCurrentUser(request);
    const body = await request.json();
    const { title, targetDate, targetHours = 2 } = body;

    if (!title || title.trim().length < 3) {
      return NextResponse.json(
        { success: false, error: { code: "INVALID_PAYLOAD", message: "Goal title must be at least 3 characters." } },
        { status: 400 }
      );
    }

    // Limit goals to 30 per user to avoid abuse
    const existingCount = await prisma.studyGoal.count({ where: { userId: user.id, isAchieved: false } });
    if (existingCount >= 30) {
      return NextResponse.json(
        { success: false, error: { code: "GOALS_LIMIT_EXCEEDED", message: "You have reached the maximum of 30 active goals. Mark some as complete to add new ones." } },
        { status: 429 }
      );
    }

    const goal = await prisma.studyGoal.create({
      data: {
        userId: user.id,
        title: title.trim(),
        targetDate: targetDate ? new Date(targetDate) : null,
        targetHours: Number(targetHours) || 2,
        isAchieved: false,
      },
    });

    return NextResponse.json({ success: true, data: goal }, { status: 201 });
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
    const user = await getCurrentUser(request);
    const body = await request.json();
    const { id, title, targetDate, targetHours, isAchieved } = body;

    if (!id) {
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

    const updated = await prisma.studyGoal.update({
      where: { id },
      data: {
        ...(title !== undefined ? { title: title.trim() } : {}),
        ...(targetDate !== undefined ? { targetDate: targetDate ? new Date(targetDate) : null } : {}),
        ...(targetHours !== undefined ? { targetHours: Number(targetHours) } : {}),
        ...(isAchieved !== undefined ? { isAchieved: Boolean(isAchieved) } : {}),
      },
    });

    return NextResponse.json({ success: true, data: updated });
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
    const user = await getCurrentUser(request);
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

    return NextResponse.json({ success: true, data: { id } });
  } catch (error: any) {
    console.error("Error in DELETE /api/v1/user/goals:", error);
    return NextResponse.json(
      { success: false, error: { code: "GOAL_DELETE_FAILED", message: error.message } },
      { status: 500 }
    );
  }
}
