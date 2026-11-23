"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Compass,
  Layers,
  Clock,
  Sparkles,
  CheckCircle,
  TrendingUp,
  BrainCircuit,
  ArrowRight,
  ShieldCheck,
  BookOpen,
  RotateCcw,
  Zap,
  Target,
  Database,
  Cpu,
  Lock,
  GitBranch,
  Activity,
  Award,
  ChevronRight,
  Calculator,
  RefreshCw,
  Sliders,
  Check,
} from "lucide-react";

export default function SystemFlowPage() {
  const [activeTab, setActiveTab] = useState<"ASPIRANT_FLOW" | "SYSTEM_DESIGN" | "SIMULATOR">("ASPIRANT_FLOW");

  // Scoring Simulator State
  const [paperType, setPaperType] = useState<"GS1" | "GS2">("GS1");
  const [attempted, setAttempted] = useState(85);
  const [correct, setCorrect] = useState(65);

  const incorrect = Math.max(0, attempted - correct);
  const posMark = paperType === "GS1" ? 2.0 : 2.5;
  const negMark = paperType === "GS1" ? 2.0 / 3.0 : 2.5 / 3.0;
  const rawScore = correct * posMark;
  const negativeScore = incorrect * negMark;
  const netScore = Number((rawScore - negativeScore).toFixed(2));
  const accuracy = attempted > 0 ? Number(((correct / attempted) * 100).toFixed(1)) : 0;

  // Spaced Repetition Simulator State
  const [repetitionCount, setRepetitionCount] = useState(1);
  const getInterval = (rep: number) => {
    if (rep === 1) return 1;
    if (rep === 2) return 3;
    if (rep === 3) return 7;
    if (rep === 4) return 14;
    return 30;
  };

  const aspirantWorkflowSteps = [
    {
      step: 1,
      time: "06:30 – 08:30",
      title: "Morning Intelligence & Syllabus Alignment",
      tagline: "PIB, Official Gazettes & The Hindu linked directly to GS Syllabus",
      icon: TrendingUp,
      accent: "from-blue-600 to-indigo-600",
      badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
      description:
        "Every current affairs story is mapped to specific UPSC syllabus themes (GS1, GS2, GS3, GS4) with historical PYQs that previously asked about related concepts.",
      keyFeatures: [
        "Government-only source tracking (PIB, PRS, Cabinet Decisions)",
        "Automatic linking to historical PYQs (e.g. Art. 324 Election Commission)",
        "Prelims and Mains analytical fodder tags",
      ],
      ctaText: "Open Current Affairs Hub",
      ctaLink: "/current-affairs",
    },
    {
      step: 2,
      time: "08:30 – 09:00",
      title: "Daily 5-Question Prelims Diagnostic",
      tagline: "Test immediate retention with high-yield authentic MCQs",
      icon: CheckCircle,
      accent: "from-emerald-600 to-teal-600",
      badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
      description:
        "Start every day with 5 curated MCQs drawn from today's major news developments and static foundation. Instant feedback with statement-by-statement rationale.",
      keyFeatures: [
        "100% official UPSC style with 4 choices (A, B, C, D)",
        "Instant score report with UPSC negative marking (-0.66)",
        "Daily streak tracking and retention benchmarks",
      ],
      ctaText: "Attempt Today's Quiz",
      ctaLink: "/daily-quiz",
    },
    {
      step: 3,
      time: "10:00 – 13:00",
      title: "Targeted PYQ Deep Drill (2019 – 2024)",
      tagline: "Master 121 verified questions with elimination techniques",
      icon: Compass,
      accent: "from-sky-600 to-blue-700",
      badgeColor: "bg-sky-50 text-sky-700 border-sky-200",
      description:
        "Filter by GS Paper 1 or CSAT Paper 2, subject (Polity, Economy, Env, History), or year. Practice in Learn Mode with instant concept explanations.",
      keyFeatures: [
        "Elimination techniques and statement verification evidence",
        "Official UPSC Final Answer Key authority (Series A aligned)",
        "Personalized bookmarks & custom concept notes",
      ],
      ctaText: "Explore PYQ Catalog",
      ctaLink: "/pyqs",
    },
    {
      step: 4,
      time: "14:30 – 16:30",
      title: "Authentic UPSC Exam Simulation",
      tagline: "Timed 2-Hour Mock Test with Strict Anti-Leak Protection",
      icon: Clock,
      accent: "from-amber-600 to-orange-600",
      badgeColor: "bg-amber-50 text-amber-700 border-amber-200",
      description:
        "Experience the actual examination hall pressure. 100 questions for GS1 (200 marks) or 80 questions for CSAT (qualifying). No answer keys exposed in client payloads until submission.",
      keyFeatures: [
        "Strict anti-leak question payload (isCorrect stripped on server)",
        "Real-time countdown timer & question status palette",
        "Comprehensive scorecard: Net score, negative marks, subject breakdown",
      ],
      ctaText: "Launch Timed Exam",
      ctaLink: "/mock-tests",
    },
    {
      step: 5,
      time: "17:30 – 19:00",
      title: "Automated Spaced Mistake Repetition",
      tagline: "Turn every negative mark into permanent retention",
      icon: RotateCcw,
      accent: "from-rose-600 to-pink-600",
      badgeColor: "bg-rose-50 text-rose-700 border-rose-200",
      description:
        "Any MCQ you answer incorrectly in Learn Mode or Timed Exams is automatically captured into your personalized Spaced Repetition Queue. Tested again at 1, 3, 7, and 14-day intervals until fully resolved.",
      keyFeatures: [
        "SuperMemo-2 spaced interval algorithm",
        "Never repeat the same factual mistake twice",
        "Instant resolve or reschedule controls",
      ],
      ctaText: "Review Mistake Bank",
      ctaLink: "/revision",
    },
    {
      step: 6,
      time: "20:00 – 21:30",
      title: "Mains Answer Writing Studio",
      tagline: "10-marker & 15-marker GS answer structuring with live word count",
      icon: BookOpen,
      accent: "from-purple-600 to-indigo-700",
      badgeColor: "bg-purple-50 text-purple-700 border-purple-200",
      description:
        "Practice authentic UPSC Mains questions across GS1 to GS4 with structured Introduction, Body dimensions, and Way Forward guidelines, live stopwatch, and self-evaluation rubrics.",
      keyFeatures: [
        "Live word-count limits (150 words / 250 words)",
        "Framework dimensional cues (Constitutional, Economic, Global)",
        "Draft autosave & historical attempt repository",
      ],
      ctaText: "Open Mains Studio",
      ctaLink: "/mains",
    },
  ];

  const systemDesignLayers = [
    {
      layer: "1. Data Ingestion & Source Provenance",
      description: "Automated and verified ingestion pipeline pulling from official sources.",
      badge: "Ingestion Engine",
      color: "border-blue-300 bg-blue-50/50",
      items: [
        { name: "UPSC Official PDF Dissector", detail: "Scrapes Series A question papers and final post-result official answer keys directly from upsc.gov.in." },
        { name: "Government Gazette & PIB Crawlers", detail: "Daily ingest of PIB Delhi, Cabinet Communiqués, and PRS Legislative summaries." },
        { name: "Source Provenance Ledger", detail: "Tracks SHA-256 file hashes, source URLs, and publication dates in SourceDocument model." },
      ],
    },
    {
      layer: "2. Editorial & Content Guardrails",
      description: "Three-tier answer key verification preventing unverified coaching rumors.",
      badge: "Integrity Gate",
      color: "border-emerald-300 bg-emerald-50/50",
      items: [
        { name: "Three-Tier Answer Guard", detail: "Distinguishes UPSC_OFFICIAL_FINAL from INDEPENDENT_AUTHORED and AI_GENERATED_DRAFT." },
        { name: "Strict 4-Option Enforcer", detail: "Blocks publication of any question missing exactly 4 distinct options or correct key." },
        { name: "No Direct-from-DRAFT Rule", detail: "Admin workflow requires human editorial review before any question can be published." },
      ],
    },
    {
      layer: "3. Next.js 14 Fullstack App & API Layer",
      description: "High-performance Server Components with secure route handlers.",
      badge: "Application Core",
      color: "border-purple-300 bg-purple-50/50",
      items: [
        { name: "Zero-Leak Exam Player", detail: "Server strips 'isCorrect' and explanations from questions during active timed sessions." },
        { name: "Auth & RBAC Isolation", detail: "Strict cross-user separation for bookmarks, custom notes, and exam history." },
        { name: "Entitlements & Quota Enforcer", detail: "Authoritative server-side tier evaluation (Free, Beginner, Achiever, Scholar)." },
      ],
    },
    {
      layer: "4. PostgreSQL Storage Tier (Docker Container)",
      description: "Robust relational data models running on PostgreSQL 17 with high-availability container pooling.",
      badge: "Database Tier",
      color: "border-amber-300 bg-amber-50/50",
      items: [
        { name: "Relational Knowledge Graph", detail: "Questions connected to Papers, Subjects, Topics, Syllabus Nodes, and Current Affairs." },
        { name: "Spaced Repetition State", detail: "ReviewSchedule tracks repetition count, ease factor, and dynamic next review timestamps." },
        { name: "Audit & Telemetry Logs", detail: "Logs admin actions, payment lifecycles, and study activity durations." },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Hero Header */}
      <div className="relative overflow-hidden border-b border-slate-200 bg-white pt-10 pb-12 sm:pt-14 sm:pb-16 px-4 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3.5 py-1 text-xs font-bold text-blue-700 shadow-2xs">
                <Sparkles className="h-3.5 w-3.5 text-blue-600" />
                <span>Product Blueprint & Aspirant Architecture</span>
              </div>
              <h1 className="mt-3 text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                Pravaah UPSC <span className="text-blue-700">System Design & Aspirant Flow</span>
              </h1>
              <p className="mt-2 max-w-3xl text-sm sm:text-base text-slate-600 leading-relaxed">
                Discover how Pravaah transforms the unstructured, overwhelming UPSC preparation journey into a systematic, high-retention daily operational loop.
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-3">
              <Link
                href="/study-planner"
                className="inline-flex items-center gap-2 rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-blue-800 transition"
              >
                <Compass className="h-4 w-4" />
                <span>Go to Study Planner</span>
              </Link>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="mt-8 flex border-b border-slate-200">
            <button
              onClick={() => setActiveTab("ASPIRANT_FLOW")}
              className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-bold transition ${
                activeTab === "ASPIRANT_FLOW"
                  ? "border-blue-700 text-blue-700 bg-blue-50/50"
                  : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300"
              }`}
            >
              <Target className="h-4 w-4" />
              <span>1. Aspirant Daily Operating System (6-Stage Loop)</span>
            </button>
            <button
              onClick={() => setActiveTab("SYSTEM_DESIGN")}
              className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-bold transition ${
                activeTab === "SYSTEM_DESIGN"
                  ? "border-blue-700 text-blue-700 bg-blue-50/50"
                  : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300"
              }`}
            >
              <Cpu className="h-4 w-4" />
              <span>2. System Design & Technical Architecture</span>
            </button>
            <button
              onClick={() => setActiveTab("SIMULATOR")}
              className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-bold transition ${
                activeTab === "SIMULATOR"
                  ? "border-blue-700 text-blue-700 bg-blue-50/50"
                  : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300"
              }`}
            >
              <Calculator className="h-4 w-4" />
              <span>3. Interactive UPSC Score & Spaced Logic Simulator</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="mx-auto max-w-6xl px-4 sm:px-6 pt-10">
        {/* ========================================================= */}
        {/* TAB 1: ASPIRANT OPERATING SYSTEM (USER FLOW) */}
        {/* ========================================================= */}
        {activeTab === "ASPIRANT_FLOW" && (
          <div className="space-y-10">
            {/* Overview Banner */}
            <div className="rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-50 via-indigo-50 to-white p-6 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
                    The Problem with Traditional Coaching
                  </span>
                  <h3 className="text-xl font-bold text-slate-900 mt-1">
                    Aspirants drown in 50-page monthly PDF digests and repeat the same mock errors.
                  </h3>
                  <p className="text-sm text-slate-600 mt-2 max-w-3xl leading-relaxed">
                    Pravaah UPSC breaks this cycle with a <strong>closed-loop learning feedback system</strong>. Every news item links back to past UPSC questions, every mock question replicates actual negative marking, and every mistake is scheduled for revision until mastered.
                  </p>
                </div>
                <div className="shrink-0 flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-100 px-3 py-1.5 text-xs font-bold text-emerald-800">
                    <Check className="h-3.5 w-3.5" /> 121 Verified Questions
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-blue-100 px-3 py-1.5 text-xs font-bold text-blue-800">
                    <ShieldCheck className="h-3.5 w-3.5" /> Official Keys
                  </span>
                </div>
              </div>
            </div>

            {/* Visual Step-by-Step Flow */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">The Daily 6-Stage Aspirant Journey</h2>
                  <p className="text-xs text-slate-500">Structured routine covering Prelims, CSAT, Mains, and Spaced Retention</p>
                </div>
                <span className="text-xs font-semibold text-slate-400">Total Recommended Daily Hours: 6 – 8 hrs</span>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                {aspirantWorkflowSteps.map((s) => {
                  const Icon = s.icon;
                  return (
                    <div
                      key={s.step}
                      className="group relative flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-xs hover:border-blue-400 hover:shadow-md transition-all"
                    >
                      <div>
                        {/* Header Badge */}
                        <div className="flex items-center justify-between gap-2 mb-3">
                          <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-bold ${s.badgeColor}`}>
                            Stage {s.step}: {s.time}
                          </span>
                          <div className={`flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br ${s.accent} text-white shadow-xs`}>
                            <Icon className="h-4.5 w-4.5" />
                          </div>
                        </div>

                        {/* Title */}
                        <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-700 transition">
                          {s.title}
                        </h3>
                        <p className="text-xs font-semibold text-slate-500 mt-0.5">{s.tagline}</p>

                        {/* Description */}
                        <p className="mt-3 text-xs leading-relaxed text-slate-600">
                          {s.description}
                        </p>

                        {/* Key Features Bullet Points */}
                        <ul className="mt-4 space-y-1.5 text-xs text-slate-600">
                          {s.keyFeatures.map((kf, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <CheckCircle className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                              <span>{kf}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* CTA Button */}
                      <div className="mt-6 pt-4 border-t border-slate-100">
                        <Link
                          href={s.ctaLink}
                          className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-bold text-slate-700 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition shadow-2xs"
                        >
                          <span>{s.ctaText}</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Full Journey Cycle Diagram */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
              <h3 className="text-base font-bold text-slate-900 mb-2">How It Fits Together (Continuous Feedback Loop)</h3>
              <p className="text-xs text-slate-500 mb-6">Notice how every step feeds insights to the next, preventing cognitive fatigue and forgotten errors:</p>

              <div className="flex flex-col md:flex-row items-center justify-between gap-3 text-center">
                <div className="w-full md:w-1/5 rounded-xl border border-blue-200 bg-blue-50/70 p-3">
                  <span className="text-[10px] font-bold uppercase text-blue-700">1. Learn</span>
                  <p className="text-xs font-bold text-slate-800 mt-1">Current Affairs & PYQs</p>
                  <span className="text-[10px] text-slate-500">PIB & Concepts</span>
                </div>
                <ChevronRight className="hidden md:block h-5 w-5 text-slate-400 shrink-0" />
                <div className="w-full md:w-1/5 rounded-xl border border-teal-200 bg-teal-50/70 p-3">
                  <span className="text-[10px] font-bold uppercase text-teal-700">2. Test</span>
                  <p className="text-xs font-bold text-slate-800 mt-1">Daily Quiz & Mocks</p>
                  <span className="text-[10px] text-slate-500">Timed Pressure</span>
                </div>
                <ChevronRight className="hidden md:block h-5 w-5 text-slate-400 shrink-0" />
                <div className="w-full md:w-1/5 rounded-xl border border-rose-200 bg-rose-50/70 p-3">
                  <span className="text-[10px] font-bold uppercase text-rose-700">3. Catch</span>
                  <p className="text-xs font-bold text-slate-800 mt-1">Mistake Bank</p>
                  <span className="text-[10px] text-slate-500">Auto Captures Errors</span>
                </div>
                <ChevronRight className="hidden md:block h-5 w-5 text-slate-400 shrink-0" />
                <div className="w-full md:w-1/5 rounded-xl border border-purple-200 bg-purple-50/70 p-3">
                  <span className="text-[10px] font-bold uppercase text-purple-700">4. Retain</span>
                  <p className="text-xs font-bold text-slate-800 mt-1">Spaced Repetition</p>
                  <span className="text-[10px] text-slate-500">Day 1, 3, 7, 14</span>
                </div>
                <ChevronRight className="hidden md:block h-5 w-5 text-slate-400 shrink-0" />
                <div className="w-full md:w-1/5 rounded-xl border border-amber-200 bg-amber-50/70 p-3">
                  <span className="text-[10px] font-bold uppercase text-amber-700">5. Express</span>
                  <p className="text-xs font-bold text-slate-800 mt-1">Mains Drafting</p>
                  <span className="text-[10px] text-slate-500">Structured Answers</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: SYSTEM DESIGN & TECHNICAL ARCHITECTURE */}
        {/* ========================================================= */}
        {activeTab === "SYSTEM_DESIGN" && (
          <div className="space-y-8">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-700">Technical Blueprint</span>
              <h2 className="text-2xl font-bold text-slate-900 mt-1">Pravaah UPSC System Architecture</h2>
              <p className="text-sm text-slate-600 mt-2 max-w-3xl leading-relaxed">
                The technical architecture guarantees <strong>zero answer-leak during live exams</strong>, <strong>high-concurrency query execution</strong>, and <strong>authoritative content provenance</strong> back to official government archives.
              </p>

              {/* Architecture 4-Layer Breakdown */}
              <div className="mt-8 space-y-6">
                {systemDesignLayers.map((l, idx) => (
                  <div key={idx} className={`rounded-xl border p-5 ${l.color}`}>
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                      <h3 className="text-base font-bold text-slate-900">{l.layer}</h3>
                      <span className="rounded-md border border-slate-300 bg-white px-2.5 py-0.5 text-xs font-bold text-slate-700 shadow-2xs">
                        {l.badge}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mb-4">{l.description}</p>

                    <div className="grid gap-3 sm:grid-cols-3">
                      {l.items.map((item, itemIdx) => (
                        <div key={itemIdx} className="rounded-lg bg-white p-3.5 border border-slate-200/80 shadow-2xs">
                          <h4 className="text-xs font-bold text-slate-900">{item.name}</h4>
                          <p className="mt-1 text-[11px] text-slate-600 leading-normal">{item.detail}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Security & Anti-Leak Callout */}
            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
                <div className="flex items-center gap-2 mb-3">
                  <ShieldCheck className="h-5 w-5 text-emerald-600" />
                  <h3 className="text-base font-bold text-slate-900">Anti-Leak Security Protocol</h3>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  In many online test platforms, inspecting network requests or DevTools exposes <code className="bg-slate-100 px-1 py-0.5 rounded text-rose-700">isCorrect: true</code> in the JSON response before the student even answers.
                </p>
                <div className="mt-4 rounded-xl bg-slate-900 p-4 text-[11px] font-mono text-slate-200 overflow-x-auto">
                  <p className="text-emerald-400">// In GET /api/v1/tests/session/start</p>
                  <p className="text-slate-400">options: &#123;</p>
                  <p className="pl-4 text-slate-300">select: &#123;</p>
                  <p className="pl-8 text-blue-300">id: true, optionCode: true, optionText: true</p>
                  <p className="pl-8 text-rose-400">// isCorrect strictly omitted by Prisma</p>
                  <p className="pl-4 text-slate-300">&#125;</p>
                  <p className="text-slate-400">&#125;</p>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
                <div className="flex items-center gap-2 mb-3">
                  <RotateCcw className="h-5 w-5 text-blue-600" />
                  <h3 className="text-base font-bold text-slate-900">Spaced Repetition Algorithm</h3>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Pravaah implements an adapted <strong>SuperMemo-2 (SM-2)</strong> interval algorithm. When a question is attempted incorrectly, it is queued for review with dynamic intervals:
                </p>
                <div className="mt-4 grid grid-cols-4 gap-2 text-center text-xs">
                  <div className="rounded-lg bg-blue-50 border border-blue-200 p-2">
                    <span className="block font-bold text-blue-800">1st Fail</span>
                    <span className="text-[11px] text-slate-500">+1 Day</span>
                  </div>
                  <div className="rounded-lg bg-indigo-50 border border-indigo-200 p-2">
                    <span className="block font-bold text-indigo-800">2nd Fail</span>
                    <span className="text-[11px] text-slate-500">+3 Days</span>
                  </div>
                  <div className="rounded-lg bg-purple-50 border border-purple-200 p-2">
                    <span className="block font-bold text-purple-800">3rd Fail</span>
                    <span className="text-[11px] text-slate-500">+7 Days</span>
                  </div>
                  <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-2">
                    <span className="block font-bold text-emerald-800">Resolved</span>
                    <span className="text-[11px] text-slate-500">Graduated</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: INTERACTIVE SIMULATOR */}
        {/* ========================================================= */}
        {activeTab === "SIMULATOR" && (
          <div className="space-y-8">
            {/* 1. Official UPSC Scorecard Calculator */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
              <div className="flex items-center justify-between gap-4 mb-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-700">Interactive Formula</span>
                  <h2 className="text-xl font-bold text-slate-900 mt-1">Official UPSC Negative Marking Calculator</h2>
                  <p className="text-xs text-slate-500">See exactly how negative marks affect your qualification cutoff</p>
                </div>

                <div className="flex rounded-xl border border-slate-200 bg-slate-100 p-1">
                  <button
                    onClick={() => { setPaperType("GS1"); setAttempted(85); setCorrect(65); }}
                    className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                      paperType === "GS1" ? "bg-white text-blue-700 shadow-xs" : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    GS Paper 1 (+2 / -0.667)
                  </button>
                  <button
                    onClick={() => { setPaperType("GS2"); setAttempted(65); setCorrect(50); }}
                    className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                      paperType === "GS2" ? "bg-white text-blue-700 shadow-xs" : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    CSAT Paper 2 (+2.5 / -0.833)
                  </button>
                </div>
              </div>

              {/* Sliders */}
              <div className="grid gap-6 md:grid-cols-2 mt-6">
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                      <span>Questions Attempted: {attempted} / {paperType === "GS1" ? 100 : 80}</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={paperType === "GS1" ? 100 : 80}
                      value={attempted}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setAttempted(val);
                        if (correct > val) setCorrect(val);
                      }}
                      className="w-full accent-blue-600 cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                      <span>Correct Answers: {correct}</span>
                      <span className="text-rose-600">Incorrect: {incorrect}</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={attempted}
                      value={correct}
                      onChange={(e) => setCorrect(Number(e.target.value))}
                      className="w-full accent-emerald-600 cursor-pointer"
                    />
                  </div>
                </div>

                {/* Score Output Card */}
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 flex flex-col justify-between">
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="rounded-lg bg-white p-2 border border-slate-200">
                      <span className="text-[10px] font-semibold text-slate-500">Gross Marks</span>
                      <p className="text-sm font-bold text-slate-900">+{rawScore.toFixed(2)}</p>
                    </div>
                    <div className="rounded-lg bg-white p-2 border border-slate-200">
                      <span className="text-[10px] font-semibold text-rose-500">Negative Marks</span>
                      <p className="text-sm font-bold text-rose-600">-{negativeScore.toFixed(2)}</p>
                    </div>
                    <div className="rounded-lg bg-white p-2 border border-slate-200">
                      <span className="text-[10px] font-semibold text-slate-500">Accuracy</span>
                      <p className="text-sm font-bold text-blue-700">{accuracy}%</p>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Authentic Net Score</span>
                      <p className="text-2xl font-black text-slate-900">
                        {netScore} <span className="text-xs font-normal text-slate-500">/ 200</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ${
                          paperType === "GS1"
                            ? netScore >= 95
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-amber-100 text-amber-800"
                            : netScore >= 66
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-rose-100 text-rose-800"
                        }`}
                      >
                        {paperType === "GS1"
                          ? netScore >= 95
                            ? "Likely Prelims Cutoff Cleared (>95)"
                            : "Borderline / Below Typical Cutoff (<95)"
                          : netScore >= 66
                          ? "CSAT Qualified (>=66)"
                          : "CSAT Failed (<66)"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Spaced Repetition Logic Tester */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-700">Spaced Memory Algorithm</span>
              <h2 className="text-xl font-bold text-slate-900 mt-1">Mistake Bank Review Schedule Preview</h2>
              <p className="text-xs text-slate-500 mb-6">Test how repetition count schedules revision dates to maximize long-term retention</p>

              <div className="flex flex-wrap items-center gap-3">
                {[1, 2, 3, 4, 5].map((rep) => (
                  <button
                    key={rep}
                    onClick={() => setRepetitionCount(rep)}
                    className={`rounded-xl px-4 py-2 text-xs font-bold transition border ${
                      repetitionCount === rep
                        ? "bg-purple-700 text-white border-purple-700 shadow-xs"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    Attempt #{rep}
                  </button>
                ))}
              </div>

              <div className="mt-6 rounded-xl border border-purple-200 bg-purple-50/40 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-purple-900">
                      When Question is Attempted Incorrectly #{repetitionCount}:
                    </p>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Next review queued in <strong>{getInterval(repetitionCount)} days</strong>.
                    </p>
                  </div>
                  <Link
                    href="/revision"
                    className="inline-flex items-center gap-1.5 rounded-lg bg-purple-700 px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-purple-800"
                  >
                    <span>View Live Mistake Bank</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
