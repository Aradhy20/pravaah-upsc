"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
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
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [qId: string]: string }>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any | null>(null);

  useEffect(() => {
    async function loadQuiz() {
      try {
        const res = await fetch("/api/v1/quiz/daily");
        const data = await res.json();
        if (data.success) {
          setQuiz(data.quiz);
        }
      } catch (e) {
        console.error("Failed to load daily quiz:", e);
      } finally {
        setLoading(false);
      }
    }
    loadQuiz();
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
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-sm text-slate-500">Loading today's quiz...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        <Header />
        <div className="flex-1 max-w-2xl mx-auto px-4 py-16 text-center">
          <AlertCircle className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-slate-900">No Quiz Available</h1>
          <p className="text-sm text-slate-500 mt-2">
            Today's daily current affairs quiz has not been published yet. Please check back shortly.
          </p>
          <Link
            href="/current-affairs"
            className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold"
          >
            <BookOpen className="h-4 w-4" />
            Explore Daily Current Affairs
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const currentQ = quiz.questions[currentIndex];
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Header />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Banner */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                Daily Prelims Challenge
              </span>
              <span className="text-xs text-slate-400">
                5 High-Yield Questions • Negative Marking (-0.66)
              </span>
            </div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
              {quiz.title}
            </h1>
          </div>

          {!submitted ? (
            <div className="text-right">
              <span className="text-xs text-slate-500 block">Progress</span>
              <span className="text-sm font-bold text-blue-700">
                {answeredCount} / {quiz.totalQuestions} Answered
              </span>
            </div>
          ) : (
            <div className="text-right">
              <span className="text-xs text-slate-500 block">Your Score</span>
              <span className="text-lg font-black text-emerald-600">
                {result?.score} / {result?.totalPossibleScore} marks
              </span>
            </div>
          )}
        </div>

        {/* Quiz Flow */}
        {!submitted ? (
          <div>
            {/* Question Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm mb-6">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-4 pb-3 border-b border-slate-100">
                <span className="font-bold text-slate-700">
                  Question {currentIndex + 1} of {quiz.totalQuestions}
                </span>
                {currentQ.relatedStory && (
                  <Link
                    href={`/current-affairs/${currentQ.relatedStory.slug}`}
                    target="_blank"
                    className="text-blue-600 hover:underline flex items-center gap-1 font-medium"
                  >
                    Based on: {currentQ.relatedStory.title.slice(0, 35)}...
                  </Link>
                )}
              </div>

              {/* Question Text */}
              <p className="text-sm sm:text-base font-semibold text-slate-900 mb-6 whitespace-pre-line leading-relaxed">
                {currentQ.questionText}
              </p>

              {/* Options */}
              <div className="space-y-3 mb-6">
                {currentQ.options.map((opt: any) => {
                  const isSelected = answers[currentQ.id] === opt.code;
                  return (
                    <button
                      key={opt.code}
                      onClick={() => handleSelect(currentQ.id, opt.code)}
                      className={`w-full text-left p-3.5 rounded-xl border text-xs sm:text-sm flex items-start gap-3 transition-all ${
                        isSelected
                          ? "border-blue-600 bg-blue-50/60 text-blue-900 font-semibold ring-2 ring-blue-600/20"
                          : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
                      }`}
                    >
                      <span
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                          isSelected
                            ? "bg-blue-600 text-white"
                            : "bg-slate-100 text-slate-600"
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
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <button
                  disabled={currentIndex === 0}
                  onClick={() => setCurrentIndex((prev) => prev - 1)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Previous
                </button>

                {currentIndex < quiz.totalQuestions - 1 ? (
                  <button
                    onClick={() => setCurrentIndex((prev) => prev + 1)}
                    className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1.5"
                  >
                    Next Question
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="px-6 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow flex items-center gap-1.5"
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
                    className={`h-8 w-8 rounded-lg text-xs font-bold transition-all ${
                      isCurrent
                        ? "bg-blue-700 text-white ring-2 ring-blue-700/30"
                        : isAnswered
                        ? "bg-blue-100 text-blue-800"
                        : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
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
            <div className="bg-gradient-to-br from-slate-900 to-indigo-950 rounded-2xl p-6 sm:p-8 text-white shadow-sm">
              <div className="flex items-center gap-2 mb-2 text-indigo-300 text-xs font-bold">
                <Award className="h-4 w-4" />
                Scorecard & Topic Analytics
              </div>
              <h2 className="text-2xl font-black">{quiz.title}</h2>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-white/10">
                <div className="bg-white/5 rounded-xl p-3 border border-white/10 text-center">
                  <span className="text-[11px] text-slate-400 block">Score</span>
                  <span className="text-xl font-black text-emerald-400">
                    {result.score} / {result.totalPossibleScore}
                  </span>
                </div>
                <div className="bg-white/5 rounded-xl p-3 border border-white/10 text-center">
                  <span className="text-[11px] text-slate-400 block">Accuracy</span>
                  <span className="text-xl font-black text-blue-300">
                    {result.accuracyPercent}%
                  </span>
                </div>
                <div className="bg-white/5 rounded-xl p-3 border border-white/10 text-center">
                  <span className="text-[11px] text-slate-400 block">Correct</span>
                  <span className="text-xl font-black text-emerald-400">
                    {result.correctCount}
                  </span>
                </div>
                <div className="bg-white/5 rounded-xl p-3 border border-white/10 text-center">
                  <span className="text-[11px] text-slate-400 block">Incorrect</span>
                  <span className="text-xl font-black text-rose-400">
                    {result.incorrectCount}
                  </span>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/revision"
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white transition-all shadow flex items-center gap-1.5"
                >
                  <RotateCw className="h-3.5 w-3.5" />
                  Review Mistakes in Revision Queue
                </Link>
                <Link
                  href="/current-affairs"
                  className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition-all border border-white/10 flex items-center gap-1.5"
                >
                  <BookOpen className="h-3.5 w-3.5" />
                  Read Full Current Affairs Cards
                </Link>
              </div>
            </div>

            {/* Explanations for all 5 questions */}
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-slate-900">
                Detailed Answers & Verification Explanations
              </h3>

              {result.gradedQuestions.map((q: any) => (
                <div
                  key={q.id}
                  className={`bg-white rounded-2xl border p-6 shadow-sm ${
                    q.isCorrect ? "border-emerald-200" : "border-rose-200"
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-3">
                    <span className="font-bold text-slate-700">
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

                  <p className="text-sm font-semibold text-slate-900 mb-4 whitespace-pre-line leading-relaxed">
                    {q.questionText}
                  </p>

                  <div className="space-y-2 mb-4">
                    {q.options.map((opt: any) => {
                      const isCorrectOpt = opt.code === q.correctOption;
                      const isUserChoice = opt.code === q.selectedOption;

                      let optClass = "border-slate-200 bg-white text-slate-700";
                      if (isCorrectOpt) {
                        optClass = "border-emerald-500 bg-emerald-50 text-emerald-900 font-bold";
                      } else if (isUserChoice && !isCorrectOpt) {
                        optClass = "border-rose-400 bg-rose-50 text-rose-900";
                      }

                      return (
                        <div
                          key={opt.code}
                          className={`p-3 rounded-xl border text-xs flex items-start gap-3 ${optClass}`}
                        >
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-100 font-bold text-slate-700 text-[11px]">
                            {opt.code}
                          </span>
                          <span className="leading-snug">{opt.text}</span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed">
                    <span className="font-bold text-slate-900 block mb-1">
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

      <Footer />
    </div>
  );
}
