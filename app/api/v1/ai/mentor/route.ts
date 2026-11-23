import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";
import { RAGEngine } from "@/lib/services/rag-engine";
import { checkAiCreditAllowance, deductAiCredit } from "@/lib/entitlements";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    const body = await request.json().catch(() => ({}));
    const { query, availableHours, focusSubject, language = "en" } = body;

    if (!query || typeof query !== "string" || !query.trim()) {
      return NextResponse.json(
        { success: false, error: "A valid preparation query is required." },
        { status: 400 }
      );
    }

    // 1. Fetch user profile and historical attempts if authenticated
    let profile: any = null;
    let weakTopicsList: string[] = [];
    let recentAccuracy = 0;

    if (user) {
      // Check AI Mentor credit allowance
      const creditCheck = await checkAiCreditAllowance(user.id, "AI_MENTOR");
      if (!creditCheck.allowed) {
        return NextResponse.json(
          {
            success: false,
            error: "AI_LIMIT_REACHED",
            message:
              "You have reached your included Pravaah AI Personal Mentor allowance for this billing period. Upgrade to Aspirant Pro (100 messages/mo) or Aspirant Elite (300 messages/mo).",
            usage: creditCheck,
          },
          { status: 403 }
        );
      }
      await deductAiCredit(user.id, "AI_MENTOR");

      profile = await prisma.userProfile.findUnique({ where: { userId: user.id } });
      const attempts = await prisma.userAttempt.findMany({
        where: { userId: user.id },
        include: {
          question: {
            include: {
              topics: { include: { topic: { include: { subject: true } } } },
            },
          },
        },
      });

      if (attempts.length > 0) {
        const correct = attempts.filter((a) => a.isCorrect).length;
        recentAccuracy = Number(((correct / attempts.length) * 100).toFixed(1));

        // Group by topic to find actual weak topics (<60% accuracy)
        const tMap: Record<string, { total: number; correct: number }> = {};
        for (const a of attempts) {
          const tName = a.question.topics[0]?.topic?.name || "General";
          if (!tMap[tName]) tMap[tName] = { total: 0, correct: 0 };
          tMap[tName].total++;
          if (a.isCorrect) tMap[tName].correct++;
        }
        weakTopicsList = Object.entries(tMap)
          .filter(([_, v]) => v.total >= 1 && (v.correct / v.total) < 0.6)
          .map(([k]) => k);
      }
    }

    // 2. Query RAG Engine for grounded database knowledge (PYQs, NCERTs, Syllabus)
    const ragResult = await RAGEngine.query({
      query,
      examFamily: "CSE",
      maxResults: 5,
    });

    const isHindi = language === "hi" || profile?.preferredLanguage === "hi";
    const hours = availableHours || profile?.dailyStudyHours || 4.0;

    // 3. Synthesize personalized study guidance based on real student metrics
    let mentorAnalysis = "";
    const timetableSlots: Array<{ time: string; activity: string; resource: string }> = [];

    if (hours <= 2) {
      timetableSlots.push({
        time: "00:00 - 01:15",
        activity: isHindi ? "उच्च-प्राथमिकता विषय और बुनियादी अध्ययन" : "High-Yield Topic & Concept Foundation",
        resource: "NCERT Class 11 Indian Constitution at Work / Laxmikanth",
      });
      timetableSlots.push({
        time: "01:15 - 02:00",
        activity: isHindi ? "5 PYQ अभ्यास और गलती रिवीज़न" : "5 PYQ Drill & Mistake Review",
        resource: "Pravaah Verified Question Bank (GS1 Series A)",
      });
    } else if (hours <= 4) {
      timetableSlots.push({
        time: "Session 1 (2h 00m)",
        activity: isHindi ? "सामान्य अध्ययन 1: मुख्य विषय (राजव्यवस्था/अर्थव्यवस्था)" : "GS Paper 1: Core Pillar (Polity/Economy)",
        resource: "Standard Text (M. Laxmikanth Ch. 7-11 or Ramesh Singh Ch. 5-7)",
      });
      timetableSlots.push({
        time: "Session 2 (1h 15m)",
        activity: isHindi ? "सीसैट योग्यता एवं समझ (CSAT Quant & Reading Comp)" : "CSAT Aptitude & Reading Comprehension Drill",
        resource: "CSAT Coach / Speed Diagnostic Module",
      });
      timetableSlots.push({
        time: "Session 3 (45m)",
        activity: isHindi ? "दैनिक क्विज़ और SM-2 रिवीज़न कतार" : "Daily Prelims Diagnostic & SM-2 Spaced Revisions",
        resource: "Pravaah Daily Quiz & Mistake Notebook",
      });
    } else {
      timetableSlots.push({
        time: "Morning Block (3h)",
        activity: isHindi ? "गहन अध्ययन: पाठ्यक्रम micro-topics और NCERT" : "Deep Focus: Core GS Syllabus & NCERT Foundations",
        resource: "NCERT Class 11-12 & Standard Book Mappings",
      });
      timetableSlots.push({
        time: "Afternoon Block (2h)",
        activity: isHindi ? "PYQ अभ्यास एवं मेन्स उत्तर लेखन (1 प्रश्न)" : "Timed PYQ Ingestion & Mains Answer Writing (1 Question)",
        resource: "Pravaah Mains Answer Studio & Prelims Explorer",
      });
      timetableSlots.push({
        time: "Evening Block (1.5h)",
        activity: isHindi ? "सीसैट गति अभ्यास और समसामयिकी" : "CSAT Speed Quantitative Practice & Current Affairs Linking",
        resource: "CSAT Survival Coach & PIB/The Hindu Briefs",
      });
    }

    if (isHindi) {
      mentorAnalysis = `आपके दैनिक ${hours} घंटे के अध्ययन समय और वर्तमान तैयारी स्थिति के आधार पर, यह अध्ययन योजना तैयार की गई है। ${
        weakTopicsList.length > 0
          ? `आपके पिछले प्रयासों से चिन्हित कमजोर विषय (${weakTopicsList.slice(0, 2).join(", ")}) को प्राथमिकता दी गई है।`
          : "संतुलित अभ्यास को बनाए रखें।"
      }`;
    } else {
      mentorAnalysis = `Based on your available study commitment of ${hours} hours and current preparation telemetry, this structured daily roadmap balances core GS foundation, CSAT qualifying safety, and active recall. ${
        weakTopicsList.length > 0
          ? `Identified friction topics (${weakTopicsList.slice(0, 2).join(", ")}) have been allocated dedicated concept revision.`
          : "Pacing is calibrated across General Studies Paper 1 and CSAT Paper 2."
      }`;
    }

    return NextResponse.json({
      success: true,
      data: {
        query,
        language: isHindi ? "hi" : "en",
        allocatedHours: hours,
        mentorAnalysis,
        timetable: timetableSlots,
        groundedResources: {
          relevantPYQs: ragResult.relevantPYQs.map((q) => ({
            id: q.id,
            year: q.year,
            paperCode: q.paperCode,
            questionNumber: q.questionNumber,
            questionText: q.questionText,
            correctOption: q.correctOption,
            subject: q.subject,
            topic: q.topic,
          })),
          ncertReferences: ragResult.ncertReferences,
          standardBookReferences: [
            { book: "Indian Polity", author: "M. Laxmikanth", edition: "7th Edition" },
            { book: "Indian Economy", author: "Ramesh Singh", edition: "15th Edition" },
            { book: "Certificate Physical and Human Geography", author: "G.C. Leong", edition: "Oxford" },
            { book: "A Brief History of Modern India", author: "Rajiv Ahir (Spectrum)", edition: "Latest" },
          ],
          syllabusNodes: ragResult.syllabusNodes,
          citations: ragResult.citations,
        },
        weakTopicInterventions: weakTopicsList.slice(0, 3).map((wt) => ({
          topic: wt,
          recommendedAction: `Read NCERT mapped chapters and attempt 5 targeted questions in Learn Mode.`,
          actionUrl: `/pyqs?q=${encodeURIComponent(wt)}`,
        })),
        isAIGenerated: true,
        disclaimer:
          "AI recommendations are grounded in authentic UPSC syllabus and official database resources. Calibrate with your personal pace.",
      },
    });
  } catch (error: any) {
    console.error("AI Personal Mentor error:", error);
    // Reliable fallback response when external or RAG components encounter exceptions
    return NextResponse.json({
      success: true,
      data: {
        query: "Personalized Daily Study Plan",
        language: "en",
        allocatedHours: 4.0,
        mentorAnalysis:
          "Standard UPSC 4-hour preparation split: 2h GS Paper 1 core conceptual reading, 1h CSAT quantitative and comprehension practice, and 1h past paper problem solving with mistake logging.",
        timetable: [
          { time: "00:00 - 02:00", activity: "GS Paper 1: Constitutional & Economic Foundations", resource: "NCERT Class 11 & Standard Texts" },
          { time: "02:00 - 03:00", activity: "CSAT Paper 2: Number System & Reading Comprehension", resource: "CSAT Coach Timed Practice" },
          { time: "03:00 - 04:00", activity: "PYQ Drill & Mistake Review Notebook", resource: "Pravaah Verified 121 Question Bank" },
        ],
        groundedResources: {
          relevantPYQs: [],
          ncertReferences: [
            { classNum: 11, subject: "Polity", bookTitle: "Indian Constitution at Work", chapterNumber: 1, chapterTitle: "Constitution: Why and How?", officialUrl: "https://ncert.nic.in" },
          ],
          standardBookReferences: [
            { book: "Indian Polity", author: "M. Laxmikanth", edition: "7th Edition" },
          ],
          syllabusNodes: [],
          citations: [],
        },
        weakTopicInterventions: [],
        isAIGenerated: false,
        fallbackActive: true,
      },
    });
  }
}
