import React from "react";
import Link from "next/link";
import { Clock, ShieldAlert, Award, Play, CheckCircle2, AlertTriangle, BookOpen } from "lucide-react";

export const metadata = {
  title: "UPSC Prelims Exam Simulator | Pravaah UPSC",
  description: "Authentic UPSC Civil Services Examination simulator with timed countdown, negative marking, and question palette.",
};

export default function ExamSimulatorPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3.5 py-1 text-xs font-bold text-blue-700 mb-3">
            <Clock className="h-3.5 w-3.5 text-blue-600" />
            <span>Strict UPSC Civil Services Examination Environment</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            UPSC Prelims Exam Simulator
          </h1>
          <p className="mt-3 text-base text-slate-600 max-w-2xl mx-auto">
            Experience real UPSC CSE pressure. 120-minute timed countdown, automatic negative marking (-0.666 for GS1, -0.833 for CSAT), and zero answer leakage before final submission.
          </p>
        </div>

        {/* Paper Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          {/* GS Paper 1 */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between mb-4">
              <span className="rounded-full bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1">
                Paper 1 — General Studies
              </span>
              <span className="text-xs text-slate-500 font-semibold">100 Questions · 200 Marks</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900">UPSC CSE GS Paper 1 Simulation</h2>
            <p className="mt-2 text-sm text-slate-600">
              Covers Indian Polity, Modern History, Geography, Economics, Environment & Ecology, and Science & Technology.
            </p>
            <ul className="mt-4 space-y-2 text-xs text-slate-600">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>+2.0 marks for correct, -0.666 negative marking</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>120-minute countdown with warning at 15 minutes</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>Elimination technique insights revealed post-submission</span>
              </li>
            </ul>
            <div className="mt-6 flex items-center gap-3">
              <Link
                href="/prelims/pyqs?paper=GS1&view=exam"
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white hover:bg-blue-700 transition shadow-sm"
              >
                <Play className="h-4 w-4 fill-white" />
                <span>Start GS1 Simulation</span>
              </Link>
              <Link
                href="/mock-tests"
                className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                All Years
              </Link>
            </div>
          </div>

          {/* GS Paper 2 (CSAT) */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between mb-4">
              <span className="rounded-full bg-teal-100 text-teal-800 text-xs font-bold px-3 py-1">
                Paper 2 — CSAT Qualifying
              </span>
              <span className="text-xs text-slate-500 font-semibold">80 Questions · 200 Marks</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900">UPSC CSE CSAT Paper II Simulation</h2>
            <p className="mt-2 text-sm text-slate-600">
              Reading comprehension, logical reasoning, analytical ability, basic numeracy, and data interpretation.
            </p>
            <ul className="mt-4 space-y-2 text-xs text-slate-600">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-teal-600 shrink-0" />
                <span>+2.5 marks for correct, -0.833 negative marking</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-teal-600 shrink-0" />
                <span>33% (66/200) qualifying benchmark evaluation</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-teal-600 shrink-0" />
                <span>Passage-by-passage trap analysis post-exam</span>
              </li>
            </ul>
            <div className="mt-6 flex items-center gap-3">
              <Link
                href="/prelims/pyqs?paper=GS2&view=exam"
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-teal-700 px-4 py-3 text-sm font-bold text-white hover:bg-teal-800 transition shadow-sm"
              >
                <Play className="h-4 w-4 fill-white" />
                <span>Start CSAT Simulation</span>
              </Link>
              <Link
                href="/mock-tests"
                className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                All Years
              </Link>
            </div>
          </div>
        </div>

        {/* Exam Rules & Instructions */}
        <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-6">
          <div className="flex items-center gap-2 mb-3">
            <ShieldAlert className="h-5 w-5 text-amber-700" />
            <h3 className="text-sm font-bold text-amber-900">Official Exam Simulator Rules</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-700">
            <div className="bg-white/80 p-3.5 rounded-xl border border-amber-100">
              <span className="font-bold text-slate-900 block mb-1">1. Anti-Cheat & Answer Shield</span>
              Server-side response sanitization ensures official answers and explanations are impossible to view via DevTools until submission.
            </div>
            <div className="bg-white/80 p-3.5 rounded-xl border border-amber-100">
              <span className="font-bold text-slate-900 block mb-1">2. Auto-Submission on Timer</span>
              When the 120-minute countdown concludes, your session auto-saves and computes final marks and negative deduction.
            </div>
            <div className="bg-white/80 p-3.5 rounded-xl border border-amber-100">
              <span className="font-bold text-slate-900 block mb-1">3. Automated Mistake Notebook</span>
              All incorrect or skipped questions are automatically queued into your spaced repetition revision system.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
