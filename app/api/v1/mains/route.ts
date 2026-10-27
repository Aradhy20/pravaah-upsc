import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    const { searchParams } = new URL(request.url);
    const paper = searchParams.get("paper");
    const yearStr = searchParams.get("year");

    const where: any = {};
    if (paper && paper !== "ALL") {
      where.paperCode = paper;
    }
    if (yearStr) {
      const yr = parseInt(yearStr, 10);
      if (!isNaN(yr)) where.year = yr;
    }

    const questions = await prisma.mainsQuestion.findMany({
      where,
      orderBy: [{ year: "desc" }, { questionNumber: "asc" }],
      include: user
        ? {
            drafts: {
              where: { userId: user.id },
            },
          }
        : undefined,
    });

    return NextResponse.json({
      success: true,
      total: questions.length,
      questions: questions.map((q: any) => ({
        id: q.id,
        paperCode: q.paperCode,
        year: q.year,
        questionNumber: q.questionNumber,
        questionText: q.questionText,
        marks: q.marks,
        wordLimit: q.wordLimit,
        theme: q.theme,
        frameworkGuidance: q.frameworkGuidance,
        userDraft: q.drafts && q.drafts.length > 0 ? q.drafts[0] : null,
      })),
    });
  } catch (error: any) {
    console.error("Error fetching Mains questions:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch Mains questions" },
      { status: 500 }
    );
  }
}
