import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { checkQuota } from "@/lib/entitlements";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    const bookmarks = await prisma.bookmark.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: {
        question: {
          include: {
            paper: true,
            options: { orderBy: { optionCode: "asc" } },
            explanation: true,
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
    });

    const data = bookmarks.map((b) => ({
      bookmarkId: b.id,
      folderTag: b.folderTag,
      createdAt: b.createdAt,
      question: {
        id: b.question.id,
        year: b.question.year,
        questionNumber: b.question.questionNumber,
        paperCode: b.question.paper.code,
        questionText: b.question.questionText,
        subject: b.question.topics[0]?.topic?.subject?.name || "General Studies",
        topic: b.question.topics[0]?.topic?.name || "General Concept",
        options: b.question.options.map((o) => ({
          code: o.optionCode,
          text: o.optionText,
          isCorrect: o.isCorrect,
        })),
        correctOption: b.question.options.find((o) => o.isCorrect)?.optionCode || "A",
        explanation: b.question.explanation
          ? {
              summary: b.question.explanation.summary,
              detailedExplanation: b.question.explanation.detailedExplanation,
              sourceCitation: b.question.explanation.sourceCitation,
            }
          : null,
      },
    }));

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error("Error in GET /api/v1/user/bookmarks:", error);
    return NextResponse.json(
      { success: false, error: { code: "BOOKMARKS_FETCH_FAILED", message: error.message } },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    const body = await request.json();
    const { questionId, folderTag = "Default" } = body;

    if (!questionId) {
      return NextResponse.json(
        { success: false, error: { code: "INVALID_PAYLOAD", message: "questionId is required" } },
        { status: 400 }
      );
    }

    // Toggle bookmark
    const existing = await prisma.bookmark.findUnique({
      where: {
        userId_questionId: {
          userId: user.id,
          questionId,
        },
      },
    });

    if (existing) {
      await prisma.bookmark.delete({
        where: { id: existing.id },
      });
      return NextResponse.json({
        success: true,
        data: { questionId, bookmarked: false },
      });
    } else {
      const currentCount = await prisma.bookmark.count({ where: { userId: user.id } });
      const quota = await checkQuota(user.id, "BOOKMARKS_LIMIT", currentCount);
      if (!quota.allowed) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "QUOTA_EXCEEDED",
              message: `You have reached your limit of ${quota.maxAllowed} bookmarks on your current plan. Upgrade to Prelims Pro for unlimited bookmarks.`,
              upgradeUrl: "/pricing",
            },
          },
          { status: 403 }
        );
      }

      const created = await prisma.bookmark.create({
        data: {
          userId: user.id,
          questionId,
          folderTag,
        },
      });
      return NextResponse.json({
        success: true,
        data: { questionId, bookmarked: true, id: created.id },
      });
    }
  } catch (error: any) {
    console.error("Error in POST /api/v1/user/bookmarks:", error);
    return NextResponse.json(
      { success: false, error: { code: "BOOKMARK_TOGGLE_FAILED", message: error.message } },
      { status: 500 }
    );
  }
}
