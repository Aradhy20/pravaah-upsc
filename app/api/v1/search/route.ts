import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q")?.trim();
    const mode = searchParams.get("mode") || "smart"; // "smart" | "exact"
    const paperCode = searchParams.get("paper");

    if (!query) {
      return NextResponse.json({
        success: true,
        data: [],
        meta: { query: "", total: 0 },
      });
    }

    const where: any = {
      status: "PUBLISHED",
    };

    if (paperCode) {
      where.paper = { code: paperCode };
    }

    if (mode === "exact") {
      where.OR = [
        { questionText: { contains: query } },
        {
          options: {
            some: { optionText: { contains: query } },
          },
        },
      ];
    } else {
      // Smart Concept search: stems, explanations, topics, and subjects
      where.OR = [
        { questionText: { contains: query } },
        {
          explanation: {
            OR: [
              { summary: { contains: query } },
              { detailedExplanation: { contains: query } },
              { relatedConcept: { contains: query } },
            ],
          },
        },
        {
          topics: {
            some: {
              topic: {
                OR: [
                  { name: { contains: query } },
                  { subject: { name: { contains: query } } },
                ],
              },
            },
          },
        },
      ];
    }

    const questions = await prisma.question.findMany({
      where,
      take: 20,
      orderBy: [{ year: "desc" }, { questionNumber: "asc" }],
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
    });

    const formatted = questions.map((q) => ({
      id: q.id,
      year: q.year,
      questionNumber: q.questionNumber,
      paperCode: q.paper.code,
      questionText: q.questionText,
      subject: q.topics[0]?.topic?.subject?.name || "General Studies",
      topic: q.topics[0]?.topic?.name || "Concept",
      options: q.options.map((o) => ({
        code: o.optionCode,
        text: o.optionText,
      })),
      correctOption: q.options.find((o) => o.isCorrect)?.optionCode || "A",
      explanation: q.explanation?.summary || "",
    }));

    return NextResponse.json({
      success: true,
      data: formatted,
      meta: {
        query,
        mode,
        total: formatted.length,
      },
    });
  } catch (error: any) {
    console.error("Error in GET /api/v1/search:", error);
    return NextResponse.json(
      {
        success: false,
        error: { code: "SEARCH_FAILED", message: error.message },
      },
      { status: 500 }
    );
  }
}
