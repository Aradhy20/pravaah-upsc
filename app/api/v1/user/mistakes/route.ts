import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({
        success: true,
        data: {
          authenticated: false,
          summary: {
            totalMistakes: 0,
            unresolvedCount: 0,
            resolvedCount: 0,
            byType: {},
          },
          mistakes: [],
        },
      });
    }

    const mistakes = await prisma.userMistakeClassification.findMany({
      where: { userId: user.id },
      include: {
        question: {
          include: {
            paper: true,
            explanation: true,
            topics: {
              include: {
                topic: { include: { subject: true } },
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const byType: Record<string, number> = {
      CONCEPT_NOT_UNDERSTOOD: 0,
      FORGOTTEN_FACT: 0,
      MISREAD_QUESTION: 0,
      INCORRECT_ELIMINATION: 0,
      CONFUSED_TWO_OPTIONS: 0,
      TIME_PRESSURE_CARELESS: 0,
    };

    for (const m of mistakes) {
      if (byType[m.mistakeType] !== undefined) {
        byType[m.mistakeType]++;
      }
    }

    const formattedMistakes = mistakes.map((m) => {
      const top = m.question.topics[0]?.topic;
      const subj = top?.subject?.name || (m.question.paper?.code === "GS2" ? "CSAT Aptitude" : "General Studies");
      const topicName = top?.name || "General Concept";

      return {
        id: m.id,
        questionId: m.questionId,
        mistakeType: m.mistakeType,
        notes: m.notes,
        isResolved: m.isResolved,
        revisitedAt: m.revisitedAt,
        createdAt: m.createdAt,
        question: {
          id: m.question.id,
          year: m.question.year,
          questionNumber: m.question.questionNumber,
          paperCode: m.question.paper?.code || "GS1",
          questionText: m.question.questionText,
          subject: subj,
          topic: topicName,
          explanation: m.question.explanation
            ? {
                core: m.question.explanation.detailedExplanation,
                elimination: m.question.explanation.eliminationTechnique,
                reference: m.question.explanation.sourceCitation,
              }
            : null,
        },
        personalizedIntervention: {
          recommendedAction:
            m.mistakeType === "CONCEPT_NOT_UNDERSTOOD"
              ? `Revisit foundational NCERT theory for ${topicName} and review constitutional/economic articles.`
              : m.mistakeType === "FORGOTTEN_FACT"
              ? `Review factual tables and memory anchors for ${topicName}.`
              : m.mistakeType === "INCORRECT_ELIMINATION"
              ? `Study elimination strategy: identify absolute qualifiers and contradictory choices.`
              : `Practice 5 timed questions in ${topicName} under simulated time pressure.`,
          drillUrl: `/pyqs?q=${encodeURIComponent(topicName)}`,
        },
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        authenticated: true,
        summary: {
          totalMistakes: mistakes.length,
          unresolvedCount: mistakes.filter((m) => !m.isResolved).length,
          resolvedCount: mistakes.filter((m) => m.isResolved).length,
          byType,
        },
        mistakes: formattedMistakes,
      },
    });
  } catch (error: any) {
    console.error("GET /api/v1/user/mistakes error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch mistake intelligence records" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Authentication required to classify mistake" },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { questionId, mistakeType, notes } = body;

    if (!questionId || !mistakeType) {
      return NextResponse.json(
        { success: false, error: "questionId and mistakeType are required fields" },
        { status: 400 }
      );
    }

    const validTypes = [
      "CONCEPT_NOT_UNDERSTOOD",
      "FORGOTTEN_FACT",
      "MISREAD_QUESTION",
      "INCORRECT_ELIMINATION",
      "CONFUSED_TWO_OPTIONS",
      "TIME_PRESSURE_CARELESS",
    ];

    if (!validTypes.includes(mistakeType)) {
      return NextResponse.json(
        { success: false, error: `Invalid mistakeType. Must be one of: ${validTypes.join(", ")}` },
        { status: 400 }
      );
    }

    // 1. Save or update mistake classification
    const mistake = await prisma.userMistakeClassification.create({
      data: {
        userId: user.id,
        questionId,
        mistakeType,
        notes: notes || null,
        isResolved: false,
      },
    });

    // 2. Ensure question is queued in SM-2 ReviewSchedule for spaced repetition
    const nextReview = new Date(Date.now() + 86400000); // 1 day interval for initial mistake
    await prisma.reviewSchedule.upsert({
      where: {
        userId_questionId: {
          userId: user.id,
          questionId,
        },
      },
      create: {
        userId: user.id,
        questionId,
        nextReviewDate: nextReview,
        intervalDays: 1,
        repetitionCount: 0,
        easeFactor: 2.5,
        isResolved: false,
      },
      update: {
        nextReviewDate: nextReview,
        intervalDays: 1,
        isResolved: false,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: mistake.id,
        questionId: mistake.questionId,
        mistakeType: mistake.mistakeType,
        isResolved: mistake.isResolved,
        nextReviewDate: nextReview,
      },
    });
  } catch (error: any) {
    console.error("POST /api/v1/user/mistakes error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to record mistake classification" },
      { status: 500 }
    );
  }
}
