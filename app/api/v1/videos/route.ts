import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const SEED_VIDEOS = [
  {
    title: "Fundamental Rights & Constitutional Writs: Article 32 vs 226",
    titleHi: "मूल अधिकार एवं संवैधानिक उपचार: अनुच्छेद 32 बनाम 226",
    description: "Deep-dive into Habeas Corpus, Mandamus, Quo-Warranto, Prohibition & Certiorari with landmark Supreme Court judgments (Minerva Mills, Maneka Gandhi).",
    descriptionHi: "बंदी प्रत्यक्षीकरण, परमादेश, अधिकार पृच्छा, प्रतिषेध एवं उत्प्रेषण रिटों का ऐतिहासिक न्यायिक निर्णयों सहित गहन विश्लेषण।",
    youtubeUrl: "https://www.youtube.com/watch?v=0yJ5B9hV_7k",
    youtubeId: "0yJ5B9hV_7k",
    durationMinutes: 28,
    paperCode: "GS2",
    subject: "Indian Polity & Governance",
    topic: "Fundamental Rights & Judiciary",
    facultyName: "Dr. Anand Sharma (Senior Polity Faculty)",
    orderIndex: 1,
    isFree: true,
  },
  {
    title: "Monetary Policy Transmission, Repo Rates & RBI Framework",
    titleHi: "मौद्रिक नीति संचरण, रेपो दर एवं RBI का मुद्रास्फीति ढांचा",
    description: "How RBI's Monetary Policy Committee targets headline vs core CPI inflation, open market operations, and standing deposit facility (SDF).",
    descriptionHi: "मौद्रिक नीति समिति किस प्रकार CPI मुद्रास्फीति, खुले बाजार की क्रियाएं और स्थायी जमा सुविधा (SDF) को नियंत्रित करती है।",
    youtubeUrl: "https://www.youtube.com/watch?v=kYv9qQvPqJg",
    youtubeId: "kYv9qQvPqJg",
    durationMinutes: 32,
    paperCode: "GS3",
    subject: "Indian Economy",
    topic: "Banking, Inflation & Monetary Policy",
    facultyName: "Prof. R. Venkatraman (Ex-RBI Consultant)",
    orderIndex: 2,
    isFree: true,
  },
  {
    title: "Indian Monsoon Mechanics, Jet Streams & El Niño Southern Oscillation",
    titleHi: "भारतीय मानसून की कार्यप्रणाली, जेट स्ट्रीम एवं अल नीनो (ENSO)",
    description: "Thermal concept vs dynamic concept, Mascarene High, Somali Jet, Indian Ocean Dipole (IOD) and impact on agricultural GDP.",
    descriptionHi: "तापीय सिद्धांत बनाम गतिक सिद्धांत, मैस्करीन हाई, सोमाली जेट, हिंद महासागर द्विध्रुव (IOD) एवं भारतीय कृषि पर प्रभाव।",
    youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    youtubeId: "dQw4w9WgXcQ",
    durationMinutes: 25,
    paperCode: "GS1",
    subject: "Geography & Climatology",
    topic: "Climatology & Physical Geography",
    facultyName: "Smt. Meera Sengupta (Senior Geography Faculty)",
    orderIndex: 3,
    isFree: true,
  },
  {
    title: "Ethics Case Studies: 7-Step Stakeholder & Conflict Resolution Matrix",
    titleHi: "नीतिशास्त्र केस स्टडीज: 7-चरणीय हितधारक एवं संघर्ष समाधान मैट्रिक्स",
    description: "Standard UPSC methodology to solve GS4 case studies: identifying ethical dilemmas, legal vs moral imperatives, and robust administrative solutions.",
    descriptionHi: "GS4 केस स्टडीज हल करने की मानक पद्धति: नैतिक दुविधाओं की पहचान, विधिक बनाम नैतिक दायित्व एवं व्यावहारिक समाधान।",
    youtubeUrl: "https://www.youtube.com/watch?v=jNQXAC9IVRw",
    youtubeId: "jNQXAC9IVRw",
    durationMinutes: 35,
    paperCode: "GS4",
    subject: "Ethics, Integrity & Aptitude",
    topic: "Ethics Case Studies",
    facultyName: "Shri K. S. Rathore (Retired IAS Officer)",
    orderIndex: 4,
    isFree: true,
  },
  {
    title: "CSAT Reading Comprehension: Eliminating Traps & Finding Crux",
    titleHi: "CSAT गद्यांश बोध: भ्रामक विकल्पों की पहचान एवं मूल भाव निष्कर्षण",
    description: "Step-by-step framework to identify assumptions, corollaries, and direct inferences in complex philosophical and scientific CSAT passages.",
    descriptionHi: "दार्शनिक एवं वैज्ञानिक CSAT गद्यांशों में पूर्वधारणाओं, उपसिद्धांतों एवं प्रत्यक्ष निष्कर्षों को पहचानने की अचूक रणनीति।",
    youtubeUrl: "https://www.youtube.com/watch?v=2vjPBrBU-TM",
    youtubeId: "2vjPBrBU-TM",
    durationMinutes: 22,
    paperCode: "CSAT",
    subject: "CSAT Paper II",
    topic: "Reading Comprehension & Logical Reasoning",
    facultyName: "Pooja Malhotra (Aptitude Specialist)",
    orderIndex: 5,
    isFree: true,
  },
];

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const paperCode = searchParams.get("paperCode");
    const subject = searchParams.get("subject");
    const query = searchParams.get("q");

    // Check if table has records, if not seed initial curated lessons
    const count = await prisma.videoLesson.count();
    if (count === 0) {
      await prisma.videoLesson.createMany({
        data: SEED_VIDEOS,
      });
    }

    const where: any = {};
    if (paperCode && paperCode !== "ALL") {
      where.paperCode = paperCode;
    }
    if (subject && subject !== "ALL") {
      where.subject = subject;
    }
    if (query) {
      where.OR = [
        { title: { contains: query, mode: "insensitive" } },
        { titleHi: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
        { topic: { contains: query, mode: "insensitive" } },
      ];
    }

    const videos = await prisma.videoLesson.findMany({
      where,
      orderBy: { orderIndex: "asc" },
    });

    return NextResponse.json({
      success: true,
      data: videos,
      meta: {
        total: videos.length,
        filters: { paperCode, subject, query },
      },
    });
  } catch (error: any) {
    console.error("Failed to fetch video lessons:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch video lessons" },
      { status: 500 }
    );
  }
}
