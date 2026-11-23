import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkAdminAccess } from "@/lib/auth";

export const dynamic = "force-dynamic";

/**
 * POST /api/v1/admin/pyqs/batch
 * Batch operations on questions: PUBLISH, VERIFY, ARCHIVE, DELETE, ASSIGN_TAXONOMY
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await checkAdminAccess(request);
    if (!auth.authorized) {
      return auth.response;
    }
    const user = auth.user;

    const body = await request.json();
    const { action, questionIds, subjectId, topicId, targetStatus } = body;

    if (!action || !Array.isArray(questionIds) || questionIds.length === 0) {
      return NextResponse.json(
        { success: false, error: { code: "INVALID_REQUEST", message: "action and questionIds[] are required" } },
        { status: 400 }
      );
    }

    let affectedCount = 0;

    switch (action) {
      case "PUBLISH": {
        // Validate each question has at least 4 options and a correct answer before publishing
        const validQuestions = await prisma.question.findMany({
          where: {
            id: { in: questionIds },
            options: { some: { isCorrect: true } },
          },
          select: { id: true, options: { select: { id: true } } },
        });

        const eligibleIds = validQuestions
          .filter((q) => q.options.length >= 4)
          .map((q) => q.id);

        if (eligibleIds.length === 0) {
          return NextResponse.json(
            {
              success: false,
              error: {
                code: "NO_ELIGIBLE_QUESTIONS",
                message: "None of the selected questions meet publishing criteria (min 4 options + verified answer).",
              },
            },
            { status: 400 }
          );
        }

        const res = await prisma.question.updateMany({
          where: { id: { in: eligibleIds } },
          data: {
            status: "PUBLISHED",
            verifiedAt: new Date(),
          },
        });
        affectedCount = res.count;
        break;
      }

      case "VERIFY": {
        const res = await prisma.question.updateMany({
          where: { id: { in: questionIds } },
          data: {
            status: "VERIFIED",
            verifiedAt: new Date(),
          },
        });
        await prisma.questionAnswer.updateMany({
          where: { questionId: { in: questionIds } },
          data: {
            verificationStatus: "OFFICIALLY_VERIFIED",
          },
        });
        affectedCount = res.count;
        break;
      }

      case "CHANGE_STATUS": {
        if (!targetStatus) {
          return NextResponse.json(
            { success: false, error: { code: "MISSING_TARGET_STATUS", message: "targetStatus required" } },
            { status: 400 }
          );
        }
        const res = await prisma.question.updateMany({
          where: { id: { in: questionIds } },
          data: { status: targetStatus },
        });
        affectedCount = res.count;
        break;
      }

      case "ASSIGN_TAXONOMY": {
        const updateData: any = {};
        if (subjectId) updateData.subjectId = subjectId;
        if (topicId) updateData.topicId = topicId;

        const res = await prisma.question.updateMany({
          where: { id: { in: questionIds } },
          data: updateData,
        });
        affectedCount = res.count;
        break;
      }

      case "DELETE": {
        const res = await prisma.question.deleteMany({
          where: { id: { in: questionIds } },
        });
        affectedCount = res.count;
        break;
      }

      default:
        return NextResponse.json(
          { success: false, error: { code: "UNKNOWN_ACTION", message: `Action '${action}' is not supported.` } },
          { status: 400 }
        );
    }

    // Audit logging
    await prisma.auditLog.create({
      data: {
        adminId: user.id,
        action: `BATCH_${action}`,
        entityType: "QUESTION",
        entityId: questionIds[0],
        detailsJson: JSON.stringify({
          action,
          totalRequested: questionIds.length,
          affectedCount,
          questionIds,
        }),
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        action,
        totalRequested: questionIds.length,
        affectedCount,
      },
    });
  } catch (error: any) {
    console.error("Error in POST /api/v1/admin/pyqs/batch:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: error.message } },
      { status: 500 }
    );
  }
}

/**
 * GET /api/v1/admin/pyqs/batch?format=json|csv&year=2024&paper=GS1...
 * Export questions for offline backup, inspection, or review
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await checkAdminAccess(request);
    if (!auth.authorized) {
      return auth.response;
    }
    const user = auth.user;

    const { searchParams } = new URL(request.url);
    const format = searchParams.get("format") || "json";
    const year = searchParams.get("year");
    const paper = searchParams.get("paper");
    const status = searchParams.get("status");

    const where: any = {};
    if (year) where.year = parseInt(year);
    if (paper) where.paper = { code: paper };
    if (status) where.status = status;

    const questions = await prisma.question.findMany({
      where,
      orderBy: [{ year: "desc" }, { questionNumber: "asc" }],
      include: {
        paper: true,
        topics: { include: { topic: { include: { subject: true } } } },
        options: { orderBy: { optionCode: "asc" } },
        answers: true,
        explanation: true,
      },
    });

    if (format === "csv") {
      const headers = [
        "ID",
        "Year",
        "Paper",
        "QNo",
        "Subject",
        "Difficulty",
        "QuestionTextEn",
        "QuestionTextHi",
        "OptionA",
        "OptionB",
        "OptionC",
        "OptionD",
        "OfficialKey",
        "EliminationTechnique",
        "ExplanationEn",
      ];

      const csvRows = [headers.join(",")];

      for (const q of questions) {
        const optMap: Record<string, string> = {};
        q.options.forEach((o) => {
          optMap[o.optionCode] = (o.optionTextEn || o.optionText).replace(/"/g, '""');
        });

        const correctAns = q.answers[0]?.answerOption || q.options.find((o) => o.isCorrect)?.optionCode || "N/A";
        const subjectName = q.topics?.[0]?.topic?.subject?.name || "";

        const row = [
          `"${q.id}"`,
          q.year,
          `"${q.paper.code}"`,
          q.questionNumber,
          `"${subjectName.replace(/"/g, '""')}"`,
          `"${q.difficulty || ""}"`,
          `"${(q.questionTextEn || q.questionText).replace(/"/g, '""').replace(/\n/g, " ")}"`,
          `"${(q.questionTextHi || "").replace(/"/g, '""').replace(/\n/g, " ")}"`,
          `"${optMap["A"] || ""}"`,
          `"${optMap["B"] || ""}"`,
          `"${optMap["C"] || ""}"`,
          `"${optMap["D"] || ""}"`,
          `"${correctAns}"`,
          `"${(q.explanation?.eliminationTechnique || "").replace(/"/g, '""').replace(/\n/g, " ")}"`,
          `"${(q.explanation?.explanationEn || q.explanation?.detailedExplanation || "").replace(/"/g, '""').replace(/\n/g, " ")}"`,
        ];
        csvRows.push(row.join(","));
      }

      return new NextResponse(csvRows.join("\n"), {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="pravaah_pyq_export_${Date.now()}.csv"`,
        },
      });
    }

    return NextResponse.json({
      success: true,
      meta: {
        total: questions.length,
        exportedAt: new Date().toISOString(),
      },
      data: questions,
    });
  } catch (error: any) {
    console.error("Error in GET /api/v1/admin/pyqs/batch:", error);
    return NextResponse.json(
      { success: false, error: { code: "EXPORT_FAILED", message: error.message } },
      { status: 500 }
    );
  }
}
