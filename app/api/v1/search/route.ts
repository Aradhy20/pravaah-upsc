import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { searchGlossary } from "@/lib/glossary";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q")?.trim();
    const mode = searchParams.get("mode") || "smart"; // "smart" | "exact"
    const paperCode = searchParams.get("paper");

    if (!query) {
      return NextResponse.json({
        success: true,
        data: [],
        universal: {
          questions: [],
          videoLessons: [],
          ncertChapters: [],
          topperCopies: [],
          mapFeatures: [],
          glossaryTerms: [],
        },
        meta: { query: "", total: 0 },
      });
    }

    const where: any = {
      status: "PUBLISHED",
    };

    if (paperCode) {
      where.paper = { code: paperCode };
    }

    if (mode === "exact") {
      where.OR = [
        { questionText: { contains: query, mode: "insensitive" } },
        {
          options: {
            some: { optionText: { contains: query, mode: "insensitive" } },
          },
        },
      ];
    } else {
      // Smart Concept search: stems, explanations, topics, and subjects
      where.OR = [
        { questionText: { contains: query, mode: "insensitive" } },
        {
          explanation: {
            OR: [
              { summary: { contains: query, mode: "insensitive" } },
              { detailedExplanation: { contains: query, mode: "insensitive" } },
              { relatedConcept: { contains: query, mode: "insensitive" } },
            ],
          },
        },
        {
          topics: {
            some: {
              topic: {
                OR: [
                  { name: { contains: query, mode: "insensitive" } },
                  { subject: { name: { contains: query, mode: "insensitive" } } },
                ],
              },
            },
          },
        },
      ];
    }

    // Parallel multi-domain search across Aspirant Knowledge Base
    const [questions, videoLessons, ncertChapters, topperCopies, mapFeatures] = await Promise.all([
      prisma.question.findMany({
        where,
        take: 20,
        orderBy: [{ year: "desc" }, { questionNumber: "asc" }],
        include: {
          paper: true,
          options: { orderBy: { optionCode: "asc" } },
          explanation: true,
          topics: {
            include: {
              topic: {
                include: { subject: true },
              },
            },
          },
        },
      }),

      prisma.videoLesson.findMany({
        where: {
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
            { subject: { contains: query, mode: "insensitive" } },
            { topic: { contains: query, mode: "insensitive" } },
          ],
        },
        take: 8,
        orderBy: { orderIndex: "asc" },
      }),

      prisma.nCERTChapter.findMany({
        where: {
          OR: [
            { chapterTitle: { contains: query, mode: "insensitive" } },
            { keyTopics: { contains: query, mode: "insensitive" } },
            { summary: { contains: query, mode: "insensitive" } },
          ],
        },
        take: 6,
        include: { book: true },
      }),

      prisma.topperCopy.findMany({
        where: {
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
            { topperName: { contains: query, mode: "insensitive" } },
            { keyTakeaways: { contains: query, mode: "insensitive" } },
          ],
        },
        take: 6,
        orderBy: [{ year: "desc" }, { rank: "asc" }],
      }),

      prisma.mapFeature.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { nameHi: { contains: query, mode: "insensitive" } },
            { keyFacts: { contains: query, mode: "insensitive" } },
            { stateOrCountry: { contains: query, mode: "insensitive" } },
          ],
        },
        take: 6,
      }),
    ]);

    // Format questions
    const formatted = questions.map((q) => ({
      id: q.id,
      year: q.year,
      questionNumber: q.questionNumber,
      paperCode: q.paper.code,
      questionText: q.questionText,
      subject: q.topics[0]?.topic?.subject?.name || "General Studies",
      topic: q.topics[0]?.topic?.name || "Concept",
      options: q.options.map((o) => ({
        code: o.optionCode,
        text: o.optionText,
      })),
      correctOption: q.options.find((o) => o.isCorrect)?.optionCode || "A",
      explanation: q.explanation?.summary || "",
    }));

    // Find matching Hindi technical glossary terms
    const glossaryTerms = searchGlossary(query, "en");

    return NextResponse.json({
      success: true,
      data: formatted,
      universal: {
        questions: formatted,
        videoLessons: videoLessons.map((v) => ({
          id: v.id,
          title: v.title,
          titleHi: v.titleHi,
          description: v.description,
          youtubeUrl: v.youtubeUrl,
          youtubeId: v.youtubeId,
          durationMinutes: v.durationMinutes,
          paperCode: v.paperCode,
          subject: v.subject,
          topic: v.topic,
          facultyName: v.facultyName,
        })),
        ncertChapters: ncertChapters.map((c) => ({
          id: c.id,
          bookTitle: c.book?.bookTitle || "NCERT Textbook",
          classNumber: c.book?.classNumber,
          subject: c.book?.subject,
          chapterNumber: c.chapterNumber,
          chapterTitle: c.chapterTitle,
          keyTopics: c.keyTopics,
          officialPdfUrl: c.officialPdfUrl,
        })),
        topperCopies: topperCopies.map((t) => ({
          id: t.id,
          topperName: t.topperName,
          rank: t.rank,
          year: t.year,
          paperCode: t.paperCode,
          title: t.title,
          description: t.description,
          keyTakeaways: t.keyTakeaways,
          scoreMarks: t.scoreMarks,
          sampleAnswerUrl: t.sampleAnswerUrl,
        })),
        mapFeatures: mapFeatures.map((m) => ({
          id: m.id,
          name: m.name,
          nameHi: m.nameHi,
          category: m.category,
          stateOrCountry: m.stateOrCountry,
          latitude: m.latitude,
          longitude: m.longitude,
          keyFacts: m.keyFacts,
          upscReference: m.upscReference,
        })),
        glossaryTerms,
      },
      synthesis: {
        query,
        guidance: `Academic Guidance for "${query}": Consult foundational NCERT chapters for core theory, review historical UPSC examination questions (1995-2024) to master elimination techniques, cross-reference AIR 1 answer scripts for diagrammatic structuring, and verify Hindi/English terminology for civil services parity.`,
      },
      meta: {
        query,
        mode,
        totalQuestions: formatted.length,
        totalVideos: videoLessons.length,
        totalNcert: ncertChapters.length,
        totalToppers: topperCopies.length,
        totalMaps: mapFeatures.length,
        totalGlossary: glossaryTerms.length,
      },
    });
  } catch (error: any) {
    console.error("Error in GET /api/v1/search:", error);
    return NextResponse.json(
      {
        success: false,
        error: { code: "SEARCH_FAILED", message: error.message },
      },
      { status: 500 }
    );
  }
}
