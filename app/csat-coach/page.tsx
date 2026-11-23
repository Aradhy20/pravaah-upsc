"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Compass,
  CheckCircle,
  Clock,
  AlertTriangle,
  Award,
  ArrowRight,
  ShieldCheck,
  Zap,
  BarChart2,
  RefreshCw,
  BookOpen,
} from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useLanguage } from "@/lib/i18n/context";

export default function CSATCoachPage() {
  const { t, language } = useLanguage();
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchCoachData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/csat/coach");
      const json = await res.json();
      if (json.success) {
        setData(json.data);
      }
    } catch (err) {
      console.error("Failed to load CSAT coach data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoachData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-heritage-ivory flex flex-col font-sans text-heritage-dark">
        <Header />
        <div className="flex-1 flex items-center justify-center py-20">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-heritage-burgundy" />
            <p className="mt-3 text-sm font-semibold text-heritage-muted">
              {language === "hi"
                ? "सीसैट सर्वाइवल कोच लोड हो रहा है..."
                : "Calibrating CSAT Survival Coach Metrics..."}
            </p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const d = data || {};
  const rules = d.qualifyingRules || {};
  const perf = d.userPerformance || {};
  const pillars = d.pillars || [];
  const sets = d.curatedPracticeSets || [];

  const isSafe = perf.estimatedScore >= 66;

  return (
    <div className="min-h-screen bg-heritage-ivory flex flex-col font-sans text-heritage-dark">
      <Header />

      {/* Top Banner */}
      <div className="border-b border-heritage-border bg-white shadow-xs">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-heritage-cream px-2.5 py-0.5 text-[11px] font-black uppercase text-heritage-burgundy border border-heritage-border">
                  UPSC CSE Paper II
                </span>
                <span className="text-xs text-heritage-muted">• Mandatory 33% Benchmark</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-serif font-black text-heritage-dark mt-1 tracking-tight">
                {language === "hi" ? "समर्पित सीसैट सर्वाइवल कोच" : "Dedicated CSAT Survival Coach"}
              </h1>
              <p className="text-sm text-heritage-muted mt-1 max-w-2xl leading-relaxed">
                {language === "hi"
                  ? "सीसैट में असफलता जीएस पेपर 1 के अंकों को निरस्त कर देती है। समय प्रबंधन, सटीकता और 66-अंक की सीमा को सुरक्षित करें।"
                  : "A single deficit in CSAT disqualifies GS Paper 1. Master quant speed, logical consistency, and reading comprehension under authentic +2.5 / -0.833 marking."}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/mission-control"
                className="rounded-xl border border-heritage-border bg-heritage-ivory px-4 py-2 text-xs font-bold text-heritage-dark hover:bg-white transition shadow-xs"
              >
                {language === "hi" ? "मिशन कंट्रोल →" : "Mission Control →"}
              </Link>
            </div>
          </div>
        </div>
      </div>

      <main className="flex-1 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 w-full">
        {/* Critical Cutoff Warning Alert if below cutoff */}
        {perf.warningMessage && (
          <div className={`rounded-3xl border p-5 flex items-start gap-3.5 shadow-xs ${
            isSafe ? "bg-amber-50/80 border-amber-300 text-amber-900" : "bg-rose-50 border-rose-300 text-rose-900"
          }`}>
            <AlertTriangle className={`h-5 w-5 shrink-0 mt-0.5 ${isSafe ? "text-amber-600" : "text-rose-600"}`} />
            <div>
              <h3 className="text-sm font-bold">{isSafe ? "Qualifying Buffer Advisory" : "Urgent CSAT Qualifying Alert"}</h3>
              <p className="text-xs mt-1 leading-relaxed">{perf.warningMessage}</p>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* ROW 1: QUALIFYING GAUGE & TIME TELEMETRY */}
        {/* ========================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Qualifying Score Status (7 Cols) */}
          <div className="lg:col-span-7 rounded-3xl border border-heritage-border bg-white p-6 sm:p-8 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-heritage-border">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-heritage-cream text-heritage-burgundy border border-heritage-border">
                    <Award className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-serif font-bold text-heritage-dark">
                      {language === "hi" ? "क्वालिफाइंग स्कोर स्थिति" : "Qualifying Threshold Telemetry"}
                    </h3>
                    <p className="text-[11px] text-heritage-muted font-mono">
                      Official UPSC Rule: Minimum 33% (66 / 200 Marks)
                    </p>
                  </div>
                </div>

                <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase font-serif ${
                  isSafe ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                }`}>
                  {perf.qualifyingStatus?.replace("_", " ")}
                </span>
              </div>

              {/* Score Display */}
              <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-heritage-muted">Projected Score</span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-4xl font-serif font-black text-heritage-dark">{perf.estimatedScore}</span>
                    <span className="text-sm font-bold text-heritage-muted">/ 200 Marks</span>
                  </div>
                </div>

                <div className="text-sm space-y-1 sm:text-right">
                  <p className="text-heritage-muted">Accuracy: <strong className="text-heritage-dark font-serif">{perf.overallAccuracy}%</strong></p>
                  <p className="text-heritage-muted">Attempts: <strong className="text-heritage-dark font-serif">{perf.totalAttempted}</strong> ({perf.correctCount} correct)</p>
                </div>
              </div>

              {/* Progress Bar with 33% marker */}
              <div className="mt-6">
                <div className="relative h-5 w-full rounded-full bg-heritage-ivory overflow-hidden border border-heritage-border">
                  <div
                    className={`h-full transition-all duration-500 ${isSafe ? "bg-emerald-600" : "bg-rose-600"}`}
                    style={{ width: `${Math.min(100, (perf.estimatedScore / 200) * 100)}%` }}
                  />
                  {/* 33% Cutoff line */}
                  <div
                    className="absolute top-0 bottom-0 w-1 bg-heritage-dark z-10"
                    style={{ left: "33%" }}
                    title="33% (66 Marks) Mandatory Cutoff"
                  />
                </div>
                <div className="flex justify-between text-[11px] font-bold text-heritage-muted mt-1.5 font-mono">
                  <span>0 Marks</span>
                  <span className="text-heritage-dark font-black">▲ 66 Marks (33% Cutoff)</span>
                  <span>200 Marks</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-heritage-border text-xs text-heritage-muted leading-relaxed">
              <strong className="text-heritage-dark">Official Marking Scheme:</strong> +2.5 marks per correct answer, -0.833 marks per incorrect answer. Exactly 80 questions in the paper.
            </div>
          </div>

          {/* Time Management & Pacing Telemetry (5 Cols) */}
          <div className="lg:col-span-5 rounded-3xl border border-heritage-border bg-white p-6 sm:p-8 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2.5 pb-4 border-b border-heritage-border">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-heritage-cream text-heritage-gold border border-heritage-border">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-serif font-bold text-heritage-dark">
                    {language === "hi" ? "समय प्रबंधन और गति" : "Time Management & Pacing"}
                  </h3>
                  <p className="text-[11px] text-heritage-muted font-mono">
                    Benchmark: 90 Seconds Per Question
                  </p>
                </div>
              </div>

              <div className="my-6 text-center">
                <div className="inline-flex flex-col items-center justify-center h-28 w-28 rounded-full border-4 border-heritage-burgundy bg-heritage-ivory">
                  <span className="text-3xl font-serif font-black text-heritage-dark leading-none">
                    {perf.avgTimePerQuestionSeconds}s
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-heritage-muted mt-1">
                    Avg / Question
                  </span>
                </div>
                <p className="mt-3 text-xs font-bold text-heritage-dark">
                  {perf.avgTimePerQuestionSeconds <= 90
                    ? "✓ Healthy Exam Pace (Under 90s)"
                    : "⚠️ Pacing Alert (Exceeding 90s average)"}
                </p>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-heritage-muted">
                  <span>Total Exam Duration:</span>
                  <strong className="text-heritage-dark">120 Minutes (2 Hours)</strong>
                </div>
                <div className="flex justify-between text-heritage-muted">
                  <span>Target Attempts for Safe 80+:</span>
                  <strong className="text-heritage-dark">40–45 Questions at 80% Acc</strong>
                </div>
              </div>
            </div>

            <div className="mt-5 rounded-xl bg-heritage-ivory p-3 text-[10px] text-heritage-muted border border-heritage-border">
              <strong className="text-heritage-dark">Golden Rule:</strong> Never attempt uncertain CSAT quant questions under time pressure. Negative marks (-0.833) rapidly erode qualifying safety.
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* ROW 2: THE 3 CORE CSAT PILLARS */}
        {/* ========================================================= */}
        <div>
          <h2 className="text-lg font-serif font-black text-heritage-dark mb-4">
            {language === "hi" ? "सीसैट के 3 मुख्य स्तंभ" : "The 3 Core CSAT Pillars"}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {pillars.map((pillar: any, idx: number) => (
              <div
                key={idx}
                className="rounded-3xl border border-heritage-border bg-white p-6 shadow-xs flex flex-col justify-between hover:border-heritage-gold hover:shadow-md transition"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="rounded-md bg-heritage-cream px-2 py-0.5 text-[10px] font-bold uppercase text-heritage-burgundy border border-heritage-border">
                      Pillar {idx + 1}
                    </span>
                    <span className="text-xs font-mono font-bold text-heritage-muted">
                      {pillar.availableQuestions} Verified Qs
                    </span>
                  </div>

                  <h3 className="text-base font-serif font-bold text-heritage-dark mt-2">{pillar.name}</h3>

                  <div className="my-4 flex items-baseline gap-2">
                    <span className="text-2xl font-serif font-black text-heritage-dark">{pillar.accuracy}%</span>
                    <span className="text-xs text-heritage-muted">accuracy ({pillar.attempted} attempted)</span>
                  </div>

                  <p className="text-xs text-heritage-muted leading-relaxed">
                    {pillar.recommendedTarget}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-heritage-border">
                  <Link
                    href={`/prelims/pyqs?paper=GS2&q=${encodeURIComponent(pillar.name.split(" ")[0])}`}
                    className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-heritage-ivory border border-heritage-border py-2 text-xs font-bold text-heritage-burgundy hover:bg-heritage-cream transition"
                  >
                    <span>Practice {pillar.name.split(" ")[0]} Drill</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ========================================================= */}
        {/* ROW 3: CURATED PRACTICE SETS */}
        {/* ========================================================= */}
        <div className="rounded-3xl border border-heritage-border bg-white p-6 sm:p-8 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-heritage-border">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-heritage-gold">
                Targeted Practice
              </span>
              <h2 className="text-lg sm:text-xl font-serif font-black text-heritage-dark mt-0.5">
                Curated CSAT Speed & Precision Challenges
              </h2>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            {sets.map((s: any) => (
              <div
                key={s.id}
                className="flex flex-col justify-between rounded-2xl bg-heritage-ivory border border-heritage-border p-5 hover:border-heritage-gold transition shadow-xs"
              >
                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-heritage-muted">
                    <span>{s.questionCount} Questions</span>
                    <span className="rounded bg-heritage-cream text-heritage-burgundy px-1.5 py-0.5 uppercase text-[10px] font-mono border border-heritage-border">
                      {s.paperCode}
                    </span>
                  </div>
                  <h4 className="text-sm font-serif font-bold text-heritage-dark mt-2">{s.title}</h4>
                  <p className="text-xs text-heritage-muted mt-1 leading-relaxed">{s.description}</p>
                </div>

                <Link
                  href={s.actionUrl}
                  className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-heritage-burgundy hover:text-heritage-wine hover:underline"
                >
                  <span>Launch Practice Challenge</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
