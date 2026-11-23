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
  RotateCw,
} from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function CurrentAffairsDetailPage() {
  const params = useParams();
  const rawSlug = params?.slug as string;
  const slug = rawSlug ? decodeURIComponent(rawSlug) : "";
  const [story, setStory] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [qId: string]: string }>({});
  const [revealedKeys, setRevealedKeys] = useState<{ [qId: string]: boolean }>({});

  const fetchDetail = async () => {
    if (!slug) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/v1/current-affairs/${encodeURIComponent(slug)}`);
      const data = await res.json();
      if (res.ok && data.success) {
        setStory(data.story);
      } else {
        setError(data.error || "Failed to load current affairs analysis.");
      }
    } catch (e: any) {
      console.error("Failed to fetch story:", e);
      setError("Network error while connecting to current affairs service.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [slug]);

  const handleSelectOption = (qId: string, optionCode: string) => {
    setSelectedAnswers((prev) => ({ ...prev, [qId]: optionCode }));
    setRevealedKeys((prev) => ({ ...prev, [qId]: true }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-heritage-ivory flex flex-col font-sans">
        <Header />
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center bg-white p-8 rounded-2xl border border-heritage-border shadow-card max-w-sm w-full">
            <RotateCw className="h-8 w-8 text-heritage-burgundy animate-spin mx-auto mb-3" />
            <p className="font-serif font-bold text-heritage-text text-sm">
              Loading UPSC Analysis...
            </p>
            <p className="text-xs text-heritage-secondary mt-1">
              Retrieving syllabus micro-themes & verified PYQs
            </p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-heritage-ivory flex flex-col font-sans">
        <Header />
        <div className="flex-1 max-w-3xl mx-auto px-4 py-16 text-center">
          <div className="bg-white rounded-2xl border border-heritage-border p-8 sm:p-12 shadow-card">
            <AlertCircle className="h-12 w-12 text-heritage-saffron mx-auto mb-4" />
            <h1 className="font-serif text-2xl font-bold text-heritage-text">
              Analysis Temporarily Unavailable
            </h1>
            <p className="text-xs sm:text-sm text-heritage-secondary mt-2 max-w-md mx-auto">
              {error}
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={fetchDetail}
                className="px-5 py-2.5 rounded-xl bg-heritage-burgundy text-white text-xs font-bold hover:bg-heritage-wine transition-all shadow-xs flex items-center gap-2"
              >
                <RotateCw className="h-4 w-4" />
                Retry Loading
              </button>
              <Link
                href="/current-affairs"
                className="px-5 py-2.5 rounded-xl border border-heritage-border text-heritage-text text-xs font-bold hover:bg-heritage-cream transition-all"
              >
                Back to Current Affairs
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!story) {
    return (
      <div className="min-h-screen bg-heritage-ivory flex flex-col font-sans">
        <Header />
        <div className="flex-1 max-w-3xl mx-auto px-4 py-16 text-center">
          <div className="bg-white rounded-2xl border border-heritage-border p-8 sm:p-12 shadow-card">
            <AlertCircle className="h-12 w-12 text-heritage-secondary mx-auto mb-4" />
            <h1 className="font-serif text-2xl font-bold text-heritage-text">Story Not Found</h1>
            <p className="text-xs sm:text-sm text-heritage-secondary mt-2">
              The requested current affairs article is unavailable.
            </p>
            <Link
              href="/current-affairs"
              className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-heritage-burgundy text-white text-xs font-bold hover:bg-heritage-wine transition-all"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Current Affairs Feed
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-heritage-ivory flex flex-col font-sans">
      <Header />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Back navigation */}
        <Link
          href="/current-affairs"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-heritage-secondary hover:text-heritage-burgundy transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Current Affairs Feed
        </Link>

        {/* Header Block */}
        <div className="bg-white rounded-2xl border border-heritage-border p-6 sm:p-8 shadow-card mb-8">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-heritage-cream text-heritage-burgundy border border-heritage-gold/30">
              {story.topics[0]?.paper || "General Studies"}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-heritage-ivory text-heritage-text border border-heritage-border">
              {story.topics[0]?.name}
            </span>
            <span className="text-xs text-heritage-secondary flex items-center gap-1 ml-auto">
              <Calendar className="h-3.5 w-3.5 text-heritage-gold" />
              {new Date(story.publishedAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
          </div>

          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-heritage-text tracking-tight leading-snug">
            {story.title}
          </h1>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-heritage-secondary border-t border-heritage-border/60 pt-4">
            <div>
              Source: <span className="font-semibold text-heritage-text">{story.sourceName}</span>
            </div>
            {story.sourceUrl && (
              <a
                href={story.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-heritage-burgundy hover:underline font-bold"
              >
                Official Release
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
          </div>
        </div>

        {/* Executive Summary & Factual Content */}
        <div className="bg-white rounded-2xl border border-heritage-border p-6 sm:p-8 shadow-card mb-8">
          <h2 className="font-serif text-base font-bold text-heritage-text mb-3 flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-heritage-burgundy" />
            Executive Summary
          </h2>
          <p className="text-xs sm:text-sm text-heritage-text leading-relaxed bg-heritage-cream/60 p-4 rounded-xl border border-heritage-gold/30 font-serif">
            {story.summary}
          </p>

          <h2 className="font-serif text-base font-bold text-heritage-text mt-6 mb-3">
            Detailed Factual Background
          </h2>
          <div className="text-xs sm:text-sm text-heritage-text leading-relaxed space-y-4">
            <p>{story.content}</p>
          </div>

          {/* Key Terms */}
          {story.terms && story.terms.length > 0 && (
            <div className="mt-6 pt-6 border-t border-heritage-border/60">
              <span className="text-xs font-bold text-heritage-secondary block mb-2 uppercase tracking-wider">
                Key UPSC Glossary Terms:
              </span>
              <div className="flex flex-wrap gap-2">
                {story.terms.map((term: string, idx: number) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-heritage-cream text-heritage-burgundy border border-heritage-gold/30"
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
          <div className="bg-white rounded-2xl border border-heritage-border p-6 shadow-card">
            <div className="flex items-center gap-2 mb-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-heritage-burgundy text-white text-xs font-bold">
                P
              </span>
              <h3 className="font-serif text-sm font-bold text-heritage-text">
                Prelims High-Yield Facts & Direct Fodder
              </h3>
            </div>
            <p className="text-xs text-heritage-text leading-relaxed">
              {story.importancePrelims}
            </p>
            {story.prelimsFodder && (
              <div className="mt-3 p-3 bg-heritage-cream/50 rounded-xl text-xs text-heritage-text border border-heritage-gold/20">
                <span className="font-bold text-heritage-burgundy">Direct Fact Check: </span>
                {story.prelimsFodder}
              </div>
            )}
          </div>

          {/* Mains Focus */}
          <div className="bg-white rounded-2xl border border-heritage-border p-6 shadow-card">
            <div className="flex items-center gap-2 mb-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-heritage-wine text-heritage-gold text-xs font-bold">
                M
              </span>
              <h3 className="font-serif text-sm font-bold text-heritage-text">
                Mains Analytical Dimensions & Case Studies
              </h3>
            </div>
            <p className="text-xs text-heritage-text leading-relaxed">
              {story.importanceMains}
            </p>
            {story.mainsFodder && (
              <div className="mt-3 p-3 bg-heritage-cream/50 rounded-xl text-xs text-heritage-text border border-heritage-gold/20">
                <span className="font-bold text-heritage-wine">Analytical Angle: </span>
                {story.mainsFodder}
              </div>
            )}
          </div>
        </div>

        {/* CONNECTED HISTORICAL UPSC PYQS SECTION */}
        {story.linkedPyqs && story.linkedPyqs.length > 0 && (
          <div className="mb-8">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
              <div>
                <h2 className="font-serif text-xl font-bold text-heritage-text flex items-center gap-2">
                  <Clock className="h-5 w-5 text-heritage-burgundy" />
                  Connected Historical UPSC PYQs
                </h2>
                <p className="text-xs text-heritage-secondary mt-0.5">
                  Official previous-year questions from our verified repository testing these exact constitutional/thematic concepts.
                </p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-heritage-burgundy text-white shadow-xs">
                {story.linkedPyqs.length} Officially Verified Question{story.linkedPyqs.length > 1 ? "s" : ""}
              </span>
            </div>

            <div className="space-y-6">
              {story.linkedPyqs.map((pyq: any) => {
                const isAnswerRevealed = Boolean(revealedKeys[pyq.id]);
                const userChoice = selectedAnswers[pyq.id];

                return (
                  <div
                    key={pyq.id}
                    className="bg-white rounded-2xl border-2 border-heritage-gold/40 p-6 shadow-card"
                  >
                    {/* Header */}
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-3 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-heritage-burgundy bg-heritage-cream px-2.5 py-1 rounded-lg border border-heritage-gold/30">
                          UPSC {pyq.year} {pyq.paperCode} • Question #{pyq.questionNumber}
                        </span>
                        <span className="text-heritage-secondary font-medium">Series A Official Key</span>
                      </div>
                      <div className="text-xs text-heritage-secondary italic">
                        {pyq.rationale}
                      </div>
                    </div>

                    {/* Question Stem */}
                    <p className="text-sm font-semibold text-heritage-text mb-4 whitespace-pre-line leading-relaxed font-serif">
                      {pyq.questionText}
                    </p>

                    {/* Options */}
                    <div className="space-y-2 mb-4">
                      {pyq.options.map((opt: any) => {
                        let btnStyle = "border-heritage-border bg-white hover:bg-heritage-cream/40 text-heritage-text";
                        if (isAnswerRevealed) {
                          if (opt.isCorrect) {
                            btnStyle = "border-emerald-500 bg-emerald-50 text-emerald-950 font-bold";
                          } else if (userChoice === opt.code && !opt.isCorrect) {
                            btnStyle = "border-rose-400 bg-rose-50 text-rose-950";
                          }
                        }

                        return (
                          <button
                            key={opt.code}
                            onClick={() => handleSelectOption(pyq.id, opt.code)}
                            className={`w-full text-left p-3 rounded-xl border text-xs flex items-start gap-3 transition-all ${btnStyle}`}
                          >
                            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-heritage-cream font-bold text-heritage-burgundy text-[11px] border border-heritage-gold/30">
                              {opt.code}
                            </span>
                            <span className="leading-snug">{opt.text}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Explanation */}
                    {isAnswerRevealed && pyq.explanation && (
                      <div className="mt-4 p-4 rounded-xl bg-heritage-cream/50 border border-heritage-gold/40 text-xs space-y-2 animate-in fade-in-50">
                        <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
                          <CheckCircle className="h-4 w-4" />
                          Official Series A Correct Answer Verified
                        </div>
                        <p className="text-heritage-text leading-relaxed">
                          <span className="font-semibold text-heritage-text">Explanation: </span>
                          {pyq.explanation.core}
                        </p>
                        {pyq.explanation.elimination && (
                          <p className="text-heritage-secondary">
                            <span className="font-semibold text-heritage-text">Elimination Technique: </span>
                            {pyq.explanation.elimination}
                          </p>
                        )}
                        {pyq.explanation.reference && (
                          <p className="text-heritage-secondary italic">
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
        <div className="bg-gradient-to-r from-heritage-wine via-heritage-burgundy to-heritage-wine rounded-2xl p-6 sm:p-8 text-white shadow-gold border border-heritage-gold/30 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="font-serif text-lg font-bold text-white">Test Today's Current Affairs Now</h3>
            <p className="text-xs text-heritage-cream/90 mt-1">
              Attempt curated Prelims MCQs based on today's releases and build your retention streak.
            </p>
          </div>
          <Link
            href="/daily-quiz"
            className="px-5 py-2.5 rounded-xl bg-heritage-gold hover:bg-amber-400 text-heritage-wine text-xs font-bold transition-all shadow-xs shrink-0"
          >
            Start Daily Quiz
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
