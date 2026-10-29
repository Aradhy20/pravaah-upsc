"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  BookOpen,
  Calendar,
  ExternalLink,
  ArrowLeft,
  CheckCircle,
  HelpCircle,
  Clock,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";

export default function CurrentAffairsDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const [story, setStory] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [qId: string]: string }>({});
  const [revealedKeys, setRevealedKeys] = useState<{ [qId: string]: boolean }>({});

  useEffect(() => {
    async function fetchDetail() {
      if (!slug) return;
      try {
        const res = await fetch(`/api/v1/current-affairs/${slug}`);
        const data = await res.json();
        if (data.success) {
          setStory(data.story);
        }
      } catch (e) {
        console.error("Failed to fetch story:", e);
      } finally {
        setLoading(false);
      }
    }
    fetchDetail();
  }, [slug]);

  const handleSelectOption = (qId: string, optionCode: string) => {
    setSelectedAnswers((prev) => ({ ...prev, [qId]: optionCode }));
    setRevealedKeys((prev) => ({ ...prev, [qId]: true }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-sm text-slate-500">Loading current affairs analysis...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!story) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        <div className="flex-1 max-w-4xl mx-auto px-4 py-16 text-center">
          <AlertCircle className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-slate-900">Story Not Found</h1>
          <p className="text-sm text-slate-500 mt-2">The requested current affairs article is unavailable.</p>
          <Link
            href="/current-affairs"
            className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Current Affairs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Back navigation */}
        <Link
          href="/current-affairs"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-700 transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Current Affairs Feed
        </Link>

        {/* Header Block */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm mb-8">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="px-3 py-1 rounded-md text-xs font-bold bg-blue-100 text-blue-800">
              {story.topics[0]?.paper || "General Studies"}
            </span>
            <span className="px-3 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-700">
              {story.topics[0]?.name}
            </span>
            <span className="text-xs text-slate-400 flex items-center gap-1 ml-auto">
              <Calendar className="h-3.5 w-3.5" />
              {new Date(story.publishedAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug">
            {story.title}
          </h1>

          <div className="mt-4 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 pt-4">
            <div>
              Source: <span className="font-semibold text-slate-700">{story.sourceName}</span>
            </div>
            {story.sourceUrl && (
              <a
                href={story.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-blue-600 hover:underline font-medium"
              >
                Official Release
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
          </div>
        </div>

        {/* Executive Summary & Factual Content */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm mb-8">
          <h2 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-blue-600" />
            Executive Summary
          </h2>
          <p className="text-sm text-slate-700 leading-relaxed bg-blue-50/50 p-4 rounded-xl border border-blue-100/60 font-medium">
            {story.summary}
          </p>

          <h2 className="text-base font-bold text-slate-900 mt-6 mb-3">
            Detailed Factual Background
          </h2>
          <div className="text-sm text-slate-700 leading-relaxed space-y-4">
            <p>{story.content}</p>
          </div>

          {/* Key Terms */}
          {story.terms && story.terms.length > 0 && (
            <div className="mt-6 pt-6 border-t border-slate-100">
              <span className="text-xs font-bold text-slate-600 block mb-2 uppercase tracking-wider">
                Key UPSC Glossary Terms:
              </span>
              <div className="flex flex-wrap gap-2">
                {story.terms.map((term: string, idx: number) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200"
                  >
                    {term}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* UPSC Exam Alignment: Prelims vs Mains */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Prelims Focus */}
          <div className="bg-white rounded-2xl border border-blue-200 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-700 text-xs font-bold">
                P
              </span>
              <h3 className="text-sm font-bold text-slate-900">Prelims Relevance & High-Yield Facts</h3>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">
              {story.importancePrelims}
            </p>
            {story.prelimsFodder && (
              <div className="mt-3 p-3 bg-slate-50 rounded-lg text-xs text-slate-600 border border-slate-100">
                <span className="font-bold text-slate-800">Direct Fact Check: </span>
                {story.prelimsFodder}
              </div>
            )}
          </div>

          {/* Mains Focus */}
          <div className="bg-white rounded-2xl border border-indigo-200 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold">
                M
              </span>
              <h3 className="text-sm font-bold text-slate-900">Mains Relevance & Answer Fodder</h3>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">
              {story.importanceMains}
            </p>
            {story.mainsFodder && (
              <div className="mt-3 p-3 bg-slate-50 rounded-lg text-xs text-slate-600 border border-slate-100">
                <span className="font-bold text-slate-800">Analytical Angle: </span>
                {story.mainsFodder}
              </div>
            )}
          </div>
        </div>

        {/* CONNECTED HISTORICAL UPSC PYQS SECTION */}
        {story.linkedPyqs && story.linkedPyqs.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <Clock className="h-5 w-5 text-indigo-600" />
                  Connected Historical UPSC PYQs
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Real previous-year questions from our verified bank testing these exact concepts.
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800">
                {story.linkedPyqs.length} Verified Question{story.linkedPyqs.length > 1 ? "s" : ""}
              </span>
            </div>

            <div className="space-y-6">
              {story.linkedPyqs.map((pyq: any) => {
                const isAnswerRevealed = Boolean(revealedKeys[pyq.id]);
                const userChoice = selectedAnswers[pyq.id];

                return (
                  <div
                    key={pyq.id}
                    className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm"
                  >
                    {/* Header */}
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-3 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded border border-indigo-200">
                          UPSC {pyq.year} {pyq.paperCode} • Question #{pyq.questionNumber}
                        </span>
                        <span className="text-slate-400">Series A Official Key</span>
                      </div>
                      <div className="text-xs text-slate-500 italic">
                        {pyq.rationale}
                      </div>
                    </div>

                    {/* Question Stem */}
                    <p className="text-sm font-semibold text-slate-900 mb-4 whitespace-pre-line leading-relaxed">
                      {pyq.questionText}
                    </p>

                    {/* Options */}
                    <div className="space-y-2 mb-4">
                      {pyq.options.map((opt: any) => {
                        let btnStyle = "border-slate-200 bg-white hover:bg-slate-50 text-slate-700";
                        if (isAnswerRevealed) {
                          if (opt.isCorrect) {
                            btnStyle = "border-emerald-500 bg-emerald-50 text-emerald-900 font-bold";
                          } else if (userChoice === opt.code && !opt.isCorrect) {
                            btnStyle = "border-rose-400 bg-rose-50 text-rose-900";
                          }
                        }

                        return (
                          <button
                            key={opt.code}
                            onClick={() => handleSelectOption(pyq.id, opt.code)}
                            className={`w-full text-left p-3 rounded-xl border text-xs flex items-start gap-3 transition-all ${btnStyle}`}
                          >
                            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-100 font-bold text-slate-700 text-[11px]">
                              {opt.code}
                            </span>
                            <span className="leading-snug">{opt.text}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Explanation */}
                    {isAnswerRevealed && pyq.explanation && (
                      <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                        <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
                          <CheckCircle className="h-4 w-4" />
                          Official Series A Correct Answer Verified
                        </div>
                        <p className="text-slate-700 leading-relaxed">
                          <span className="font-semibold text-slate-900">Explanation: </span>
                          {pyq.explanation.core}
                        </p>
                        {pyq.explanation.elimination && (
                          <p className="text-slate-600">
                            <span className="font-semibold text-slate-900">Elimination Technique: </span>
                            {pyq.explanation.elimination}
                          </p>
                        )}
                        {pyq.explanation.reference && (
                          <p className="text-slate-500 italic">
                            Authority: {pyq.explanation.reference}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Call to Action: Daily Quiz */}
        <div className="bg-gradient-to-r from-blue-700 to-indigo-800 rounded-2xl p-6 sm:p-8 text-white shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold">Test Today's Current Affairs Now</h3>
            <p className="text-xs text-blue-100 mt-1">
              Attempt 5 curated Prelims MCQs based on today's releases and build your retention streak.
            </p>
          </div>
          <Link
            href="/daily-quiz"
            className="px-5 py-2.5 rounded-lg bg-white text-blue-800 text-xs font-bold hover:bg-blue-50 transition-colors shadow shrink-0"
          >
            Start Daily Quiz
          </Link>
        </div>
      </main>
    </div>
  );
}
