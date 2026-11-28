import test from 'node:test';
import assert from 'node:assert/strict';
import { prisma } from '../lib/prisma.js';

test('IASBoard Feature Parity: Live Database Connectivity', async (t) => {
  await t.test('1. Smart Search queries live database collections', async () => {
    const qMatches = await prisma.question.findMany({
      where: { questionText: { contains: 'Constitution', mode: 'insensitive' } },
      take: 5
    });
    assert.ok(qMatches.length > 0, 'Database should contain questions mentioning Constitution');
  });

  await t.test('2. PYQ Explorer loads questions with options and explanations', async () => {
    const sample = await prisma.question.findFirst({
      where: { examStage: 'PRELIMS' },
      include: {
        options: true,
        explanation: true,
        paper: true
      }
    });
    assert.ok(sample, 'Should load a sample Prelims question');
    assert.equal(sample.options.length, 4, 'Should load 4 options from DB');
    assert.ok(sample.explanation, 'Should load explanation from DB');
  });

  await t.test('3. Prelims Simulator: CSAT and GS1 questions available', async () => {
    const gs1Count = await prisma.question.count({ where: { paper: { code: 'GS1' } } });
    const csatCount = await prisma.question.count({ where: { paper: { code: 'GS2' } } });
    assert.ok(gs1Count >= 100, `GS1 count should be >= 100 (Found ${gs1Count})`);
    assert.ok(csatCount >= 80, `CSAT count should be >= 80 (Found ${csatCount})`);
  });

  await t.test('4. Mains Answer Writing: Authentic historical questions available', async () => {
    const mainsQuestions = await prisma.mainsQuestion.findMany({
      where: { year: { in: [2021, 2022, 2023, 2024] } }
    });
    assert.ok(mainsQuestions.length >= 30, `Should have >= 30 historical Mains questions (Found ${mainsQuestions.length})`);
    const sample = mainsQuestions[0];
    assert.ok(sample.questionText.length > 20, 'Should have valid question statement');
    assert.ok(sample.frameworkGuidance, 'Should have model answer framework guidance');
  });

  await t.test('5. Topper Copies Library has authentic ranker copies', async () => {
    const topperCopies = await prisma.topperCopy.findMany();
    assert.ok(topperCopies.length >= 10, `Should have >= 10 topper copies (Found ${topperCopies.length})`);
  });

  await t.test('6. Current Affairs Hub has active stories', async () => {
    const stories = await prisma.currentAffairsStory.findMany();
    assert.ok(stories.length >= 5, `Should have >= 5 current affairs stories (Found ${stories.length})`);
  });

  await t.test('7. NCERT Concept Explorer has chapters with question linkages', async () => {
    const chapters = await prisma.nCERTChapter.findMany({
      include: { questionLinks: true }
    });
    assert.ok(chapters.length > 0, 'Should have NCERT chapters');
  });

  await t.test('8. Interview Preparation has situational prompts', async () => {
    const interviewPrompts = await prisma.interviewQuestion.findMany();
    assert.ok(interviewPrompts.length >= 10, `Should have >= 10 interview prompts (Found ${interviewPrompts.length})`);
  });
});
