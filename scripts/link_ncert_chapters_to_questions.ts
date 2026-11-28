import { prisma } from "../lib/prisma";

async function main() {
  console.log("🔗 Linking NCERT chapters to relevant UPSC CSE questions...");

  const chapters = await prisma.nCERTChapter.findMany({
    include: { book: true },
  });

  console.log(`Loaded ${chapters.length} NCERT chapters.`);

  let createdLinks = 0;

  for (const chapter of chapters) {
    const rawKeywords = [
      ...chapter.chapterTitle.split(/\s+/),
      ...(chapter.keyTopics ? chapter.keyTopics.split(/[,;\n]+/) : []),
    ]
      .map((k) => k.trim().toLowerCase())
      .filter((k) => k.length > 3 && !["with", "from", "that", "this", "indian", "india"].includes(k));

    // Dedup keywords
    const keywords = Array.from(new Set(rawKeywords)).slice(0, 5);

    if (keywords.length === 0) continue;

    // Search for questions matching keywords
    const matchingQuestions = await prisma.question.findMany({
      where: {
        OR: keywords.map((kw) => ({
          questionText: { contains: kw, mode: "insensitive" },
        })),
      },
      take: 6,
      select: { id: true, questionText: true, year: true, questionNumber: true },
    });

    for (const q of matchingQuestions) {
      try {
        await prisma.nCERTChapterQuestionLink.upsert({
          where: {
            chapterId_questionId: {
              chapterId: chapter.id,
              questionId: q.id,
            },
          },
          update: {
            relevanceNote: `Foundational concepts for Q${q.questionNumber} (${q.year}) covered in ${chapter.book.bookTitle}, Chapter ${chapter.chapterNumber}: "${chapter.chapterTitle}".`,
          },
          create: {
            chapterId: chapter.id,
            questionId: q.id,
            relevanceNote: `Foundational concepts for Q${q.questionNumber} (${q.year}) covered in ${chapter.book.bookTitle}, Chapter ${chapter.chapterNumber}: "${chapter.chapterTitle}".`,
          },
        });
        createdLinks++;
      } catch (err: any) {
        // Skip duplicate or foreign key issue
      }
    }
  }

  const totalLinks = await prisma.nCERTChapterQuestionLink.count();
  console.log(`✅ NCERT chapter linking completed! Added ${createdLinks} linkings. Total database links: ${totalLinks}.`);
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
