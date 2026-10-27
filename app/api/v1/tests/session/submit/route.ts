import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateScorecard, QuestionGradingInput } from "@/lib/scoring";
import { getCurrentUser } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, responses = [], totalTimeSpentSeconds = 0 } = body;

    if (!sessionId) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "INVALID_SESSION", message: "sessionId is required" },
        },
        { status: 400 }
      );
    }

    const session = await prisma.testSession.findUnique({
      where: { id: sessionId },
      include: {
        test: {
          include: {
            paper: true,
            questions: {
              include: {
                question: {
                  include: {
                    options: true,
                    explanation: true,
                    topics: {
                      include: {
                        topic: {
                          include: { subject: true },
                        },
                      },
                    },
                  },
                },
              },
              orderBy: { orderIndex: "asc" },
            },
          },
        },
      },
    });

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "SESSION_NOT_FOUND", message: "Test session not found" },
        },
        { status: 404 }
      );
    }

    // Security Check: Verify user owns this session
    const user = await getCurrentUser(request);
    if (session.userId !== user.id && user.role !== "ADMIN") {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "FORBIDDEN_SESSION_MISMATCH",
            message: "You can only submit your own test session.",
          },
        },
        { status: 403 }
      );
    }

    if (session.status === "COMPLETED") {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "ALREADY_SUBMITTED",
            message: "This test session has already been submitted.",
          },
        },
        { status: 400 }
      );
    }

    // Map responses to question IDs
    const responseMap = new Map<string, { selectedOption: string; timeSpent: number }>();
    for (const r of responses) {
      if (r.questionId) {
        responseMap.set(r.questionId, {
          selectedOption: r.selectedOption || "",
          timeSpent: r.timeSpent || 0,
        });
      }
    }

    // Fetch questions to grade: all test questions if configured, else submitted question IDs
    let dbQuestions: any[] = [];
    if (session.test.questions && session.test.questions.length > 0) {
      dbQuestions = session.test.questions.map((tq) => tq.question);
    } else {
      const questionIds = Array.from(responseMap.keys());
      dbQuestions = await prisma.question.findMany({
        where: { id: { in: questionIds } },
        include: {
          options: true,
          explanation: true,
          topics: {
            include: {
              topic: {
                include: { subject: true },
              },
            },
          },
        },
      });
    }

    const gradingInputs: QuestionGradingInput[] = [];
    const detailedResults: any[] = [];

    for (const q of dbQuestions) {
      const resp = responseMap.get(q.id);
      const selectedOption = resp?.selectedOption ? resp.selectedOption.toUpperCase() : null;
      const correctOptionObj = q.options.find((o: any) => o.isCorrect);
      const correctOption = correctOptionObj?.optionCode || "A";
      const subjectName = q.topics[0]?.topic?.subject?.name || "General Studies";

      gradingInputs.push({
        questionId: q.id,
        selectedOption,
        correctOption,
        subjectName,
        timeSpentSeconds: resp?.timeSpent || 0,
      });

      const isCorrect = selectedOption !== null && selectedOption === correctOption;

      // Save UserResponse in DB
      await prisma.userResponse.create({
        data: {
          sessionId: session.id,
          userId: session.userId,
          questionId: q.id,
          selectedCode: selectedOption,
          isCorrect,
          timeSpentSeconds: resp?.timeSpent || 0,
        },
      });

      // If incorrect attempt, queue in mistake bank
      if (selectedOption !== null && !isCorrect) {
        await prisma.reviewSchedule.upsert({
          where: {
            userId_questionId: {
              userId: session.userId,
              questionId: q.id,
            },
          },
          update: {
            repetitionCount: { increment: 1 },
            isResolved: false,
            nextReviewDate: new Date(Date.now() + 86400000),
          },
          create: {
            userId: session.userId,
            questionId: q.id,
            repetitionCount: 1,
            intervalDays: 1,
            nextReviewDate: new Date(Date.now() + 86400000),
            isResolved: false,
          },
        });
      }

      detailedResults.push({
        id: q.id,
        questionNumber: q.questionNumber,
        questionText: q.questionText,
        selectedOption,
        correctOption,
        isCorrect,
        isAttempted: selectedOption !== null,
        subject: subjectName,
        topic: q.topics[0]?.topic?.name || "General Topic",
        options: q.options.map((o: any) => ({
          code: o.optionCode,
          text: o.optionText,
          isCorrect: o.isCorrect,
        })),
        explanation: q.explanation
          ? {
              summary: q.explanation.summary,
              detailedExplanation: q.explanation.detailedExplanation,
              eliminationTechnique: q.explanation.eliminationTechnique,
              sourceCitation: q.explanation.sourceCitation,
            }
          : null,
      });
    }

    // Calculate score with strict UPSC marking
    const paperCode = session.test.paper.code;
    const scorecard = calculateScorecard(paperCode, gradingInputs);

    // Update Session in DB
    await prisma.testSession.update({
      where: { id: session.id },
      data: {
        status: "COMPLETED",
        submittedAt: new Date(),
        totalTimeSpentSeconds,
        attemptedCount: scorecard.attemptedCount,
        correctCount: scorecard.correctCount,
        incorrectCount: scorecard.incorrectCount,
        unattemptedCount: scorecard.unattemptedCount,
        rawScore: scorecard.rawScore,
        negativeMarks: scorecard.negativeMarks,
        netScore: scorecard.netScore,
      },
    });

    // Record Study Activity
    await prisma.studyActivity.create({
      data: {
        userId: session.userId,
        activityType: "test_completed",
        label: `Completed ${session.test.title} (Score: ${scorecard.netScore})`,
        refId: session.id,
        durationSeconds: totalTimeSpentSeconds,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        sessionId: session.id,
        testTitle: session.test.title,
        paperCode,
        scorecard,
        detailedResults,
      },
    });
  } catch (error: any) {
    console.error("Error in POST /api/v1/tests/session/submit:", error);
    return NextResponse.json(
      {
        success: false,
        error: { code: "SUBMISSION_GRADING_FAILED", message: error.message },
      },
      { status: 500 }
    );
  }
}
