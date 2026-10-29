"use client";

import React, { useState, useEffect } from "react";
import {
  Clock,
  CheckCircle,
  AlertCircle,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Flag,
  RotateCcw,
  BookOpen,
} from "lucide-react";

interface ExamQuestion {
  id: string;
  questionNumber: number;
  questionText: string;
  options: {
    id: string;
    code: string;
    text: string;
  }[];
}

interface ExamPlayerProps {
  sessionId: string;
  testTitle: string;
  paperCode: string;
  durationMinutes: number;
  positiveMark: number;
  negativeMark: number;
  questions: ExamQuestion[];
}

export function ExamPlayer({
  sessionId,
  testTitle,
  paperCode,
  durationMinutes = 120,
  positiveMark = 2.0,
  negativeMark = 0.666,
  questions,
}: ExamPlayerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({}); // { questionId: "B" }
  const [markedForReview, setMarkedForReview] = useState<Record<string, boolean>>({});
  const [secondsRemaining, setSecondsRemaining] = useState(durationMinutes * 60);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [scorecardResult, setScorecardResult] = useState<any | null>(null);

  // Restore session from localStorage on mount
  useEffect(() => {
    if (typeof window === "undefined" || !sessionId) return;
    try {
      const saved = localStorage.getItem(`pravaah_mock_session_${sessionId}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.answers && typeof parsed.answers === "object") {
          setAnswers(parsed.answers);
        }
        if (parsed.markedForReview && typeof parsed.markedForReview === "object") {
          setMarkedForReview(parsed.markedForReview);
        }
        if (typeof parsed.secondsRemaining === "number" && parsed.secondsRemaining > 0) {
          const elapsed = parsed.savedAt ? Math.floor((Date.now() - parsed.savedAt) / 1000) : 0;
          const adjusted = Math.max(0, parsed.secondsRemaining - elapsed);
          setSecondsRemaining(adjusted);
        }
        if (typeof parsed.currentIndex === "number" && parsed.currentIndex < questions.length) {
          setCurrentIndex(parsed.currentIndex);
        }
      }
    } catch (e) {
      console.warn("Could not load local session backup:", e);
    }
  }, [sessionId, questions.length]);

  // Persist session to localStorage on changes
  useEffect(() => {
    if (typeof window === "undefined" || !sessionId || scorecardResult) return;
    try {
      localStorage.setItem(
        `pravaah_mock_session_${sessionId}`,
        JSON.stringify({
          answers,
          markedForReview,
          secondsRemaining,
          currentIndex,
          savedAt: Date.now(),
        })
      );
    } catch (e) {
      // localStorage error fallback
    }
  }, [sessionId, answers, markedForReview, secondsRemaining, currentIndex, scorecardResult]);

  // Timer countdown
  useEffect(() => {
    if (scorecardResult || secondsRemaining <= 0) return;
    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleSubmitTest(); // auto-submit on 00:00
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [secondsRemaining, scorecardResult]);

  const formatTimer = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s
      .toString()
      .padStart(2, "0")}`;
  };

  const currentQ = questions[currentIndex];
  const selectedOption = currentQ ? answers[currentQ.id] : null;
  const isMarked = currentQ ? markedForReview[currentQ.id] : false;

  const handleSelectOption = (code: string) => {
    if (!currentQ) return;
    setAnswers((prev) => ({ ...prev, [currentQ.id]: code }));
  };

  const handleClearOption = () => {
    if (!currentQ) return;
    setAnswers((prev) => {
      const copy = { ...prev };
      delete copy[currentQ.id];
      return copy;
    });
  };

  const handleToggleMarkReview = () => {
    if (!currentQ) return;
    setMarkedForReview((prev) => ({
      ...prev,
      [currentQ.id]: !prev[currentQ.id],
    }));
  };

  const handleSubmitTest = async () => {
    try {
      setIsSubmitting(true);
      setShowSubmitModal(false);

      const responsePayload = questions.map((q) => ({
        questionId: q.id,
        selectedOption: answers[q.id] || null,
        timeSpent: 45,
      }));

      const res = await fetch("/api/v1/tests/session/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          responses: responsePayload,
          totalTimeSpentSeconds: durationMinutes * 60 - secondsRemaining,
        }),
      });

      const json = await res.json();
      if (json.success) {
        if (typeof window !== "undefined") {
          try {
            localStorage.removeItem(`pravaah_mock_session_${sessionId}`);
          } catch (e) {}
        }
        setScorecardResult(json.data);
      } else {
        alert(json.error?.message || "Submission failed");
      }
    } catch (e) {
      console.error(e);
      alert("Submission error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const answeredCount = Object.keys(answers).length;
  const unattemptedCount = questions.length - answeredCount;
  const reviewCount = Object.values(markedForReview).filter(Boolean).length;

  if (scorecardResult) {
    const sc = scorecardResult.scorecard;
    return (
      <div className="mx-auto max-w-5xl py-8 px-4 sm:px-6">
        {/* Scorecard Hero Banner */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
          <div className="border-b border-slate-100 pb-5">
            <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-800">
              Exam Complete • Official UPSC Marking
            </span>
            <h1 className="mt-3 text-2xl sm:text-3xl font-extrabold text-slate-900">
              {scorecardResult.testTitle}
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Scoring Standard: +{positiveMark} for correct, -{negativeMark.toFixed(3)} for incorrect.
            </p>
          </div>

          {/* Core Metrics Grid */}
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-center">
              <span className="text-xs font-semibold text-slate-500 uppercase">Net Score</span>
              <p
                className={`text-3xl font-extrabold mt-1 ${
                  sc.netScore >= 88 ? "text-emerald-600" : "text-slate-900"
                }`}
              >
                {sc.netScore}
              </p>
              <span className="text-[11px] text-slate-400">out of 200</span>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-center">
              <span className="text-xs font-semibold text-slate-500 uppercase">Accuracy</span>
              <p className="text-3xl font-extrabold text-blue-600 mt-1">
                {sc.accuracyPercentage}%
              </p>
              <span className="text-[11px] text-slate-400">
                {sc.correctCount} of {sc.attemptedCount} attempted
              </span>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-center">
              <span className="text-xs font-semibold text-slate-500 uppercase">Correct</span>
              <p className="text-3xl font-extrabold text-emerald-600 mt-1">
                {sc.correctCount}
              </p>
              <span className="text-[11px] text-emerald-700">+{sc.rawScore} marks</span>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-center">
              <span className="text-xs font-semibold text-slate-500 uppercase">Incorrect</span>
              <p className="text-3xl font-extrabold text-rose-600 mt-1">
                {sc.incorrectCount}
              </p>
              <span className="text-[11px] text-rose-600">-{sc.negativeMarks} marks</span>
            </div>
          </div>

          {/* Subject Breakdown */}
          {Object.keys(sc.subjectBreakdown).length > 0 && (
            <div className="mt-8 border-t border-slate-100 pt-6">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">
                Subject-Wise Performance Breakdown
              </h3>
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Object.values(sc.subjectBreakdown).map((stat: any) => (
                  <div
                    key={stat.subject}
                    className="flex items-center justify-between rounded-lg border border-slate-200 p-3 bg-white"
                  >
                    <div>
                      <p className="font-semibold text-sm text-slate-800">{stat.subject}</p>
                      <p className="text-xs text-slate-500">
                        {stat.correct} correct, {stat.incorrect} incorrect ({stat.attempted} attempted)
                      </p>
                    </div>
                    <span
                      className={`text-sm font-bold ${
                        stat.accuracy >= 70
                          ? "text-emerald-600"
                          : stat.accuracy >= 50
                          ? "text-amber-600"
                          : "text-rose-600"
                      }`}
                    >
                      {stat.accuracy}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-8 flex justify-end gap-3">
            <a
              href="/revision"
              className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Go to Mistake Revision Queue
            </a>
            <a
              href="/dashboard"
              className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-blue-700"
            >
              View Analytics Dashboard
            </a>
          </div>
        </div>

        {/* Detailed Solutions Section */}
        <div className="mt-10">
          <h2 className="text-xl font-bold text-slate-900 mb-4">
            Question-by-Question Analysis & Solutions
          </h2>
          <div className="space-y-4">
            {scorecardResult.detailedResults.map((item: any, idx: number) => (
              <div
                key={item.id}
                className={`rounded-xl border p-5 bg-white ${
                  item.isCorrect
                    ? "border-emerald-200"
                    : item.isAttempted
                    ? "border-rose-200"
                    : "border-slate-200"
                }`}
              >
                <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-100">
                  <span className="font-bold text-slate-600">Question {idx + 1}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-slate-500">{item.subject}</span>
                    {item.isCorrect ? (
                      <span className="rounded bg-emerald-100 px-2 py-0.5 font-bold text-emerald-800">
                        Correct (+{positiveMark})
                      </span>
                    ) : item.isAttempted ? (
                      <span className="rounded bg-rose-100 px-2 py-0.5 font-bold text-rose-800">
                        Incorrect (-{negativeMark.toFixed(3)})
                      </span>
                    ) : (
                      <span className="rounded bg-slate-100 px-2 py-0.5 font-bold text-slate-600">
                        Unattempted (0)
                      </span>
                    )}
                  </div>
                </div>

                <p className="mt-3 whitespace-pre-line text-sm font-medium text-slate-800">
                  {item.questionText}
                </p>

                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {item.options.map((opt: any) => {
                    const isUserPick = item.selectedOption === opt.code;
                    const isKey = item.correctOption === opt.code;

                    let bg = "bg-slate-50 border-slate-200 text-slate-700";
                    if (isKey) bg = "bg-emerald-50 border-emerald-400 text-emerald-900 font-bold";
                    else if (isUserPick) bg = "bg-rose-50 border-rose-300 text-rose-900";

                    return (
                      <div key={opt.code} className={`rounded-lg border p-2.5 ${bg}`}>
                        <span className="font-bold mr-1.5">({opt.code})</span>
                        <span>{opt.text}</span>
                        {isUserPick && (
                          <span className="ml-1 text-[10px] uppercase font-bold text-blue-700">
                            [Your Answer]
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {item.explanation && (
                  <div className="mt-3 rounded-lg bg-blue-50/50 p-3 text-xs text-slate-700 border border-blue-100">
                    <p className="font-bold text-blue-900">Official Solution Note:</p>
                    <p className="mt-1 leading-relaxed">{item.explanation.summary}</p>
                    {item.explanation.sourceCitation && (
                      <p className="mt-1 text-[11px] text-slate-500 italic">
                        Ref: {item.explanation.sourceCitation}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Sticky Exam Bar */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white px-4 py-3 shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div>
            <h1 className="text-base font-bold text-slate-900 truncate max-w-md">
              {testTitle}
            </h1>
            <span className="text-xs font-semibold text-slate-500">
              Question {currentIndex + 1} of {questions.length}
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Live Countdown Timer */}
            <div
              className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 font-mono text-base font-bold shadow-sm ${
                secondsRemaining < 600
                  ? "border-rose-300 bg-rose-50 text-rose-700 animate-pulse"
                  : "border-slate-300 bg-slate-100 text-slate-900"
              }`}
            >
              <Clock className="h-4 w-4" />
              <span>{formatTimer(secondsRemaining)}</span>
            </div>

            <button
              onClick={() => setShowSubmitModal(true)}
              className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-700 transition"
            >
              Submit Paper
            </button>
          </div>
        </div>
      </header>

      {/* Main Examination Workspace */}
      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col lg:flex-row gap-6 p-4 sm:p-6">
        {/* Left Side: Question Pane */}
        <main className="flex-1 rounded-xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Question {currentIndex + 1}
              </span>
              <button
                onClick={handleToggleMarkReview}
                className={`flex items-center gap-1.5 rounded-lg border px-3 py-1 text-xs font-semibold transition ${
                  isMarked
                    ? "border-purple-300 bg-purple-50 text-purple-700"
                    : "border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Flag className={`h-3.5 w-3.5 ${isMarked ? "fill-purple-600" : ""}`} />
                <span>{isMarked ? "Marked for Review" : "Mark for Review"}</span>
              </button>
            </div>

            {/* Question Text */}
            <div className="mt-4">
              <p className="whitespace-pre-line text-base font-medium leading-relaxed text-slate-800">
                {currentQ?.questionText}
              </p>
            </div>

            {/* Options */}
            <div className="mt-6 space-y-3">
              {currentQ?.options.map((opt) => {
                const isSelected = selectedOption === opt.code;
                return (
                  <button
                    key={opt.code}
                    onClick={() => handleSelectOption(opt.code)}
                    className={`flex w-full items-start gap-3 rounded-xl border p-3.5 text-left transition touch-target ${
                      isSelected
                        ? "border-blue-600 bg-blue-50/80 text-blue-950 ring-1 ring-blue-600 font-medium"
                        : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <span
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                        isSelected
                          ? "bg-blue-600 text-white"
                          : "border border-slate-300 bg-slate-100 text-slate-600"
                      }`}
                    >
                      {opt.code}
                    </span>
                    <span className="text-sm leading-normal">{opt.text}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Navigation & Choice Clearing Footer */}
          <div className="mt-8 border-t border-slate-100 pt-4 flex flex-wrap items-center justify-between gap-3">
            <button
              onClick={handleClearOption}
              disabled={!selectedOption}
              className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800 disabled:opacity-40"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Clear Choice</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                disabled={currentIndex === 0}
                className="flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Previous</span>
              </button>
              <button
                onClick={() =>
                  setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))
                }
                disabled={currentIndex === questions.length - 1}
                className="flex items-center gap-1 rounded-lg bg-blue-600 px-5 py-2 text-xs font-bold text-white hover:bg-blue-700 disabled:opacity-40"
              >
                <span>Save & Next</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </main>

        {/* Right Side: Question Navigation Palette */}
        <aside className="w-full lg:w-80 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
            Question Navigation Palette
          </h2>

          <div className="grid grid-cols-5 gap-2 max-h-[380px] overflow-y-auto pr-1">
            {questions.map((q, idx) => {
              const isAnswered = Boolean(answers[q.id]);
              const isMarkedRev = Boolean(markedForReview[q.id]);
              const isCurrent = idx === currentIndex;

              let btnStyle = "border-slate-200 bg-slate-50 text-slate-600";
              if (isMarkedRev) {
                btnStyle = "border-purple-300 bg-purple-100 text-purple-800 font-bold";
              } else if (isAnswered) {
                btnStyle = "border-emerald-400 bg-emerald-500 text-white font-bold";
              }

              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-9 rounded-lg border text-xs font-semibold transition ${btnStyle} ${
                    isCurrent ? "ring-2 ring-blue-600 ring-offset-1" : ""
                  }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          {/* Palette Legend */}
          <div className="mt-5 border-t border-slate-100 pt-3 space-y-1.5 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-emerald-500" />
              <span>Answered ({answeredCount})</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-purple-200 border border-purple-400" />
              <span>Marked for Review ({reviewCount})</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-slate-100 border border-slate-300" />
              <span>Unattempted ({unattemptedCount})</span>
            </div>
          </div>
        </aside>
      </div>

      {/* Submission Confirmation Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold text-slate-900">Submit Examination Paper?</h3>
            <p className="mt-2 text-xs text-slate-500">
              Please review your question status before confirming your final submission:
            </p>

            <div className="my-4 rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-600">Total Questions:</span>
                <span className="font-bold text-slate-900">{questions.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-emerald-700 font-semibold">Answered Questions:</span>
                <span className="font-bold text-emerald-800">{answeredCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-purple-700 font-semibold">Marked for Review:</span>
                <span className="font-bold text-purple-800">{reviewCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Unanswered / Skipped:</span>
                <span className="font-bold text-slate-700">{unattemptedCount}</span>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowSubmitModal(false)}
                className="rounded-lg px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Return to Paper
              </button>
              <button
                onClick={handleSubmitTest}
                disabled={isSubmitting}
                className="rounded-lg bg-blue-600 px-5 py-2 text-xs font-bold text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {isSubmitting ? "Grading..." : "Confirm & Submit"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
