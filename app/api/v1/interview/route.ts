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
