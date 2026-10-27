import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "Admin privileges required" } },
        { status: 403 }
      );
    }

    const papers = await prisma.paper.findMany({
      include: {
        questions: true,
      },
    });

    const questionsByStatus = await prisma.question.groupBy({
      by: ["status"],
      _count: { id: true },
    });

    const statusCounts = {
      DRAFT: 0,
      NEEDS_REVIEW: 0,
      VERIFIED: 0,
      PUBLISHED: 0,
      ARCHIVED: 0,
    };

    questionsByStatus.forEach((item) => {
      if (item.status in statusCounts) {
        (statusCounts as any)[item.status] = item._count.id;
      }
    });

    const yearCoverage = await prisma.question.groupBy({
      by: ["year", "paperId"],
      _count: { id: true },
    });

    const subjects = await prisma.subject.findMany({
      include: {
        topics: {
          include: {
            questions: true,
          },
        },
      },
    });

    const subjectCoverage = subjects.map((s) => {
      let qCount = 0;
      s.topics.forEach((t) => {
        qCount += t.questions.length;
      });
      return {
        subject: s.name,
        slug: s.slug,
        topicsCount: s.topics.length,
        questionCount: qCount,
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        statusCounts,
        totalQuestions: Object.values(statusCounts).reduce((a, b) => a + b, 0),
        papers: papers.map((p) => ({
          code: p.code,
          name: p.name,
          questionCount: p.questions.length,
          targetQuestions: p.totalQuestions,
        })),
        subjectCoverage,
      },
    });
  } catch (error: any) {
    console.error("Error in GET /api/v1/admin/coverage:", error);
    return NextResponse.json(
      { success: false, error: { code: "COVERAGE_FETCH_FAILED", message: error.message } },
      { status: 500 }
    );
  }
}
