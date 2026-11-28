import { NextRequest, NextResponse } from "next/server";
import {
  OFFICIAL_UPSC_EXAM_TAXONOMY,
  getTaxonomyByCode,
  getTaxonomyByCategory,
} from "@/lib/taxonomy";

export const dynamic = "force-dynamic";

/**
 * GET /api/v1/exams/taxonomy
 * Returns the versioned, authoritative UPSC examination taxonomy.
 * Query parameters:
 * - code: Filter by examination code (e.g., "CSE", "CDS", "NDA")
 * - category: Filter by category (e.g., "Defence Services", "Civil Services")
 * - grouped: If true, returns grouped by category
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const category = searchParams.get("category");
    const grouped = searchParams.get("grouped") === "true";

    if (code) {
      const entry = getTaxonomyByCode(code);
      if (!entry) {
        return NextResponse.json(
          { success: false, error: `Examination code '${code}' not found in taxonomy.` },
          { status: 404 }
        );
      }
      return NextResponse.json({
        success: true,
        data: entry,
      });
    }

    if (grouped) {
      const groupedData = getTaxonomyByCategory();
      return NextResponse.json({
        success: true,
        totalTracks: OFFICIAL_UPSC_EXAM_TAXONOMY.length,
        categories: Object.keys(groupedData),
        data: groupedData,
      });
    }

    let results = OFFICIAL_UPSC_EXAM_TAXONOMY;
    if (category && category !== "ALL") {
      results = results.filter(
        (e) => e.category.toLowerCase() === category.toLowerCase()
      );
    }

    return NextResponse.json({
      success: true,
      totalTracks: results.length,
      data: results,
    });
  } catch (error: any) {
    console.error("Taxonomy API Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to retrieve examination taxonomy." },
      { status: 500 }
    );
  }
}
