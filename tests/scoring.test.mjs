import test from "node:test";
import assert from "node:assert/strict";
import { calculateScorecard, UPSC_MARKING_SCHEMES } from "../lib/scoring.js";

test("UPSC GS Paper 1 Scoring Formula (+2.0 for correct, -0.666 for incorrect)", () => {
  const mockItems = [
    { questionId: "q1", selectedOption: "A", correctOption: "A", subjectName: "Polity" },
    { questionId: "q2", selectedOption: "B", correctOption: "B", subjectName: "Polity" },
    { questionId: "q3", selectedOption: "C", correctOption: "A", subjectName: "Economy" }, // incorrect
    { questionId: "q4", selectedOption: null, correctOption: "D", subjectName: "Economy" }, // unattempted
  ];

  const scorecard = calculateScorecard("GS1", mockItems);

  assert.equal(scorecard.totalQuestions, 4);
  assert.equal(scorecard.attemptedCount, 3);
  assert.equal(scorecard.correctCount, 2);
  assert.equal(scorecard.incorrectCount, 1);
  assert.equal(scorecard.unattemptedCount, 1);

  // 2 * 2.0 = 4.0 raw
  assert.equal(scorecard.rawScore, 4.0);
  // 1 * (2/3) ≈ 0.667 negative deduction
  assert.ok(Math.abs(scorecard.negativeMarks - 0.667) < 0.01);
  // Net score = 4.0 - 0.667 = 3.33
  assert.ok(Math.abs(scorecard.netScore - 3.33) < 0.01);

  // Accuracy: 2 / 3 = 66.7%
  assert.equal(scorecard.accuracyPercentage, 66.7);

  // Subject breakdown
  assert.equal(scorecard.subjectBreakdown["Polity"].correct, 2);
  assert.equal(scorecard.subjectBreakdown["Polity"].accuracy, 100);
  assert.equal(scorecard.subjectBreakdown["Economy"].incorrect, 1);
  assert.equal(scorecard.subjectBreakdown["Economy"].accuracy, 0);
});

test("UPSC CSAT Paper 2 Scoring Formula (+2.5 for correct, -0.833 for incorrect)", () => {
  const mockItems = [
    { questionId: "q1", selectedOption: "A", correctOption: "A", subjectName: "CSAT Quant" },
    { questionId: "q2", selectedOption: "B", correctOption: "C", subjectName: "CSAT Quant" }, // incorrect
    { questionId: "q3", selectedOption: null, correctOption: "D", subjectName: "CSAT Reasoning" }, // unattempted
  ];

  const scorecard = calculateScorecard("GS2", mockItems);

  assert.equal(scorecard.totalQuestions, 3);
  assert.equal(scorecard.attemptedCount, 2);
  assert.equal(scorecard.correctCount, 1);
  assert.equal(scorecard.incorrectCount, 1);

  // 1 * 2.5 = 2.5 raw
  assert.equal(scorecard.rawScore, 2.5);
  // 1 * (2.5/3) ≈ 0.833 negative
  assert.ok(Math.abs(scorecard.negativeMarks - 0.833) < 0.01);
  // Net score = 2.5 - 0.833 = 1.67
  assert.ok(Math.abs(scorecard.netScore - 1.67) < 0.01);
  // Accuracy: 1 / 2 = 50.0%
  assert.equal(scorecard.accuracyPercentage, 50.0);
});

test("Zero attempts and negative score handling", () => {
  const allIncorrect = [
    { questionId: "q1", selectedOption: "B", correctOption: "A" },
    { questionId: "q2", selectedOption: "C", correctOption: "A" },
  ];

  const scorecard = calculateScorecard("GS1", allIncorrect);
  assert.equal(scorecard.correctCount, 0);
  assert.equal(scorecard.incorrectCount, 2);
  assert.ok(scorecard.netScore < 0);
  assert.equal(scorecard.accuracyPercentage, 0);
});
