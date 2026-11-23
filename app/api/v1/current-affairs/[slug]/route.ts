import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const slug = params.slug;

    const story = await prisma.orm.public.CurrentAffairsStory
      .where({ slug })
      .include("topics")
      .include("questionLinks", (qls) =>
        qls.include("question", (question) =>
          question
            .include("paper")
            .include("options", (o) => o.orderBy((opt) => opt.optionCode.asc()))
            .include("explanation"),
        ),
      )
      .include("quizQuestions", (qs) => qs.orderBy((q) => q.orderIndex.asc()))
      .first();

    if (!story) {
      return NextResponse.json(
        { success: false, error: "Story not found" },
        { status: 404 }
      );
    }

    // Increment view count (safely ignore write failures in read-only environments)
    try {
      await prisma.orm.public.CurrentAffairsStory
        .where({ id: story.id })
        .update({ viewCount: story.viewCount + 1 });
    } catch {
      // Ignored in read-only serverless environments
    }

    return NextResponse.json({
      success: true,
      story: {
        id: story.id,
        title: story.title,
        slug: story.slug,
        summary: story.summary,
        content: story.content,
        importancePrelims: story.importancePrelims,
        importanceMains: story.importanceMains,
        sourceName: story.sourceName,
        sourceUrl: story.sourceUrl,
        publishedAt: story.publishedAt,
        prelimsFodder: story.prelimsFodder,
        mainsFodder: story.mainsFodder,
        terms: story.termsList ? story.termsList.split(",").map((t) => t.trim()) : [],
        topics: story.topics.map((t) => ({
          paper: t.syllabusPaper,
          name: t.topicName,
        })),
        linkedPyqs: story.questionLinks.map((ql) => ({
          id: ql.question.id,
          year: ql.question.year,
          questionNumber: ql.question.questionNumber,
          paperCode: ql.question.paper.code,
          paperName: ql.question.paper.name,
          questionText: ql.question.questionText,
          difficulty: ql.question.difficulty,
          rationale: ql.relationshipRationale,
          options: ql.question.options.map((o) => ({
            code: o.optionCode,
            text: o.optionText,
            isCorrect: o.isCorrect,
          })),
          explanation: ql.question.explanation
            ? {
                core: ql.question.explanation.detailedExplanation,
                elimination: ql.question.explanation.eliminationTechnique,
                reference: ql.question.explanation.sourceCitation,
              }
            : null,
        })),
        practiceQuestions: story.quizQuestions.map((q) => ({
          id: q.id,
          orderIndex: q.orderIndex,
          questionText: q.questionText,
          options: [
            { code: "A", text: q.optionA },
            { code: "B", text: q.optionB },
            { code: "C", text: q.optionC },
            { code: "D", text: q.optionD },
          ],
          correctOption: q.correctOption,
          explanation: q.explanation,
        })),
      },
    });
  } catch (error: any) {
    console.error("Error fetching story detail:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch story details" },
      { status: 500 }
    );
  }
}
