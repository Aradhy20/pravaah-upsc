import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const paper = searchParams.get('paper'); // e.g. "GS1", "CSAT", "MAINS-GS1"
    const subject = searchParams.get('subject');

    const where: any = {};
    if (paper) {
      where.paperCode = paper;
    }
    if (subject) {
      where.subjectName = { contains: subject, mode: 'insensitive' };
    }

    const nodes = await prisma.syllabusNode.findMany({
      where,
      orderBy: { code: 'asc' },
    });

    // Group by paper and subject for structured presentation
    const groupedByPaper: Record<string, { subjectName: string; nodes: any[] }[]> = {};

    for (const node of nodes) {
      if (!groupedByPaper[node.paperCode]) {
        groupedByPaper[node.paperCode] = [];
      }
      let subjectGroup = groupedByPaper[node.paperCode].find(
        (g) => g.subjectName === node.subjectName
      );
      if (!subjectGroup) {
        subjectGroup = { subjectName: node.subjectName, nodes: [] };
        groupedByPaper[node.paperCode].push(subjectGroup);
      }
      subjectGroup.nodes.push(node);
    }

    return NextResponse.json({
      success: true,
      data: {
        totalNodes: nodes.length,
        nodes,
        groupedByPaper,
      },
    });
  } catch (error: any) {
    console.error('Error in /api/v1/syllabus:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to retrieve syllabus nodes.',
          details: error.message,
        },
      },
      { status: 500 }
    );
  }
}
