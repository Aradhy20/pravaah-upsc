import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { not } from "@prisma/orm-postgres/orm-client";
import { getCurrentUser } from "@/lib/auth";
import { checkEntitlement } from "@/lib/entitlements";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    const body = await request.json().catch(() => ({}));
    let { testId, paperCode, year } = body;

    // Parse testId if provided (e.g., "test-cse-2024-gs1", "test-cse-2023-gs2")
    if (testId) {
      if (!year) {
        const yearMatch = testId.match(/(19\d\d|20\d\d)/);
        if (yearMatch) year = parseInt(yearMatch[1], 10);
      }
      if (!paperCode) {
        if (/gs2|csat/i.test(testId)) paperCode = "GS2";
        else if (/gs1/i.test(testId)) paperCode = "GS1";
      }
    }

    year = year ? parseInt(year.toString(), 10) : 2024;
    paperCode = paperCode ? paperCode.toUpperCase() : "GS1";

    // Free Diagnostic Test: UPSC CSE 2024 GS1 is open to all registered/guest aspirants to benchmark preparation
    const isFreeDiagnostic = (year === 2024 && paperCode === "GS1") || testId === "test-cse-2024-gs1";

    if (!isFreeDiagnostic && user.role !== "ADMIN") {
      // Server-side Entitlement Check: Full Timed Exam Mode requires Achiever plan or higher
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
    }

    let test: any = null;
    if (testId) {
      test = await prisma.orm.public.Test
        .include("paper")
        .include("questions", (tqs) =>
          tqs
            .orderBy((tq) => tq.orderIndex.asc())
            .include("question", (question) =>
              question.include("options", (o) =>
                o
                  .select("id", "optionCode", "optionText")
                  // DO NOT SELECT isCorrect! (Anti-leak)
                  .orderBy((opt) => opt.optionCode.asc()),
              ),
            ),
        )
        .first({ id: testId });
    }

    // Determine target paper
    let targetPaper: any = test?.paper;
    if (!targetPaper) {
      targetPaper = await prisma.orm.public.Paper.where((p) => p.code.ilike(paperCode)).first();
    }

    if (!targetPaper) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "PAPER_NOT_FOUND", message: `Paper '${paperCode}' not found` },
        },
        { status: 404 }
      );
    }

    let questionsList: any[] = [];

    if (test && test.questions && test.questions.length > 0) {
      questionsList = test.questions.map((tq: any) => tq.question);
    } else {
      // Fetch verified published questions for this paper and year
      questionsList = await prisma.orm.public.Question
        .where({ paperId: targetPaper.id, year, status: "PUBLISHED" })
        .include("options", (o) =>
          o
            .select("id", "optionCode", "optionText")
            // Strictly stripped: isCorrect
            .orderBy((opt) => opt.optionCode.asc()),
        )
        .orderBy((q) => q.questionNumber.asc())
        .all();

      // If specific year has few questions, complement with authentic published questions from the paper
      if (questionsList.length < 5) {
        const moreQuestions = await prisma.orm.public.Question
          .where({ paperId: targetPaper.id, status: "PUBLISHED" })
          .where((q) => not(q.id.in(questionsList.map((q: any) => q.id))))
          .include("options", (o) =>
            o.select("id", "optionCode", "optionText").orderBy((opt) => opt.optionCode.asc()),
          )
          .orderBy((q) => q.year.desc())
          .limit(35 - questionsList.length)
          .all();
        questionsList = [...questionsList, ...moreQuestions];
      }

      // Ensure test container exists in DB
      if (!test) {
        test = await prisma.orm.public.Test
          .where({ paperId: targetPaper.id, year })
          .first();

        if (!test) {
          test = await prisma.orm.public.Test.create({
            id: testId || undefined,
            paperId: targetPaper.id,
            title: `UPSC CSE Prelims ${year} — ${targetPaper.name}`,
            year,
            isFullPaper: true,
          });
        }
      }

      // Link questions into TestQuestion if not already linked
      if (test && questionsList.length > 0) {
        for (let i = 0; i < questionsList.length; i++) {
          try {
            await prisma.orm.public.TestQuestion.create({
              testId: test.id,
              questionId: questionsList[i].id,
              orderIndex: i + 1,
            });
          } catch {
            // Ignore if already linked
          }
        }
      }
    }

    // Create active session in DB
    const session = await prisma.orm.public.TestSession.create({
      userId: user.id,
      testId: test.id,
      status: "IN_PROGRESS",
      totalQuestions: questionsList.length,
    });

    // Sanitized Anti-Leak Payload
    const sanitizedQuestions = questionsList.map((q: any) => ({
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
