import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { syncTaxonomyToDatabase } from "@/lib/taxonomy";

export const dynamic = "force-dynamic";

/**
 * GET /api/v1/admin/exams
 * Returns all examination directory records along with counts of associated papers, stages, and questions.
 */
export async function GET(request: NextRequest) {
  try {
    const exams = await prisma.examDirectory.findMany({
      orderBy: { orderIndex: "asc" },
    });

    // Augment with Question counts if available
    const examCodes = exams.map((e) => e.code);
    const questionCounts = await prisma.question.groupBy({
      by: ["examCategory"],
      _count: { _all: true },
    });
    const countMap: Record<string, number> = {};
    for (const q of questionCounts) {
      countMap[q.examCategory] = q._count._all;
    }

    const enriched = exams.map((e) => ({
      ...e,
      publishedQuestionsCount: countMap[e.code] || 0,
    }));

    return NextResponse.json({
      success: true,
      total: enriched.length,
      data: enriched,
    });
  } catch (error: any) {
    console.error("Admin Exams GET error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to retrieve exams." },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v1/admin/exams
 * Actions:
 * - action: "SYNC_OFFICIAL_TAXONOMY" -> Syncs all 14 official UPSC taxonomy entries to PostgreSQL.
 * - action: "CREATE_CUSTOM_EXAM" -> Creates a new custom examination entry dynamically without code rewrite.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const action = body.action || "SYNC_OFFICIAL_TAXONOMY";

    if (action === "SYNC_OFFICIAL_TAXONOMY") {
      const result = await syncTaxonomyToDatabase(prisma);
      return NextResponse.json({
        success: true,
        message: `Successfully synchronized ${result.syncedExams} examination tracks and ${result.syncedPapers} papers into the database.`,
        data: result,
      });
    }

    if (action === "CREATE_CUSTOM_EXAM") {
      const {
        code,
        name,
        conductingBody,
        category,
        overview,
        eligibilityQualifications,
        ageLimit,
        attemptsAllowed,
        stagesDescription,
        officialNotificationUrl,
        syllabusOverview,
        examCycleDates,
        totalVacanciesTypical,
      } = body;

      if (!code || !name) {
        return NextResponse.json(
          { success: false, error: "Code and name are required for new examination track." },
          { status: 400 }
        );
      }

      const existing = await prisma.examDirectory.findUnique({
        where: { code: code.toUpperCase() },
      });

      if (existing) {
        return NextResponse.json(
          { success: false, error: `Examination code '${code}' already exists.` },
          { status: 409 }
        );
      }

      const maxOrder = await prisma.examDirectory.aggregate({
        _max: { orderIndex: true },
      });
      const nextOrder = (maxOrder._max.orderIndex || 0) + 1;

      const created = await prisma.examDirectory.create({
        data: {
          code: code.toUpperCase(),
          name,
          conductingBody: conductingBody || "UPSC",
          category: category || "Recruitment & Special",
          overview: overview || "",
          eligibilityQualifications: eligibilityQualifications || "",
          ageLimit: ageLimit || "",
          attemptsAllowed: attemptsAllowed || "",
          stagesDescription: stagesDescription || "",
          officialNotificationUrl: officialNotificationUrl || "",
          syllabusOverview: syllabusOverview || "",
          examCycleDates: examCycleDates || "",
          totalVacanciesTypical: totalVacanciesTypical || "",
          isActive: true,
          orderIndex: nextOrder,
        },
      });

      // Also create base Exam record
      await prisma.exam.upsert({
        where: { code: code.toUpperCase() },
        update: { name },
        create: { code: code.toUpperCase(), name },
      });

      return NextResponse.json({
        success: true,
        message: `Created examination track '${name}' (${code}).`,
        data: created,
      });
    }

    return NextResponse.json(
      { success: false, error: `Unrecognized action: ${action}` },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("Admin Exams POST error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process exam operation." },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/v1/admin/exams
 * Updates an existing examination record.
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, ...updates } = body;

    if (!code) {
      return NextResponse.json(
        { success: false, error: "Exam code is required for update." },
        { status: 400 }
      );
    }

    const updated = await prisma.examDirectory.update({
      where: { code: code.toUpperCase() },
      data: updates,
    });

    return NextResponse.json({
      success: true,
      message: `Updated examination '${code}'.`,
      data: updated,
    });
  } catch (error: any) {
    console.error("Admin Exams PUT error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update exam." },
      { status: 500 }
    );
  }
}
