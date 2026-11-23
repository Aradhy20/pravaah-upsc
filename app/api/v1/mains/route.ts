import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";
import { getFallbackMainsQuestions } from "@/lib/data-fallback";

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

    if (questions.length === 0) {
      const yr = yearStr ? parseInt(yearStr, 10) : null;
      const fallback = getFallbackMainsQuestions(paper, isNaN(yr as number) ? null : yr);
      return NextResponse.json(
        {
          ...fallback,
          dataSource: "FALLBACK",
        },
        { headers: { "X-Data-Source": "FALLBACK" } }
      );
    }

    return NextResponse.json(
      {
        success: true,
        total: questions.length,
        dataSource: "POSTGRESQL",
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
      },
      { headers: { "X-Data-Source": "POSTGRESQL" } }
    );
  } catch (error: any) {
    console.warn("Graceful fallback in GET /api/v1/mains:", error.message);
    const { searchParams } = new URL(request.url);
    const yr = searchParams.get("year") ? parseInt(searchParams.get("year")!, 10) : null;
    const fallback = getFallbackMainsQuestions(searchParams.get("paper"), isNaN(yr as number) ? null : yr);
    return NextResponse.json(
      {
        ...fallback,
        dataSource: "FALLBACK",
      },
      { headers: { "X-Data-Source": "FALLBACK" } }
    );
  }
}
