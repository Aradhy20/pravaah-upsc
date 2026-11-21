import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getFallbackCurrentAffairs } from "@/lib/data-fallback";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const paper = searchParams.get("paper");
    const search = searchParams.get("search");
    const limit = Math.min(parseInt(searchParams.get("limit") || "10", 10), 50);
    const page = Math.max(parseInt(searchParams.get("page") || "1", 10), 1);
    const skip = (page - 1) * limit;

    const where: any = {
      status: "PUBLISHED",
    };

    if (paper && paper !== "ALL") {
      where.topics = {
        some: {
          syllabusPaper: paper,
        },
      };
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { summary: { contains: search, mode: "insensitive" } },
        { termsList: { contains: search, mode: "insensitive" } },
      ];
    }

    const [total, stories] = await Promise.all([
      prisma.currentAffairsStory.count({ where }),
      prisma.currentAffairsStory.findMany({
        where,
        skip,
        take: limit,
        orderBy: { publishedAt: "desc" },
        include: {
          topics: true,
          questionLinks: {
            include: {
              question: {
                select: {
                  id: true,
                  year: true,
                  questionNumber: true,
                  paper: { select: { code: true } },
                },
              },
            },
          },
        },
      }),
    ]);

    if (stories.length === 0) {
      return NextResponse.json(getFallbackCurrentAffairs(paper, search, skip, limit));
    }

    return NextResponse.json({
      success: true,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      stories: stories.map((s) => ({
        id: s.id,
        title: s.title,
        slug: s.slug,
        summary: s.summary,
        importancePrelims: s.importancePrelims,
        importanceMains: s.importanceMains,
        sourceName: s.sourceName,
        sourceUrl: s.sourceUrl,
        publishedAt: s.publishedAt,
        terms: s.termsList ? s.termsList.split(",").map((t) => t.trim()) : [],
        topics: s.topics.map((t) => ({
          paper: t.syllabusPaper,
          name: t.topicName,
        })),
        linkedPyqsCount: s.questionLinks.length,
        linkedPyqs: s.questionLinks.map((ql) => ({
          questionId: ql.questionId,
          year: ql.question.year,
          paper: ql.question.paper?.code || "GS1",
          questionNumber: ql.question.questionNumber,
          rationale: ql.relationshipRationale,
        })),
      })),
    });
  } catch (error: any) {
    console.warn("Graceful fallback in GET /api/v1/current-affairs:", error.message);
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get("limit") || "10", 10), 50);
    const page = Math.max(parseInt(searchParams.get("page") || "1", 10), 1);
    const skip = (page - 1) * limit;
    return NextResponse.json(
      getFallbackCurrentAffairs(searchParams.get("paper"), searchParams.get("search"), skip, limit)
    );
  }
}
