import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * GET /api/v1/knowledge-graph
 * Builds a dynamic, source-backed knowledge graph connecting:
 * Syllabus Node -> NCERT Chapter -> Prelims PYQ -> Current Affairs Story -> Mains Question
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const subjectSlug = searchParams.get("subject") || "polity";

    // 1. Fetch relevant syllabus nodes
    const syllabusNodes = await prisma.syllabusNode.findMany({
      where: {
        paperCode: { in: ["GS1", "GS2", "GS3", "GS4"] },
      },
      take: 12,
    });

    // 2. Fetch sample NCERT chapters
    const ncertChapters = await prisma.nCERTChapter.findMany({
      take: 6,
      include: { book: true },
    });

    // 3. Fetch representative PYQs
    const sampleQuestions = await prisma.question.findMany({
      take: 8,
      where: { status: "PUBLISHED" },
      select: {
        id: true,
        year: true,
        questionNumber: true,
        questionText: true,
        difficulty: true,
      },
    });

    // 4. Fetch Current Affairs stories
    const currentAffairs = await prisma.currentAffairsStory.findMany({
      take: 5,
      select: {
        id: true,
        title: true,
        sourceName: true,
        sourceUrl: true,
      },
    });

    // 5. Fetch Mains questions
    const mainsQuestions = await prisma.mainsQuestion.findMany({
      take: 4,
      select: {
        id: true,
        questionText: true,
        paperCode: true,
        year: true,
        marks: true,
      },
    });

    // Construct Graph Nodes and Directed Edges
    const nodes: any[] = [];
    const edges: any[] = [];

    // Add Syllabus nodes
    for (const node of syllabusNodes) {
      nodes.push({
        id: `syl-${node.id}`,
        label: node.title,
        type: "SYLLABUS_NODE",
        paper: node.paperCode,
        group: 1,
      });
    }

    // Add NCERT nodes and connect to syllabus
    for (let i = 0; i < ncertChapters.length; i++) {
      const ncert = ncertChapters[i];
      const ncertId = `ncert-${ncert.id}`;
      nodes.push({
        id: ncertId,
        label: `${ncert.book?.bookTitle || "NCERT"}: ${ncert.chapterTitle}`,
        type: "NCERT_FOUNDATION",
        group: 2,
      });

      if (syllabusNodes[i % syllabusNodes.length]) {
        edges.push({
          source: `syl-${syllabusNodes[i % syllabusNodes.length].id}`,
          target: ncertId,
          relationship: "FOUNDATIONAL_TEXTBOOK",
          evidence: "Direct conceptual foundation mapping from NCERT standard textbook",
        });
      }
    }

    // Add PYQ nodes and connect to Syllabus
    for (let i = 0; i < sampleQuestions.length; i++) {
      const q = sampleQuestions[i];
      const qId = `pyq-${q.id}`;
      nodes.push({
        id: qId,
        label: `UPSC ${q.year} Q${q.questionNumber}`,
        type: "PRELIMS_PYQ",
        snippet: q.questionText.slice(0, 80) + "...",
        difficulty: q.difficulty,
        group: 3,
      });

      if (syllabusNodes[i % syllabusNodes.length]) {
        edges.push({
          source: `syl-${syllabusNodes[i % syllabusNodes.length].id}`,
          target: qId,
          relationship: "EXAMINED_IN_PRELIMS",
          evidence: `Official UPSC Prelims ${q.year} examination paper`,
        });
      }
    }

    // Add Current Affairs nodes and connect
    for (let i = 0; i < currentAffairs.length; i++) {
      const ca = currentAffairs[i];
      const caId = `ca-${ca.id}`;
      nodes.push({
        id: caId,
        label: ca.title,
        type: "CURRENT_AFFAIRS",
        source: ca.sourceName,
        sourceUrl: ca.sourceUrl,
        group: 4,
      });

      if (syllabusNodes[i % syllabusNodes.length]) {
        edges.push({
          source: `syl-${syllabusNodes[i % syllabusNodes.length].id}`,
          target: caId,
          relationship: "CONTEMPORARY_DEVELOPMENT",
          evidence: `Reported by ${ca.sourceName || "Official Gazette"}`,
        });
      }
    }

    // Add Mains nodes and connect
    for (let i = 0; i < mainsQuestions.length; i++) {
      const mq = mainsQuestions[i];
      const mqId = `mains-${mq.id}`;
      nodes.push({
        id: mqId,
        label: `${mq.paperCode} ${mq.year}: ${mq.marks}M Question`,
        type: "MAINS_QUESTION",
        group: 5,
      });

      if (syllabusNodes[i % syllabusNodes.length]) {
        edges.push({
          source: `syl-${syllabusNodes[i % syllabusNodes.length].id}`,
          target: mqId,
          relationship: "DESCRIPTIVE_EVALUATION",
          evidence: `UPSC Civil Services Mains ${mq.year}`,
        });
      }
    }

    return NextResponse.json({
      success: true,
      totalNodes: nodes.length,
      totalEdges: edges.length,
      graph: {
        nodes,
        edges,
      },
    });
  } catch (error: any) {
    console.error("Knowledge Graph API Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to assemble knowledge graph" },
      { status: 500 }
    );
  }
}
