import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const paperCode = searchParams.get("paper"); // "GS1" | "GS2"
    const yearsParam = searchParams.get("years"); // "2024,2023"
    const subjectParam = searchParams.get("subject");
    const topicParam = searchParams.get("topic");
    const difficulty = searchParams.get("difficulty");
    const search = searchParams.get("q");
    const searchMode = searchParams.get("mode") || "smart"; // "smart" | "exact"
    const status = searchParams.get("status") || "PUBLISHED";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20")));
    const skip = (page - 1) * limit;

    const where: any = {};

    if (status !== "ALL") {
      where.status = status;
    }

    if (paperCode) {
      where.paper = { code: paperCode };
    }

    if (yearsParam) {
      const yearArray = yearsParam
        .split(",")
        .map((y) => parseInt(y.trim()))
        .filter((y) => !isNaN(y));
      if (yearArray.length > 0) {
        where.year = { in: yearArray };
      }
    }

    if (difficulty) {
      where.difficulty = difficulty.toUpperCase();
    }

    const topicConditions: any[] = [];
    if (subjectParam) {
      topicConditions.push({
        topic: {
          subject: {
            OR: [
              { slug: subjectParam.toLowerCase() },
              { name: { contains: subjectParam } },
            ],
          },
        },
      });
    }

    if (topicParam) {
      topicConditions.push({
        topic: {
          OR: [
            { slug: topicParam.toLowerCase() },
            { name: { contains: topicParam } },
          ],
        },
      });
    }

    if (topicConditions.length > 0) {
      where.topics = {
        some: {
          AND: topicConditions,
        },
      };
    }

    if (search && search.trim()) {
      const trimmed = search.trim();
      if (searchMode === "exact") {
        where.OR = [
          { questionText: { contains: trimmed } },
          { options: { some: { optionText: { contains: trimmed } } } },
        ];
      } else {
        where.OR = [
          { questionText: { contains: trimmed } },
          { options: { some: { optionText: { contains: trimmed } } } },
          {
            explanation: {
              OR: [
                { summary: { contains: trimmed } },
                { detailedExplanation: { contains: trimmed } },
                { relatedConcept: { contains: trimmed } },
                { eliminationTechnique: { contains: trimmed } },
              ],
            },
          },
          {
            topics: {
              some: {
                topic: {
                  OR: [
                    { name: { contains: trimmed } },
                    { subject: { name: { contains: trimmed } } },
                  ],
                },
              },
            },
          },
        ];
      }
    }

    const [total, questions] = await Promise.all([
      prisma.question.count({ where }),
      prisma.question.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ year: "desc" }, { questionNumber: "asc" }],
        include: {
          paper: true,
          options: {
            orderBy: { optionCode: "asc" },
          },
          explanation: true,
          answerKeys: {
            take: 1,
            orderBy: { createdAt: "desc" },
          },
          topics: {
            include: {
              topic: {
                include: {
                  subject: true,
                },
              },
            },
          },
        },
      }),
    ]);

    // Format response
    const formatted = questions.map((q) => {
      const primaryTopic = q.topics[0]?.topic;
      const primarySubject = primaryTopic?.subject;
      const correctOption = q.options.find((o) => o.isCorrect)?.optionCode || "A";

      return {
        id: q.id,
        year: q.year,
        questionNumber: q.questionNumber,
        paperCode: q.paper.code,
        paperName: q.paper.name,
        questionText: q.questionText,
        difficulty: q.difficulty,
        isStatic: q.isStatic,
        status: q.status,
        subject: primarySubject?.name || "General Studies",
        subjectSlug: primarySubject?.slug || "general-studies",
        topic: primaryTopic?.name || "Syllabus Concept",
        options: q.options.map((opt) => ({
          id: opt.id,
          code: opt.optionCode,
          text: opt.optionText,
          isCorrect: opt.isCorrect,
        })),
        correctOption,
        explanation: q.explanation
          ? {
              summary: q.explanation.summary,
              detailedExplanation: q.explanation.detailedExplanation,
              eliminationTechnique: q.explanation.eliminationTechnique,
              sourceCitation: q.explanation.sourceCitation,
              relatedConcept: q.explanation.relatedConcept,
            }
          : null,
      };
    });

    return NextResponse.json({
      success: true,
      data: formatted,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasMore: skip + limit < total,
      },
    });
  } catch (error: any) {
    console.error("Error in GET /api/v1/questions:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: error.message || "Failed to retrieve questions",
        },
      },
      { status: 500 }
    );
  }
}
