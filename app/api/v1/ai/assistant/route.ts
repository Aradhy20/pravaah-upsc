import { NextRequest, NextResponse } from "next/server";
import { RAGEngine } from "@/lib/services/rag-engine";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { query, examFamily, year, subject, maxResults } = body;

    if (!query || typeof query !== "string" || !query.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "BAD_REQUEST",
            message: "A non-empty query string is required.",
          },
        },
        { status: 400 }
      );
    }

    const ragResult = await RAGEngine.query({
      query,
      examFamily: examFamily || "CSE",
      year: year ? parseInt(year) : undefined,
      subject: subject || undefined,
      maxResults: maxResults ? parseInt(maxResults) : 5,
    });

    return NextResponse.json({
      success: true,
      data: ragResult,
    });
  } catch (error: any) {
    console.error("Error in POST /api/v1/ai/assistant:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: error.message || "Failed to process RAG query",
        },
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || searchParams.get("query");
    const examFamily = searchParams.get("exam") || "CSE";
    const year = searchParams.get("year");
    const subject = searchParams.get("subject");

    if (!query || !query.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "BAD_REQUEST",
            message: "A query parameter ?q=... is required.",
          },
        },
        { status: 400 }
      );
    }

    const ragResult = await RAGEngine.query({
      query,
      examFamily,
      year: year ? parseInt(year) : undefined,
      subject: subject || undefined,
      maxResults: 5,
    });

    return NextResponse.json({
      success: true,
      data: ragResult,
    });
  } catch (error: any) {
    console.error("Error in GET /api/v1/ai/assistant:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: error.message || "Failed to process RAG query",
        },
      },
      { status: 500 }
    );
  }
}
