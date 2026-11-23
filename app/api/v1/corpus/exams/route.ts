import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * GET /api/v1/corpus/exams
 * Returns the directory of all 241 official UPSC examination instances
 * across examination families (CSE, CDS, NDA, IFOS, CAPF, CMS, ESE, CGS, IES_ISS, etc.)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const family = searchParams.get("family");
    const yearParam = searchParams.get("year");

    const where: any = {};
    if (family && family !== "ALL") {
      where.examFamily = family.toUpperCase();
    }
    if (yearParam && yearParam !== "ALL") {
      const yr = parseInt(yearParam, 10);
      if (!isNaN(yr)) {
        where.year = yr;
      }
    }

    const [total, exams, familyStats] = await Promise.all([
      prisma.corpusExam.count({ where }),
      prisma.corpusExam.findMany({
        where,
        orderBy: [{ year: "desc" }, { examName: "asc" }],
        include: {
          _count: {
            select: { documents: true }
          }
        }
      }),
      prisma.corpusExam.groupBy({
        by: ["examFamily"],
        _count: { _all: true }
      })
    ]);

    const formattedExams = exams.map(e => ({
      id: e.id,
      examName: e.examName,
      year: e.year,
      examFamily: e.examFamily,
      registryStatus: e.registryStatus,
      totalDocuments: e._count.documents
    }));

    return NextResponse.json({
      success: true,
      total,
      familyBreakdown: familyStats.map(f => ({ family: f.examFamily, count: f._count._all })),
      exams: formattedExams
    });

  } catch (error: any) {
    console.error("Error fetching corpus exams:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch corpus exams", details: error.message },
      { status: 500 }
    );
  }
}
