"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  CheckCircle,
  XCircle,
  Clock,
  RotateCw,
  Award,
  ArrowRight,
  ArrowLeft,
  BookOpen,
  Sparkles,
  AlertCircle,
} from "lucide-react";

export default function DailyQuizPage() {
  const [quiz, setQuiz] = useState<any | null>(null);
  const [archive, setArchive] = useState<any[]>([]);
  const [selectedQuizId, setSelectedQuizId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [qId: string]: string }>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any | null>(null);

  const loadQuiz = async (quizId?: string) => {
    setLoading(true);
    setError(null);
    setCurrentIndex(0);
    setAnswers({});
    setSubmitted(false);
    setResult(null);

    try {
      const url = quizId ? `/api/v1/quiz/daily?quizId=${encodeURIComponent(quizId)}` : "/api/v1/quiz/daily";
      const res = await fetch(url);
      const data = await res.json();
      if (res.ok && data.success) {
        setQuiz(data.quiz);
        if (quizId) setSelectedQuizId(quizId);
      } else if (res.status === 404) {
        setQuiz(null);
      } else {
        setError(data.error || "Failed to load daily quiz.");
      }
    } catch (e: any) {
      console.error("Failed to load daily quiz:", e);
      setError("Network error while connecting to the daily quiz engine.");
    } finally {
      setLoading(false);
    }
  };

  const loadArchive = async () => {
    try {
      const res = await fetch("/api/v1/quiz/daily?archive=true");
      const data = await res.json();
      if (res.ok && data.success && Array.isArray(data.archive)) {
        setArchive(data.archive);
      }
    } catch (e) {
      console.error("Failed to load quiz archive:", e);
    }
  };

  useEffect(() => {
    loadQuiz();
    loadArchive();
  }, []);

  const handleSelect = (qId: string, optionCode: string) => {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [qId]: optionCode }));
  };

  const handleSubmit = async () => {
    if (!quiz || submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/v1/quiz/daily/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quizId: quiz.id,
          answers,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setResult(data.result);
        setSubmitted(true);
      }
    } catch (e) {
      console.error("Failed to submit quiz:", e);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-heritage-ivory flex flex-col font-sans">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-heritage-burgundy border-t-transparent"></div>
            <p className="mt-2 text-sm text-heritage-secondary font-medium">Loading today's quiz...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-heritage-ivory flex flex-col font-sans">
        <div className="flex-1 max-w-2xl mx-auto px-4 py-16 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 border border-rose-200 shadow-xs">
            <AlertCircle className="h-7 w-7" />
          </div>
          <h1 className="font-serif text-xl font-bold text-heritage-text">Unable to Load Quiz</h1>
          <p className="text-sm text-rose-700 mt-2">{error}</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button
              onClick={() => loadQuiz()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-heritage-burgundy hover:bg-heritage-wine text-white text-sm font-bold shadow-xs transition"
            >
              <RotateCw className="h-4 w-4 text-heritage-gold" />
              Retry Quiz Load
            </button>
            <Link
              href="/current-affairs"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-heritage-border hover:bg-heritage-cream text-heritage-text text-sm font-semibold transition"
            >
              <BookOpen className="h-4 w-4 text-heritage-gold" />
              Current Affairs
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="min-h-screen bg-heritage-ivory flex flex-col font-sans">
        <div className="flex-1 max-w-2xl mx-auto px-4 py-16 text-center">
          <AlertCircle className="h-12 w-12 text-heritage-gold mx-auto mb-4" />
          <h1 className="font-serif text-xl font-bold text-heritage-text">No Quiz Available</h1>
          <p className="text-sm text-heritage-secondary mt-2">
            Today's daily current affairs quiz has not been published yet. Please check back shortly.
          </p>
          <Link
            href="/current-affairs"
            className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-heritage-burgundy text-white text-sm font-bold shadow-xs hover:bg-heritage-wine transition"
          >
            <BookOpen className="h-4 w-4 text-heritage-gold" />
            Explore Daily Current Affairs
          </Link>
        </div>
      </div>
    );
  }

  const currentQ = quiz.questions[currentIndex];
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="min-h-screen bg-heritage-ivory flex flex-col font-sans">
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Banner */}
        <div className="bg-white rounded-2xl border border-heritage-border p-6 shadow-card mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-heritage-cream text-heritage-burgundy border border-heritage-border">
                Daily Prelims Challenge
              </span>
              <span className="text-xs text-heritage-secondary">
                5 High-Yield Questions • Negative Marking (-0.66)
              </span>
            </div>
            <h1 className="font-serif text-xl sm:text-2xl font-bold text-heritage-text tracking-tight">
              {quiz.title}
            </h1>
            {archive.length > 0 && (
              <div className="mt-2.5 flex items-center gap-2">
                <span className="text-xs font-semibold text-heritage-secondary">Select Date:</span>
                <select
                  value={selectedQuizId || quiz.id}
                  onChange={(e) => loadQuiz(e.target.value)}
                  className="text-xs bg-heritage-ivory border border-heritage-border rounded-xl px-3 py-1 font-semibold text-heritage-text hover:border-heritage-gold transition-colors cursor-pointer"
                >
                  {archive.map((item) => (
                    <option key={item.id} value={item.id}>
                      {new Date(item.quizDate).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}{" "}
                      — {item.title.replace("Daily Prelims Diagnostic: ", "")}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {!submitted ? (
            <div className="text-right">
              <span className="text-xs text-heritage-secondary block">Progress</span>
              <span className="font-serif text-sm font-bold text-heritage-burgundy">
                {answeredCount} / {quiz.totalQuestions} Answered
              </span>
            </div>
          ) : (
            <div className="text-right">
              <span className="text-xs text-heritage-secondary block">Your Score</span>
              <span className="font-serif text-lg font-bold text-emerald-700">
                {result?.score} / {result?.totalPossibleScore} marks
              </span>
            </div>
          )}
        </div>

        {/* Quiz Flow */}
        {!submitted ? (
          <div>
            {/* Question Card */}
            <div className="bg-white rounded-2xl border border-heritage-border p-6 sm:p-8 shadow-card mb-6">
              <div className="flex items-center justify-between text-xs text-heritage-secondary mb-4 pb-3 border-b border-heritage-border/60">
                <span className="font-bold text-heritage-text">
                  Question {currentIndex + 1} of {quiz.totalQuestions}
                </span>
                {currentQ.relatedStory && (
                  <Link
                    href={`/current-affairs/${currentQ.relatedStory.slug}`}
                    target="_blank"
                    className="text-heritage-burgundy hover:underline flex items-center gap-1 font-medium"
                  >
                    Based on: {currentQ.relatedStory.title.slice(0, 35)}...
                  </Link>
                )}
              </div>

              {/* Question Text */}
              <p className="font-serif text-sm sm:text-base font-bold text-heritage-text mb-6 whitespace-pre-line leading-relaxed">
                {currentQ.questionText}
              </p>

              {/* Options */}
              <div className="space-y-3 mb-6 font-sans">
                {currentQ.options.map((opt: any) => {
                  const isSelected = answers[currentQ.id] === opt.code;
                  return (
                    <button
                      key={opt.code}
                      onClick={() => handleSelect(currentQ.id, opt.code)}
                      className={`w-full text-left p-3.5 rounded-xl border text-xs sm:text-sm flex items-start gap-3 transition-all ${
                        isSelected
                          ? "border-heritage-burgundy bg-heritage-cream text-heritage-burgundy font-bold ring-1 ring-heritage-burgundy/30"
                          : "border-heritage-border bg-white hover:border-heritage-gold hover:bg-heritage-ivory/50 text-heritage-text"
                      }`}
                    >
                      <span
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                          isSelected
                            ? "bg-heritage-burgundy text-white"
                            : "border border-heritage-border bg-heritage-ivory text-heritage-burgundy"
                        }`}
                      >
                        {opt.code}
                      </span>
                      <span className="leading-snug">{opt.text}</span>
                    </button>
                  );
                })}
              </div>

              {/* Navigation Controls */}
              <div className="flex items-center justify-between pt-4 border-t border-heritage-border/60">
                <button
                  disabled={currentIndex === 0}
                  onClick={() => setCurrentIndex((prev) => prev - 1)}
                  className="px-4 py-2 rounded-xl border border-heritage-border text-xs font-semibold text-heritage-secondary hover:bg-heritage-ivory disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 transition"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Previous
                </button>

                {currentIndex < quiz.totalQuestions - 1 ? (
                  <button
                    onClick={() => setCurrentIndex((prev) => prev + 1)}
                    className="px-4 py-2 rounded-xl bg-heritage-burgundy hover:bg-heritage-wine text-white text-xs font-bold flex items-center gap-1.5 transition shadow-xs"
                  >
                    Next Question
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs flex items-center gap-1.5"
                  >
                    {submitting ? "Grading..." : "Submit Daily Quiz"}
                    <CheckCircle className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Quick palette */}
            <div className="flex items-center justify-center gap-2">
              {quiz.questions.map((q: any, i: number) => {
                const isCurrent = i === currentIndex;
                const isAnswered = Boolean(answers[q.id]);
                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIndex(i)}
                    className={`h-8 w-8 rounded-xl text-xs font-bold transition-all ${
                      isCurrent
                        ? "bg-heritage-burgundy text-white ring-2 ring-heritage-gold"
                        : isAnswered
                        ? "bg-heritage-cream border border-heritage-gold text-heritage-burgundy font-bold"
                        : "bg-white border border-heritage-border text-heritage-secondary hover:bg-heritage-ivory"
                    }`}
                  >
                    {i + 1}
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          /* SCORECARD & COMPREHENSIVE EXPLANATIONS */
          <div className="space-y-6">
            {/* Scorecard Hero */}
            <div className="bg-gradient-to-r from-heritage-burgundy to-heritage-wine rounded-2xl p-6 sm:p-8 text-white shadow-gold border border-heritage-gold/30">
              <div className="flex items-center gap-2 mb-2 text-heritage-gold text-xs font-bold">
                <Award className="h-4 w-4" />
                Scorecard & Topic Analytics
              </div>
              <h2 className="font-serif text-2xl font-bold">{quiz.title}</h2>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-white/10">
                <div className="bg-white/10 rounded-xl p-3 border border-white/10 text-center">
                  <span className="text-[11px] text-heritage-cream/80 block">Score</span>
                  <span className="font-serif text-xl font-bold text-heritage-gold">
                    {result.score} / {result.totalPossibleScore}
                  </span>
                </div>
                <div className="bg-white/10 rounded-xl p-3 border border-white/10 text-center">
                  <span className="text-[11px] text-heritage-cream/80 block">Accuracy</span>
                  <span className="font-serif text-xl font-bold text-amber-200">
                    {result.accuracyPercent}%
                  </span>
                </div>
                <div className="bg-white/10 rounded-xl p-3 border border-white/10 text-center">
                  <span className="text-[11px] text-heritage-cream/80 block">Correct</span>
                  <span className="font-serif text-xl font-bold text-emerald-300">
                    {result.correctCount}
                  </span>
                </div>
                <div className="bg-white/10 rounded-xl p-3 border border-white/10 text-center">
                  <span className="text-[11px] text-heritage-cream/80 block">Incorrect</span>
                  <span className="font-serif text-xl font-bold text-rose-300">
                    {result.incorrectCount}
                  </span>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/revision"
                  className="px-4 py-2 rounded-xl bg-heritage-cream text-heritage-burgundy text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 hover:bg-white"
                >
                  <RotateCw className="h-3.5 w-3.5 text-heritage-gold" />
                  Review Mistakes in Revision Queue
                </Link>
                <Link
                  href="/current-affairs"
                  className="px-4 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-xs font-bold text-white transition-all border border-white/20 flex items-center gap-1.5"
                >
                  <BookOpen className="h-3.5 w-3.5 text-heritage-gold" />
                  Read Full Current Affairs Cards
                </Link>
              </div>
            </div>

            {/* Explanations for all 5 questions */}
            <div className="space-y-6">
              <h3 className="font-serif text-lg font-bold text-heritage-text">
                Detailed Answers & Verification Explanations
              </h3>

              {result.gradedQuestions.map((q: any) => (
                <div
                  key={q.id}
                  className={`bg-white rounded-2xl border p-6 shadow-card ${
                    q.isCorrect ? "border-emerald-300" : "border-rose-300"
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-3">
                    <span className="font-bold text-heritage-text">
                      Question #{q.orderIndex}
                    </span>
                    {q.isCorrect ? (
                      <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" /> Correct (+2.0)
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
                        <XCircle className="h-3 w-3" /> Incorrect (-0.66)
                      </span>
                    )}
                  </div>

                  <p className="font-serif text-sm font-bold text-heritage-text mb-4 whitespace-pre-line leading-relaxed">
                    {q.questionText}
                  </p>

                  <div className="space-y-2 mb-4 font-sans">
                    {q.options.map((opt: any) => {
                      const isCorrectOpt = opt.code === q.correctOption;
                      const isUserChoice = opt.code === q.selectedOption;

                      let optClass = "border-heritage-border bg-white text-heritage-text";
                      if (isCorrectOpt) {
                        optClass = "border-emerald-500 bg-emerald-50 text-emerald-950 font-bold";
                      } else if (isUserChoice && !isCorrectOpt) {
                        optClass = "border-rose-400 bg-rose-50 text-rose-950";
                      }

                      return (
                        <div
                          key={opt.code}
                          className={`p-3 rounded-xl border text-xs flex items-start gap-3 ${optClass}`}
                        >
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-lg bg-heritage-cream font-bold text-heritage-burgundy text-[11px] border border-heritage-border">
                            {opt.code}
                          </span>
                          <span className="leading-snug">{opt.text}</span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="p-4 rounded-xl bg-heritage-ivory border border-heritage-gold/30 text-xs text-heritage-text leading-relaxed">
                    <span className="font-bold text-heritage-burgundy block mb-1 uppercase tracking-wider text-[10px]">
                      Official Explanation:
                    </span>
                    {q.explanation}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
