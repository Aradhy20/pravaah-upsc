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
import { useLanguage } from "@/lib/i18n/context";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

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
      <div className="min-h-screen bg-[#F7F9FC] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600" />
          <p className="mt-3 text-sm font-semibold text-[#475467]">
            {language === "hi"
              ? "सीसैट सर्वाइवल कोच लोड हो रहा है..."
              : "Calibrating CSAT Survival Coach Metrics..."}
          </p>
        </div>
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
    <div className="min-h-screen bg-[#F7F9FC] font-sans text-[#101828]">
      {/* Top Banner */}
      <div className="border-b border-[#E4E7EC] bg-white">
        <div className="mx-auto max-w-[1280px] px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-purple-100 px-2.5 py-0.5 text-[11px] font-black uppercase text-purple-700">
                  UPSC CSE Paper II
                </span>
                <span className="text-xs text-[#667085]">• Mandatory 33% Benchmark</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-[#101828] mt-1 tracking-tight">
                {language === "hi" ? "समर्पित सीसैट सर्वाइवल कोच" : "Dedicated CSAT Survival Coach"}
              </h1>
              <p className="text-sm text-[#475467] mt-1 max-w-2xl">
                {language === "hi"
                  ? "सीसैट में असफलता जीएस पेपर 1 के अंकों को निरस्त कर देती है। समय प्रबंधन, सटीकता और 66-अंक की सीमा को सुरक्षित करें।"
                  : "A single deficit in CSAT disqualifies GS Paper 1. Master quant speed, logical consistency, and reading comprehension under authentic +2.5 / -0.833 marking."}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <LanguageSwitcher />
              <Link
                href="/mission-control"
                className="rounded-xl border border-[#E4E7EC] bg-white px-4 py-2 text-xs font-bold text-[#475467] hover:bg-[#F7F9FC] transition shadow-xs"
              >
                {language === "hi" ? "मिशन कंट्रोल →" : "Mission Control →"}
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1280px] px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        {/* Critical Cutoff Warning Alert if below cutoff */}
        {perf.warningMessage && (
          <div className={`rounded-3xl border p-5 flex items-start gap-3.5 shadow-xs ${
            isSafe ? "bg-amber-50/80 border-amber-300 text-amber-900" : "bg-rose-50 border-rose-300 text-rose-900"
          }`}>
            <AlertTriangle className={`h-5 w-5 shrink-0 mt-0.5 ${isSafe ? "text-amber-600" : "text-rose-600"}`} />
            <div>
              <h3 className="text-sm font-black">{isSafe ? "Qualifying Buffer Advisory" : "Urgent CSAT Qualifying Alert"}</h3>
              <p className="text-xs mt-1 leading-relaxed">{perf.warningMessage}</p>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* ROW 1: QUALIFYING GAUGE & TIME TELEMETRY */}
        {/* ========================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Qualifying Score Status (7 Cols) */}
          <div className="lg:col-span-7 rounded-3xl border border-[#E4E7EC] bg-white p-6 sm:p-8 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-[#E4E7EC]">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-purple-700">
                    <Award className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#101828]">
                      {language === "hi" ? "क्वालिफाइंग स्कोर स्थिति" : "Qualifying Threshold Telemetry"}
                    </h3>
                    <p className="text-[11px] text-[#667085]">
                      Official UPSC Rule: Minimum 33% (66 / 200 Marks)
                    </p>
                  </div>
                </div>

                <span className={`rounded-full px-3 py-1 text-xs font-black uppercase ${
                  isSafe ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                }`}>
                  {perf.qualifyingStatus.replace("_", " ")}
                </span>
              </div>

              {/* Score Display */}
              <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#667085]">Projected Score</span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-4xl font-black text-[#101828]">{perf.estimatedScore}</span>
                    <span className="text-sm font-bold text-[#667085]">/ 200 Marks</span>
                  </div>
                </div>

                <div className="text-sm space-y-1 sm:text-right">
                  <p className="text-[#667085]">Accuracy: <strong className="text-[#101828]">{perf.overallAccuracy}%</strong></p>
                  <p className="text-[#667085]">Attempts: <strong className="text-[#101828]">{perf.totalAttempted}</strong> ({perf.correctCount} correct)</p>
                </div>
              </div>

              {/* Progress Bar with 33% marker */}
              <div className="mt-6">
                <div className="relative h-5 w-full rounded-full bg-slate-100 overflow-hidden border border-[#E4E7EC]">
                  <div
                    className={`h-full transition-all duration-500 ${isSafe ? "bg-emerald-500" : "bg-rose-500"}`}
                    style={{ width: `${Math.min(100, (perf.estimatedScore / 200) * 100)}%` }}
                  />
                  {/* 33% Cutoff line */}
                  <div
                    className="absolute top-0 bottom-0 w-1 bg-black z-10"
                    style={{ left: "33%" }}
                    title="33% (66 Marks) Mandatory Cutoff"
                  />
                </div>
                <div className="flex justify-between text-[11px] font-bold text-[#667085] mt-1.5">
                  <span>0 Marks</span>
                  <span className="text-black font-black">▲ 66 Marks (33% Cutoff)</span>
                  <span>200 Marks</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[#E4E7EC] text-xs text-[#667085] leading-relaxed">
              <strong>Official Marking Scheme:</strong> +2.5 marks per correct answer, -0.833 marks per incorrect answer. Exactly 80 questions in the paper.
            </div>
          </div>

          {/* Time Management & Pacing Telemetry (5 Cols) */}
          <div className="lg:col-span-5 rounded-3xl border border-[#E4E7EC] bg-white p-6 sm:p-8 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2.5 pb-4 border-b border-[#E4E7EC]">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-[#2453E6]">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#101828]">
                    {language === "hi" ? "समय प्रबंधन और गति" : "Time Management & Pacing"}
                  </h3>
                  <p className="text-[11px] text-[#667085]">
                    Benchmark: 90 Seconds Per Question
                  </p>
                </div>
              </div>

              <div className="my-6 text-center">
                <div className="inline-flex flex-col items-center justify-center h-28 w-28 rounded-full border-4 border-[#2453E6] bg-blue-50/50">
                  <span className="text-3xl font-black text-[#101828] leading-none">
                    {perf.avgTimePerQuestionSeconds}s
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#667085] mt-1">
                    Avg / Question
                  </span>
                </div>
                <p className="mt-3 text-xs font-bold text-[#101828]">
                  {perf.avgTimePerQuestionSeconds <= 90
                    ? "✓ Healthy Exam Pace (Under 90s)"
                    : "⚠️ Pacing Alert (Exceeding 90s average)"}
                </p>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-[#667085]">
                  <span>Total Exam Duration:</span>
                  <strong className="text-[#101828]">120 Minutes (2 Hours)</strong>
                </div>
                <div className="flex justify-between text-[#667085]">
                  <span>Target Attempts for Safe 80+:</span>
                  <strong className="text-[#101828]">40–45 Questions at 80% Acc</strong>
                </div>
              </div>
            </div>

            <div className="mt-5 rounded-xl bg-[#F7F9FC] p-3 text-[10px] text-[#667085] border border-[#E4E7EC]">
              <strong>Golden Rule:</strong> Never attempt uncertain CSAT quant questions under time pressure. Negative marks (-0.833) rapidly erode qualifying safety.
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* ROW 2: THE 3 CORE CSAT PILLARS */}
        {/* ========================================================= */}
        <div>
          <h2 className="text-lg font-black text-[#101828] mb-4">
            {language === "hi" ? "सीसैट के 3 मुख्य स्तंभ" : "The 3 Core CSAT Pillars"}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {pillars.map((pillar: any, idx: number) => (
              <div
                key={idx}
                className="rounded-3xl border border-[#E4E7EC] bg-white p-6 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="rounded-md bg-purple-50 px-2 py-0.5 text-[10px] font-black uppercase text-purple-700">
                      Pillar {idx + 1}
                    </span>
                    <span className="text-xs font-bold text-[#667085]">
                      {pillar.availableQuestions} Verified Qs
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-[#101828] mt-2">{pillar.name}</h3>

                  <div className="my-4 flex items-baseline gap-2">
                    <span className="text-2xl font-black text-[#101828]">{pillar.accuracy}%</span>
                    <span className="text-xs text-[#667085]">accuracy ({pillar.attempted} attempted)</span>
                  </div>

                  <p className="text-xs text-[#475467] leading-relaxed">
                    {pillar.recommendedTarget}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-[#E4E7EC]">
                  <Link
                    href={`/pyqs?paper=GS2&q=${encodeURIComponent(pillar.name.split(" ")[0])}`}
                    className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-[#F7F9FC] border border-[#E4E7EC] py-2 text-xs font-bold text-[#2453E6] hover:bg-blue-50 transition"
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
        <div className="rounded-3xl border border-[#E4E7EC] bg-white p-6 sm:p-8 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-[#E4E7EC]">
            <div>
              <span className="text-[11px] font-black uppercase tracking-wider text-purple-700">
                Targeted Practice
              </span>
              <h2 className="text-lg sm:text-xl font-black text-[#101828] mt-0.5">
                Curated CSAT Speed & Precision Challenges
              </h2>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            {sets.map((s: any) => (
              <div
                key={s.id}
                className="flex flex-col justify-between rounded-2xl bg-[#F7F9FC] border border-[#E4E7EC] p-5 hover:border-purple-300 transition"
              >
                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-[#667085]">
                    <span>{s.questionCount} Questions</span>
                    <span className="rounded bg-purple-100 text-purple-800 px-1.5 py-0.2 uppercase text-[10px]">
                      {s.paperCode}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-[#101828] mt-2">{s.title}</h4>
                  <p className="text-xs text-[#667085] mt-1 leading-relaxed">{s.description}</p>
                </div>

                <Link
                  href={s.actionUrl}
                  className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-purple-700 hover:underline"
                >
                  <span>Launch Practice Challenge</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
