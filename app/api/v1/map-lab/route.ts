import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");

    const whereClause: any = {};
    if (category && category !== "ALL") {
      whereClause.category = category;
    }

    const features = await prisma.mapFeature.findMany({
      where: whereClause,
      orderBy: { name: "asc" },
    });

    const allFeatures = await prisma.mapFeature.findMany();
    const categoriesMap: Record<string, number> = {};
    for (const f of allFeatures) {
      categoriesMap[f.category] = (categoriesMap[f.category] || 0) + 1;
    }

    const categoriesList = [
      { id: "ALL", labelEn: "All Locations", labelHi: "सभी स्थान", count: allFeatures.length },
      { id: "NATIONAL_PARK", labelEn: "National Parks & Sanctuaries", labelHi: "राष्ट्रीय उद्यान एवं वन्यजीव", count: categoriesMap["NATIONAL_PARK"] || 0 },
      { id: "RIVER", labelEn: "Rivers, Waterfalls & Basins", labelHi: "नदियाँ, जलप्रपात एवं द्रोणियाँ", count: categoriesMap["RIVER"] || 0 },
      { id: "RAMSAR_SITE", labelEn: "Wetlands & Ramsar Sites", labelHi: "आर्द्रभूमियां एवं रामसर स्थल", count: categoriesMap["RAMSAR_SITE"] || 0 },
      { id: "MOUNTAIN_PASS", labelEn: "Mountain Passes & Ranges", labelHi: "पर्वतीय दर्रे एवं श्रेणियां", count: categoriesMap["MOUNTAIN_PASS"] || 0 },
      { id: "STRAIT", labelEn: "Maritime Straits & Chokepoints", labelHi: "समुद्री जलडमरूमध्य एवं चोकपॉइंट्स", count: categoriesMap["STRAIT"] || 0 },
      { id: "BIOSPHERE_RESERVE", labelEn: "Biosphere Reserves", labelHi: "बायोस्फीयर रिजर्व", count: categoriesMap["BIOSPHERE_RESERVE"] || 0 },
    ];

    return NextResponse.json({
      success: true,
      data: {
        totalFeatures: features.length,
        categories: categoriesList,
        features: features.map((f) => ({
          id: f.id,
          name: f.name,
          nameHi: f.nameHi,
          category: f.category,
          stateOrCountry: f.stateOrCountry,
          latitude: f.latitude,
          longitude: f.longitude,
          keyFacts: f.keyFacts,
          keyFactsHi: f.keyFactsHi,
          upscReference: f.upscReference,
        })),
      },
    });
  } catch (error: any) {
    console.error("Error in GET /api/v1/map-lab:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load map features" },
      { status: 500 }
    );
  }
}
