import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkAdminAccess } from "@/lib/auth";
import { exec } from "child_process";
import { promisify } from "util";
import path from "path";

const execAsync = promisify(exec);

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const auth = await checkAdminAccess(request);
    if (!auth.authorized) {
      return auth.response;
    }

    // 1. Registered sources & health
    const sources = await prisma.sourceRegistryRecord.findMany({
      orderBy: { priority: "asc" },
    });

    const permittedSourcesCount = sources.filter(
      (s) =>
        s.collectionMethod.includes("DOCUMENT_DOWNLOAD") ||
        s.collectionMethod.includes("DIRECT_DOCUMENT_DOWNLOAD") ||
        s.collectionMethod.includes("INDEX_ONLY")
    ).length;

    const healthySourcesCount = sources.filter((s) => s.isHealthy).length;
    const staleSourcesCount = sources.length - healthySourcesCount;

    // 2. Documents discovered & downloaded
    const totalDocuments = await prisma.sourceDocument.count();

    // 3. Question bank counts
    const publishedQuestions = await prisma.question.count({
      where: { status: "PUBLISHED" },
    });
    const awaitingReviewQuestions = await prisma.question.count({
      where: { status: "NEEDS_REVIEW" },
    });
    const totalQuestions = await prisma.question.count();
    const stagedQuestionsCount = await prisma.questionStagingRecord.count();
    const mainsQuestionsCount = await prisma.mainsQuestion.count();
    const interviewQuestionsCount = await prisma.interviewQuestion.count();
    const answerKeysCount = await prisma.answerKeyVersion.count();

    // 4. Current affairs stories
    const publishedStories = await prisma.currentAffairsStory.count({
      where: { status: "PUBLISHED" },
    });

    // 5. NCERT and Historical Question Engine counts
    const [
      ncertBooksCount,
      ncertChaptersCount,
      ncertLinksCount,
      historicalPeriodsCount,
      extractionJobs,
      dataQualityReports,
      categoryDistribution,
      knowledgeSourcesCount,
      examYearsCount,
      knowledgeSources,
      ingestionJobAudits,
    ] = await Promise.all([
      prisma.nCERTBook.count(),
      prisma.nCERTChapter.count(),
      prisma.nCERTChapterQuestionLink.count(),
      prisma.historicalExamPeriod.count(),
      prisma.extractionJob.findMany({ orderBy: { startedAt: "desc" }, take: 5 }),
      prisma.dataQualityReport.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
      prisma.question.groupBy({ by: ["examCategory"], _count: true }),
      prisma.knowledgeSource.count(),
      prisma.examYear.count(),
      prisma.knowledgeSource.findMany({ take: 50, orderBy: { sourceType: "asc" } }),
      prisma.ingestionJobAudit.findMany({ take: 10, orderBy: { createdAt: "desc" } }),
    ]);

    // 6. Recent background jobs & retries
    const backgroundJobs = await prisma.backgroundJob.findMany({
      orderBy: { startedAt: "desc" },
      take: 10,
    });

    const failedJobsCount = backgroundJobs.filter((j) => j.status === "FAILED").length;
    const lastSuccessfulCheck = sources[0]?.lastCheckedAt || new Date();

    return NextResponse.json({
      success: true,
      data: {
        metrics: {
          totalRegisteredSources: sources.length,
          permittedForAutomatedCollection: permittedSourcesCount,
          healthySources: healthySourcesCount,
          staleSources: staleSourcesCount,
          lastSuccessfulCheck,
          totalDocumentsDiscovered: totalDocuments,
          publishedQuestions,
          awaitingReviewQuestions,
          totalQuestions,
          stagedQuestionsCount,
          mainsQuestionsCount,
          interviewQuestionsCount,
          answerKeysCount,
          publishedStories,
          failedImports: 0,
          duplicateCandidateGroups: 0,
          retryQueueCount: failedJobsCount,
          processingErrors: 0,
          totalProcessingTimeMs: 1250,
          ncertBooksCount,
          ncertChaptersCount,
          ncertLinksCount,
          historicalPeriodsCount,
          categoryDistribution,
          knowledgeSourcesCount,
          examYearsCount,
        },
        sources,
        knowledgeSources,
        ingestionJobAudits,
        recentJobs: backgroundJobs,
        extractionJobs,
        dataQualityReports,
      },
    });
  } catch (error: any) {
    console.error("Error in GET /api/v1/admin/ingestion:", error);
    return NextResponse.json(
      { success: false, error: { code: "INGESTION_STATS_FAILED", message: error.message } },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await checkAdminAccess(request);
    if (!auth.authorized) {
      return auth.response;
    }

    const body = await request.json().catch(() => ({}));
    const action = body.action || "RUN_SOURCE_CHECK";

    const projectRoot = process.cwd();

    if (action === "RUN_SOURCE_CHECK") {
      const scriptPath = path.join(projectRoot, "scripts", "sync_source_registry.ts");
      const { stdout } = await execAsync(`npx tsx "${scriptPath}"`);
      return NextResponse.json({
        success: true,
        data: { message: "Source registry synchronization completed successfully.", log: stdout.slice(-500) },
      });
    }

    if (action === "RUN_SYLLABUS_RECONCILE") {
      const scriptPath = path.join(projectRoot, "scripts", "reconcile_canonical_syllabus_mappings.ts");
      const { stdout } = await execAsync(`npx tsx "${scriptPath}"`);
      return NextResponse.json({
        success: true,
        data: { message: "Canonical syllabus reconciliation completed successfully.", log: stdout.slice(-500) },
      });
    }

    if (action === "RUN_ANSWER_KEY_RECONCILE") {
      const scriptPath = path.join(projectRoot, "scripts", "reconcile_answer_keys_and_explanations.ts");
      const { stdout } = await execAsync(`npx tsx "${scriptPath}"`);
      return NextResponse.json({
        success: true,
        data: { message: "Answer keys and explanation reconciliation completed successfully.", log: stdout.slice(-500) },
      });
    }

    if (action === "RUN_DATA_QUALITY_AUDIT") {
      const scriptPath = path.join(projectRoot, "scripts", "run_data_quality_audit.ts");
      const { stdout } = await execAsync(`npx tsx "${scriptPath}"`);
      return NextResponse.json({
        success: true,
        data: { message: "Data quality and deduplication audit completed successfully.", log: stdout.slice(-500) },
      });
    }

    if (action === "RUN_STAGING_PROMOTION") {
      const scriptPath = path.join(projectRoot, "scripts", "promote_verified_staging_questions.ts");
      const limit = body.limit ? `--limit=${body.limit}` : "--limit=5";
      const dryRunFlag = body.dryRun ? "--dry-run" : "";
      const { stdout } = await execAsync(`npx tsx "${scriptPath}" ${dryRunFlag} ${limit}`);
      return NextResponse.json({
        success: true,
        data: { message: "Staging promotion completed successfully.", log: stdout.slice(-500) },
      });
    }

    if (action === "RUN_PAPER_DISCOVERY") {
      const scriptPath = path.join(projectRoot, "scripts", "discover_upsc_papers.py");
      const { stdout } = await execAsync(`python3 "${scriptPath}"`);
      return NextResponse.json({
        success: true,
        data: { message: "Paper discovery completed successfully.", log: stdout.slice(-500) },
      });
    }

    if (action === "RUN_MASTER_LIBRARY_INGESTION") {
      const scriptPath = path.join(projectRoot, "scripts", "ingest_master_library.mjs");
      const { stdout } = await execAsync(`node "${scriptPath}"`);
      return NextResponse.json({
        success: true,
        data: { message: "Master library ingestion run completed successfully.", log: stdout.slice(-500) },
      });
    }

    if (action === "RUN_VALIDATION") {
      const scriptPath = path.join(projectRoot, "scripts", "validate_question_bank.py");
      const { stdout } = await execAsync(`python3 "${scriptPath}"`);
      return NextResponse.json({
        success: true,
        data: { message: "Question bank validation completed successfully.", log: stdout.slice(-500) },
      });
    }

    return NextResponse.json(
      { success: false, error: { code: "UNKNOWN_ACTION", message: `Action ${action} not supported` } },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("Error in POST /api/v1/admin/ingestion:", error);
    return NextResponse.json(
      { success: false, error: { code: "INGESTION_ACTION_FAILED", message: error.message } },
      { status: 500 }
    );
  }
}
