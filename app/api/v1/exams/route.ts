import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");

    const where: any = { isActive: true };
    if (category && category !== "ALL") {
      where.category = category;
    }

    const exams = await prisma.examDirectory.findMany({
      where,
      orderBy: { orderIndex: "asc" },
    });

    return NextResponse.json({
      success: true,
      total: exams.length,
      exams,
    });
  } catch (error: any) {
    console.error("Error fetching exams:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch exam catalogue" },
      { status: 500 }
    );
  }
}
