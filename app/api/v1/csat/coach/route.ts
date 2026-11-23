import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);

    // 1. Fetch all CSAT (GS2) questions from database
    const csatQuestions = await prisma.question.findMany({
      where: {
        paper: { code: "GS2" },
        status: "PUBLISHED",
      },
      include: {
        options: { orderBy: { optionCode: "asc" } },
        explanation: true,
        topics: {
          include: { topic: { include: { subject: true } } },
        },
      },
      orderBy: { questionNumber: "asc" },
    });

    // 2. Fetch user attempts on CSAT if authenticated
    let userAttempts: any[] = [];
    if (user) {
      userAttempts = await prisma.userAttempt.findMany({
        where: {
          userId: user.id,
          question: { paper: { code: "GS2" } },
        },
        include: { question: true },
      });
    }

    const totalAttempted = userAttempts.length;
    const correctCount = userAttempts.filter((a) => a.isCorrect).length;
    const incorrectCount = totalAttempted - correctCount;

    // Marking scheme: +2.5 for correct, -0.833 for incorrect
    const estimatedScore =
      totalAttempted > 0
        ? Number(Math.max(0, correctCount * 2.5 - incorrectCount * 0.833).toFixed(1))
        : 0;

    const overallAccuracy =
      totalAttempted > 0 ? Number(((correctCount / totalAttempted) * 100).toFixed(1)) : 0;

    const totalTimeSeconds = userAttempts.reduce((acc, a) => acc + (a.timeSpentSeconds || 0), 0);
    const avgTimePerQuestion =
      totalAttempted > 0 ? Math.round(totalTimeSeconds / totalAttempted) : 85;

    // CSAT Qualifying rules: 33% = 66 / 200 marks
    let qualifyingStatus = "UNTESTED";
    let warningMessage: string | null = null;

    if (totalAttempted >= 5) {
      if (estimatedScore >= 80) {
        qualifyingStatus = "QUALIFYING_SAFE";
      } else if (estimatedScore >= 66) {
        qualifyingStatus = "QUALIFYING_MARGINAL";
        warningMessage = "You are hovering close to the 66-mark cutoff. Secure your buffer with targeted reasoning and quantitative practice.";
      } else {
        qualifyingStatus = "AT_RISK";
        warningMessage = "CRITICAL ALERT: Your current accuracy projects a score below the mandatory 66-mark (33%) qualifying cutoff. Failure in CSAT disqualifies GS Paper 1 regardless of marks.";
      }
    } else if (totalAttempted > 0) {
      qualifyingStatus = "CALIBRATING";
      warningMessage = "Attempt at least 5 questions to calibrate your projected qualifying score.";
    }

    // Sub-pillar groupings
    const quantQuestions = csatQuestions.filter((q) => {
      const tName = q.topics[0]?.topic?.name?.toLowerCase() || "";
      const sName = q.topics[0]?.topic?.subject?.name?.toLowerCase() || "";
      return tName.includes("quant") || tName.includes("ratio") || tName.includes("number") || sName.includes("quant");
    });

    const reasoningQuestions = csatQuestions.filter((q) => {
      const tName = q.topics[0]?.topic?.name?.toLowerCase() || "";
      const sName = q.topics[0]?.topic?.subject?.name?.toLowerCase() || "";
      return tName.includes("reasoning") || tName.includes("syllogism") || sName.includes("reasoning");
    });

    const readingCompQuestions = csatQuestions.filter((q) => {
      const tName = q.topics[0]?.topic?.name?.toLowerCase() || "";
      const sName = q.topics[0]?.topic?.subject?.name?.toLowerCase() || "";
      return tName.includes("comprehension") || tName.includes("reading") || sName.includes("comprehension");
    });

    // Sub-pillar attempts
    const quantAttempts = userAttempts.filter((a) => quantQuestions.some((q) => q.id === a.questionId));
    const reasoningAttempts = userAttempts.filter((a) => reasoningQuestions.some((q) => q.id === a.questionId));
    const compAttempts = userAttempts.filter((a) => readingCompQuestions.some((q) => q.id === a.questionId));

    const quantCorrect = quantAttempts.filter((a) => a.isCorrect).length;
    const reasoningCorrect = reasoningAttempts.filter((a) => a.isCorrect).length;
    const compCorrect = compAttempts.filter((a) => a.isCorrect).length;

    return NextResponse.json({
      success: true,
      data: {
        authenticated: !!user,
        qualifyingRules: {
          totalQuestionsInPaper: 80,
          totalMarksInPaper: 200,
          marksPerQuestion: 2.5,
          negativeMarkPerIncorrect: 0.833,
          qualifyingPercentage: 33,
          qualifyingThresholdMarks: 66.0,
          officialNotice:
            "According to UPSC CSE Preliminary Examination rules, General Studies Paper-II is a qualifying paper with minimum qualifying marks fixed at 33%.",
        },
        userPerformance: {
          totalAttempted,
          correctCount,
          incorrectCount,
          overallAccuracy,
          estimatedScore,
          avgTimePerQuestionSeconds: avgTimePerQuestion,
          qualifyingStatus,
          warningMessage,
        },
        pillars: [
          {
            name: "Quantitative Aptitude",
            slug: "quant",
            availableQuestions: quantQuestions.length,
            attempted: quantAttempts.length,
            correct: quantCorrect,
            accuracy: quantAttempts.length > 0 ? Number(((quantCorrect / quantAttempts.length) * 100).toFixed(1)) : 0,
            recommendedTarget: "Aim for 80%+ accuracy in core topics: Number System, Ratio & Proportions.",
          },
          {
            name: "Logical & Analytical Reasoning",
            slug: "reasoning",
            availableQuestions: reasoningQuestions.length,
            attempted: reasoningAttempts.length,
            correct: reasoningCorrect,
            accuracy: reasoningAttempts.length > 0 ? Number(((reasoningCorrect / reasoningAttempts.length) * 100).toFixed(1)) : 0,
            recommendedTarget: "High accuracy, low negative mark potential. Focus on Syllogisms and Sequences.",
          },
          {
            name: "Reading Comprehension",
            slug: "comprehension",
            availableQuestions: readingCompQuestions.length,
            attempted: compAttempts.length,
            correct: compCorrect,
            accuracy: compAttempts.length > 0 ? Number(((compCorrect / compAttempts.length) * 100).toFixed(1)) : 0,
            recommendedTarget: "Critical inferences & crucial messages. Avoid extreme interpretations.",
          },
        ],
        curatedPracticeSets: [
          {
            id: "set-speed-diagnostic",
            title: "CSAT 15-Minute Speed Diagnostic",
            description: "5 rapid-fire questions testing Number Systems and Critical Inferences.",
            questionCount: 5,
            paperCode: "GS2",
            actionUrl: "/pyqs?paper=GS2&limit=5",
          },
          {
            id: "set-quant-booster",
            title: "Quantitative Aptitude High-Yield Drill",
            description: "Practice percentages, mixtures, and divisibility rules from 2024 Series A.",
            questionCount: 10,
            paperCode: "GS2",
            actionUrl: "/pyqs?paper=GS2&subject=csat-quant",
          },
          {
            id: "set-rc-mastery",
            title: "Reading Comprehension Assumption Lab",
            description: "10 passage-based questions with strict assumption identification.",
            questionCount: 10,
            paperCode: "GS2",
            actionUrl: "/pyqs?paper=GS2&subject=csat-comprehension",
          },
        ],
      },
    });
  } catch (error: any) {
    console.error("GET /api/v1/csat/coach error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate CSAT Coach telemetry" },
      { status: 500 }
    );
  }
}
