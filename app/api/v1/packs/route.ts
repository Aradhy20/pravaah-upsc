import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const packs = await prisma.specializedPack.findMany({
      where: { isActive: true },
      orderBy: { priceRupees: "asc" },
    });

    const formatted = packs.map((p) => {
      let features: string[] = [];
      try {
        features = JSON.parse(p.featuresJson);
      } catch (e) {
        features = [p.tagline];
      }

      return {
        id: p.id,
        code: p.code,
        name: p.name,
        nameHi: p.nameHi,
        tagline: p.tagline,
        category: p.category,
        priceRupees: p.priceRupees,
        creditsIncluded: p.creditsIncluded,
        validityDays: p.validityDays,
        features,
      };
    });

    return NextResponse.json({
      success: true,
      data: formatted,
    });
  } catch (error: any) {
    console.error("Error in GET /api/v1/packs:", error);
    return NextResponse.json(
      { success: false, error: "Failed to retrieve specialized packs catalogue" },
      { status: 500 }
    );
  }
}
