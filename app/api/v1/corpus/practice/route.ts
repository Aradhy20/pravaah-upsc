import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * GET /api/v1/corpus/practice
 * Retrieval endpoint for generated practice questions.
 * DATA INTEGRITY GUARANTEE:
 * Returns ONLY questions from GeneratedPracticeQuestion table,
 * each explicitly marked with contentLabel = 'GENERATED_PRACTICE_NOT_OFFICIAL_PYQ'.
 * These are completely isolated from the official Question table.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const subject = searchParams.get("subject");
    const difficulty = searchParams.get("difficulty");
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "10", 10)));

    const where: any = {
      contentLabel: "GENERATED_PRACTICE_NOT_OFFICIAL_PYQ"
    };

    if (subject && subject !== "ALL") {
      where.syllabusSubject = { contains: subject, mode: "insensitive" };
    }

    if (difficulty && difficulty !== "ALL") {
      where.difficulty = difficulty.toUpperCase();
    }

    const [total, questions] = await Promise.all([
      prisma.generatedPracticeQuestion.count({ where }),
      prisma.generatedPracticeQuestion.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: limit
      })
    ]);

    return NextResponse.json({
      success: true,
      meta: {
        total,
        isOfficialPYQ: false,
        contentCategory: "GENERATED_PRACTICE_NOT_OFFICIAL_PYQ",
        dataIntegrityNote: "Generated practice items are strictly separated from authentic UPSC PYQ counts."
      },
      practiceQuestions: questions
    });

  } catch (error: any) {
    console.error("Error fetching practice questions:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch practice questions", details: error.message },
      { status: 500 }
    );
  }
}
