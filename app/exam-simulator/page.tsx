import React from "react";
import Link from "next/link";
import { Clock, ShieldAlert, Award, Play, CheckCircle2, AlertTriangle, BookOpen } from "lucide-react";

export const metadata = {
  title: "UPSC Prelims Exam Simulator | Pravaah UPSC",
  description: "Authentic UPSC Civil Services Examination simulator with timed countdown, negative marking, and question palette.",
};

export default function ExamSimulatorPage() {
  return (
    <div className="min-h-screen bg-heritage-ivory py-10 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-heritage-gold/50 bg-heritage-cream px-3.5 py-1 text-xs font-bold text-heritage-burgundy mb-3 shadow-xs">
            <Clock className="h-3.5 w-3.5 text-heritage-gold" />
            <span>Strict UPSC Civil Services Examination Environment</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-heritage-text tracking-tight">
            UPSC Prelims Exam Simulator
          </h1>
          <p className="mt-3 text-base text-heritage-secondary max-w-2xl mx-auto leading-relaxed">
            Experience authentic UPSC CSE examination conditions. 120-minute timed countdown, automatic negative marking (-0.666 for GS1, -0.833 for CSAT), and zero answer leakage before final submission.
          </p>
        </div>

        {/* Paper Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          {/* GS Paper 1 */}
          <div className="rounded-2xl border border-heritage-border bg-white p-6 sm:p-7 shadow-card hover:shadow-hover transition">
            <div className="flex items-center justify-between mb-4">
              <span className="rounded-full bg-heritage-burgundy/10 text-heritage-burgundy text-xs font-bold px-3 py-1 border border-heritage-burgundy/20">
                Paper 1 — General Studies
              </span>
              <span className="text-xs text-heritage-secondary font-semibold">100 Questions · 200 Marks</span>
            </div>
            <h2 className="font-serif text-xl font-bold text-heritage-text">UPSC CSE GS Paper 1 Simulation</h2>
            <p className="mt-2 text-sm text-heritage-secondary leading-relaxed">
              Covers Indian Polity, Modern History, Geography, Economics, Environment & Ecology, and Science & Technology.
            </p>
            <ul className="mt-4 space-y-2 text-xs text-heritage-text">
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
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-heritage-burgundy px-4 py-3 text-sm font-bold text-white hover:bg-heritage-wine transition shadow-xs"
              >
                <Play className="h-4 w-4 fill-white" />
                <span>Start GS1 Simulation</span>
              </Link>
              <Link
                href="/mock-tests"
                className="rounded-xl border border-heritage-border bg-white px-4 py-3 text-sm font-semibold text-heritage-text hover:bg-heritage-ivory transition"
              >
                All Years
              </Link>
            </div>
          </div>

          {/* GS Paper 2 (CSAT) */}
          <div className="rounded-2xl border border-heritage-border bg-white p-6 sm:p-7 shadow-card hover:shadow-hover transition">
            <div className="flex items-center justify-between mb-4">
              <span className="rounded-full bg-heritage-saffron/10 text-heritage-saffron text-xs font-bold px-3 py-1 border border-heritage-saffron/30">
                Paper 2 — CSAT Qualifying
              </span>
              <span className="text-xs text-heritage-secondary font-semibold">80 Questions · 200 Marks</span>
            </div>
            <h2 className="font-serif text-xl font-bold text-heritage-text">UPSC CSE CSAT Paper II Simulation</h2>
            <p className="mt-2 text-sm text-heritage-secondary leading-relaxed">
              Reading comprehension, logical reasoning, analytical ability, basic numeracy, and data interpretation.
            </p>
            <ul className="mt-4 space-y-2 text-xs text-heritage-text">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-heritage-saffron shrink-0" />
                <span>+2.5 marks for correct, -0.833 negative marking</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-heritage-saffron shrink-0" />
                <span>33% (66/200) qualifying benchmark evaluation</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-heritage-saffron shrink-0" />
                <span>Passage-by-passage trap analysis post-exam</span>
              </li>
            </ul>
            <div className="mt-6 flex items-center gap-3">
              <Link
                href="/prelims/pyqs?paper=GS2&view=exam"
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-heritage-saffron px-4 py-3 text-sm font-bold text-white hover:bg-heritage-saffron/90 transition shadow-xs"
              >
                <Play className="h-4 w-4 fill-white" />
                <span>Start CSAT Simulation</span>
              </Link>
              <Link
                href="/mock-tests"
                className="rounded-xl border border-heritage-border bg-white px-4 py-3 text-sm font-semibold text-heritage-text hover:bg-heritage-ivory transition"
              >
                All Years
              </Link>
            </div>
          </div>
        </div>

        {/* Information Callout */}
        <div className="rounded-2xl border border-heritage-gold/40 bg-heritage-cream/70 p-6 shadow-xs">
          <div className="flex items-start gap-3">
            <ShieldAlert className="h-5 w-5 text-heritage-gold shrink-0 mt-0.5" />
            <div>
              <h3 className="font-serif text-sm font-bold text-heritage-burgundy">Academic Anti-Leak Integrity</h3>
              <p className="mt-1 text-xs text-heritage-secondary leading-relaxed">
                All mock test answers, difficulty ratings, and pedagogical explanations are validated against official UPSC Master Question Paper series and published answer keys. Questions and explanations are securely withheld until final test submission to preserve examination integrity.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
