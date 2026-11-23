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
        <div className="rounded-2xl border border-heritage-border bg-white p-6 sm:p-8 shadow-card">
          <div className="border-b border-heritage-border/60 pb-5">
            <span className="rounded-full bg-heritage-cream px-3 py-1 text-xs font-bold text-heritage-burgundy border border-heritage-border">
              Exam Complete • Official UPSC Marking
            </span>
            <h1 className="font-serif mt-3 text-2xl sm:text-3xl font-bold text-heritage-text">
              {scorecardResult.testTitle}
            </h1>
            <p className="mt-1 text-sm text-heritage-secondary">
              Scoring Standard: +{positiveMark} for correct, -{negativeMark.toFixed(3)} for incorrect.
            </p>
          </div>

          {/* Core Metrics Grid */}
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-xl border border-heritage-border bg-heritage-ivory p-4 text-center">
              <span className="text-xs font-semibold text-heritage-secondary uppercase tracking-wider">Net Score</span>
              <p
                className={`text-3xl font-serif font-bold mt-1 ${
                  sc.netScore >= 88 ? "text-emerald-700" : "text-heritage-burgundy"
                }`}
              >
                {sc.netScore}
              </p>
              <span className="text-[11px] text-heritage-secondary">out of 200</span>
            </div>

            <div className="rounded-xl border border-heritage-border bg-heritage-ivory p-4 text-center">
              <span className="text-xs font-semibold text-heritage-secondary uppercase tracking-wider">Accuracy</span>
              <p className="text-3xl font-serif font-bold text-heritage-burgundy mt-1">
                {sc.accuracyPercentage}%
              </p>
              <span className="text-[11px] text-heritage-secondary">
                {sc.correctCount} of {sc.attemptedCount} attempted
              </span>
            </div>

            <div className="rounded-xl border border-heritage-border bg-heritage-ivory p-4 text-center">
              <span className="text-xs font-semibold text-heritage-secondary uppercase tracking-wider">Correct</span>
              <p className="text-3xl font-serif font-bold text-emerald-700 mt-1">
                {sc.correctCount}
              </p>
              <span className="text-[11px] text-emerald-700 font-semibold">+{sc.rawScore} marks</span>
            </div>

            <div className="rounded-xl border border-heritage-border bg-heritage-ivory p-4 text-center">
              <span className="text-xs font-semibold text-heritage-secondary uppercase tracking-wider">Incorrect</span>
              <p className="text-3xl font-serif font-bold text-rose-700 mt-1">
                {sc.incorrectCount}
              </p>
              <span className="text-[11px] text-rose-700 font-semibold">-{sc.negativeMarks} marks</span>
            </div>
          </div>

          {/* Subject Breakdown */}
          {Object.keys(sc.subjectBreakdown).length > 0 && (
            <div className="mt-8 border-t border-heritage-border/60 pt-6">
              <h3 className="font-serif text-sm font-bold uppercase tracking-wider text-heritage-burgundy">
                Subject-Wise Performance Breakdown
              </h3>
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Object.values(sc.subjectBreakdown).map((stat: any) => (
                  <div
                    key={stat.subject}
                    className="flex items-center justify-between rounded-xl border border-heritage-border p-3.5 bg-white shadow-xs"
                  >
                    <div>
                      <p className="font-semibold text-sm text-heritage-text">{stat.subject}</p>
                      <p className="text-xs text-heritage-secondary">
                        {stat.correct} correct, {stat.incorrect} incorrect ({stat.attempted} attempted)
                      </p>
                    </div>
                    <span
                      className={`text-sm font-bold ${
                        stat.accuracy >= 70
                          ? "text-emerald-700"
                          : stat.accuracy >= 50
                          ? "text-amber-700"
                          : "text-rose-700"
                      }`}
                    >
                      {stat.accuracy}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-8 flex flex-wrap justify-end gap-3">
            <a
              href="/revision"
              className="rounded-xl border border-heritage-border bg-white px-4 py-2.5 text-sm font-semibold text-heritage-text hover:bg-heritage-ivory transition"
            >
              Go to Mistake Revision Queue
            </a>
            <a
              href="/dashboard"
              className="rounded-xl bg-heritage-burgundy px-5 py-2.5 text-sm font-bold text-white hover:bg-heritage-wine transition shadow-xs"
            >
              View Analytics Dashboard
            </a>
          </div>
        </div>

        {/* Detailed Solutions Section */}
        <div className="mt-10">
          <h2 className="font-serif text-xl font-bold text-heritage-text mb-4">
            Question-by-Question Analysis & Solutions
          </h2>
          <div className="space-y-4">
            {scorecardResult.detailedResults.map((item: any, idx: number) => (
              <div
                key={item.id}
                className={`rounded-2xl border p-5 sm:p-6 bg-white shadow-card ${
                  item.isCorrect
                    ? "border-emerald-300"
                    : item.isAttempted
                    ? "border-rose-300"
                    : "border-heritage-border"
                }`}
              >
                <div className="flex items-center justify-between text-xs pb-3 border-b border-heritage-border/60">
                  <span className="font-bold text-heritage-text">Question {idx + 1}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-heritage-secondary">{item.subject}</span>
                    {item.isCorrect ? (
                      <span className="rounded-md bg-emerald-100 px-2 py-0.5 font-bold text-emerald-800">
                        Correct (+{positiveMark})
                      </span>
                    ) : item.isAttempted ? (
                      <span className="rounded-md bg-rose-100 px-2 py-0.5 font-bold text-rose-800">
                        Incorrect (-{negativeMark.toFixed(3)})
                      </span>
                    ) : (
                      <span className="rounded-md bg-heritage-cream px-2 py-0.5 font-bold text-heritage-secondary">
                        Unattempted (0)
                      </span>
                    )}
                  </div>
                </div>

                <p className="font-serif mt-3 whitespace-pre-line text-sm sm:text-base font-medium text-heritage-text leading-relaxed">
                  {item.questionText}
                </p>

                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-sans">
                  {item.options.map((opt: any) => {
                    const isUserPick = item.selectedOption === opt.code;
                    const isKey = item.correctOption === opt.code;

                    let bg = "bg-heritage-ivory/50 border-heritage-border text-heritage-text";
                    if (isKey) bg = "bg-emerald-50 border-emerald-500 text-emerald-950 font-bold";
                    else if (isUserPick) bg = "bg-rose-50 border-rose-400 text-rose-950";

                    return (
                      <div key={opt.code} className={`rounded-xl border p-3 ${bg}`}>
                        <span className="font-bold mr-1.5">({opt.code})</span>
                        <span>{opt.text}</span>
                        {isUserPick && (
                          <span className="ml-1 text-[10px] uppercase font-bold text-heritage-burgundy">
                            [Your Answer]
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {item.explanation && (
                  <div className="mt-4 rounded-xl bg-heritage-ivory/90 p-4 text-xs text-heritage-text border border-heritage-gold/30">
                    <p className="font-bold text-heritage-burgundy uppercase tracking-wider text-[10px]">Official Solution Note:</p>
                    <p className="mt-1 leading-relaxed text-heritage-text">{item.explanation.summary}</p>
                    {item.explanation.sourceCitation && (
                      <p className="mt-1.5 text-[11px] text-heritage-secondary italic">
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
    <div className="min-h-screen bg-heritage-ivory flex flex-col">
      {/* Sticky Exam Bar */}
      <header className="sticky top-0 z-30 border-b border-heritage-gold/30 bg-heritage-wine text-white px-4 py-3 shadow-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div>
            <h1 className="font-serif text-base font-bold text-white truncate max-w-md">
              {testTitle}
            </h1>
            <span className="text-xs font-semibold text-heritage-gold">
              Question {currentIndex + 1} of {questions.length}
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Live Countdown Timer */}
            <div
              className={`flex items-center gap-2 rounded-xl border px-3 py-1.5 font-mono text-base font-bold shadow-xs ${
                secondsRemaining < 600
                  ? "border-rose-400 bg-rose-900/80 text-rose-200 animate-pulse"
                  : "border-heritage-gold/40 bg-heritage-burgundy text-heritage-gold"
              }`}
            >
              <Clock className="h-4 w-4" />
              <span>{formatTimer(secondsRemaining)}</span>
            </div>

            <button
              onClick={() => setShowSubmitModal(true)}
              className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 transition"
            >
              Submit Paper
            </button>
          </div>
        </div>
      </header>

      {/* Main Examination Workspace */}
      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col lg:flex-row gap-6 p-4 sm:p-6">
        {/* Left Side: Question Pane */}
        <main className="flex-1 rounded-2xl border border-heritage-border bg-white p-6 sm:p-7 shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-heritage-border/60 pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-heritage-secondary">
                Question {currentIndex + 1}
              </span>
              <button
                onClick={handleToggleMarkReview}
                className={`flex items-center gap-1.5 rounded-lg border px-3 py-1 text-xs font-semibold transition ${
                  isMarked
                    ? "border-heritage-gold bg-heritage-cream text-heritage-burgundy font-bold"
                    : "border-heritage-border text-heritage-secondary hover:bg-heritage-ivory"
                }`}
              >
                <Flag className={`h-3.5 w-3.5 ${isMarked ? "fill-heritage-gold text-heritage-gold" : ""}`} />
                <span>{isMarked ? "Marked for Review" : "Mark for Review"}</span>
              </button>
            </div>

            {/* Question Text */}
            <div className="mt-4">
              <p className="font-serif whitespace-pre-line text-base sm:text-lg font-medium leading-relaxed text-heritage-text">
                {currentQ?.questionText}
              </p>
            </div>

            {/* Options */}
            <div className="mt-6 space-y-3 font-sans">
              {currentQ?.options.map((opt) => {
                const isSelected = selectedOption === opt.code;
                return (
                  <button
                    key={opt.code}
                    onClick={() => handleSelectOption(opt.code)}
                    className={`flex w-full items-start gap-3 rounded-xl border p-3.5 text-left transition touch-target ${
                      isSelected
                        ? "border-heritage-burgundy bg-heritage-cream text-heritage-burgundy font-bold ring-1 ring-heritage-burgundy/30"
                        : "border-heritage-border bg-white hover:border-heritage-gold hover:bg-heritage-ivory/50 text-heritage-text"
                    }`}
                  >
                    <span
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                        isSelected
                          ? "bg-heritage-burgundy text-white"
                          : "border border-heritage-border bg-heritage-ivory text-heritage-burgundy"
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
          <div className="mt-8 border-t border-heritage-border/60 pt-4 flex flex-wrap items-center justify-between gap-3">
            <button
              onClick={handleClearOption}
              disabled={!selectedOption}
              className="flex items-center gap-1 text-xs font-semibold text-heritage-secondary hover:text-heritage-text disabled:opacity-40"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Clear Choice</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                disabled={currentIndex === 0}
                className="flex items-center gap-1 rounded-xl border border-heritage-border bg-white px-4 py-2 text-xs font-semibold text-heritage-text hover:bg-heritage-ivory disabled:opacity-40 transition"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Previous</span>
              </button>
              <button
                onClick={() =>
                  setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))
                }
                disabled={currentIndex === questions.length - 1}
                className="flex items-center gap-1 rounded-xl bg-heritage-burgundy px-5 py-2 text-xs font-bold text-white hover:bg-heritage-wine disabled:opacity-40 transition shadow-xs"
              >
                <span>Save & Next</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </main>

        {/* Right Side: Question Navigation Palette */}
        <aside className="w-full lg:w-80 rounded-2xl border border-heritage-border bg-white p-5 shadow-card">
          <h2 className="text-xs font-bold uppercase tracking-wider text-heritage-secondary mb-3">
            Question Navigation Palette
          </h2>

          <div className="grid grid-cols-5 gap-2 max-h-[380px] overflow-y-auto pr-1">
            {questions.map((q, idx) => {
              const isAnswered = Boolean(answers[q.id]);
              const isMarkedRev = Boolean(markedForReview[q.id]);
              const isCurrent = idx === currentIndex;

              let btnStyle = "border-heritage-border bg-heritage-ivory/60 text-heritage-text";
              if (isMarkedRev) {
                btnStyle = "border-heritage-gold bg-heritage-cream text-heritage-burgundy font-bold";
              } else if (isAnswered) {
                btnStyle = "border-emerald-500 bg-emerald-600 text-white font-bold";
              }

              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-9 rounded-xl border text-xs font-semibold transition ${btnStyle} ${
                    isCurrent ? "ring-2 ring-heritage-gold ring-offset-1 font-bold" : ""
                  }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          {/* Palette Legend */}
          <div className="mt-5 border-t border-heritage-border/60 pt-3 space-y-1.5 text-xs text-heritage-secondary">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-emerald-600" />
              <span>Answered ({answeredCount})</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-heritage-cream border border-heritage-gold" />
              <span>Marked for Review ({reviewCount})</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-heritage-ivory border border-heritage-border" />
              <span>Unattempted ({unattemptedCount})</span>
            </div>
          </div>
        </aside>
      </div>

      {/* Submission Confirmation Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-heritage-border">
            <h3 className="font-serif text-lg font-bold text-heritage-text">Submit Examination Paper?</h3>
            <p className="mt-2 text-xs text-heritage-secondary">
              Please review your question status before confirming your final submission:
            </p>

            <div className="my-4 rounded-xl border border-heritage-border bg-heritage-ivory p-4 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-heritage-secondary">Total Questions:</span>
                <span className="font-bold text-heritage-text">{questions.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-emerald-700 font-semibold">Answered Questions:</span>
                <span className="font-bold text-emerald-800">{answeredCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-heritage-burgundy font-semibold">Marked for Review:</span>
                <span className="font-bold text-heritage-burgundy">{reviewCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-heritage-secondary">Unanswered / Skipped:</span>
                <span className="font-bold text-heritage-text">{unattemptedCount}</span>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowSubmitModal(false)}
                className="rounded-xl px-4 py-2 text-xs font-semibold text-heritage-secondary hover:bg-heritage-ivory transition"
              >
                Return to Paper
              </button>
              <button
                onClick={handleSubmitTest}
                disabled={isSubmitting}
                className="rounded-xl bg-heritage-burgundy px-5 py-2 text-xs font-bold text-white hover:bg-heritage-wine disabled:opacity-50 transition shadow-xs"
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
