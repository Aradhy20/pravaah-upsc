import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

interface DimensionScore {
  name: string;
  weightPercent: number;
  score: number;
  maxScore: number;
  feedback: string;
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Authentication required to evaluate answers" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { mainsQuestionId, userAnswer } = body;

    if (!mainsQuestionId || !userAnswer || typeof userAnswer !== "string") {
      return NextResponse.json(
        { success: false, error: "mainsQuestionId and userAnswer string are required" },
        { status: 400 }
      );
    }

    const question = await prisma.mainsQuestion.findUnique({
      where: { id: mainsQuestionId },
    });

    if (!question) {
      return NextResponse.json(
        { success: false, error: "Mains question not found" },
        { status: 404 }
      );
    }

    const words = userAnswer.trim().split(/\s+/).filter(Boolean);
    const wordCount = words.length;

    if (wordCount < 30) {
      return NextResponse.json(
        {
          success: false,
          error: "Answer is too short for meaningful UPSC evaluation (minimum 30 words required).",
        },
        { status: 400 }
      );
    }

    // UPSC 4-Dimension Evaluation Logic
    const targetWords = question.wordLimit || 150;
    const maxMarks = question.marks || 10;

    // Check if external Gemini API is configured
    const geminiApiKey = process.env.GEMINI_API_KEY;
    let evaluationData: any = null;

    if (geminiApiKey) {
      try {
        const prompt = `You are a strict, veteran UPSC Civil Services Mains answer evaluator.
Evaluate the following student answer for a ${question.paperCode} question.

Question (${question.marks} Marks, ${question.wordLimit} Words Limit):
"${question.questionText}"

Ideal Framework / Official Themes:
${question.frameworkGuidance || "Comprehensive multi-dimensional analysis with constitutional, statutory, and empirical evidence."}

Student Submitted Answer (${wordCount} words):
"${userAnswer}"

Evaluate strictly on 4 UPSC parameters:
1. Introduction (Definition, context, clarity)
2. Body (Multi-dimensional aspects: legal, social, economic, administrative, environmental)
3. Value Additions (Case laws, constitutional articles, committee reports, facts)
4. Conclusion (Forward-looking, balanced, pragmatic)

Provide your response in JSON format with this exact structure:
{
  "totalScore": number (out of ${question.marks}),
  "summaryCritique": "string",
  "dimensions": [
    {"name": "Introduction & Conceptual Definition", "score": number, "maxScore": number, "feedback": "string"},
    {"name": "Multi-Dimensional Arguments", "score": number, "maxScore": number, "feedback": "string"},
    {"name": "Constitutional & Empirical Citations", "score": number, "maxScore": number, "feedback": "string"},
    {"name": "Conclusion & Way Forward", "score": number, "maxScore": number, "feedback": "string"}
  ],
  "strengths": ["string", "string"],
  "missingPoints": ["string", "string"],
  "wordCountCompliance": "UNDER" | "OPTIMAL" | "OVER"
}`;

        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: { responseMimeType: "application/json" },
            }),
          }
        );

        if (geminiRes.ok) {
          const geminiJson = await geminiRes.json();
          const rawText = geminiJson.candidates?.[0]?.content?.parts?.[0]?.text;
          if (rawText) {
            evaluationData = JSON.parse(rawText);
          }
        }
      } catch (geminiError) {
        console.error("Gemini API call failed, falling back to heuristic engine:", geminiError);
      }
    }

    // Pedagogical Heuristic Evaluation Engine (Fallback & Local Execution)
    if (!evaluationData) {
      const guidanceTerms = (question.frameworkGuidance || "")
        .toLowerCase()
        .replace(/[^a-z0-9 ]/g, " ")
        .split(" ")
        .filter((w) => w.length > 4);

      const lowerAnswer = userAnswer.toLowerCase();
      let matchedTermsCount = 0;
      for (const term of guidanceTerms) {
        if (lowerAnswer.includes(term)) matchedTermsCount++;
      }

      // Word count scoring penalty
      let wordComplianceScore = 1.0;
      let wordStatus = "OPTIMAL";
      if (wordCount < targetWords * 0.7) {
        wordComplianceScore = 0.75;
        wordStatus = "UNDER";
      } else if (wordCount > targetWords * 1.3) {
        wordComplianceScore = 0.85;
        wordStatus = "OVER";
      }

      // Paragraph and structure analysis
      const paragraphs = userAnswer.split(/\n+/).filter((p) => p.trim().length > 0);
      const hasHeadings = /body|dimensions|reasons|challenges|way forward|conclusion|recommendations/i.test(
        userAnswer
      );
      const hasCitations = /article|section|committee|report|act|judgement|v\.|survey|ministry/i.test(
        userAnswer
      );

      // Intro Dimension (15%)
      const introMax = maxMarks * 0.15;
      const introScore = Math.round((introMax * (paragraphs.length > 1 ? 0.75 : 0.5)) * 10) / 10;

      // Body Dimension (50%)
      const bodyMax = maxMarks * 0.5;
      const keywordRatio = Math.min(1.0, (matchedTermsCount + 2) / Math.max(5, guidanceTerms.length * 0.4));
      const bodyScore =
        Math.round(
          (bodyMax * (0.5 + 0.3 * keywordRatio + (hasHeadings ? 0.2 : 0)) * wordComplianceScore) * 10
        ) / 10;

      // Evidence & Citations Dimension (20%)
      const citationsMax = maxMarks * 0.2;
      const citationsScore = Math.round((citationsMax * (hasCitations ? 0.8 : 0.4)) * 10) / 10;

      // Conclusion Dimension (15%)
      const conclusionMax = maxMarks * 0.15;
      const conclusionScore =
        Math.round((conclusionMax * (paragraphs.length >= 3 ? 0.8 : 0.45)) * 10) / 10;

      const rawTotal = introScore + bodyScore + citationsScore + conclusionScore;
      const totalScore = Math.min(maxMarks * 0.78, Math.max(maxMarks * 0.35, Math.round(rawTotal * 10) / 10));

      evaluationData = {
        totalScore,
        summaryCritique: `Your draft demonstrates good foundational understanding (${wordCount} words). ${
          hasHeadings
            ? "Clear structural subheadings helped organize arguments."
            : "Adding explicit subheadings (e.g. Constitutional Provisions, Bottlenecks, Way Forward) will boost marks."
        } ${hasCitations ? "Citations were effectively integrated." : "Include specific committee names, constitutional articles, or budget data points."}`,
        dimensions: [
          {
            name: "Introduction & Contextual Definition",
            score: introScore,
            maxScore: introMax,
            feedback:
              paragraphs.length > 1
                ? "Good distinct introduction separating definition from the core body."
                : "Demarcate the opening paragraph to provide a crisp 2-line definition.",
          },
          {
            name: "Multi-Dimensional Argumentation",
            score: bodyScore,
            maxScore: bodyMax,
            feedback: `Covered key thematic dimensions. Word limit compliance: ${wordStatus}.`,
          },
          {
            name: "Evidence, Citations & Case Laws",
            score: citationsScore,
            maxScore: citationsMax,
            feedback: hasCitations
              ? "Relevant institutional or constitutional references identified."
              : "Substantiate points with Law Commission, 2nd ARC, or Supreme Court precedents.",
          },
          {
            name: "Conclusion & Pragmatic Way Forward",
            score: conclusionScore,
            maxScore: conclusionMax,
            feedback:
              paragraphs.length >= 3
                ? "Balanced closing aligning with constitutional ethos."
                : "Ensure the concluding paragraph articulates a pragmatic policy solution.",
          },
        ],
        strengths: [
          hasHeadings ? "Structured thematic separation" : "Direct addressal of the core question directive",
          `Maintained steady narrative flow across ${paragraphs.length} paragraph blocks`,
        ],
        missingPoints: [
          "Include a reference to relevant committee reports (e.g. 2nd ARC, NITI Aayog Strategy Documents)",
          "Summarize actionable policy recommendations under an explicit 'Way Forward' subheading",
        ],
        wordCountCompliance: wordStatus,
      };
    }

    // Persist AI evaluation in MainsDraft
    await prisma.mainsDraft.upsert({
      where: {
        userId_mainsQuestionId: {
          userId: user.id,
          mainsQuestionId,
        },
      },
      update: {
        userAnswer,
        wordCount,
        selfEvaluationScore: evaluationData.totalScore,
        aiFeedbackJson: JSON.stringify(evaluationData),
        isSubmitted: true,
        updatedAt: new Date(),
      },
      create: {
        userId: user.id,
        mainsQuestionId,
        userAnswer,
        wordCount,
        selfEvaluationScore: evaluationData.totalScore,
        aiFeedbackJson: JSON.stringify(evaluationData),
        isSubmitted: true,
      },
    });

    return NextResponse.json({
      success: true,
      evaluation: evaluationData,
    });
  } catch (error: any) {
    console.error("Error in POST /api/v1/mains/evaluate:", error);
    return NextResponse.json(
      { success: false, error: "Internal error evaluating Mains answer" },
      { status: 500 }
    );
  }
}
