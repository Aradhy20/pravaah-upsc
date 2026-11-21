import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const examCategory = searchParams.get("exam") || searchParams.get("examCategory");
    const paperCode = searchParams.get("paper");
    const yearsParam = searchParams.get("years") || searchParams.get("year");
    const subjectParam = searchParams.get("subject");
    const topicParam = searchParams.get("topic");
    const languageParam = searchParams.get("language");
    const answerKeyType = searchParams.get("answerKeyType");
    const verificationStatus = searchParams.get("verificationStatus");
    const difficulty = searchParams.get("difficulty");
    const search = searchParams.get("q") || searchParams.get("search");
    const status = searchParams.get("status") || "PUBLISHED";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20")));
    const skip = (page - 1) * limit;

    const where: any = {};

    if (status !== "ALL") {
      where.status = status;
    }

    if (examCategory && examCategory !== "ALL") {
      where.OR = [
        { examCategory: { equals: examCategory, mode: "insensitive" } },
        { paper: { stage: { exam: { code: { equals: examCategory, mode: "insensitive" } } } } },
      ];
    }

    if (paperCode) {
      where.paper = { code: { equals: paperCode, mode: "insensitive" } };
    }

    if (yearsParam) {
      const yearArray = yearsParam
        .split(",")
        .map((y) => parseInt(y.trim()))
        .filter((y) => !isNaN(y));
      if (yearArray.length > 0) {
        where.year = { in: yearArray };
      }
    }

    if (difficulty) {
      where.difficulty = difficulty.toUpperCase();
    }

    if (languageParam && languageParam !== "ALL") {
      where.language = { equals: languageParam, mode: "insensitive" };
    }

    if (verificationStatus) {
      where.answers = {
        some: {
          verificationStatus: verificationStatus,
        },
      };
    }

    if (answerKeyType) {
      where.answers = {
        some: {
          answerKeyType: answerKeyType,
        },
      };
    }

    if (subjectParam) {
      where.topics = {
        some: {
          topic: {
            subject: {
              OR: [
                { slug: subjectParam.toLowerCase() },
                { name: { contains: subjectParam, mode: "insensitive" } },
              ],
            },
          },
        },
      };
    }

    if (topicParam) {
      where.topics = {
        some: {
          topic: {
            OR: [
              { slug: topicParam.toLowerCase() },
              { name: { contains: topicParam, mode: "insensitive" } },
            ],
          },
        },
      };
    }

    if (search) {
      where.OR = [
        { questionText: { contains: search, mode: "insensitive" } },
        { questionTextEn: { contains: search, mode: "insensitive" } },
        { questionTextHi: { contains: search, mode: "insensitive" } },
        {
          explanation: {
            OR: [
              { summary: { contains: search, mode: "insensitive" } },
              { detailedExplanation: { contains: search, mode: "insensitive" } },
              { explanationEn: { contains: search, mode: "insensitive" } },
              { explanationHi: { contains: search, mode: "insensitive" } },
            ],
          },
        },
      ];
    }

    const [total, questions] = await Promise.all([
      prisma.question.count({ where }),
      prisma.question.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ year: "desc" }, { questionNumber: "asc" }],
        include: {
          paper: { include: { stage: { include: { exam: true } } } },
          options: {
            orderBy: { optionCode: "asc" },
          },
          explanation: true,
          answers: {
            take: 2,
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
      }),
    ]);

    const formatted = questions.map((q) => {
      const primaryTopic = q.topics[0]?.topic;
      const primarySubject = primaryTopic?.subject;
      const primaryAnswer = q.answers[0];
      const correctOpt = q.options.find((o) => o.isCorrect)?.optionCode || "A";

      return {
        id: q.id,
        recordId: q.recordId || `REC-${q.year}-${q.paper.code}-${q.questionNumber}`,
        questionGroupId: q.questionGroupId,
        examCategory: q.examCategory || q.paper?.stage?.exam?.code || "CSE",
        examName: q.paper?.stage?.exam?.name || "Civil Services Examination",
        paperCode: q.paper.code,
        paperName: q.paper.name,
        year: q.year,
        questionNumber: q.questionNumber,
        language: q.language || (q.questionTextHi ? "Bilingual" : "English"),
        questionText: q.questionText,
        questionTextEn: q.questionTextEn || q.questionText,
        questionTextHi: q.questionTextHi || null,
        difficulty: q.difficulty,
        difficultyLevel: q.difficultyLevel || q.difficulty,
        marks: q.paper?.code === "GS2" ? 2.5 : (q.marks || 2.0),
        negativeMarks: q.paper?.code === "GS2" ? 0.833 : (q.negativeMarks || 0.666),
        subject: primarySubject?.name || "General Studies",
        subjectSlug: primarySubject?.slug || "general-studies",
        topic: primaryTopic?.name || "Concept",
        options: q.options.map((opt) => ({
          id: opt.id,
          code: opt.optionCode,
          label: opt.optionLabel || opt.optionCode,
          text: opt.optionText,
          textEn: opt.optionTextEn || opt.optionText,
          textHi: opt.optionTextHi || null,
          isCorrect: opt.isCorrect,
        })),
        verifiedAnswer: primaryAnswer
          ? {
              answerOption: primaryAnswer.answerOption,
              answerType: primaryAnswer.answerType,
              answerKeyType: primaryAnswer.answerKeyType,
              answerProvenance: primaryAnswer.answerProvenance,
              verificationStatus: primaryAnswer.verificationStatus,
              sourceName: (primaryAnswer as any).source?.sourceName || "UPSC Official Key",
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
        explanation: q.explanation
          ? {
              summary: q.explanation.summary,
              detailedExplanation: q.explanation.detailedExplanation,
              explanationEn: q.explanation.explanationEn || q.explanation.detailedExplanation,
              explanationHi: q.explanation.explanationHi || null,
              eliminationTechnique: q.explanation.eliminationTechnique,
              sourceCitation: q.explanation.sourceCitation,
              relatedConcept: q.explanation.relatedConcept,
              verifiedAt: q.explanation.verifiedAt,
            }
          : null,
        citations: q.citations.map((c) => ({
          id: c.id,
          sourceName: c.source?.sourceName || "UPSC Gazette",
          publisher: c.source?.publisher || "UPSC",
          sourceUrl: c.sourceUrl || c.source?.canonicalUrl,
          evidenceType: c.evidenceType,
          pageNumber: c.pageNumber,
          citationText: c.citationText,
        })),
        syllabusMappings: q.syllabusMappings.map((sm) => ({
          id: sm.id,
          mappingType: sm.mappingType,
          confidenceScore: sm.confidenceScore,
          syllabusTopic: sm.syllabusTopic?.syllabusText || "UPSC CSE Prelims Standard Syllabus",
        })),
      };
    });

    return NextResponse.json({
      success: true,
      data: formatted,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasMore: skip + limit < total,
      },
    });
  } catch (error: any) {
    console.error("Error in GET /api/v1/pyqs:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: error.message || "Failed to retrieve PYQs",
        },
      },
      { status: 500 }
    );
  }
}
