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
              { title: { contains: queryClean, mode: "insensitive" } },
              { subject: { contains: queryClean, mode: "insensitive" } },
              { topic: { contains: queryClean, mode: "insensitive" } },
              { description: { contains: queryClean, mode: "insensitive" } },
            ],
          },
          take: 4,
          orderBy: { orderIndex: "asc" },
        }),

        prisma.topperCopy.findMany({
          where: {
            OR: [
              { title: { contains: queryClean, mode: "insensitive" } },
              { description: { contains: queryClean, mode: "insensitive" } },
              { keyTakeaways: { contains: queryClean, mode: "insensitive" } },
            ],
          },
          take: 3,
        }),

        prisma.nCERTChapter.findMany({
          where: {
            OR: [
              { chapterTitle: { contains: queryClean, mode: "insensitive" } },
              { keyTopics: { contains: queryClean, mode: "insensitive" } },
              { summary: { contains: queryClean, mode: "insensitive" } },
            ],
          },
          take: 3,
          include: { book: true },
        }),

        prisma.question.findMany({
          where: {
            status: "PUBLISHED",
            OR: [
              { questionText: { contains: queryClean, mode: "insensitive" } },
              {
                explanation: {
                  summary: { contains: queryClean, mode: "insensitive" },
                },
              },
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
              { name: { contains: queryClean, mode: "insensitive" } },
              { keyFacts: { contains: queryClean, mode: "insensitive" } },
            ],
          },
          take: 2,
        }),
      ]);

    const matchingGlossary = searchGlossary(queryClean, "en");

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
