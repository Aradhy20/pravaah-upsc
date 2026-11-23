import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * GET /api/v1/corpus/search
 * Search across official UPSC corpus documents, extracted document pages, and staged questions.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = (searchParams.get("q") || "").trim();
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "15", 10)));

    if (!query || query.length < 2) {
      return NextResponse.json({
        success: true,
        query: "",
        results: {
          documents: [],
          pages: [],
          questions: []
        }
      });
    }

    const [matchingDocs, matchingPages, matchingQuestions] = await Promise.all([
      // 1. Search official documents
      prisma.corpusDocument.findMany({
        where: {
          OR: [
            { examName: { contains: query, mode: "insensitive" } },
            { paper: { contains: query, mode: "insensitive" } },
            { note: { contains: query, mode: "insensitive" } }
          ]
        },
        take: limit,
        select: {
          id: true,
          examName: true,
          year: true,
          paper: true,
          documentType: true,
          sourceUrl: true,
          extractionStatus: true,
          fileSize: true
        }
      }),

      // 2. Search extracted page text
      prisma.corpusDocumentPage.findMany({
        where: {
          pageText: { contains: query, mode: "insensitive" }
        },
        take: limit,
        include: {
          document: {
            select: {
              examName: true,
              paper: true,
              year: true,
              documentType: true
            }
          }
        }
      }),

      // 3. Search staged authentic questions
      prisma.questionStagingRecord.findMany({
        where: {
          OR: [
            { questionTextEn: { contains: query, mode: "insensitive" } },
            { topicSlug: { contains: query, mode: "insensitive" } },
            { subjectSlug: { contains: query, mode: "insensitive" } }
          ]
        },
        take: limit,
        select: {
          id: true,
          year: true,
          paperCode: true,
          questionNumber: true,
          subjectSlug: true,
          topicSlug: true,
          questionTextEn: true,
          officialAnswer: true,
          sourceCitation: true,
          workflowStatus: true
        }
      })
    ]);

    // Format page matches with context snippet
    const formattedPages = matchingPages.map(p => {
      const lower = p.pageText.toLowerCase();
      const idx = lower.indexOf(query.toLowerCase());
      const start = Math.max(0, idx - 80);
      const end = Math.min(p.pageText.length, idx + query.length + 120);
      const snippet = (start > 0 ? "..." : "") + p.pageText.slice(start, end).replace(/\s+/g, " ") + (end < p.pageText.length ? "..." : "");

      return {
        documentId: p.documentId,
        pageNumber: p.pageNumber,
        examName: p.document.examName,
        paper: p.document.paper,
        year: p.document.year,
        documentType: p.document.documentType,
        snippet,
        characterCount: p.characterCount
      };
    });

    return NextResponse.json({
      success: true,
      query,
      results: {
        totalMatches: matchingDocs.length + matchingPages.length + matchingQuestions.length,
        documents: matchingDocs,
        extractedPages: formattedPages,
        stagedQuestions: matchingQuestions
      }
    });

  } catch (error: any) {
    console.error("Corpus search error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to execute corpus search", details: error.message },
      { status: 500 }
    );
  }
}
