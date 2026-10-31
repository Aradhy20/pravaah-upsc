import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    const code = params.code.toUpperCase();

    const exam = await prisma.examDirectory.findUnique({
      where: { code },
    });

    if (!exam) {
      return NextResponse.json(
        { success: false, error: "Exam not found in catalogue" },
        { status: 404 }
      );
    }

    // Parse stagesDescription into structured stages array
    const stages = exam.stagesDescription
      ? exam.stagesDescription
          .split(";")
          .map((s, idx) => {
            const trimmed = s.trim().replace(/^Three Stages:\s*/i, "").trim();
            const match = trimmed.match(/^(\d+)\.\s*([^(:]+)(?:[(:](.*)\)?)?/);
            if (match) {
              return {
                id: `${code.toLowerCase()}-stage-${match[1]}`,
                name: match[2].trim(),
                orderIndex: parseInt(match[1], 10),
                details: match[3] ? match[3].replace(/\)$/, "").trim() : trimmed,
              };
            }
            return {
              id: `${code.toLowerCase()}-stage-${idx + 1}`,
              name: trimmed,
              orderIndex: idx + 1,
              details: trimmed,
            };
          })
          .filter((st) => st.name.length > 0)
      : [];

    return NextResponse.json({
      success: true,
      exam: {
        ...exam,
        stages,
      },
    });
  } catch (error: any) {
    console.error("Error fetching exam details:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch exam details" },
      { status: 500 }
    );
  }
}
