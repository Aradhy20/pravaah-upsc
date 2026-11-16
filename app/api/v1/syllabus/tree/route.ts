import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const subjects = await prisma.subject.findMany({
      include: {
        topics: {
          include: {
            subtopics: true,
            _count: { select: { questions: true } },
          },
        },
      },
      orderBy: { name: "asc" },
    });

    const syllabusNodes = await prisma.syllabusNode.findMany({
      orderBy: { code: "asc" },
    });

    // Group subjects into stages
    const prelimsSubjects = subjects.map((sub) => ({
      id: sub.id,
      name: sub.name,
      slug: sub.slug,
      topicsCount: sub.topics.length,
      questionsCount: sub.topics.reduce((acc, t) => acc + t._count.questions, 0),
      topics: sub.topics.map((t) => ({
        id: t.id,
        name: t.name,
        slug: t.slug,
        questionsCount: t._count.questions,
        subtopics: t.subtopics.map((st) => ({
          id: st.id,
          name: st.name,
          slug: st.slug,
        })),
      })),
    }));

    return NextResponse.json({
      success: true,
      data: {
        totalSubjects: subjects.length,
        totalMicroNodes: syllabusNodes.length,
        subjects: prelimsSubjects,
        syllabusNodes,
      },
    });
  } catch (error: any) {
    console.error("Error in GET /api/v1/syllabus/tree:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: error.message || "Failed to retrieve syllabus tree",
        },
      },
      { status: 500 }
    );
  }
}
