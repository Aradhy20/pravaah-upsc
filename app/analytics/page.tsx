"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  BarChart2,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  HelpCircle,
  Layers,
  Sparkles,
  ShieldCheck,
  RotateCw,
  BookOpen,
  PieChart,
} from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useLanguage } from "@/lib/i18n/context";

export default function PrelimsReadinessAnalyticsPage() {
  const { language } = useLanguage();
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/v1/mission-control");
      const json = await res.json();
      if (res.ok && json.success) {
        setData(json.data);
      } else {
        setError(json.error || "Failed to load readiness analytics.");
      }
    } catch (e: any) {
      console.error("Analytics fetch error:", e);
      setError("Network error connecting to analytics engine.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const readiness = data?.examReadiness;
  const breakdown = readiness?.breakdown;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Hero Header */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 rounded-3xl p-6 sm:p-10 text-white shadow-sm mb-8 relative overflow-hidden">
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold mb-4 border border-blue-400/20">
              <TrendingUp className="h-3.5 w-3.5" />
              {language === "hi" ? "पारदर्शी परीक्षा तत्परता विश्लेषण" : "Transparent Prelims Readiness Engine"}
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              {language === "hi" ? (
                <>प्रारंभिक परीक्षा <span className="text-blue-400">तत्परता विश्लेषण</span></>
              ) : (
                <>Prelims Readiness & <span className="text-blue-400">Diagnostic Analytics</span></>
              )}
            </h1>
            <p className="mt-3 text-slate-300 text-xs sm:text-sm leading-relaxed">
              {language === "hi"
                ? "सामान्य अध्ययन पेपर-1 सटीकता, सीएसएटी 33% अर्हक मार्जिन, पाठ्यक्रम कवरेज और एसएम-2 दोहराव निरंतरता पर आधारित पारदर्शी सांख्यिकीय सूचकांक। कोई काल्पनिक रैंक भविष्यवाणी या चयन का झूठा दावा नहीं।"
                : "Transparent analytical telemetry evaluating your General Studies accuracy, CSAT 33% qualifying safety margin, micro-topic syllabus coverage, and SM-2 spaced repetition consistency. Built strictly from authentic student attempt records."}
            </p>
          </div>
        </div>

        {/* Anti-Hallucination Disclaimer Banner */}
        <div className="p-4 bg-blue-50/80 rounded-2xl border border-blue-200 text-xs text-blue-950 mb-8 flex items-start gap-3 shadow-xs">
          <ShieldCheck className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold block uppercase tracking-wider text-[11px] text-blue-800">
              Zero Delusion Mathematical Philosophy
            </span>
            <p className="leading-relaxed text-blue-900">
              Pravaah UPSC strictly rejects spurious "rank predictors" or "guaranteed selection" claims. The Exam Readiness Index is an objective meta-cognitive metric calibrated on: <strong>35% GS1 Accuracy</strong> + <strong>25% CSAT Score Alignment</strong> (normalized to 66 qualifying benchmark) + <strong>20% Syllabus Coverage</strong> + <strong>20% SM-2 Revision Consistency</strong>.
            </p>
          </div>
        </div>

        {/* 4 Pillars Readiness Scorecards */}
        {loading ? (
          <div className="py-20 text-center text-xs text-slate-400">Calculating readiness metrics...</div>
        ) : error ? (
          <div className="p-6 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 text-center">
            {error}
          </div>
        ) : (
          <div className="space-y-8">
            {/* Master Index Card */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="max-w-xl">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Comprehensive Indicator
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                  Exam Readiness Index: <span className="text-blue-700">{readiness?.index || 0} / 100</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Status: <strong>{readiness?.label || "Calibrating"}</strong> ({readiness?.status}).
                  Calculated from your verified attempts, accuracy splits, and due revision schedules.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Link
                  href="/mission-control"
                  className="px-4 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold transition shadow"
                >
                  Open Mission Control →
                </Link>
                <Link
                  href="/csat-coach"
                  className="px-4 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold transition shadow"
                >
                  CSAT Coach →
                </Link>
              </div>
            </div>

            {/* 4 Dimension Weights Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* GS1 Accuracy */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-bold text-slate-700">GS Paper I Accuracy</span>
                  <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">35% Weight</span>
                </div>
                <div className="text-2xl font-black text-slate-900 mb-1">
                  {breakdown?.gsPaper1Accuracy || 0}%
                </div>
                <p className="text-[11px] text-slate-500 leading-snug">
                  Target: 70%+ net accuracy after negative marking (-0.666 per incorrect).
                </p>
              </div>

              {/* CSAT Benchmark */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-bold text-slate-700">CSAT Score Alignment</span>
                  <span className="font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded">25% Weight</span>
                </div>
                <div className="text-2xl font-black text-slate-900 mb-1">
                  {breakdown?.csatQualifyingMargin || 0} / 66.0
                </div>
                <p className="text-[11px] text-slate-500 leading-snug">
                  Official 33% qualifying benchmark. Score must exceed 66.0 marks.
                </p>
              </div>

              {/* Syllabus Coverage */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-bold text-slate-700">Syllabus Coverage</span>
                  <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">20% Weight</span>
                </div>
                <div className="text-2xl font-black text-slate-900 mb-1">
                  {breakdown?.syllabusCoveragePct || 0}%
                </div>
                <p className="text-[11px] text-slate-500 leading-snug">
                  Proportion of micro-topics marked as Practised or Mastered.
                </p>
              </div>

              {/* Revision Consistency */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-bold text-slate-700">SM-2 Consistency</span>
                  <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">20% Weight</span>
                </div>
                <div className="text-2xl font-black text-slate-900 mb-1">
                  {breakdown?.revisionConsistencyPct || 0}%
                </div>
                <p className="text-[11px] text-slate-500 leading-snug">
                  Ratio of scheduled mistake repetitions cleared on time.
                </p>
              </div>
            </div>

            {/* Subject-Wise Performance Table */}
            {data?.subjectPerformance && (
              <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
                <h3 className="text-base font-bold text-slate-900 mb-4">
                  Subject-Wise Diagnostic Performance
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-700">
                    <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                      <tr>
                        <th className="py-3 px-4">Subject Pillar</th>
                        <th className="py-3 px-4">Paper</th>
                        <th className="py-3 px-4">Attempts</th>
                        <th className="py-3 px-4">Correct</th>
                        <th className="py-3 px-4">Accuracy</th>
                        <th className="py-3 px-4">Diagnostic Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {data.subjectPerformance.map((sub: any, idx: number) => (
                        <tr key={idx} className="hover:bg-slate-50/60">
                          <td className="py-3 px-4 font-bold text-slate-900">{sub.subject}</td>
                          <td className="py-3 px-4">
                            <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600 font-semibold">
                              {sub.paperCode}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-mono">{sub.attempted}</td>
                          <td className="py-3 px-4 font-mono text-emerald-700 font-bold">{sub.correct}</td>
                          <td className="py-3 px-4 font-mono font-bold">
                            {sub.accuracy}%
                          </td>
                          <td className="py-3 px-4">
                            {sub.accuracy >= 70 ? (
                              <span className="text-emerald-700 font-bold">Strong</span>
                            ) : sub.accuracy >= 50 ? (
                              <span className="text-amber-700 font-bold">Progressing</span>
                            ) : (
                              <span className="text-rose-600 font-bold">Friction Area</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
