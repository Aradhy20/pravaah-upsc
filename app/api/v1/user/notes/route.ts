import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuthenticatedUser } from "@/lib/auth";
import { checkQuota } from "@/lib/entitlements";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuthenticatedUser(request);
    if (auth.error) return auth.error;
    const user = auth.user;

    const notes = await prisma.userNote.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: "desc" },
      include: {
        question: {
          include: {
            paper: true,
            topics: {
              include: {
                topic: { include: { subject: true } },
              },
            },
          },
        },
      },
    });

    const data = notes.map((n) => ({
      id: n.id,
      content: n.content,
      updatedAt: n.updatedAt,
      questionId: n.questionId,
      question: {
        id: n.question.id,
        year: n.question.year,
        questionNumber: n.question.questionNumber,
        paperCode: n.question.paper.code,
        questionText: n.question.questionText,
        subject: n.question.topics[0]?.topic?.subject?.name || "General Studies",
        topic: n.question.topics[0]?.topic?.name || "Concept",
      },
    }));

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error("Error in GET /api/v1/user/notes:", error);
    return NextResponse.json(
      { success: false, error: { code: "NOTES_FETCH_FAILED", message: error.message } },
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
    const { questionId, content } = body;

    if (!questionId || content === undefined || typeof content !== "string") {
      return NextResponse.json(
        { success: false, error: { code: "INVALID_PAYLOAD", message: "questionId and content are required" } },
        { status: 400 }
      );
    }

    const existing = await prisma.userNote.findUnique({
      where: {
        userId_questionId: {
          userId: user.id,
          questionId,
        },
      },
    });

    if (!existing) {
      const currentCount = await prisma.userNote.count({ where: { userId: user.id } });
      const quota = await checkQuota(user.id, "NOTES_LIMIT", currentCount);
      if (!quota.allowed) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "QUOTA_EXCEEDED",
              message: `You have reached your limit of ${quota.maxAllowed} notes on your current plan. Upgrade to Prelims Pro for unlimited notes.`,
              upgradeUrl: "/pricing",
            },
          },
          { status: 403 }
        );
      }
    }

    const note = await prisma.userNote.upsert({
      where: {
        userId_questionId: {
          userId: user.id,
          questionId,
        },
      },
      update: {
        content: content.trim(),
        updatedAt: new Date(),
      },
      create: {
        userId: user.id,
        questionId,
        content: content.trim(),
      },
    });

    return NextResponse.json({ success: true, data: note });
  } catch (error: any) {
    console.error("Error in POST /api/v1/user/notes:", error);
    return NextResponse.json(
      { success: false, error: { code: "NOTE_SAVE_FAILED", message: error.message } },
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
    const noteId = searchParams.get("id");
    const questionId = searchParams.get("questionId");

    if (!noteId && !questionId) {
      return NextResponse.json(
        { success: false, error: { code: "INVALID_PAYLOAD", message: "Note id or questionId is required." } },
        { status: 400 }
      );
    }

    let noteToDelete;
    if (noteId) {
      noteToDelete = await prisma.userNote.findUnique({ where: { id: noteId } });
    } else if (questionId) {
      noteToDelete = await prisma.userNote.findUnique({
        where: {
          userId_questionId: {
            userId: user.id,
            questionId,
          },
        },
      });
    }

    if (!noteToDelete || noteToDelete.userId !== user.id) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Note not found or access denied." } },
        { status: 404 }
      );
    }

    await prisma.userNote.delete({ where: { id: noteToDelete.id } });

    return NextResponse.json({ success: true, data: { id: noteToDelete.id, questionId: noteToDelete.questionId } });
  } catch (error: any) {
    console.error("Error in DELETE /api/v1/user/notes:", error);
    return NextResponse.json(
      { success: false, error: { code: "NOTE_DELETE_FAILED", message: error.message } },
      { status: 500 }
    );
  }
}
