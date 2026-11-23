import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getFallbackPYQInventory } from "@/lib/data-fallback";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const paperCode = searchParams.get("paper"); // "GS1" | "GS2" | null

    const where: any = { status: "PUBLISHED" };
    if (paperCode && paperCode !== "ALL") {
      where.paper = { code: { equals: paperCode, mode: "insensitive" } };
    }

    // 1. Group by Year
    const yearGroups = await prisma.question.groupBy({
      by: ["year"],
      where,
      _count: { id: true },
      orderBy: { year: "desc" },
    });

    const years = yearGroups.map((yg) => ({
      year: yg.year,
      count: yg._count.id,
    }));

    // 2. Paper counts
    const gs1Count = await prisma.question.count({
      where: {
        status: "PUBLISHED",
        paper: { code: { equals: "GS1", mode: "insensitive" } },
      },
    });

    const gs2Count = await prisma.question.count({
      where: {
        status: "PUBLISHED",
        paper: { code: { equals: "GS2", mode: "insensitive" } },
      },
    });

    // 3. Subjects with active counts
    const subjects = await prisma.subject.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        paper: { select: { code: true } },
        topics: {
          select: {
            id: true,
            name: true,
            slug: true,
            _count: { select: { questions: true } },
          },
        },
      },
    });

    const formattedSubjects = subjects.map((sub) => {
      const qCount = sub.topics.reduce((acc, t) => acc + t._count.questions, 0);
      return {
        id: sub.id,
        name: sub.name,
        slug: sub.slug,
        paperCode: sub.paper?.code || "GS1",
        count: qCount,
        topics: sub.topics.map((t) => ({
          id: t.id,
          name: t.name,
          slug: t.slug,
          count: t._count.questions,
        })),
      };
    });

    if (years.length === 0) {
      const fallback = getFallbackPYQInventory(paperCode);
      return NextResponse.json(
        {
          ...fallback,
          data: {
            ...(fallback as any).data,
            dataSource: "FALLBACK",
          },
        },
        { headers: { "X-Data-Source": "FALLBACK" } }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          total: gs1Count + gs2Count,
          papers: {
            GS1: gs1Count,
            GS2: gs2Count,
          },
          years,
          subjects: formattedSubjects,
          dataSource: "POSTGRESQL",
        },
      },
      { headers: { "X-Data-Source": "POSTGRESQL" } }
    );
  } catch (error: any) {
    console.warn("Graceful fallback in GET /api/v1/pyqs/inventory:", error.message);
    const { searchParams } = new URL(request.url);
    const fallback = getFallbackPYQInventory(searchParams.get("paper"));
    return NextResponse.json(
      {
        ...fallback,
        data: {
          ...(fallback as any).data,
          dataSource: "FALLBACK",
        },
      },
      { headers: { "X-Data-Source": "FALLBACK" } }
    );
  }
}
