import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * GET /api/v1/corpus/documents
 * Search and browse official UPSC examination documents indexed in the Master Corpus.
 * Supports filtering by examFamily, year, documentType, extractionStatus, and text query.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const examFamily = searchParams.get("examFamily") || searchParams.get("family");
    const yearParam = searchParams.get("year");
    const documentType = searchParams.get("documentType") || searchParams.get("type");
    const extractionStatus = searchParams.get("extractionStatus");
    const search = searchParams.get("q") || searchParams.get("search");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "25", 10)));
    const skip = (page - 1) * limit;

    const where: any = {};

    if (examFamily && examFamily !== "ALL") {
      where.exam = {
        examFamily: { equals: examFamily.toUpperCase() }
      };
    }

    if (yearParam && yearParam !== "ALL") {
      const yr = parseInt(yearParam, 10);
      if (!isNaN(yr)) {
        where.year = yr;
      }
    }

    if (documentType && documentType !== "ALL") {
      where.documentType = {
        contains: documentType,
        mode: "insensitive"
      };
    }

    if (extractionStatus && extractionStatus !== "ALL") {
      where.extractionStatus = extractionStatus;
    }

    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { examName: { contains: q, mode: "insensitive" } },
        { paper: { contains: q, mode: "insensitive" } },
        { note: { contains: q, mode: "insensitive" } },
      ];
    }

    const [total, documents, statsByType, statsByExtraction] = await Promise.all([
      prisma.corpusDocument.count({ where }),
      prisma.corpusDocument.findMany({
        where,
        orderBy: [{ year: "desc" }, { id: "asc" }],
        skip,
        take: limit,
        include: {
          exam: {
            select: {
              id: true,
              examName: true,
              examFamily: true,
              year: true
            }
          },
          _count: {
            select: { pages: true }
          }
        }
      }),
      prisma.corpusDocument.groupBy({
        by: ["documentType"],
        _count: { _all: true }
      }),
      prisma.corpusDocument.groupBy({
        by: ["extractionStatus"],
        _count: { _all: true }
      })
    ]);

    const formattedDocs = documents.map(doc => ({
      id: doc.id,
      examId: doc.examId,
      examFamily: doc.exam?.examFamily || "OTHER",
      examName: doc.examName,
      year: doc.year,
      paper: doc.paper,
      documentType: doc.documentType,
      authority: doc.authority,
      sourceUrl: doc.sourceUrl,
      fileSize: doc.fileSize,
      verificationStatus: doc.verificationStatus,
      extractionStatus: doc.extractionStatus,
      hasLocalCopy: Boolean(doc.localPath),
      indexedPages: doc._count.pages,
      note: doc.note
    }));

    return NextResponse.json({
      success: true,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      },
      summary: {
        byDocumentType: statsByType.map(s => ({ type: s.documentType, count: s._count._all })),
        byExtractionStatus: statsByExtraction.map(s => ({ status: s.extractionStatus, count: s._count._all }))
      },
      documents: formattedDocs
    });

  } catch (error: any) {
    console.error("Error fetching corpus documents:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch corpus documents", details: error.message },
      { status: 500 }
    );
  }
}
