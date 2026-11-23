import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { and, or } from "@prisma/orm-postgres/orm-client";
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

    type StoryAccessor = any;
    const conditions: ((s: StoryAccessor) => any)[] = [];

    conditions.push((s) => s.status.eq("PUBLISHED"));

    if (paper && paper !== "ALL") {
      conditions.push((s) => s.topics.some((t: any) => t.syllabusPaper.eq(paper)));
    }

    if (search) {
      conditions.push((s) => or(
        s.title.ilike(`%${search}%`),
        s.summary.ilike(`%${search}%`),
        s.termsList.ilike(`%${search}%`),
      ));
    }

    const filtered = conditions.length > 0
      ? prisma.orm.public.CurrentAffairsStory.where((s) => and(...conditions.map((c) => c(s))))
      : prisma.orm.public.CurrentAffairsStory;

    const [total, stories] = await Promise.all([
      filtered.aggregate((a) => ({ n: a.count() })).then((r) => r.n),
      filtered
        .include("topics")
        .include("questionLinks", (qls) =>
          qls.include("question", (question) =>
            question
              .select("id", "year", "questionNumber")
              .include("paper", (p) => p.select("code")),
          ),
        )
        .orderBy((s) => s.publishedAt.desc())
        .offset(skip)
        .limit(limit)
        .all(),
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
