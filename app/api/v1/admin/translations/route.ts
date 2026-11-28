import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkAdminAccess } from "@/lib/auth";

export const dynamic = "force-dynamic";

/**
 * GET /api/v1/admin/translations
 * Lists questions needing translation review (from Question or QuestionStagingRecord)
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await checkAdminAccess(request);
    if (!auth.authorized) return auth.response;

    const { searchParams } = new URL(request.url);
    const source = searchParams.get("source") || "staging"; // "staging" | "published"
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const skip = (page - 1) * limit;

    if (source === "published") {
      const [total, questions] = await Promise.all([
        prisma.question.count(),
        prisma.question.findMany({
          skip,
          take: limit,
          orderBy: [{ year: "desc" }, { questionNumber: "asc" }],
          include: {
            options: true,
            explanation: true,
          },
        }),
      ]);

      return NextResponse.json({
        success: true,
        source: "published",
        total,
        page,
        totalPages: Math.ceil(total / limit) || 1,
        data: questions,
      });
    }

    // Default to staging
    const [total, stagingRecords] = await Promise.all([
      prisma.questionStagingRecord.count(),
      prisma.questionStagingRecord.findMany({
        skip,
        take: limit,
        orderBy: [{ year: "desc" }, { questionNumber: "asc" }],
      }),
    ]);

    return NextResponse.json({
      success: true,
      source: "staging",
      total,
      page,
      totalPages: Math.ceil(total / limit) || 1,
      data: stagingRecords,
    });
  } catch (error: any) {
    console.error("Admin Translations GET error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch translation queue" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v1/admin/translations
 * Updates Hindi translation for a question or staged record and marks HUMAN_VERIFIED
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await checkAdminAccess(request);
    if (!auth.authorized) return auth.response;

    const body = await request.json();
    const {
      source = "staging",
      id,
      questionTextHi,
      optionsHi, // Array of { code: string, textHi: string }
      explanationHi,
    } = body;

    if (!id || !questionTextHi) {
      return NextResponse.json(
        { success: false, error: "ID and questionTextHi are required" },
        { status: 400 }
      );
    }

    if (source === "published") {
      await prisma.$transaction(async (tx) => {
        // Update Question
        await tx.question.update({
          where: { id },
          data: {
            questionTextHi,
            translationStatus: "HUMAN_VERIFIED",
          },
        });

        // Update Options if provided
        if (optionsHi && Array.isArray(optionsHi)) {
          for (const opt of optionsHi) {
            await tx.questionOption.updateMany({
              where: { questionId: id, optionCode: opt.code },
              data: {
                optionTextHi: opt.textHi,
                translationStatus: "HUMAN_VERIFIED",
              },
            });
          }
        }

        // Update Explanation if provided
        if (explanationHi) {
          await tx.explanation.updateMany({
            where: { questionId: id },
            data: {
              explanationHi,
              translationStatus: "HUMAN_VERIFIED",
            },
          });
        }
      });

      return NextResponse.json({
        success: true,
        message: "Published question translation verified and saved successfully.",
      });
    }

    // Update Staging Record
    const staged = await prisma.questionStagingRecord.findUnique({
      where: { id },
    });
    if (!staged) {
      return NextResponse.json(
        { success: false, error: "Staging record not found" },
        { status: 404 }
      );
    }

    let existingOptions: any[] = [];
    try {
      existingOptions = JSON.parse(staged.optionsJson);
    } catch {
      existingOptions = [];
    }

    if (optionsHi && Array.isArray(optionsHi)) {
      for (const opt of existingOptions) {
        const match = optionsHi.find((h: any) => h.code === opt.code);
        if (match) {
          opt.textHi = match.textHi;
        }
      }
    }

    await prisma.questionStagingRecord.update({
      where: { id },
      data: {
        questionTextHi,
        optionsJson: JSON.stringify(existingOptions),
        explanationHi: explanationHi || staged.explanationHi,
        translationStatus: "HUMAN_VERIFIED",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Staging question translation verified and saved successfully.",
    });
  } catch (error: any) {
    console.error("Admin Translations POST error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update translation" },
      { status: 500 }
    );
  }
}
