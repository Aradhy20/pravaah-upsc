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

    return NextResponse.json({
      success: true,
      exam,
    });
  } catch (error: any) {
    console.error("Error fetching exam details:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch exam details" },
      { status: 500 }
    );
  }
}
