import { NextRequest, NextResponse } from "next/server";
import { UPSC_MARKING_SCHEMES } from "@/lib/scoring";

export const dynamic = "force-dynamic";

/**
 * POST /api/v1/exam-simulator/what-if
 * Calculates scenario outcomes:
 * What if an aspirant changes 5 doubtful attempts from guessed to unattempted?
 * What if accuracy improves by 10%?
 * Evaluates impact on negative penalty and net score.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      paperCode = "GS1",
      totalQuestions = 100,
      currentAttempted = 85,
      currentCorrect = 60,
      simulatedChanges = {
        convertIncorrectToUnattempted: 5,
        convertDoubtfulToCorrect: 3,
      },
    } = body;

    const scheme = UPSC_MARKING_SCHEMES[paperCode] || UPSC_MARKING_SCHEMES.GS1;
    const currentIncorrect = Math.max(0, currentAttempted - currentCorrect);
    const currentUnattempted = Math.max(0, totalQuestions - currentAttempted);

    // Baseline calculation
    const baselineRaw = currentCorrect * scheme.positiveMark;
    const baselineNegative = currentIncorrect * scheme.negativeMark;
    const baselineNet = Math.max(0, baselineRaw - baselineNegative);
    const baselineAccuracy = currentAttempted > 0 ? (currentCorrect / currentAttempted) * 100 : 0;

    // Simulation calculation
    const deltaIncorrect = simulatedChanges.convertIncorrectToUnattempted || 0;
    const deltaCorrect = simulatedChanges.convertDoubtfulToCorrect || 0;

    const simulatedCorrect = Math.min(totalQuestions, currentCorrect + deltaCorrect);
    const simulatedIncorrect = Math.max(0, currentIncorrect - deltaIncorrect);
    const simulatedAttempted = simulatedCorrect + simulatedIncorrect;
    const simulatedUnattempted = Math.max(0, totalQuestions - simulatedAttempted);

    const simulatedRaw = simulatedCorrect * scheme.positiveMark;
    const simulatedNegative = simulatedIncorrect * scheme.negativeMark;
    const simulatedNet = Math.max(0, simulatedRaw - simulatedNegative);
    const simulatedAccuracy = simulatedAttempted > 0 ? (simulatedCorrect / simulatedAttempted) * 100 : 0;

    const netScoreDifference = simulatedNet - baselineNet;

    return NextResponse.json({
      success: true,
      disclaimer: "What-If Simulator is an analytical model demonstrating negative marking sensitivity. Simulated results are mathematical estimations and do not correspond to official UPSC cutoffs or percentiles.",
      data: {
        paperCode,
        markingRule: {
          positiveMark: scheme.positiveMark,
          negativeMark: Number(scheme.negativeMark.toFixed(3)),
        },
        baseline: {
          attempted: currentAttempted,
          correct: currentCorrect,
          incorrect: currentIncorrect,
          unattempted: currentUnattempted,
          rawScore: Number(baselineRaw.toFixed(2)),
          negativeMarksDeducted: Number(baselineNegative.toFixed(2)),
          netScore: Number(baselineNet.toFixed(2)),
          accuracyPercentage: Number(baselineAccuracy.toFixed(1)),
        },
        simulated: {
          attempted: simulatedAttempted,
          correct: simulatedCorrect,
          incorrect: simulatedIncorrect,
          unattempted: simulatedUnattempted,
          rawScore: Number(simulatedRaw.toFixed(2)),
          negativeMarksDeducted: Number(simulatedNegative.toFixed(2)),
          netScore: Number(simulatedNet.toFixed(2)),
          accuracyPercentage: Number(simulatedAccuracy.toFixed(1)),
        },
        impact: {
          netScoreDifference: Number(netScoreDifference.toFixed(2)),
          savedNegativeMarks: Number((baselineNegative - simulatedNegative).toFixed(2)),
          advice:
            netScoreDifference > 0
              ? `Eliminating ${deltaIncorrect} wild guesses saves ${(deltaIncorrect * scheme.negativeMark).toFixed(2)} negative marks, boosting net score by +${netScoreDifference.toFixed(2)}.`
              : "Review your aggressive guessing threshold to minimize negative marks.",
        },
      },
    });
  } catch (error: any) {
    console.error("What-If Simulator Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to run What-If simulation" },
      { status: 500 }
    );
  }
}
