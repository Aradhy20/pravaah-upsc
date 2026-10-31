import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';

for (const envFile of ['.env.local', '.env.production', '.env']) {
  const p = path.resolve(process.cwd(), envFile);
  if (fs.existsSync(p)) {
    const lines = fs.readFileSync(p, 'utf-8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
        const [k, ...v] = trimmed.split('=');
        const key = k.trim();
        const val = v.join('=').trim().replace(/^["']|["']$/g, '');
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }
}

const prisma = new PrismaClient();

async function main() {
  console.log('Neon PostgreSQL Question Bank Detailed Reconciler\n');

  const totalQuestions = await prisma.question.count();
  const publishedQuestions = await prisma.question.count({ where: { status: 'PUBLISHED' } });
  const verifiedQuestions = await prisma.question.count({ where: { status: 'VERIFIED' } });
  const draftQuestions = await prisma.question.count({ where: { status: 'DRAFT' } });

  console.log('Question Statuses:', { totalQuestions, publishedQuestions, verifiedQuestions, draftQuestions });

  const totalOptions = await prisma.questionOption.count();
  const totalExplanations = await prisma.explanation.count();
  const totalAnswerKeys = await prisma.answerKeyVersion.count();

  console.log('Content Integrity:', { totalOptions, totalExplanations, totalAnswerKeys });

  // Breakdown by Year & Paper
  const paperYearBreakdown = await prisma.question.groupBy({
    by: ['year', 'paperId'],
    _count: { id: true },
    orderBy: [{ year: 'desc' }, { paperId: 'asc' }]
  });

  const papers = await prisma.paper.findMany();
  const paperMap = Object.fromEntries(papers.map(p => [p.id, p.code]));

  console.log('\nBreakdown by Year and Paper:');
  const formatted = paperYearBreakdown.map(b => ({
    year: b.year,
    paper: paperMap[b.paperId] || b.paperId,
    total: b._count.id
  }));
  console.table(formatted);

  // Subject breakdown via QuestionTopic -> Topic -> Subject
  const questionTopics = await prisma.questionTopic.findMany({
    include: {
      topic: {
        include: {
          subject: true
        }
      }
    }
  });

  const subjectCounts = {};
  for (const qt of questionTopics) {
    const subjName = qt.topic?.subject?.name || 'Unmapped';
    subjectCounts[subjName] = (subjectCounts[subjName] || 0) + 1;
  }
  console.log('\nSubject Distribution (mapped via QuestionTopic):');
  console.table(Object.entries(subjectCounts).map(([subject, count]) => ({ subject, count })));

  // Mains Breakdown
  const mains = await prisma.mainsQuestion.findMany({
    select: { id: true, paperCode: true, year: true, questionNumber: true, marks: true, wordLimit: true, questionText: true }
  });
  console.log(`\nMains Questions (${mains.length} total):`);
  console.table(mains.map(m => ({
    paper: m.paperCode,
    year: m.year,
    qNum: m.questionNumber,
    marks: m.marks,
    words: m.wordLimit,
    preview: m.questionText.slice(0, 50) + '...'
  })));

  // Quizzes & Current Affairs
  const quizCount = await prisma.dailyQuiz.count();
  const quizQCount = await prisma.dailyQuizQuestion.count();
  const caStories = await prisma.currentAffairsStory.count();
  const exams = await prisma.examDirectory.count();

  console.log('\nEditorial & Directory Assets:');
  console.log({ dailyQuizzes: quizCount, dailyQuizQuestions: quizQCount, currentAffairsStories: caStories, examProfiles: exams });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
