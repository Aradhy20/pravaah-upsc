import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { checkEntitlement } from "@/lib/entitlements";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);

    // Server-side Entitlement Check: Timed Exam Mode requires Achiever plan or higher
    const entitlement = await checkEntitlement(user.id, "TIMED_EXAMS");
    if (!entitlement.hasAccess) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "FORBIDDEN_SUBSCRIPTION_REQUIRED",
            message: entitlement.reason,
            upgradeUrl: "/pricing",
            requiredTier: entitlement.requiredTier,
          },
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { testId, paperCode = "GS1", year = 2024 } = body;

    let test = null;
    if (testId) {
      test = await prisma.test.findUnique({
        where: { id: testId },
        include: {
          paper: true,
          questions: {
            include: {
              question: {
                include: {
                  options: {
                    select: {
                      id: true,
                      optionCode: true,
                      optionText: true,
                      // DO NOT SELECT isCorrect! (Anti-leak)
                    },
                    orderBy: { optionCode: "asc" },
                  },
                },
              },
            },
            orderBy: { orderIndex: "asc" },
          },
        },
      });
    }

    // If no explicit test or not found, generate dynamically for the paper & year
    let questionsList: any[] = [];
    let targetPaper: any = null;

    if (test && test.questions.length > 0) {
      targetPaper = test.paper;
      questionsList = test.questions.map((tq) => tq.question);
    } else {
      targetPaper = await prisma.paper.findFirst({
        where: { code: paperCode },
      });

      if (!targetPaper) {
        return NextResponse.json(
          {
            success: false,
            error: { code: "PAPER_NOT_FOUND", message: "Paper not found" },
          },
          { status: 404 }
        );
      }

      // Fetch verified published questions
      questionsList = await prisma.question.findMany({
        where: {
          paperId: targetPaper.id,
          year: parseInt(year.toString()),
          status: "PUBLISHED",
        },
        orderBy: { questionNumber: "asc" },
        include: {
          options: {
            select: {
              id: true,
              optionCode: true,
              optionText: true,
              // Strictly stripped: isCorrect
            },
            orderBy: { optionCode: "asc" },
          },
        },
      });

      // Ensure test container exists in DB
      test = await prisma.test.findFirst({
        where: { paperId: targetPaper.id, year: parseInt(year.toString()) },
      });

      if (!test) {
        test = await prisma.test.create({
          data: {
            paperId: targetPaper.id,
            title: `UPSC CSE Prelims ${year} — ${targetPaper.name}`,
            year: parseInt(year.toString()),
            isFullPaper: true,
          },
        });
      }
    }

    // Create active session in DB
    const session = await prisma.testSession.create({
      data: {
        userId: user.id,
        testId: test.id,
        status: "IN_PROGRESS",
        totalQuestions: questionsList.length,
      },
    });

    // Sanitized Anti-Leak Payload
    const sanitizedQuestions = questionsList.map((q) => ({
      id: q.id,
      questionNumber: q.questionNumber,
      questionText: q.questionText,
      options: q.options.map((opt: any) => ({
        id: opt.id,
        code: opt.optionCode,
        text: opt.optionText,
      })),
    }));

    return NextResponse.json({
      success: true,
      data: {
        sessionId: session.id,
        testTitle: test.title,
        paperCode: targetPaper.code,
        paperName: targetPaper.name,
        durationMinutes: targetPaper.durationMinutes,
        positiveMark: targetPaper.positiveMark,
        negativeMark: targetPaper.negativeMark,
        totalQuestions: sanitizedQuestions.length,
        questions: sanitizedQuestions,
      },
    });
  } catch (error: any) {
    console.error("Error in POST /api/v1/tests/session/start:", error);
    return NextResponse.json(
      {
        success: false,
        error: { code: "SESSION_CREATION_FAILED", message: error.message },
      },
      { status: 500 }
    );
  }
}
