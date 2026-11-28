import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sourceType = searchParams.get("sourceType");
    const topic = searchParams.get("topic");

    const whereClause: any = {};
    if (sourceType && sourceType !== "ALL") {
      whereClause.sourceType = sourceType;
    }
    if (topic && topic !== "ALL") {
      whereClause.topic = topic;
    }

    const questions = await prisma.interviewQuestion.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
    });

    const allQuestions = await prisma.interviewQuestion.findMany();
    const sourceMap: Record<string, number> = {};
    for (const q of allQuestions) {
      sourceMap[q.sourceType] = (sourceMap[q.sourceType] || 0) + 1;
    }

    const sourceTypesList = [
      { id: "ALL", labelEn: "All Interview Prompts", labelHi: "सभी प्रश्न", count: allQuestions.length },
      { id: "CANDIDATE_REPORTED", labelEn: "Candidate-Reported Experiences", labelHi: "अभ्यर्थी-अनुभव", count: sourceMap["CANDIDATE_REPORTED"] || 0 },
      { id: "SITUATIONAL", labelEn: "Situational Judgement Prompts", labelHi: "स्थितिगत निर्णय", count: sourceMap["SITUATIONAL"] || 0 },
      { id: "DAF_THEME", labelEn: "Detailed Application Form (DAF)", labelHi: "डीएएफ विषय", count: sourceMap["DAF_THEME"] || 0 },
      { id: "MOCK_INTERVIEW", labelEn: "Public Mock Transcripts", labelHi: "मॉक साक्षात्कार", count: sourceMap["MOCK_INTERVIEW"] || 0 },
    ];

    return NextResponse.json({
      success: true,
      data: {
        totalQuestions: questions.length,
        disclaimer:
          "Important Accuracy Notice: UPSC does not publish an official written interview question paper. These records represent candidate-reported transcripts, DAF-grounded thematic prompts, and situational administrative drills with transparent attribution.",
        sourceTypes: sourceTypesList,
        questions: questions.map((q) => ({
          id: q.id,
          questionTextEn: q.questionTextEn,
          questionTextHi: q.questionTextHi,
          contextEn: q.contextEn,
          contextHi: q.contextHi,
          sourceType: q.sourceType,
          sourceAttribution: q.sourceAttribution,
          year: q.year,
          topic: q.topic,
          tags: q.tags ? q.tags.split(",").map((t) => t.trim()) : [],
          frameworkGuidance: q.frameworkGuidance,
          frameworkGuidanceHi: q.frameworkGuidanceHi,
        })),
      },
    });
  } catch (error: any) {
    console.error("Error in GET /api/v1/interview:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load interview question bank" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v1/interview
 * Actions:
 * 1. DAF_QUESTIONS: Generates personalized DAF-grounded interview questions based on candidate profile.
 * 2. SUBMIT_ANSWER_AND_GET_FOLLOWUP: Analyzes candidate response and returns UPSC Board follow-up questions.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action = "DAF_QUESTIONS" } = body;

    if (action === "DAF_QUESTIONS") {
      const {
        homeState = "Uttar Pradesh",
        homeDistrict = "Varanasi",
        graduationDegree = "Mechanical Engineering",
        optionalSubject = "PSIR",
        hobbies = "Reading non-fiction, playing badminton",
      } = body;

      const generatedQuestions = [
        {
          id: `daf-state-${Date.now()}`,
          category: "HOME_STATE_AND_DISTRICT",
          boardMember: "Chairperson",
          questionTextEn: `You belong to ${homeDistrict}, ${homeState}. What are the primary socioeconomic challenges facing this district today, and as the District Magistrate, what three immediate administrative interventions would you prioritize?`,
          questionTextHi: `आप ${homeDistrict}, ${homeState} से आते हैं। आज इस जिले के समक्ष मुख्य सामाजिक-आर्थिक चुनौतियां क्या हैं, और एक जिलाधिकारी के रूप में आप किन तीन प्रशासनिक हस्तक्षेपों को प्राथमिकता देंगे?`,
          pedagogicalFocus: "Knowledge of local geography, development deficit, realistic governance planning.",
        },
        {
          id: `daf-grad-${Date.now()}`,
          category: "GRADUATION_BACKGROUND",
          boardMember: "Member 1 (Technical Expert)",
          questionTextEn: `You completed your graduation in ${graduationDegree}. How can the analytical principles and systems-thinking of ${graduationDegree} be practically leveraged to improve public service delivery and reduce bureaucratic delays in general administration?`,
          questionTextHi: `आपने ${graduationDegree} में स्नातक किया है। सामान्य प्रशासन में सार्वजनिक सेवा वितरण को बेहतर बनाने और नौकरशाही की देरी को कम करने के लिए ${graduationDegree} के विश्लेषणात्मक सिद्धांतों का व्यावहारिक रूप से कैसे उपयोग किया जा सकता है?`,
          pedagogicalFocus: "Application of specialized degree knowledge to generalist civil service challenges.",
        },
        {
          id: `daf-optional-${Date.now()}`,
          category: "OPTIONAL_SUBJECT",
          boardMember: "Member 2 (Subject Specialist)",
          questionTextEn: `Your optional subject is ${optionalSubject}. In the context of recent global geopolitical shifts and India's multilateral diplomacy, what is your assessment of the strategic autonomy doctrine today?`,
          questionTextHi: `आपका वैकल्पिक विषय ${optionalSubject} है। हालिया वैश्विक भू-राजनीतिक बदलावों और भारत की बहुपक्षीय कूटनीति के संदर्भ में, रणनीतिक स्वायत्तता सिद्धांत पर आपका क्या आकलन है?`,
          pedagogicalFocus: "Conceptual depth, balance of views, ability to handle counter-arguments.",
        },
        {
          id: `daf-hobby-${Date.now()}`,
          category: "HOBBIES_AND_INTERESTS",
          boardMember: "Member 3 (Psychologist)",
          questionTextEn: `You mentioned '${hobbies}' as your hobby. How does this pursuit help you decompress during intense administrative pressure, and what life lesson has it taught you about perseverance?`,
          questionTextHi: `आपने अपनी रुचि के रूप में '${hobbies}' का उल्लेख किया है। यह गहन प्रशासनिक तनाव के दौरान आपको कैसे संतुलित रखता है, और इसने आपको दृढ़ता के बारे में क्या जीवन पाठ सिखाया है?`,
          pedagogicalFocus: "Emotional stability, authentic self-awareness, personal grounding.",
        },
        {
          id: `daf-ethical-${Date.now()}`,
          category: "SITUATIONAL_ETHICAL_DILEMMA",
          boardMember: "Member 4 (Senior Administrator)",
          questionTextEn: `Suppose a senior political representative directs you to approve a subsidized procurement contract that complies with technical rules on paper but clearly favours a single politically connected vendor. How will you respond without derailing your career or violating the public trust?`,
          questionTextHi: `मान लीजिए कि कोई वरिष्ठ राजनीतिक प्रतिनिधि आपको एक रियायती खरीद अनुबंध को मंजूरी देने का निर्देश देता है जो कागजों पर तकनीकी नियमों का पालन करता है लेकिन स्पष्ट रूप से एक राजनीतिक रूप से जुड़े विक्रेता का पक्ष लेता है। आप अपने करियर को पटरी से उतारे बिना या जनता के विश्वास का उल्लंघन किए बिना क्या करेंगे?`,
          pedagogicalFocus: "Constitutional morality, rule of law, institutional courage, diplomatic firmness.",
        },
      ];

      return NextResponse.json({
        success: true,
        disclaimer: "These simulated prompts are calibrated against authentic UPSC interview transcripts for diagnostic self-reflection. UPSC does not release an official interview syllabus or predict scores.",
        data: {
          candidateProfileSummary: {
            homeState,
            homeDistrict,
            graduationDegree,
            optionalSubject,
            hobbies,
          },
          generatedQuestions,
        },
      });
    }

    if (action === "SUBMIT_ANSWER_AND_GET_FOLLOWUP") {
      const { candidateAnswer } = body;
      if (!candidateAnswer || candidateAnswer.trim().length < 15) {
        return NextResponse.json(
          { success: false, error: "Please provide a substantive answer to the board." },
          { status: 400 }
        );
      }

      const wordCount = candidateAnswer.trim().split(/\s+/).length;
      const lower = candidateAnswer.toLowerCase();
      const hasConstitutional = /constitution|article|statutory|law|act|supreme court|judgment|democracy|justice|rights/i.test(lower);
      const hasPractical = /implementation|district|field|monitoring|transparency|citizen|delivery|technology|audit/i.test(lower);

      const followupQuestion = {
        boardMember: "Member 2",
        dialogue: `Candidate, you argued that "${candidateAnswer.slice(0, 80)}...". But critics would point out that in real field conditions with budget constraints and local resistance, this approach often stalls. How would you counter that skepticism?`,
      };

      const feedback = {
        wordCount,
        deliveryAssessment: wordCount > 150 ? "Slightly verbose for a spoken interview answer (aim for crisp 90-120 words)." : "Well-calibrated spoken length.",
        strengths: [
          hasConstitutional ? "Grounded in constitutional principles and administrative mandate." : "Addressed the core question directly.",
          hasPractical ? "Included pragmatic on-ground delivery considerations." : "Articulated thoughts clearly with respectful tone.",
        ],
        areasToImprove: [
          "Avoid absolute statements like 'completely' or 'never'; use measured civil service phrasing like 'evidence suggests' or 'on balance'.",
          "Structure response into: 1. Direct stance, 2. Key supporting rationale, 3. Balanced acknowledgment of counter-perspective.",
        ],
        followup: followupQuestion,
      };

      return NextResponse.json({
        success: true,
        disclaimer: "Diagnostic feedback only. Not an official UPSC evaluation.",
        data: feedback,
      });
    }

    return NextResponse.json(
      { success: false, error: `Unknown action: ${action}` },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("Error in POST /api/v1/interview:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process interview prompt" },
      { status: 500 }
    );
  }
}
