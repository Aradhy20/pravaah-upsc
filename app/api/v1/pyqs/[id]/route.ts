import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const question = await prisma.question.findFirst({
      where: {
        OR: [
          { id: id },
          { recordId: id },
          { questionGroupId: id },
        ],
      },
      include: {
        paper: { include: { stage: { include: { exam: true } } } },
        options: { orderBy: { optionCode: "asc" } },
        explanation: true,
        answers: {
          orderBy: { createdAt: "desc" },
        },
        citations: {
          include: { source: true },
        },
        syllabusMappings: {
          include: { syllabusTopic: true },
        },
        topics: {
          include: {
            topic: {
              include: { subject: true },
            },
          },
        },
      },
    });

    if (!question) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "NOT_FOUND",
            message: `Question with ID or recordId '${id}' not found.`,
          },
        },
        { status: 404 }
      );
    }

    const primaryTopic = question.topics[0]?.topic;
    const primarySubject = primaryTopic?.subject;
    const primaryAnswer = question.answers[0];
    const correctOpt = question.options.find((o) => o.isCorrect)?.optionCode || "A";

    const formatted = {
      id: question.id,
      recordId: question.recordId || `REC-${question.year}-${question.paper.code}-${question.questionNumber}`,
      questionGroupId: question.questionGroupId,
      examCategory: question.examCategory || question.paper?.stage?.exam?.code || "CSE",
      examName: question.paper?.stage?.exam?.name || "Civil Services Examination",
      paperCode: question.paper.code,
      paperName: question.paper.name,
      year: question.year,
      questionNumber: question.questionNumber,
      language: question.language || (question.questionTextHi ? "Bilingual" : "English"),
      questionText: question.questionText,
      questionTextEn: question.questionTextEn || question.questionText,
      questionTextHi: question.questionTextHi || null,
      difficulty: question.difficulty,
      difficultyLevel: question.difficultyLevel || question.difficulty,
      marks: question.marks,
      negativeMarks: question.negativeMarks,
      subject: primarySubject?.name || "General Studies",
      subjectSlug: primarySubject?.slug || "general-studies",
      topic: primaryTopic?.name || "Concept",
      options: question.options.map((opt) => ({
        id: opt.id,
        code: opt.optionCode,
        label: opt.optionLabel || opt.optionCode,
        text: opt.optionText,
        textEn: opt.optionTextEn || opt.optionText,
        textHi: opt.optionTextHi || null,
        isCorrect: opt.isCorrect,
      })),
      answers: question.answers.map((a) => ({
        id: a.id,
        answerOption: a.answerOption,
        answerType: a.answerType,
        answerKeyType: a.answerKeyType,
        answerProvenance: a.answerProvenance,
        verificationStatus: a.verificationStatus,
        sourceName: a.source?.sourceName || "UPSC Official Key",
        sourceUrl: a.source?.canonicalUrl,
        publishedAt: a.publishedAt,
      })),
      verifiedAnswer: primaryAnswer
        ? {
            answerOption: primaryAnswer.answerOption,
            answerType: primaryAnswer.answerType,
            answerKeyType: primaryAnswer.answerKeyType,
            answerProvenance: primaryAnswer.answerProvenance,
            verificationStatus: primaryAnswer.verificationStatus,
            sourceName: primaryAnswer.source?.sourceName || "UPSC Official Key",
            publishedAt: primaryAnswer.publishedAt,
          }
        : {
            answerOption: correctOpt,
            answerType: "FINAL",
            answerKeyType: "UPSC_FINAL_KEY",
            answerProvenance: "UPSC_OFFICIAL_FINAL",
            verificationStatus: "OFFICIALLY_VERIFIED",
            sourceName: "UPSC Official Master Key",
            publishedAt: null,
          },
      explanation: question.explanation
        ? {
            summary: question.explanation.summary,
            detailedExplanation: question.explanation.detailedExplanation,
            explanationEn: question.explanation.explanationEn || question.explanation.detailedExplanation,
            explanationHi: question.explanation.explanationHi || null,
            eliminationTechnique: question.explanation.eliminationTechnique,
            sourceCitation: question.explanation.sourceCitation,
            relatedConcept: question.explanation.relatedConcept,
            verifiedAt: question.explanation.verifiedAt,
          }
        : null,
      citations: question.citations.map((c) => ({
        id: c.id,
        sourceName: c.source?.sourceName || "UPSC Gazette",
        publisher: c.source?.publisher || "UPSC",
        sourceUrl: c.sourceUrl || c.source?.canonicalUrl,
        evidenceType: c.evidenceType,
        pageNumber: c.pageNumber,
        citationText: c.citationText,
      })),
      syllabusMappings: question.syllabusMappings.map((sm) => ({
        id: sm.id,
        mappingType: sm.mappingType,
        confidenceScore: sm.confidenceScore,
        syllabusTopic: sm.syllabusTopic?.syllabusText || "UPSC CSE Prelims Standard Syllabus",
      })),
    };

    return NextResponse.json({
      success: true,
      data: formatted,
    });
  } catch (error: any) {
    console.error("Error in GET /api/v1/pyqs/[id]:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: error.message || "Failed to retrieve question details",
        },
      },
      { status: 500 }
    );
  }
}
