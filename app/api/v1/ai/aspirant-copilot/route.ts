import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { AIOrchestrator } from "@/lib/ai/orchestrator";
import { searchGlossary } from "@/lib/glossary";
import { getAuthenticatedUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

/**
 * POST /api/v1/ai/aspirant-copilot
 * Multi-modal Aspirant Intelligence Copilot.
 * Synthesizes AI academic mentoring with verified platform assets:
 * - Curated YouTube video lessons & faculty masterclasses
 * - AIR 1-3 Topper copy structuring frameworks
 * - NCERT textbook foundation chapters
 * - Historical UPSC Prelims (1995-2024) and Mains questions
 * - Bilingual Hindi technical glossary
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    const body = await request.json().catch(() => ({}));
    const { prompt, paperCode, subject } = body;

    if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "BAD_REQUEST",
            message: "A prompt query is required for Aspirant Copilot.",
          },
        },
        { status: 400 }
      );
    }

    const queryClean = prompt.trim();
    const stopWords = new Set([
      "what", "when", "where", "which", "with", "about", "from", "into", "have", "your",
      "this", "that", "these", "those", "how", "why", "who", "whom", "will", "would",
      "could", "should", "prepare", "explain", "give", "tell", "show", "help", "please"
    ]);
    const terms = queryClean
      .split(/[^a-zA-Z0-9\u0900-\u097F]+/)
      .map((t) => t.trim())
      .filter((t) => t.length > 2 && !stopWords.has(t.toLowerCase()));

    const searchTerms = terms.length > 0 ? terms.slice(0, 4) : [queryClean];

    // Build OR conditions across extracted key concepts
    const textConditions = searchTerms.map((t) => ({ contains: t, mode: "insensitive" as const }));

    // 1. Parallel retrieval of related platform resources
    const [aiResponse, relatedVideos, relatedToppers, relatedNcert, relatedQuestions, relatedMaps] =
      await Promise.all([
        AIOrchestrator.execute({
          userId: user?.id,
          taskType: "CONCEPT_EXPLANATION",
          prompt: queryClean,
          preferredProvider: process.env.GEMINI_API_KEY ? "GEMINI" : "HEURISTIC_LOCAL",
        }),

        prisma.videoLesson.findMany({
          where: {
            OR: [
              ...textConditions.map((c) => ({ title: c })),
              ...textConditions.map((c) => ({ subject: c })),
              ...textConditions.map((c) => ({ topic: c })),
              ...textConditions.map((c) => ({ description: c })),
            ],
          },
          take: 4,
          orderBy: { orderIndex: "asc" },
        }),

        prisma.topperCopy.findMany({
          where: {
            OR: [
              ...textConditions.map((c) => ({ title: c })),
              ...textConditions.map((c) => ({ description: c })),
              ...textConditions.map((c) => ({ keyTakeaways: c })),
            ],
          },
          take: 3,
        }),

        prisma.nCERTChapter.findMany({
          where: {
            OR: [
              ...textConditions.map((c) => ({ chapterTitle: c })),
              ...textConditions.map((c) => ({ keyTopics: c })),
              ...textConditions.map((c) => ({ summary: c })),
            ],
          },
          take: 3,
          include: { book: true },
        }),

        prisma.question.findMany({
          where: {
            status: "PUBLISHED",
            OR: [
              ...textConditions.map((c) => ({ questionText: c })),
              ...textConditions.map((c) => ({
                explanation: {
                  summary: c,
                },
              })),
            ],
          },
          take: 4,
          orderBy: [{ year: "desc" }, { questionNumber: "asc" }],
          include: {
            paper: true,
            options: { orderBy: { optionCode: "asc" } },
            explanation: true,
          },
        }),

        prisma.mapFeature.findMany({
          where: {
            OR: [
              ...textConditions.map((c) => ({ name: c })),
              ...textConditions.map((c) => ({ keyFacts: c })),
            ],
          },
          take: 2,
        }),
      ]);

    const matchingGlossary = searchTerms.flatMap((t) => searchGlossary(t, "en")).slice(0, 4);

    return NextResponse.json({
      success: true,
      query: queryClean,
      guidance: {
        aiSynthesis: aiResponse.output,
        provider: aiResponse.providerUsed,
        disclaimer: aiResponse.disclaimer,
      },
      curatedAspirantAssets: {
        videoAcademyLessons: relatedVideos.map((v) => ({
          id: v.id,
          title: v.title,
          titleHi: v.titleHi,
          youtubeUrl: v.youtubeUrl,
          youtubeId: v.youtubeId,
          durationMinutes: v.durationMinutes,
          facultyName: v.facultyName,
          paperCode: v.paperCode,
          subject: v.subject,
        })),
        topperCopies: relatedToppers.map((t) => ({
          id: t.id,
          topperName: t.topperName,
          rank: t.rank,
          year: t.year,
          title: t.title,
          scoreMarks: t.scoreMarks,
          keyTakeaways: t.keyTakeaways,
          sampleAnswerUrl: t.sampleAnswerUrl,
        })),
        ncertFoundations: relatedNcert.map((n) => ({
          id: n.id,
          bookTitle: n.book?.bookTitle || "NCERT Standard Textbook",
          classNumber: n.book?.classNumber,
          chapterTitle: n.chapterTitle,
          keyTopics: n.keyTopics,
          officialPdfUrl: n.officialPdfUrl,
        })),
        verifiedHistoricalPYQs: relatedQuestions.map((q) => ({
          id: q.id,
          year: q.year,
          questionNumber: q.questionNumber,
          paperCode: q.paper.code,
          questionText: q.questionText,
          correctOption: q.options.find((o) => o.isCorrect)?.optionCode || "A",
          explanationSummary: q.explanation?.summary,
        })),
        geographyMapFeatures: relatedMaps.map((m) => ({
          id: m.id,
          name: m.name,
          category: m.category,
          stateOrCountry: m.stateOrCountry,
          keyFacts: m.keyFacts,
          upscReference: m.upscReference,
        })),
        bilingualGlossary: matchingGlossary,
      },
    });
  } catch (error: any) {
    console.error("Error in POST /api/v1/ai/aspirant-copilot:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: error.message || "Failed to process Aspirant Copilot query",
        },
      },
      { status: 500 }
    );
  }
}
