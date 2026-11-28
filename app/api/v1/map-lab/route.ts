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

    let features: any[] = [];
    let allFeatures: any[] = [];

    try {
      features = await prisma.mapFeature.findMany({
        where: whereClause,
        orderBy: { name: "asc" },
      });
      allFeatures = await prisma.mapFeature.findMany();
    } catch (dbErr: any) {
      console.warn("MapFeature table query fallback:", dbErr.message);
    }

    if (allFeatures.length === 0) {
      const fallbackFeatures = [
        {
          id: "mf-corbett",
          name: "Jim Corbett National Park",
          nameHi: "जिम कॉर्बेट राष्ट्रीय उद्यान",
          category: "NATIONAL_PARK",
          stateOrCountry: "Uttarakhand",
          latitude: 29.53,
          longitude: 78.77,
          keyFacts: "Oldest national park in India, established in 1936 as Hailey National Park. First park under Project Tiger in 1973. Ramganga river flows through it.",
          keyFactsHi: "भारत का सबसे पुराना राष्ट्रीय उद्यान (1936)। प्रोजेक्ट टाइगर के तहत पहला पार्क। रामगंगा नदी इसके बीच से बहती है।",
          upscReference: "UPSC CSE Prelims 2013, 2019",
        },
        {
          id: "mf-loktak",
          name: "Loktak Lake & Keibul Lamjao",
          nameHi: "लोकटक झील एवं केबुल लामजाओ",
          category: "RAMSAR_SITE",
          stateOrCountry: "Manipur",
          latitude: 24.55,
          longitude: 93.81,
          keyFacts: "Largest freshwater lake in Northeast India, famous for phumdis (floating islands). Houses the world's only floating national park (Keibul Lamjao) and endangered Sangai deer.",
          keyFactsHi: "पूर्वोत्तर भारत की सबसे बड़ी मीठे पानी की झील। फुमडी (तैरते द्वीप) और संगाई हिरण का एकमात्र प्राकृतिक आवास।",
          upscReference: "UPSC CSE Prelims 2015, 2018",
        },
        {
          id: "mf-majuli",
          name: "Majuli River Island",
          nameHi: "माजुली नदी द्वीप",
          category: "RIVER",
          stateOrCountry: "Assam",
          latitude: 26.95,
          longitude: 94.22,
          keyFacts: "World's largest inhabited river island formed by the Brahmaputra River and Subansiri River. Cultural hub of neo-Vaishnavite Satras founded by Srimanta Sankardev.",
          keyFactsHi: "ब्रह्मपुत्र नदी द्वारा निर्मित विश्व का सबसे बड़ा आबाद नदी द्वीप। श्रीमंत शंकरदेव द्वारा स्थापित सत्र संस्कृति का केंद्र।",
          upscReference: "UPSC CSE Prelims 2016",
        },
        {
          id: "mf-khardungla",
          name: "Khardung La Pass",
          nameHi: "खारदुंग ला दर्रा",
          category: "MOUNTAIN_PASS",
          stateOrCountry: "Ladakh",
          latitude: 34.28,
          longitude: 77.60,
          keyFacts: "High mountain pass in the Ladakh range, serving as the strategic gateway to the Shyok and Nubra valleys and the Siachen Glacier.",
          keyFactsHi: "लद्दाख श्रेणी में स्थित रणनीतिक दर्रा, जो श्योक, नुब्रा घाटी और सियाचिन ग्लेशियर का प्रवेश द्वार है।",
          upscReference: "UPSC CSE Prelims 2020",
        },
        {
          id: "mf-malacca",
          name: "Strait of Malacca",
          nameHi: "मलक्का जलडमरूमध्य",
          category: "STRAIT",
          stateOrCountry: "Indonesia / Malaysia",
          latitude: 4.0,
          longitude: 100.0,
          keyFacts: "Narrow stretch of water linking the Indian Ocean to the South China Sea. Vital global maritime chokepoint carrying over 25% of global traded goods and oil traffic.",
          keyFactsHi: "हिंद महासागर को दक्षिण चीन सागर से जोड़ने वाला संकरा समुद्री मार्ग। वैश्विक तेल और व्यापारिक जहाजों के लिए अत्यंत महत्वपूर्ण चोकपॉइंट।",
          upscReference: "UPSC CSE Prelims 2011, 2021",
        },
      ];

      allFeatures = fallbackFeatures;
      features = fallbackFeatures;
    }

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
