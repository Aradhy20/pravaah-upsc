import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateScorecard, QuestionGradingInput } from "@/lib/scoring";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

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

    // Fetch questions to grade: all test questions if configured, else all questions for the session paper & year
    let dbQuestions: any[] = [];
    if (session.test?.questions && session.test.questions.length > 0) {
      dbQuestions = session.test.questions.map((tq) => tq.question);
    } else {
      dbQuestions = await prisma.question.findMany({
        where: {
          paperId: session.test?.paperId || undefined,
          year: session.test?.year || 2024,
          status: "PUBLISHED",
        },
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
        orderBy: { questionNumber: "asc" },
      });

      if (dbQuestions.length === 0) {
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
    }

    const gradingInputs: QuestionGradingInput[] = [];
    const detailedResults: any[] = [];
    const userResponsesData: any[] = [];
    const incorrectQuestionIds: string[] = [];

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

      userResponsesData.push({
        sessionId: session.id,
        userId: session.userId,
        questionId: q.id,
        selectedCode: selectedOption,
        isCorrect,
        timeSpentSeconds: resp?.timeSpent || 0,
      });

      if (selectedOption !== null && !isCorrect) {
        incorrectQuestionIds.push(q.id);
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

    // Calculate score with strict examination marking
    const paperCode = session.test.paper.code;
    const customScheme = session.test.paper.positiveMark
      ? {
          positiveMark: session.test.paper.positiveMark,
          negativeMark: session.test.paper.negativeMark,
        }
      : undefined;
    const scorecard = calculateScorecard(paperCode, gradingInputs, customScheme);

    // Atomic High-Performance Transaction Batching (eliminates 100+ sequential roundtrips)
    await prisma.$transaction(async (tx) => {
      // 1. Batch insert all user responses
      if (userResponsesData.length > 0) {
        await tx.userResponse.createMany({
          data: userResponsesData,
        });
      }

      // 2. Batch upsert incorrect questions into ReviewSchedule (Mistake Bank)
      if (incorrectQuestionIds.length > 0) {
        const existingSchedules = await tx.reviewSchedule.findMany({
          where: {
            userId: session.userId,
            questionId: { in: incorrectQuestionIds },
          },
          select: { questionId: true },
        });

        const existingSet = new Set(existingSchedules.map((s) => s.questionId));
        const toUpdateIds = incorrectQuestionIds.filter((id) => existingSet.has(id));
        const toCreateIds = incorrectQuestionIds.filter((id) => !existingSet.has(id));

        if (toUpdateIds.length > 0) {
          await tx.reviewSchedule.updateMany({
            where: {
              userId: session.userId,
              questionId: { in: toUpdateIds },
            },
            data: {
              repetitionCount: { increment: 1 },
              isResolved: false,
              nextReviewDate: new Date(Date.now() + 86400000),
            },
          });
        }

        if (toCreateIds.length > 0) {
          await tx.reviewSchedule.createMany({
            data: toCreateIds.map((qId) => ({
              userId: session.userId,
              questionId: qId,
              repetitionCount: 1,
              intervalDays: 1,
              nextReviewDate: new Date(Date.now() + 86400000),
              isResolved: false,
            })),
          });
        }
      }

      // 3. Mark TestSession completed with authoritative score
      await tx.testSession.update({
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

      // 4. Record Study Activity
      await tx.studyActivity.create({
        data: {
          userId: session.userId,
          activityType: "test_completed",
          label: `Completed ${session.test.title} (Score: ${scorecard.netScore})`,
          refId: session.id,
          durationSeconds: totalTimeSpentSeconds,
        },
      });
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
