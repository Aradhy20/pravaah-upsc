"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import {
  BookOpen,
  Calendar,
  CheckCircle,
  Clock,
  RotateCw,
  Compass,
  ArrowRight,
  Sparkles,
  Award,
  AlertCircle,
  HelpCircle,
  ChevronRight,
  TrendingUp,
} from "lucide-react";

export default function DailyStudyPlannerPage() {
  const [plan, setPlan] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPlan() {
      try {
        const res = await fetch("/api/v1/study-planner/today");
        const data = await res.json();
        if (data.success) {
          setPlan(data.studyPlan);
        }
      } catch (e) {
        console.error("Failed to load study plan:", e);
      } finally {
        setLoading(false);
      }
    }
    loadPlan();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-sm text-slate-500">Formulating your personalized study plan...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const todayStudy = plan?.todayStudy;
  const importantPyqs = plan?.importantForUpsc?.connectedPyqs || [];
  const revisionItems = plan?.revisionNext?.items || [];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Header />

      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Planner Header */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 rounded-2xl p-6 sm:p-10 text-white shadow-sm mb-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-200 text-xs font-semibold mb-4 border border-blue-400/20">
              <Calendar className="h-3.5 w-3.5" />
              Daily Aspirant Compass • {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Your Daily <span className="text-blue-400">Preparation Architecture</span>
            </h1>
            <p className="mt-3 text-slate-300 text-sm sm:text-base leading-relaxed">
              Every day, Pravaah answers the three vital questions for every serious UPSC aspirant: What to study today, what is important from previous exams, and what to revise based on your mistakes.
            </p>
          </div>
        </div>

        {/* THREE CORE QUESTIONS ACCORDION / CARDS */}
        <div className="space-y-8">
          {/* QUESTION 1: WHAT SHOULD I STUDY TODAY? */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-100 text-blue-700 font-black text-sm">
                1
              </span>
              <div>
                <span className="text-xs font-bold text-blue-700 uppercase tracking-wider block">
                  First Priority of the Day
                </span>
                <h2 className="text-xl font-bold text-slate-900">What should I study today?</h2>
              </div>
            </div>

            {todayStudy ? (
              <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 mt-4">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-blue-600 text-white">
                    {todayStudy.syllabusPaper}
                  </span>
                  <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-white text-slate-700 border border-slate-200">
                    {todayStudy.topic}
                  </span>
                  <span className="text-xs text-slate-500 ml-auto font-medium">
                    Source: {todayStudy.sourceName}
                  </span>
                </div>

                <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                  {todayStudy.title}
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {todayStudy.summary}
                </p>

                {/* Prelims & Mains Takeaway Highlights */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-200 text-xs">
                  <div className="bg-white p-3 rounded-lg border border-slate-200">
                    <span className="font-bold text-blue-800 block mb-1">Prelims Core Theme:</span>
                    <p className="text-slate-600">{todayStudy.importancePrelims || "Key institutional roles and constitutional statutory safeguards."}</p>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-slate-200">
                    <span className="font-bold text-indigo-800 block mb-1">Mains Core Dimension:</span>
                    <p className="text-slate-600">{todayStudy.importanceMains || "Structural reforms, inter-institutional autonomy, and policy governance."}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-5 flex flex-wrap gap-3 items-center">
                  <Link
                    href={`/current-affairs/${todayStudy.slug}`}
                    className="px-4 py-2 rounded-lg bg-blue-700 hover:bg-blue-600 text-white text-xs font-bold transition-all shadow flex items-center gap-1.5"
                  >
                    Read Full News Card & Explanations
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>

                  <Link
                    href="/daily-quiz"
                    className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow flex items-center gap-1.5"
                  >
                    <CheckCircle className="h-3.5 w-3.5" />
                    Attempt 5-Question Daily Quiz
                  </Link>
                </div>
              </div>
            ) : (
              <div className="p-4 text-xs text-slate-500">Today's study agenda is being synchronized.</div>
            )}
          </div>

          {/* QUESTION 2: WHAT IS IMPORTANT FOR UPSC & HOW HAS IT BEEN ASKED? */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700 font-black text-sm">
                2
              </span>
              <div>
                <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider block">
                  Historical Pattern & High-Yield Themes
                </span>
                <h2 className="text-xl font-bold text-slate-900">
                  What is important for UPSC, and how has it been asked in previous exams?
                </h2>
              </div>
            </div>

            <p className="text-xs text-slate-500 mb-4">
              Directly connected previous-year questions from our verified 1,085 question database testing the same fundamental principles:
            </p>

            <div className="space-y-4">
              {importantPyqs.map((q: any) => (
                <div
                  key={q.id}
                  className="bg-slate-50 rounded-xl p-4 sm:p-5 border border-slate-200 flex flex-col justify-between"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2 text-xs">
                    <span className="font-extrabold text-indigo-800 bg-indigo-100 px-2.5 py-0.5 rounded">
                      UPSC {q.year} • {q.paper} Question #{q.questionNumber}
                    </span>
                    <span className="text-xs text-slate-500 italic">
                      {q.rationale}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm font-semibold text-slate-800 whitespace-pre-line leading-relaxed mb-3">
                    {q.questionText}
                  </p>

                  <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                    <span className="text-[11px] text-slate-500">Official Series A Verified Answer Available</span>
                    <Link
                      href={`/pyqs`}
                      className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 hover:underline"
                    >
                      Practice in Learn Mode
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* QUESTION 3: WHAT SHOULD I REVISE NEXT? */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-100 text-amber-800 font-black text-sm">
                3
              </span>
              <div>
                <span className="text-xs font-bold text-amber-800 uppercase tracking-wider block">
                  Personalized Spaced-Repetition Algorithm
                </span>
                <h2 className="text-xl font-bold text-slate-900">
                  What should I revise next based on my mistakes and weak areas?
                </h2>
              </div>
            </div>

            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              {plan?.revisionNext?.instructions}
            </p>

            {revisionItems.length > 0 ? (
              <div className="space-y-3">
                {revisionItems.map((item: any) => (
                  <div
                    key={item.scheduleId}
                    className="p-4 rounded-xl bg-amber-50/50 border border-amber-200/70 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-amber-900 block mb-0.5">
                        UPSC {item.year} {item.paper} • Q#{item.questionNumber}
                      </span>
                      <p className="text-slate-700 line-clamp-1">{item.questionText}</p>
                    </div>

                    <Link
                      href="/revision"
                      className="px-3 py-1.5 rounded-lg bg-amber-700 hover:bg-amber-800 text-white font-bold shrink-0 ml-4 flex items-center gap-1"
                    >
                      <RotateCw className="h-3 w-3" /> Revise Now
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 rounded-xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-500">
                <CheckCircle className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
                <span className="font-bold text-slate-800 block text-sm">Zero Overdue Mistakes Today!</span>
                Attempt questions in the PYQ Explorer or Daily Quiz. Any missed questions will automatically queue here based on spaced repetition intervals.
              </div>
            )}

            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Current Due Items: <span className="font-bold text-slate-800">{plan?.revisionNext?.dueCount || 0}</span>
              </span>
              <Link
                href="/revision"
                className="text-xs font-bold text-blue-700 hover:underline flex items-center gap-1"
              >
                Go to Dedicated Revision Hub
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
