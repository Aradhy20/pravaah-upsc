import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { and, or } from "@prisma/orm-postgres/orm-client";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const paperCode = searchParams.get("paper"); // "GS1" | "GS2"
    const yearsParam = searchParams.get("years"); // "2024,2023"
    const subjectParam = searchParams.get("subject");
    const topicParam = searchParams.get("topic");
    const difficulty = searchParams.get("difficulty");
    const search = searchParams.get("q");
    const status = searchParams.get("status") || "PUBLISHED";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20")));
    const skip = (page - 1) * limit;

    type QuestionAccessor = any;
    const conditions: ((q: QuestionAccessor) => any)[] = [];

    if (status !== "ALL") {
      conditions.push((q) => q.status.eq(status));
    }

    if (paperCode) {
      conditions.push((q) => q.paper.code.eq(paperCode));
    }

    if (yearsParam) {
      const yearArray = yearsParam
        .split(",")
        .map((y) => parseInt(y.trim()))
        .filter((y) => !isNaN(y));
      if (yearArray.length > 0) {
        conditions.push((q) => q.year.in(yearArray));
      }
    }

    if (difficulty) {
      conditions.push((q) => q.difficulty.eq(difficulty.toUpperCase()));
    }

    if (subjectParam) {
      conditions.push((q) => q.topics.some((qt: any) =>
        qt.topic.some((tp: any) =>
          or(tp.subject.slug.eq(subjectParam.toLowerCase()), tp.subject.name.like(`%${subjectParam}%`)),
        ),
      ));
    }

    if (topicParam) {
      conditions.push((q) => q.topics.some((qt: any) =>
        qt.topic.some((tp: any) =>
          or(tp.slug.eq(topicParam.toLowerCase()), tp.name.like(`%${topicParam}%`)),
        ),
      ));
    }

    if (search) {
      conditions.push((q) => or(
        q.questionText.ilike(`%${search}%`),
        q.explanation.summary.ilike(`%${search}%`),
        q.explanation.detailedExplanation.ilike(`%${search}%`),
      ));
    }

    const filtered = conditions.length > 0
      ? prisma.orm.public.Question.where((q) => and(...conditions.map((c) => c(q))))
      : prisma.orm.public.Question;

    const [total, questions] = await Promise.all([
      filtered.aggregate((a) => ({ n: a.count() })).then((r) => r.n),
      filtered
        .include("paper")
        .include("options", (o) => o.orderBy((opt) => opt.optionCode.asc()))
        .include("explanation")
        .include("answers", (a) => a.orderBy((ans) => ans.createdAt.desc()).limit(1))
        .include("citations", (c) => c.limit(2).include("source"))
        .include("topics", (t) => t.include("topic", (topic) => topic.include("subject")))
        .orderBy([(q) => q.year.desc(), (q) => q.questionNumber.asc()])
        .offset(skip)
        .limit(limit)
        .all(),
    ]);

    // Format response
    const formatted = questions.map((q) => {
      const primaryTopic = q.topics[0]?.topic;
      const primarySubject = primaryTopic?.subject;
      const primaryAnswer = (q as any).answers?.[0];
      const correctOption = primaryAnswer?.answerOption || q.options.find((o) => o.isCorrect)?.optionCode || "A";

      return {
        id: q.id,
        recordId: (q as any).recordId || `REC-${q.year}-${q.paper.code}-${q.questionNumber}`,
        questionGroupId: (q as any).questionGroupId || null,
        year: q.year,
        questionNumber: q.questionNumber,
        paperCode: q.paper.code,
        paperName: q.paper.name,
        questionText: q.questionText,
        questionTextEn: (q as any).questionTextEn || q.questionText,
        questionTextHi: (q as any).questionTextHi || null,
        language: (q as any).language || ((q as any).questionTextHi ? "Bilingual" : "English"),
        difficulty: q.difficulty,
        isStatic: q.isStatic,
        status: q.status,
        subject: primarySubject?.name || "General Studies",
        subjectSlug: primarySubject?.slug || "general-studies",
        topic: primaryTopic?.name || "Syllabus Concept",
        options: q.options.map((opt) => ({
          id: opt.id,
          code: opt.optionCode,
          label: (opt as any).optionLabel || opt.optionCode,
          text: opt.optionText,
          textEn: (opt as any).optionTextEn || opt.optionText,
          textHi: (opt as any).optionTextHi || null,
          isCorrect: opt.isCorrect,
        })),
        correctOption,
        answerKeyType: primaryAnswer?.answerKeyType || "UPSC_FINAL_KEY",
        verificationStatus: primaryAnswer?.verificationStatus || "OFFICIALLY_VERIFIED",
        answerProvenance: primaryAnswer?.answerProvenance || "UPSC_OFFICIAL_FINAL",
        explanation: q.explanation
          ? {
              summary: q.explanation.summary,
              detailedExplanation: q.explanation.detailedExplanation,
              explanationEn: (q.explanation as any).explanationEn || q.explanation.detailedExplanation,
              explanationHi: (q.explanation as any).explanationHi || null,
              eliminationTechnique: q.explanation.eliminationTechnique,
              sourceCitation: q.explanation.sourceCitation,
              relatedConcept: q.explanation.relatedConcept,
            }
          : null,
        citations: ((q as any).citations || []).map((c: any) => ({
          id: c.id,
          sourceName: c.source?.sourceName || "UPSC Official Key",
          publisher: c.source?.publisher || "UPSC",
          sourceUrl: c.sourceUrl || c.source?.canonicalUrl || "https://www.upsc.gov.in",
          evidenceType: c.evidenceType || "OFFICIAL_GAZETTE",
          pageNumber: c.pageNumber,
          citationText: c.citationText,
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
    console.error("Error in GET /api/v1/questions:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: error.message || "Failed to retrieve questions",
        },
      },
      { status: 500 }
    );
  }
}
