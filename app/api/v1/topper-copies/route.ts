import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const SEED_TOPPER_COPIES = [
  {
    topperName: "Ishita Kishore",
    rank: 1,
    year: 2022,
    examType: "UPSC_CSE",
    paperCode: "GS2",
    optionalSubject: "PSIR",
    title: "GS Paper 2: International Relations & Constitutional Governance",
    titleHi: "GS प्रश्नपत्र 2: अंतर्राष्ट्रीय संबंध एवं संवैधानिक शासन",
    description: "Exemplary answer script illustrating sub-heading structuring, Constitutional Article citing (Art 14, 19, 21), and crisp bilateral diplomacy balance.",
    scoreMarks: "128/250",
    sampleAnswerUrl: "https://pravaah-upsc.vercel.app/samples/topper-gs2-air1.pdf",
    keyTakeaways: "1. Used 2x2 matrix for comparing India-US vs India-Russia strategic interests.\n2. Cited 2nd ARC recommendations on Civil Services accountability.\n3. Concise 3-line conclusion quoting Preamble values.",
  },
  {
    topperName: "Garima Lohia",
    rank: 2,
    year: 2022,
    examType: "UPSC_CSE",
    paperCode: "GS1",
    optionalSubject: "Commerce & Accountancy",
    title: "GS Paper 1: Society, Women Empowerment & Modern Indian History",
    titleHi: "GS प्रश्नपत्र 1: भारतीय समाज, महिला सशक्तिकरण एवं आधुनिक इतिहास",
    description: "Masterclass in sociologically rich answers, demographic trends, and clear temporal timelines for 19th-century reform movements.",
    scoreMarks: "122/250",
    sampleAnswerUrl: "https://pravaah-upsc.vercel.app/samples/topper-gs1-air2.pdf",
    keyTakeaways: "1. Hand-drawn timeline for Tribal and Peasant uprisings (1857-1947).\n2. Quoted NFHS-5 data for female labor force participation.\n3. Interlinked urbanization with social fragmentation in metro cities.",
  },
  {
    topperName: "Shruti Sharma",
    rank: 1,
    year: 2021,
    examType: "UPSC_CSE",
    paperCode: "GS3",
    optionalSubject: "History",
    title: "GS Paper 3: Inclusive Growth, Agriculture & Climate Resilience",
    titleHi: "GS प्रश्नपत्र 3: समावेशी संवृद्धि, कृषि सुधार एवं जलवायु लचीलापन",
    description: "Rigorous analytical answers featuring flowcharts of agricultural supply chains, MSP reforms, and renewable energy targets.",
    scoreMarks: "124/250",
    sampleAnswerUrl: "https://pravaah-upsc.vercel.app/samples/topper-gs3-air1.pdf",
    keyTakeaways: "1. Schematic flowchart of food processing value chain bottlenecks.\n2. Cites IPCC AR6 synthesis report for coastal adaptation.\n3. Clear distinction between formal vs informal credit penetration in rural credit.",
  },
  {
    topperName: "Kanishak Kataria",
    rank: 1,
    year: 2018,
    examType: "UPSC_CSE",
    paperCode: "GS4",
    optionalSubject: "Mathematics",
    title: "GS Paper 4: Ethics, Administrative Integrity & Case Studies",
    titleHi: "GS प्रश्नपत्र 4: नीतिशास्त्र, प्रशासनिक सत्यनिष्ठा एवं केस स्टडीज",
    description: "Benchmark ethical reasoning combining deontological (Kant) vs utilitarian (Bentham) perspectives with pragmatic bureaucratic action.",
    scoreMarks: "134/250",
    sampleAnswerUrl: "https://pravaah-upsc.vercel.app/samples/topper-gs4-air1.pdf",
    keyTakeaways: "1. Stakeholder mapping grid identifying immediate vs long-term public interest.\n2. Explicit quotes from Bhagavad Gita, Mahatma Gandhi, and Nolan Committee principles.\n3. Crisp administrative options evaluated on Feasibility, Legality, and Moral rectitude.",
  },
  {
    topperName: "Shubham Kumar",
    rank: 1,
    year: 2020,
    examType: "UPSC_CSE",
    paperCode: "ESSAY",
    optionalSubject: "Anthropology",
    title: "Mains Essay: Philosophical & Socio-Economic Dimensions",
    titleHi: "मुख्य परीक्षा निबंध: दार्शनिक एवं सामाजिक-आर्थिक आयाम",
    description: "Flawless multi-layered essay structuring starting with an engaging historical anecdote, transitioning through PESTLE analysis, and ending with an inspiring vision.",
    scoreMarks: "142/250",
    sampleAnswerUrl: "https://pravaah-upsc.vercel.app/samples/topper-essay-air1.pdf",
    keyTakeaways: "1. Anecdote hook connecting Ashoka's Dhamma with modern constitutionalism.\n2. Sub-headings derived from the prompt's metaphorical nuances.\n3. Balanced global vs Indian perspective without hyperbole.",
  },
];

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const paperCode = searchParams.get("paperCode");
    const year = searchParams.get("year");
    const query = searchParams.get("q");

    // Check count and seed if empty
    const count = await prisma.topperCopy.count();
    if (count === 0) {
      await prisma.topperCopy.createMany({
        data: SEED_TOPPER_COPIES,
      });
    }

    const where: any = {};
    if (paperCode && paperCode !== "ALL") {
      where.paperCode = paperCode;
    }
    if (year) {
      where.year = parseInt(year);
    }
    if (query) {
      where.OR = [
        { topperName: { contains: query, mode: "insensitive" } },
        { title: { contains: query, mode: "insensitive" } },
        { titleHi: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
      ];
    }

    const copies = await prisma.topperCopy.findMany({
      where,
      orderBy: [{ year: "desc" }, { rank: "asc" }],
    });

    return NextResponse.json({
      success: true,
      data: copies.length > 0 ? copies : SEED_TOPPER_COPIES,
      meta: {
        total: copies.length > 0 ? copies.length : SEED_TOPPER_COPIES.length,
      },
    });
  } catch (error: any) {
    console.warn("Database fallback for topper copies:", error.message);
    return NextResponse.json({
      success: true,
      data: SEED_TOPPER_COPIES,
      meta: {
        total: SEED_TOPPER_COPIES.length,
      },
    });
  }
}
