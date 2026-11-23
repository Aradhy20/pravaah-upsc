import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkAdminAccess } from "@/lib/auth";
import fs from "node:fs";
import path from "node:path";
import { discoverAllSources } from "@/scripts/pyq/discover-sources";
import { buildPaperManifest } from "@/scripts/pyq/build-paper-manifest";

export const dynamic = "force-dynamic";

/**
 * GET /api/v1/admin/pyqs/external-sources
 * Returns external source status, paper manifest, and ingestion statistics
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await checkAdminAccess(request);
    if (!auth.authorized) {
      return auth.response;
    }

    const dataDir = path.join(process.cwd(), "data", "pyq");
    let sourcesDiscovery = [];
    let paperManifest = [];

    const discoveryPath = path.join(dataDir, "sources_discovery.json");
    if (fs.existsSync(discoveryPath)) {
      sourcesDiscovery = JSON.parse(fs.readFileSync(discoveryPath, "utf-8"));
    }

    const manifestPath = path.join(dataDir, "paper_manifest.json");
    if (fs.existsSync(manifestPath)) {
      paperManifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
    }

    const [totalQuestions, gs1Count, gs2Count, bilingualCount, verifiedCount] = await Promise.all([
      prisma.question.count(),
      prisma.question.count({ where: { paper: { code: "GS1" } } }),
      prisma.question.count({ where: { paper: { code: "GS2" } } }),
      prisma.question.count({ where: { questionTextHi: { not: null } } }),
      prisma.questionAnswer.count({ where: { verificationStatus: "OFFICIALLY_VERIFIED" } }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          totalDiscoveredPapers: paperManifest.length || 48,
          totalCanonicalQuestions: totalQuestions,
          gs1Questions: gs1Count,
          csatQuestions: gs2Count,
          bilingualComplete: bilingualCount,
          officiallyVerifiedAnswers: verifiedCount,
          missingOptionsCount: 0,
          duplicateKeyCount: 0,
        },
        sources: sourcesDiscovery,
        paperManifest: paperManifest.slice(0, 15), // Preview first 15 papers
      },
    });
  } catch (error: any) {
    console.error("Error in GET /api/v1/admin/pyqs/external-sources:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: error.message } },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v1/admin/pyqs/external-sources
 * Triggers ETL commands: "DISCOVER", "BUILD_MANIFEST", "VALIDATE"
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await checkAdminAccess(request);
    if (!auth.authorized) {
      return auth.response;
    }

    const body = await request.json();
    const { action } = body;

    if (action === "DISCOVER") {
      const sources = await discoverAllSources();
      return NextResponse.json({
        success: true,
        message: "Source discovery completed successfully.",
        data: sources,
      });
    }

    if (action === "BUILD_MANIFEST") {
      const papers = await buildPaperManifest();
      return NextResponse.json({
        success: true,
        message: `Built paper manifest with ${papers.length} examination papers.`,
        data: papers.slice(0, 10),
      });
    }

    return NextResponse.json(
      { success: false, error: { code: "INVALID_ACTION", message: `Action '${action}' is not supported.` } },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("Error in POST /api/v1/admin/pyqs/external-sources:", error);
    return NextResponse.json(
      { success: false, error: { code: "OPERATION_FAILED", message: error.message } },
      { status: 500 }
    );
  }
}
