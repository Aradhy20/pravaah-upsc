import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { and } from "@prisma/orm-postgres/orm-client";
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

    const session = await prisma.orm.public.TestSession
      .include("test", (test) =>
        test
          .include("paper")
          .include("questions", (tqs) =>
            tqs
              .orderBy((tq) => tq.orderIndex.asc())
              .include("question", (question) =>
                question
                  .include("options")
                  .include("explanation")
                  .include("topics", (ts) => ts.include("topic", (tp) => tp.include("subject"))),
              ),
          ),
      )
      .first({ id: sessionId });

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
      dbQuestions = await prisma.orm.public.Question
        .where({ paperId: session.test?.paperId || undefined, year: session.test?.year || 2024, status: "PUBLISHED" })
        .include("options")
        .include("explanation")
        .include("topics", (ts) => ts.include("topic", (tp) => tp.include("subject")))
        .orderBy((q) => q.questionNumber.asc())
        .all();

      if (dbQuestions.length === 0) {
        const questionIds = Array.from(responseMap.keys());
        dbQuestions = await prisma.orm.public.Question
          .where((q) => q.id.in(questionIds))
          .include("options")
          .include("explanation")
          .include("topics", (ts) => ts.include("topic", (tp) => tp.include("subject")))
          .all();
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

    // Calculate score with strict UPSC marking
    const paperCode = session.test.paper.code;
    const scorecard = calculateScorecard(paperCode, gradingInputs);

    // Atomic Transaction (eliminates 100+ sequential roundtrips)
    await prisma.transaction(async (tx) => {
      // 1. Batch insert all user responses
      if (userResponsesData.length > 0) {
        await tx.orm.public.UserResponse.createAll(userResponsesData);
      }

      // 2. Batch upsert incorrect questions into ReviewSchedule (Mistake Bank)
      if (incorrectQuestionIds.length > 0) {
        const existingSchedules = await tx.orm.public.ReviewSchedule
          .where((rs) => and(rs.userId.eq(session.userId), rs.questionId.in(incorrectQuestionIds)))
          .select("questionId", "repetitionCount")
          .all();

        const existingSet = new Map(existingSchedules.map((s) => [s.questionId, s]));
        const toUpdateIds = incorrectQuestionIds.filter((id) => existingSet.has(id));
        const toCreateIds = incorrectQuestionIds.filter((id) => !existingSet.has(id));

        if (toUpdateIds.length > 0) {
          for (const qId of toUpdateIds) {
            const existing: any = existingSet.get(qId)!;
            await tx.orm.public.ReviewSchedule.where({ userId: session.userId, questionId: qId }).updateAll({
              repetitionCount: existing.repetitionCount + 1,
              isResolved: false,
              nextReviewDate: new Date(Date.now() + 86400000),
            });
          }
        }

        if (toCreateIds.length > 0) {
          await tx.orm.public.ReviewSchedule.createAll(
            toCreateIds.map((qId) => ({
              userId: session.userId,
              questionId: qId,
              repetitionCount: 1,
              intervalDays: 1,
              nextReviewDate: new Date(Date.now() + 86400000),
              isResolved: false,
            })),
          );
        }
      }

      // 3. Mark TestSession completed with authoritative score
      await tx.orm.public.TestSession.where({ id: session.id }).update({
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
      });

      // 4. Record Study Activity
      await tx.orm.public.StudyActivity.create({
        userId: session.userId,
        activityType: "test_completed",
        label: `Completed ${session.test.title} (Score: ${scorecard.netScore})`,
        refId: session.id,
        durationSeconds: totalTimeSpentSeconds,
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
