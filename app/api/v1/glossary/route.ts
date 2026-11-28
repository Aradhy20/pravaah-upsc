import { NextRequest, NextResponse } from "next/server";
import { UPSC_TECHNICAL_GLOSSARY, searchGlossary } from "@/lib/glossary";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";
    const category = searchParams.get("category");
    const lang = (searchParams.get("lang") as "en" | "hi") || "en";

    let results = query ? searchGlossary(query, lang) : UPSC_TECHNICAL_GLOSSARY;

    if (category && category !== "ALL") {
      results = results.filter((r) => r.category === category);
    }

    return NextResponse.json({
      success: true,
      total: results.length,
      data: results,
    });
  } catch (error: any) {
    console.error("Glossary API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch glossary terms" },
      { status: 500 }
    );
  }
}
