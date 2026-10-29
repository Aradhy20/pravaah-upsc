import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "Admin privileges required" } },
        { status: 403 }
      );
    }

    const body = await request.json();
    let { paperCode = "GS1", year = 2024, questions = [], csvData } = body;

    // Support CSV parsing if csvData string is provided
    if (csvData && typeof csvData === "string") {
      const lines = csvData.trim().split("\n");
      const parsedCsvQuestions: any[] = [];
      const startIndex = lines[0].toLowerCase().includes("questiontext") ? 1 : 0;

      for (let i = startIndex; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        // Simple comma split handling quotes
        const parts = line.split(",").map((p) => p.trim().replace(/^["']|["']$/g, ""));
        if (parts.length >= 7) {
          // Format: qNum, questionText, optA, optB, optC, optD, correctOpt, explanation, difficulty
          const [qNum, qText, optA, optB, optC, optD, correctOpt, expl = "", diff = "MEDIUM"] = parts;
          parsedCsvQuestions.push({
            questionNumber: parseInt(qNum) || i + 1,
            questionText: qText,
            difficulty: diff,
            options: [
              { code: "A", text: optA, isCorrect: correctOpt.toUpperCase() === "A" },
              { code: "B", text: optB, isCorrect: correctOpt.toUpperCase() === "B" },
              { code: "C", text: optC, isCorrect: correctOpt.toUpperCase() === "C" },
              { code: "D", text: optD, isCorrect: correctOpt.toUpperCase() === "D" },
            ],
            explanation: { summary: expl },
          });
        }
      }
      if (parsedCsvQuestions.length > 0) {
        questions = parsedCsvQuestions;
      }
    }

    if (!Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json(
        { success: false, error: { code: "EMPTY_BATCH", message: "No questions provided in batch (neither valid JSON nor CSV format)" } },
        { status: 400 }
      );
    }

    const paper = await prisma.paper.findUnique({
      where: { code: paperCode },
    });

    if (!paper) {
      return NextResponse.json(
        { success: false, error: { code: "INVALID_PAPER", message: `Paper ${paperCode} not found` } },
        { status: 400 }
      );
    }

    let importedCount = 0;
    let duplicateCount = 0;
    let rejectedCount = 0;
    const errors: string[] = [];

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      const qNum = q.questionNumber || i + 1;

      // Validate required fields
      if (!q.questionText || !Array.isArray(q.options) || q.options.length < 2) {
        rejectedCount++;
        errors.push(`Row ${i + 1}: Missing question text or insufficient options.`);
        continue;
      }

      // Check existing duplicate in this paper & year
      const existing = await prisma.question.findUnique({
        where: {
          paperId_year_questionNumber: {
            paperId: paper.id,
            year: parseInt(year.toString()),
            questionNumber: qNum,
          },
        },
      });

      if (existing) {
        duplicateCount++;
        continue;
      }

      // Create new question in status 'NEEDS_REVIEW'
      await prisma.question.create({
        data: {
          paperId: paper.id,
          year: parseInt(year.toString()),
          questionNumber: qNum,
          questionText: q.questionText,
          difficulty: q.difficulty || "MEDIUM",
          status: "NEEDS_REVIEW", // Enforces editorial review before publication
          options: {
            create: q.options.map((opt: any) => ({
              optionCode: (opt.code || "A").toUpperCase(),
              optionText: opt.text || "",
              isCorrect: opt.isCorrect || false,
            })),
          },
          explanation: q.explanation
            ? {
                create: {
                  summary: q.explanation.summary || q.explanation,
                  detailedExplanation: q.explanation.detailed || q.explanation.summary || q.explanation,
                  sourceCitation: q.explanation.source || "Official UPSC Past Paper Archive",
                },
              }
            : undefined,
        },
      });

      importedCount++;
    }

    // Create ContentImportJob record
    await prisma.contentImportJob.create({
      data: {
        adminId: user.id,
        fileName: `batch_import_${paperCode}_${year}.json`,
        paperYear: parseInt(year.toString()),
        paperCode,
        totalRecords: questions.length,
        importedCount,
        rejectedCount: rejectedCount + duplicateCount,
        status: "COMPLETED",
        errorReportJson: JSON.stringify({ errors, duplicates: duplicateCount }),
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        totalProcessed: questions.length,
        importedCount,
        duplicateCount,
        rejectedCount,
        errors,
      },
    });
  } catch (error: any) {
    console.error("Error in POST /api/v1/admin/import/batch:", error);
    return NextResponse.json(
      { success: false, error: { code: "BATCH_IMPORT_FAILED", message: error.message } },
      { status: 500 }
    );
  }
}
