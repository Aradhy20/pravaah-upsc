import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const examFilter = searchParams.get("exam");

    const examWhere: any = {};
    if (examFilter && examFilter !== "ALL") {
      examWhere.examFamily = examFilter;
    }

    const [
      totalQuestions,
      verifiedAnswersCount,
      examFamilies,
      examYears,
      knowledgeSourcesCount,
      questionsByYearAndPaper,
    ] = await Promise.all([
      prisma.question.count(),
      prisma.questionAnswer.count({
        where: { verificationStatus: "OFFICIALLY_VERIFIED" },
      }),
      prisma.exam.findMany({ orderBy: { code: "asc" } }),
      prisma.examYear.findMany({
        where: examWhere,
        orderBy: [{ examFamily: "asc" }, { year: "desc" }],
      }),
      prisma.knowledgeSource.count(),
      prisma.question.groupBy({
        by: ["year", "paperId"],
        _count: { id: true },
      }),
    ]);

    // Group harvest status across all 448 records
    const statusBreakdown: Record<string, number> = {
      COMPLETED: 0,
      EXTRACTED: 0,
      DISCOVERED: 0,
      NOT_HARVESTED: 0,
      UNAVAILABLE: 0,
    };

    examYears.forEach((ey) => {
      const s = ey.downloadStatus || "NOT_HARVESTED";
      statusBreakdown[s] = (statusBreakdown[s] || 0) + 1;
    });

    // Group by exam family
    const familyMap = new Map<string, any>();

    examYears.forEach((ey) => {
      let entry = familyMap.get(ey.examFamily);
      if (!entry) {
        const ef = examFamilies.find(
          (f) =>
            ey.examFamily.includes(`(${f.code})`) ||
            ey.examFamily.toLowerCase().includes(f.name.toLowerCase()) ||
            f.code === ey.examFamily
        );
        entry = {
          code: ef ? ef.code : ey.examFamily.slice(0, 10).toUpperCase().replace(/[^A-Z0-9]/g, ""),
          name: ey.examFamily,
          targetYearsCount: 0,
          completedYearsCount: 0,
          harvestedQuestions: 0,
          years: [],
        };
        familyMap.set(ey.examFamily, entry);
      }

      entry.targetYearsCount++;
      if (
        ey.downloadStatus === "COMPLETED" ||
        ey.downloadStatus === "EXTRACTED" ||
        ey.downloadStatus === "DOWNLOADED" ||
        ey.downloadStatus === "VERIFIED"
      ) {
        entry.completedYearsCount++;
      }
      entry.harvestedQuestions += (ey as any).extractedCount || 0;

      entry.years.push({
        year: ey.year,
        paperOrStage: ey.paperOrStage,
        status: ey.downloadStatus,
        notes: ey.notes,
        officialSourceUrl: ey.officialSourceUrl,
      });
    });

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          totalTargets: examYears.length,
          totalQuestionsInDb: totalQuestions,
          verifiedAnswersCount,
          totalKnowledgeSources: knowledgeSourcesCount,
          statusBreakdown,
          historicalSpan: "1995–2026 (32 Years)",
        },
        examFamilies: Array.from(familyMap.values()),
      },
    });
  } catch (error: any) {
    console.error("Error in GET /api/v1/coverage:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: error.message || "Failed to retrieve coverage matrix",
        },
      },
      { status: 500 }
    );
  }
}
