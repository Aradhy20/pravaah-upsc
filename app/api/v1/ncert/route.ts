import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getFallbackNCERTBooks } from "@/lib/data-fallback";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const classNumber = searchParams.get("class") ? parseInt(searchParams.get("class")!) : undefined;
    const subject = searchParams.get("subject") || undefined;

    let books: any[] = [];
    try {
      books = await prisma.nCERTBook.findMany({
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
    } catch (dbErr) {
      books = [];
    }

    if (books.length === 0) {
      books = getFallbackNCERTBooks(classNumber, subject);
    }

    const totalChapters = books.reduce((acc, b) => acc + (b.chapters?.length || 0), 0);
    const totalLinkedQuestions = books.reduce(
      (acc, b) => acc + (b.chapters || []).reduce((cAcc: number, c: any) => cAcc + (c._count?.questionLinks || 0), 0),
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
    console.warn("Graceful fallback in GET /api/v1/ncert:", error.message);
    const fallbackBooks = getFallbackNCERTBooks();
    return NextResponse.json({
      success: true,
      meta: {
        totalBooks: fallbackBooks.length,
        totalChapters: fallbackBooks.reduce((acc, b) => acc + b.chapters.length, 0),
        totalLinkedQuestions: 0,
        copyrightDisclaimer: "NCERT official curriculum reference.",
      },
      data: fallbackBooks,
    });
  }
}
