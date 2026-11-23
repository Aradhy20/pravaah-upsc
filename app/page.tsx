"use client";

import React, { useState } from "react";
import {
  Compass,
  Layers,
  Clock,
  Sparkles,
  Search,
  CheckCircle,
  TrendingUp,
  BrainCircuit,
  ArrowRight,
  ShieldCheck,
  BookOpen,
  RotateCcw,
  Zap,
  Award,
  Lock,
  ChevronRight,
  HelpCircle,
  BarChart2,
  Sliders,
  Check,
  X,
  GraduationCap,
  FileCheck2,
  Target,
} from "lucide-react";

export default function HomePage() {
  const [interactiveOption, setInteractiveOption] = useState<string | null>(null);
  const [showInteractiveExplanation, setShowInteractiveExplanation] = useState(false);
  const [pricingInterval, setPricingInterval] = useState<"MONTHLY" | "ANNUAL">("ANNUAL");

  const popularKeywords = [
    "Fundamental Rights",
    "Monetary Policy Committee",
    "Indian Ocean Dipole",
    "Swamp Deer (Barasingha)",
    "Lagrange Point (L1)",
    "Mitakshara and Dayabhaga",
  ];

  const comparisonData = [
    {
      feature: "Answer Key Accuracy",
      coaching: "Conflicting, unofficial keys with 8-12 disputed questions yearly",
      pravaah: "100% Verified against official UPSC Series A Master Keys with statement evidence",
    },
    {
      feature: "Mistake Retention (Revise)",
      coaching: "Manual physical notebook; easily forgotten after 2 weeks",
      pravaah: "Automated SuperMemo-2 spaced repetition queue on Day 1, 3, and 7",
    },
    {
      feature: "Current Affairs Integration",
      coaching: "Bloated 150-page monthly magazine dumps",
      pravaah: "Daily official PIB & Ministry briefs linked directly to historical PYQs",
    },
    {
      feature: "Mains Answer Evaluation",
      coaching: "Turnaround time of 10-15 days from coaching institutes",
      pravaah: "Instant AI dimensional scoring (Intro, Multi-body, Articles, Way Forward)",
    },
    {
      feature: "Examination Simulator",
      coaching: "Unformatted Google forms or slow offline test centers",
      pravaah: "Full 2-hour anti-leak simulation with live negative marking (-0.66)",
    },
  ];

  const subjectCards = [
    {
      title: "Polity & Governance",
      desc: "Constitutional articles, Parliament, Executive, Judiciary & Statutory bodies.",
      tag: "15-18 Qs / yr",
      color: "border-blue-200 bg-blue-50/40 text-blue-900",
    },
    {
      title: "Economy & Development",
      desc: "Monetary policy, fiscal deficits, banking, external trade & national accounts.",
      tag: "14-16 Qs / yr",
      color: "border-emerald-200 bg-emerald-50/40 text-emerald-900",
    },
    {
      title: "Environment & Ecology",
      desc: "Protected area network, national parks, Ramsar sites, climate conventions.",
      tag: "16-20 Qs / yr",
      color: "border-teal-200 bg-teal-50/40 text-teal-900",
    },
    {
      title: "History & Art & Culture",
      desc: "Ancient sites, temple architecture, freedom struggle & social movements.",
      tag: "14-16 Qs / yr",
      color: "border-amber-200 bg-amber-50/40 text-amber-900",
    },
    {
      title: "Geography & Agriculture",
      desc: "Physical systems, rivers, monsoon circulation & cropping patterns.",
      tag: "10-12 Qs / yr",
      color: "border-indigo-200 bg-indigo-50/40 text-indigo-900",
    },
    {
      title: "CSAT Aptitude & Logic",
      desc: "Number systems, syllogisms, permutations & reading comprehension.",
      tag: "80 Qs (Qualifying)",
      color: "border-purple-200 bg-purple-50/40 text-purple-900",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* 1. Hero Section: Split 2-Column with Prominent Visual Trust Asset Above the Fold */}
      <section className="relative overflow-hidden border-b border-slate-200 bg-gradient-to-b from-slate-50 via-white to-white px-4 pt-8 pb-14 sm:px-6 sm:pt-12 sm:pb-20">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
            
            {/* Left Column: Core Value Proposition, Search Bar, CTAs */}
            <div className="lg:col-span-7 text-left">
              {/* Trust Pill */}
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50/90 px-3.5 py-1 text-xs font-bold text-blue-700 mb-4 shadow-xs">
                <Sparkles className="h-3.5 w-3.5 text-blue-600" />
                <span>High-Fidelity UPSC CSE Prelims PYQ Learning Platform</span>
              </div>

              {/* Core Headline */}
              <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 leading-[1.15]">
                Find the PYQ. Understand the concept.{" "}
                <span className="text-blue-700">Learn from every mistake.</span>
              </h1>

              {/* Subtitle */}
              <p className="mt-4 text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
                No bloated paywalls or unverified coaching keys. Master{" "}
                <span className="font-bold text-slate-900">officially verified</span> UPSC General Studies & CSAT questions (1995–2024 Series A) with statement-by-statement evidence, timed exam simulation, NCERT chapter links, and automated spaced mistake revision.
              </p>

              {/* Prominent PYQ Search Box */}
              <div className="mt-6">
                <form
                  action="/pyqs"
                  method="GET"
                  className="flex items-center rounded-2xl border-2 border-slate-300 bg-white p-1.5 shadow-sm transition focus-within:border-blue-600 focus-within:ring-4 focus-within:ring-blue-100"
                >
                  <Search className="ml-3 h-5 w-5 text-slate-400 shrink-0" />
                  <input
                    type="text"
                    name="q"
                    placeholder="Search topics, constitutional articles, treaties, or keywords..."
                    className="w-full bg-transparent px-3 py-2 text-sm sm:text-base text-slate-800 placeholder:text-slate-400 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="shrink-0 rounded-xl bg-blue-700 px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-blue-800 transition"
                  >
                    Search PYQs
                  </button>
                </form>

                {/* Popular Topics */}
                <div className="mt-2.5 flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
                  <span className="font-semibold text-slate-400 mr-1">Popular Topics:</span>
                  {popularKeywords.map((kw) => (
                    <a
                      key={kw}
                      href={`/pyqs?q=${encodeURIComponent(kw)}`}
                      className="rounded-full border border-slate-200 bg-white px-2.5 py-0.5 text-[11px] font-medium text-slate-600 hover:border-blue-400 hover:text-blue-700 hover:bg-blue-50/50 transition"
                    >
                      {kw}
                    </a>
                  ))}
                </div>
              </div>

              {/* Primary Action Buttons */}
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <a
                  href="/pyqs?paper=GS1"
                  className="rounded-xl bg-blue-700 hover:bg-blue-800 px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:shadow transition flex items-center gap-1.5"
                >
                  <BookOpen className="h-4 w-4" />
                  <span>Explore GS Paper 1 PYQs</span>
                </a>

                <a
                  href="/pyqs?paper=GS2"
                  className="rounded-xl border border-slate-300 hover:border-slate-400 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 transition flex items-center gap-1.5"
                >
                  <Compass className="h-4 w-4 text-emerald-600" />
                  <span>Explore CSAT Paper 2</span>
                </a>

                <a
                  href="/exam-simulator"
                  className="rounded-xl border border-slate-300 hover:border-slate-400 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 transition flex items-center gap-1.5"
                >
                  <Clock className="h-4 w-4 text-amber-500" />
                  <span>Start Timed Exam</span>
                </a>
              </div>

              {/* Quick Pills */}
              <div className="mt-5 flex flex-wrap items-center gap-2 pt-4 border-t border-slate-200/80">
                <a
                  href="/syllabus"
                  className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-100 transition"
                >
                  <Sparkles className="h-3 w-3" />
                  <span>UPSC Crack Engine & Vault</span>
                </a>
                <a
                  href="/system-flow"
                  className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-200 transition"
                >
                  <BrainCircuit className="h-3 w-3 text-indigo-600" />
                  <span>Aspirant Flow & Design</span>
                </a>
                <a
                  href="/daily-quiz"
                  className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 transition"
                >
                  <CheckCircle className="h-3 w-3" />
                  <span>Today's Daily Quiz</span>
                </a>
                <a
                  href="/current-affairs"
                  className="inline-flex items-center gap-1 rounded-lg bg-teal-50 px-2.5 py-1 text-xs font-semibold text-teal-700 hover:bg-teal-100 transition"
                >
                  <TrendingUp className="h-3 w-3" />
                  <span>Current Affairs Links</span>
                </a>
                <a
                  href="/mains"
                  className="inline-flex items-center gap-1 rounded-lg bg-purple-50 px-2.5 py-1 text-xs font-semibold text-purple-700 hover:bg-purple-100 transition"
                >
                  <FileCheck2 className="h-3 w-3" />
                  <span>Mains & Essay AI</span>
                </a>
              </div>
            </div>

            {/* Right Column: High-Trust Photorealistic Showcase (Above the Fold) */}
            <div className="lg:col-span-5">
              <div className="relative rounded-3xl overflow-hidden border-2 border-slate-200 shadow-2xl bg-slate-900 group">
                <div className="relative aspect-[4/3] sm:aspect-[16/11] w-full overflow-hidden">
                  <img
                    src="/images/upsc_trust_hero.jpg"
                    alt="Pravaah UPSC Official Preparation Platform - Serious Academic Rigor & Verified Ground Truth"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/25 to-black/30" />

                  {/* Floating Trust Badges */}
                  <div className="absolute top-3.5 left-3.5 flex items-center gap-1.5 rounded-xl bg-slate-900/90 backdrop-blur-md border border-white/20 px-3 py-1.5 text-[11px] font-bold text-white shadow-lg">
                    <ShieldCheck className="h-4 w-4 text-emerald-400" />
                    <span>100% UPSC Official Ground Truth</span>
                  </div>

                  <div className="absolute top-3.5 right-3.5 flex items-center gap-1.5 rounded-xl bg-blue-900/90 backdrop-blur-md border border-blue-400/30 px-3 py-1.5 text-[11px] font-bold text-blue-200 shadow-lg">
                    <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                    <span>SM-2 Retention Engine</span>
                  </div>

                  <div className="absolute bottom-3 left-3 right-3 text-left">
                    <div className="text-[10px] font-extrabold uppercase tracking-wider text-blue-300">
                      Academic Rigor For Serious Aspirants
                    </div>
                    <div className="text-xs sm:text-sm font-bold text-white leading-snug mt-0.5">
                      Pedagogical Evidence & Zero Disputed Coaching Keys
                    </div>
                  </div>
                </div>

                {/* High-Impact Trust Metric Strip */}
                <div className="grid grid-cols-4 divide-x divide-slate-800 bg-slate-950 py-3.5 px-3 text-center text-white">
                  <div>
                    <div className="text-base sm:text-lg font-black text-blue-400">1995–2024</div>
                    <div className="text-[10px] font-medium text-slate-400 mt-0.5 leading-tight">Curated Archives</div>
                  </div>
                  <div>
                    <div className="text-base sm:text-lg font-black text-emerald-400">GS1 & CSAT</div>
                    <div className="text-[10px] font-medium text-slate-400 mt-0.5 leading-tight">Prelims & Mains</div>
                  </div>
                  <div>
                    <div className="text-base sm:text-lg font-black text-amber-400">100%</div>
                    <div className="text-[10px] font-medium text-slate-400 mt-0.5 leading-tight">Official Keys</div>
                  </div>
                  <div>
                    <div className="text-base sm:text-lg font-black text-purple-400">0</div>
                    <div className="text-[10px] font-medium text-slate-400 mt-0.5 leading-tight">Coaching Errors</div>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Interactive Live Preview Diagnostic Card */}
          <div className="mt-12 mx-auto max-w-3xl bg-white rounded-3xl border-2 border-slate-200 p-6 sm:p-7 text-left shadow-xl shadow-slate-100 relative">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 text-xs">
              <span className="font-extrabold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md">
                Interactive Learn Mode Sample • UPSC CSE 2024 GS1
              </span>
              <span className="text-slate-400 font-semibold">Marks: +2.0 / -0.66</span>
            </div>

            <p className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
              With reference to the Central Bank Digital Currency (CBDC) issued by the RBI, consider the following statements:
            </p>
            <ol className="mt-2 text-xs sm:text-sm text-slate-700 space-y-1 list-decimal list-inside leading-relaxed">
              <li>It is a sovereign digital currency appearing as a direct liability on the RBI balance sheet.</li>
              <li>It requires an underlying commercial bank deposit account for offline peer-to-peer transfers.</li>
            </ol>
            <p className="mt-2 text-xs sm:text-sm font-semibold text-slate-800">Which of the statements given above is/are correct?</p>

            {/* Options */}
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs font-semibold">
              {[
                { code: "A", text: "1 only", correct: true },
                { code: "B", text: "2 only", correct: false },
                { code: "C", text: "Both 1 and 2", correct: false },
                { code: "D", text: "Neither 1 nor 2", correct: false },
              ].map((opt) => (
                <button
                  key={opt.code}
                  onClick={() => {
                    setInteractiveOption(opt.code);
                    setShowInteractiveExplanation(true);
                  }}
                  className={`flex items-center gap-2 p-3 rounded-xl border text-left transition-all ${
                    interactiveOption === opt.code
                      ? opt.correct
                        ? "bg-emerald-50 border-emerald-500 text-emerald-900 shadow-sm"
                        : "bg-rose-50 border-rose-500 text-rose-900 shadow-sm"
                      : "bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-800"
                  }`}
                >
                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg font-bold text-xs ${
                      interactiveOption === opt.code
                        ? opt.correct
                          ? "bg-emerald-600 text-white"
                          : "bg-rose-600 text-white"
                        : "bg-white text-slate-700 border border-slate-300"
                    }`}
                  >
                    {opt.code}
                  </span>
                  <span>{opt.text}</span>
                </button>
              ))}
            </div>

            {/* Instant Pedagogical Feedback */}
            {showInteractiveExplanation && (
              <div className="mt-4 p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-xs text-emerald-900 leading-relaxed animate-in fade-in duration-200">
                <div className="font-extrabold flex items-center gap-1.5 text-emerald-800 mb-1">
                  <CheckCircle className="h-4 w-4" /> Correct Answer: Option A (1 only)
                </div>
                <p>
                  <strong>Statement 1 is correct:</strong> Digital Rupee (e₹) is sovereign currency appearing as a direct central bank liability. 
                  <br />
                  <strong>Statement 2 is incorrect:</strong> Retail CBDC acts as a tokenized digital bearer instrument that can be transacted offline without requiring an active commercial bank account.
                </p>
                <div className="mt-2.5 pt-2 border-t border-emerald-200/60 flex items-center justify-between text-[11px] text-emerald-800 font-bold">
                  <span>Elimination Tip: Cross-check bearer vs account-based instruments.</span>
                  <a href="/pyqs" className="underline hover:text-emerald-950">
                    Solve more like this →
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 2. The 3 Core SaaS Pillars (The Moat) */}
      <section className="py-16 px-4 sm:px-6 bg-slate-50 border-b border-slate-200">
        <div className="mx-auto max-w-7xl">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
              The Pravaah Architecture
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 mt-1">
              Why Serious Aspirants Choose Pravaah
            </h2>
            <p className="text-sm text-slate-500 mt-2">
              Replacing fragmented coaching PDFs with cognitive science, authentic data, and AI feedback.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm hover:shadow-md transition">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-700 mb-5 font-black">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">100% Official Series A Ground Truth</h3>
              <p className="mt-2 text-xs sm:text-sm leading-relaxed text-slate-600">
                Never second-guess with disputed coaching answer keys. Every question is mapped to official UPSC Series A keys, verified against government gazettes, PIB releases, and Supreme Court judgements.
              </p>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-1 text-xs font-bold text-blue-700">
                <span>Multi-Year Archive Fully Verified</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm hover:shadow-md transition">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-700 mb-5 font-black">
                <RotateCcw className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">SuperMemo-2 Automated Mistake Notebook</h3>
              <p className="mt-2 text-xs sm:text-sm leading-relaxed text-slate-600">
                Physical "Mistake Registers" gather dust. Pravaah automatically schedules every missed question in an adaptive spaced repetition queue on Day 1, Day 3, and Day 7 until permanent retention.
              </p>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-1 text-xs font-bold text-amber-700">
                <span>Adaptive Spaced Intervals</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm hover:shadow-md transition">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-700 mb-5 font-black">
                <Sparkles className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">AI Mains Answer Dimensional Grader</h3>
              <p className="mt-2 text-xs sm:text-sm leading-relaxed text-slate-600">
                Don't wait 2 weeks for coaching test series evaluation. Receive instant scores across Introduction clarity, multi-dimensional body arguments, Supreme Court precedents, and pragmatic Way Forward.
              </p>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-1 text-xs font-bold text-indigo-700">
                <span>32 Authentic Mains Questions</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Comparison Matrix: Coaching vs Pravaah SaaS */}
      <section className="py-16 px-4 sm:px-6 bg-white border-b border-slate-200">
        <div className="mx-auto max-w-5xl">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
              Direct Comparison
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
              Traditional Coaching PDFs vs. Pravaah SaaS
            </h2>
          </div>

          <div className="rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-800">
                  <th className="p-4 font-bold w-1/4">Feature Dimension</th>
                  <th className="p-4 font-bold text-slate-500 w-3/8">Traditional Coaching PDFs</th>
                  <th className="p-4 font-black text-blue-800 bg-blue-50/60 w-3/8">Pravaah UPSC SaaS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {comparisonData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/60 transition">
                    <td className="p-4 font-bold text-slate-800">{row.feature}</td>
                    <td className="p-4 text-slate-500 flex items-start gap-1.5">
                      <X className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                      <span>{row.coaching}</span>
                    </td>
                    <td className="p-4 text-slate-800 font-semibold bg-blue-50/20">
                      <div className="flex items-start gap-1.5">
                        <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{row.pravaah}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 4. Subject Silos Grid */}
      <section className="py-16 px-4 sm:px-6 bg-slate-50 border-b border-slate-200">
        <div className="mx-auto max-w-7xl">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
              Syllabus Mapping
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
              Practise by UPSC Subject Domain
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Read your standard textbook, then immediately drill every corresponding PYQ from 2019 to 2024.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {subjectCards.map((subj) => (
              <a
                key={subj.title}
                href={`/pyqs?subject=${encodeURIComponent(subj.title)}`}
                className={`group rounded-2xl border p-5 transition shadow-sm hover:shadow-md ${subj.color}`}
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-700 transition">
                    {subj.title}
                  </h3>
                  <span className="rounded-full bg-white/90 px-2.5 py-0.5 text-[11px] font-bold text-slate-700 border border-slate-200 shadow-xs">
                    {subj.tag}
                  </span>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-slate-600">{subj.desc}</p>
                <div className="mt-4 flex items-center gap-1 text-xs font-bold text-blue-700 group-hover:translate-x-1 transition-transform">
                  <span>Practise questions</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </a>
            ))}
          </div>

          {/* UPSC Crack Engine & High-Yield Vault Feature Banner */}
          <div className="mt-12 rounded-3xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-8 sm:p-10 text-white shadow-xl relative overflow-hidden">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-6 relative z-10">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/20 px-3.5 py-1 text-xs font-bold text-blue-200 mb-3 border border-blue-400/30">
                  <Sparkles className="h-3.5 w-3.5" />
                  Free Aspirant Resource Hub
                </div>
                <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                  The Complete UPSC Crack Engine & High-Yield Vault
                </h3>
                <p className="mt-2 text-sm text-slate-300 leading-relaxed">
                  Everything you search Google for in one authoritative place: 53 micro-topic syllabus breakdowns (Prelims + Mains), standard NCERT chapter mapping, Laxmikanth & Spectrum booklists, high-yield static cheat sheets (Constitutional Articles, Amendments, Rivers, National Parks), and the 365-day preparation blueprint.
                </p>
              </div>

              <div className="shrink-0 flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                <a
                  href="/syllabus"
                  className="rounded-2xl bg-blue-600 hover:bg-blue-500 px-6 py-3.5 text-center text-sm font-bold text-white shadow-lg shadow-blue-600/30 transition flex items-center justify-center gap-2"
                >
                  <span>Explore Crack Vault</span>
                  <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Pricing Preview Section */}
      <section className="py-16 px-4 sm:px-6 bg-white border-b border-slate-200">
        <div className="mx-auto max-w-6xl text-center">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
            Transparent Subscription
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 mt-1">
            Invest in High-Yield UPSC Precision
          </h2>
          <p className="text-sm text-slate-500 mt-2 max-w-xl mx-auto">
            Choose a plan that matches your current preparation stage. Annual plans include a 42% discount.
          </p>

          {/* Billing toggle */}
          <div className="mt-6 inline-flex p-1 bg-slate-100 rounded-xl">
            <button
              onClick={() => setPricingInterval("MONTHLY")}
              className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
                pricingInterval === "MONTHLY" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600"
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setPricingInterval("ANNUAL")}
              className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                pricingInterval === "ANNUAL"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <span>Annual Plan</span>
              <span className="rounded bg-amber-400 text-slate-900 px-1.5 py-0.2 text-[10px] font-black">
                SAVE 42%
              </span>
            </button>
          </div>

          {/* Cards */}
          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            {/* Foundation Free */}
            <div className="rounded-3xl border border-slate-200 p-6 flex flex-col justify-between bg-white shadow-sm">
              <div>
                <h3 className="text-base font-bold text-slate-900">Foundation</h3>
                <p className="text-xs text-slate-500 mt-1">Free forever for casual practice</p>
                <div className="mt-4 text-3xl font-black text-slate-900">₹0</div>
                <div className="mt-6 space-y-2 text-xs text-slate-700">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-emerald-600" /> Curated Verified PYQs in Learn Mode
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-emerald-600" /> 5 Daily Quiz questions / day
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-emerald-600" /> Daily PIB Current Affairs briefs
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <X className="h-4 w-4 text-slate-300" /> Timed 2-Hour Examination Simulator
                  </div>
                </div>
              </div>
              <a
                href="/register"
                className="mt-8 w-full text-center py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 hover:bg-slate-50 transition"
              >
                Start Free Practice
              </a>
            </div>

            {/* Achiever Pro (Featured) */}
            <div className="rounded-3xl border-2 border-blue-600 p-6 flex flex-col justify-between bg-blue-50/30 shadow-lg relative">
              <div className="absolute -top-3 right-6 rounded-full bg-blue-700 px-3 py-0.5 text-[10px] font-black text-white uppercase tracking-wider">
                Recommended
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">Achiever (Prelims Pro)</h3>
                <p className="text-xs text-slate-600 mt-1">Targeting CSE Prelims 2025/2026</p>
                <div className="mt-4">
                  <span className="text-3xl font-black text-slate-900">
                    {pricingInterval === "ANNUAL" ? "₹5,499" : "₹799"}
                  </span>
                  <span className="text-xs text-slate-500 ml-1">
                    {pricingInterval === "ANNUAL" ? "/ year (₹458/mo)" : "/ month"}
                  </span>
                </div>
                <div className="mt-6 space-y-2 text-xs text-slate-700 font-medium">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-emerald-600" /> Unlimited Timed 2-Hour Mocks
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-emerald-600" /> Automated SM-2 Mistake Queue
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-emerald-600" /> Negative Marking Telemetry
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-emerald-600" /> Unlimited Notes & Bookmarks
                  </div>
                </div>
              </div>
              <a
                href="/pricing"
                className="mt-8 w-full text-center py-3 rounded-xl bg-blue-700 hover:bg-blue-800 text-xs font-bold text-white shadow transition"
              >
                Upgrade to Achiever Pro
              </a>
            </div>

            {/* Scholar All-Access */}
            <div className="rounded-3xl border border-slate-200 p-6 flex flex-col justify-between bg-white shadow-sm">
              <div>
                <h3 className="text-base font-bold text-slate-900">Scholar (Ranker Suite)</h3>
                <p className="text-xs text-slate-500 mt-1">Comprehensive Prelims, Mains & AI evaluation</p>
                <div className="mt-4">
                  <span className="text-3xl font-black text-slate-900">
                    {pricingInterval === "ANNUAL" ? "₹8,999" : "₹1,299"}
                  </span>
                  <span className="text-xs text-slate-500 ml-1">
                    {pricingInterval === "ANNUAL" ? "/ year (₹749/mo)" : "/ month"}
                  </span>
                </div>
                <div className="mt-6 space-y-2 text-xs text-slate-700">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-emerald-600" /> Everything in Achiever Pro
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-emerald-600" /> Instant AI Mains Answer Grading
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-emerald-600" /> 32 Authentic Mains Model Frameworks
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-emerald-600" /> PDF Model Answer Exports
                  </div>
                </div>
              </div>
              <a
                href="/pricing"
                className="mt-8 w-full text-center py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 hover:bg-slate-50 transition"
              >
                Get Scholar All-Access
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Call to Action Banner */}
      <section className="bg-gradient-to-br from-blue-800 via-indigo-900 to-slate-900 py-16 px-4 sm:px-6 text-white text-center">
        <div className="mx-auto max-w-3xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-blue-200 text-xs font-bold mb-4 border border-white/10">
            <Sparkles className="h-3.5 w-3.5" />
            Clear UPSC CSE with Evidence & Retention
          </div>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            Stop Guessing. Start Mastering Every PYQ.
          </h2>
          <p className="mt-3 text-sm sm:text-base text-blue-100 max-w-xl mx-auto font-normal">
            Join thousands of serious civil services aspirants preparing with verified Series A data, spaced repetition, and AI evaluation.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a
              href="/register"
              className="rounded-2xl bg-white px-7 py-3.5 text-sm font-bold text-blue-900 shadow-xl hover:bg-blue-50 transition"
            >
              Create Free Aspirant Account
            </a>
            <a
              href="/system-flow"
              className="rounded-2xl border border-white/30 bg-white/10 px-6 py-3.5 text-sm font-bold text-white hover:bg-white/20 transition"
            >
              View Daily Operating Routine
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
