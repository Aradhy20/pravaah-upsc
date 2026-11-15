import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const classNumber = searchParams.get("class") ? parseInt(searchParams.get("class")!) : undefined;
    const subject = searchParams.get("subject") || undefined;

    const books = await prisma.nCERTBook.findMany({
      where: {
        ...(classNumber ? { classNumber } : {}),
        ...(subject ? { subject: { equals: subject, mode: "insensitive" } } : {}),
      },
      include: {
        chapters: {
          orderBy: { chapterNumber: "asc" },
          include: {
            _count: {
              select: { questionLinks: true },
            },
          },
        },
      },
      orderBy: [{ classNumber: "asc" }, { subject: "asc" }],
    });

    const totalChapters = books.reduce((acc, b) => acc + b.chapters.length, 0);
    const totalLinkedQuestions = books.reduce(
      (acc, b) => acc + b.chapters.reduce((cAcc, c) => cAcc + c._count.questionLinks, 0),
      0
    );

    return NextResponse.json({
      success: true,
      meta: {
        totalBooks: books.length,
        totalChapters,
        totalLinkedQuestions,
        copyrightDisclaimer:
          "NCERT textbooks, titles, and curriculum are property of NCERT, New Delhi. Pravaah UPSC provides educational navigation, syllabus mapping, independent summaries, and deep links to official portals (ncert.nic.in / epathshala.nic.in) in compliance with fair dealing and official copyright guidelines.",
      },
      data: books,
    });
  } catch (error: any) {
    console.error("Error fetching NCERT books:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load NCERT catalog" },
      { status: 500 }
    );
  }
}
