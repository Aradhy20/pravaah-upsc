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
  RotateCw,
  BarChart2,
  ChevronDown,
  ChevronUp,
  FileText,
  Award,
  Check,
  Zap,
} from "lucide-react";

export default function HomePage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const toggleFaq = (idx: number) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  const popularTopics = [
    "Fundamental Rights",
    "Monetary Policy Committee",
    "Biodiversity & Wetlands",
    "Modern Indian History",
    "Inflation & Forex Reserves",
    "Climate Conventions",
  ];

  const recentPapers = [
    { year: 2024, paper: "GS Paper 1", code: "GS1", count: 100, solvedCount: 100 },
    { year: 2024, paper: "CSAT Paper 2", code: "GS2", count: 80, solvedCount: 80 },
    { year: 2023, paper: "GS Paper 1", code: "GS1", count: 100, solvedCount: 100 },
    { year: 2023, paper: "CSAT Paper 2", code: "GS2", count: 80, solvedCount: 80 },
    { year: 2022, paper: "GS Paper 1", code: "GS1", count: 100, solvedCount: 100 },
  ];

  const subjectTaxonomy = [
    {
      title: "Polity & Governance",
      desc: "Constitutional articles, Parliament, Executive, Judiciary & Statutory bodies.",
      slug: "polity-governance",
      tag: "High Yield",
      color: "border-blue-200 bg-blue-50/40 text-blue-900",
    },
    {
      title: "Economy & Development",
      desc: "Monetary policy, fiscal deficits, banking, external trade & national accounts.",
      slug: "economy-development",
      tag: "Core Syllabus",
      color: "border-emerald-200 bg-emerald-50/40 text-emerald-900",
    },
    {
      title: "Environment & Ecology",
      desc: "Protected area network, national parks, Ramsar sites, climate conventions.",
      slug: "environment-biodiversity",
      tag: "High Weightage",
      color: "border-teal-200 bg-teal-50/40 text-teal-900",
    },
    {
      title: "History & Art & Culture",
      desc: "Ancient sites, temple architecture, freedom struggle & social movements.",
      slug: "history-culture",
      tag: "Syllabus Pillar",
      color: "border-amber-200 bg-amber-50/40 text-amber-900",
    },
    {
      title: "Geography & Agriculture",
      desc: "Physical systems, rivers, monsoon circulation & cropping patterns.",
      slug: "geography-agriculture",
      tag: "Conceptual",
      color: "border-indigo-200 bg-indigo-50/40 text-indigo-900",
    },
    {
      title: "CSAT Aptitude & Logic",
      desc: "Number systems, syllogisms, permutations & reading comprehension.",
      slug: "csat-quant",
      tag: "Qualifying 33%",
      color: "border-purple-200 bg-purple-50/40 text-purple-900",
    },
  ];

  const platformFeatures = [
    {
      icon: Compass,
      title: "Concept-First PYQ Explorer",
      desc: "Explore 1,100 authenticated UPSC questions from 2019 to 2024. Every question features statement-by-statement evidence and textbook provenance.",
      link: "/pyqs",
      actionText: "Browse PYQs",
    },
    {
      icon: Clock,
      title: "Authentic Timed Examination",
      desc: "Realistic 2-hour examination simulator applying official marking schemes (+2.0 / -0.666 for GS1, +2.5 / -0.833 for CSAT). Keys remain protected until submission.",
      link: "/mock-tests",
      actionText: "Take Timed Mock",
    },
    {
      icon: RotateCw,
      title: "Automated Mistake Bank",
      desc: "Every missed question is automatically catalogued in your personal Spaced Revision Queue to ensure zero repeat mistakes on exam day.",
      link: "/revision",
      actionText: "View Revision System",
    },
    {
      icon: Layers,
      title: "Current Affairs & Syllabus Linking",
      desc: "Daily verified news stories tagged directly to official GS papers and linked to historical questions that tested identical underlying concepts.",
      link: "/current-affairs",
      actionText: "Read Today's Analysis",
    },
    {
      icon: FileText,
      title: "Mains & Essay Workspace",
      desc: "Practice structured answer writing with syllabus-linked prompts, model structure breakdowns, and micro-draft evaluation.",
      link: "/mains",
      actionText: "Practice Mains",
    },
    {
      icon: BarChart2,
      title: "Diagnostic Learning Telemetry",
      desc: "Track genuine accuracy rates, time spent per question, topic-level weak areas, and cognitive retention metrics without vanity scores.",
      link: "/dashboard",
      actionText: "View My Progress",
    },
  ];

  const faqs = [
    {
      q: "Are the questions and answer keys official UPSC materials?",
      a: "Yes. All 1,100 questions and keys are extracted directly from official Union Public Service Commission CSE Prelims examinations (2019–2024 Series A), cross-referenced with official UPSC final answer keys.",
    },
    {
      q: "How does the negative marking calculation work?",
      a: "The simulator strictly adheres to official UPSC rules: General Studies Paper 1 awards +2.0 marks for correct answers and deducts 0.666 (one-third) marks for incorrect responses. CSAT Paper 2 awards +2.5 marks and deducts 0.833 marks. Unanswered questions receive 0 marks.",
    },
    {
      q: "What is the Automated Mistake Bank?",
      a: "Whenever you answer a question incorrectly in Practice Mode or a Timed Exam, our learning engine queues that question into your Spaced Revision Queue. It schedules revision intervals (1 day, 3 days, 7 days) until you demonstrate consistent conceptual mastery.",
    },
    {
      q: "Can I use Pravaah UPSC for free?",
      a: "Yes! The Aspirant Foundation tier is completely free. It provides unlimited access to solve PYQs with full official answer keys, take the Daily Quiz, read Daily Current Affairs, and maintain basic study bookmarks.",
    },
    {
      q: "How do I upgrade to Prelims Pro or All-Access Scholar?",
      a: "You can view subscription options anytime on our Pricing page. In the current development and preview phase, you can test plan upgrades seamlessly through our verified sandbox mode.",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden border-b border-slate-200 bg-white px-4 pt-10 pb-14 sm:px-6 sm:pt-16 sm:pb-20">
        <div className="mx-auto max-w-4xl text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50/80 px-3.5 py-1 text-xs font-bold text-blue-700 mb-5 shadow-xs">
            <Sparkles className="h-3.5 w-3.5 text-blue-600" />
            <span>High-Fidelity UPSC CSE Prelims & Mains Preparation Platform</span>
          </div>

          {/* Headline */}
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 leading-[1.15]">
            Prepare Smarter. Practice Better.{" "}
            <span className="text-blue-600">Crack UPSC.</span>
          </h1>

          {/* Supporting Description */}
          <p className="mx-auto mt-4 max-w-2xl text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
            Your complete UPSC preparation platform for Previous Year Questions, daily practice, mock exams, current affairs and performance tracking. Master 1,100 verified questions with statement-by-statement evidence and automated mistake revision.
          </p>

          {/* Primary & Secondary CTAs */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <a
              href="/register"
              className="rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-bold text-white shadow-sm hover:bg-blue-700 transition flex items-center gap-2"
            >
              <span>Start Learning Free</span>
              <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href="/pyqs"
              className="rounded-xl border border-slate-300 bg-white px-6 py-3.5 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50 hover:text-slate-900 transition flex items-center gap-2"
            >
              <Compass className="h-4 w-4 text-blue-600" />
              <span>Explore PYQs</span>
            </a>
          </div>

          {/* Search Box */}
          <div className="mt-8 mx-auto max-w-2xl">
            <form
              action="/pyqs"
              method="GET"
              className="flex items-center rounded-2xl border-2 border-slate-300 bg-white p-2 shadow-sm transition focus-within:border-blue-600 focus-within:ring-4 focus-within:ring-blue-100"
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
                className="shrink-0 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-blue-700 transition"
              >
                Search
              </button>
            </form>

            {/* Popular Topics Pills */}
            <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5 text-xs text-slate-500">
              <span className="font-semibold text-slate-400 mr-1">Popular Topics:</span>
              {popularTopics.map((topic) => (
                <a
                  key={topic}
                  href={`/pyqs?q=${encodeURIComponent(topic)}`}
                  className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-slate-600 hover:border-blue-300 hover:text-blue-700 hover:bg-white transition"
                >
                  {topic}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Entry Points */}
          <div className="mt-8 pt-6 border-t border-slate-100 flex flex-wrap items-center justify-center gap-3">
            <a
              href="/pyqs?paper=GS1"
              className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50/60 px-4 py-2.5 text-xs font-bold text-blue-800 hover:bg-blue-100 transition"
            >
              <Compass className="h-4 w-4 text-blue-600" />
              <span>GS Paper 1 (100 Qs / Year)</span>
            </a>
            <a
              href="/pyqs?paper=GS2"
              className="inline-flex items-center gap-2 rounded-xl border border-teal-200 bg-teal-50/60 px-4 py-2.5 text-xs font-bold text-teal-800 hover:bg-teal-100 transition"
            >
              <BrainCircuit className="h-4 w-4 text-teal-600" />
              <span>CSAT Paper 2 (80 Qs / Year)</span>
            </a>
            <a
              href="/mock-tests"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
            >
              <Clock className="h-4 w-4 text-slate-600" />
              <span>Timed Examination Mode</span>
            </a>
          </div>
        </div>
      </section>

      {/* 2. Platform Features Showcase */}
      <section className="py-14 px-4 sm:px-6 bg-slate-50 border-b border-slate-200">
        <div className="mx-auto max-w-7xl">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
              Complete Preparation Suite
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              Engineered for Cognitive Retention & Real UPSC Marks
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Every tool in Pravaah is designed to move you from passive question reading to active conceptual mastery.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {platformFeatures.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs hover:shadow-md hover:border-blue-300 transition flex flex-col justify-between"
                >
                  <div>
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-700 mb-4">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="text-base font-bold text-slate-900">{feat.title}</h3>
                    <p className="mt-2 text-xs leading-relaxed text-slate-600">{feat.desc}</p>
                  </div>
                  <div className="mt-5 pt-3 border-t border-slate-100">
                    <a
                      href={feat.link}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 transition"
                    >
                      <span>{feat.actionText}</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. UPSC PYQ Explorer Showcase */}
      <section className="py-14 px-4 sm:px-6 bg-white border-b border-slate-200">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
                Authoritative Archives
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
                Year-Wise Historical Papers (2019–2024)
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                1,100 verified questions with official UPSC answer keys and statement explanations
              </p>
            </div>
            <a
              href="/pyqs"
              className="mt-3 sm:mt-0 text-sm font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 self-start sm:self-auto"
            >
              <span>Explore All Archive Papers</span>
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
            {recentPapers.map((p, idx) => (
              <a
                key={idx}
                href={`/pyqs?paper=${p.code}&years=${p.year}`}
                className="group rounded-xl border border-slate-200 bg-white p-4 shadow-xs hover:border-blue-400 hover:shadow-md transition"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xl font-extrabold text-slate-900 group-hover:text-blue-600 transition">
                    {p.year}
                  </span>
                  <span
                    className={`rounded text-[10px] font-bold px-2 py-0.5 ${
                      p.code === "GS2" ? "bg-teal-100 text-teal-800" : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {p.code}
                  </span>
                </div>
                <p className="mt-1 text-xs font-medium text-slate-600">{p.paper}</p>
                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <span>{p.count} Questions</span>
                  <span className="text-emerald-600 font-semibold flex items-center gap-0.5">
                    <CheckCircle className="h-3 w-3" /> Official Key
                  </span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Subject-Wise Syllabus Silos */}
      <section className="py-14 px-4 sm:px-6 bg-slate-50 border-b border-slate-200">
        <div className="mx-auto max-w-7xl">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
              Syllabus Mapping
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              Practise by Subject & Concept
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Read your standard textbook, then immediately drill every corresponding PYQ across 2019–2024.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {subjectTaxonomy.map((subj) => (
              <a
                key={subj.slug}
                href={`/pyqs?subject=${encodeURIComponent(subj.title)}`}
                className={`group rounded-2xl border p-5 transition shadow-xs hover:shadow-md ${subj.color}`}
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-700 transition">
                    {subj.title}
                  </h3>
                  <span className="rounded-full bg-white/80 px-2.5 py-0.5 text-[11px] font-bold text-slate-700 border border-slate-200 shadow-2xs">
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
        </div>
      </section>

      {/* 5. Daily Study Flow & Revision */}
      <section className="py-14 px-4 sm:px-6 bg-white border-b border-slate-200">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
                Daily Habit Formation
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
                Your Complete Daily UPSC Workflow
              </h2>
              <p className="text-sm text-slate-600 mt-3 leading-relaxed">
                Consistent daily discipline beats irregular marathon study sessions. Pravaah structures your daily prep into three targeted micro-habits:
              </p>

              <div className="mt-6 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-700 shrink-0 font-bold text-xs mt-0.5">
                    1
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Today's Daily Study Plan</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Curated daily syllabus topic linked directly with corresponding high-yield PYQs.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 shrink-0 font-bold text-xs mt-0.5">
                    2
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">5-Question Daily Quiz</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Fresh daily Prelims questions testing syllabus application with authentic negative scoring.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700 shrink-0 font-bold text-xs mt-0.5">
                    3
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Spaced Mistake Revision</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Review missed questions at 1, 3, and 7-day intervals to lock retention into long-term memory.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href="/daily-quiz"
                  className="rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-blue-700 transition"
                >
                  Take Today's Quiz
                </a>
                <a
                  href="/study-planner"
                  className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                >
                  Open Study Planner
                </a>
              </div>
            </div>

            {/* Interactive Preview Card */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 shadow-xs">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-emerald-600" />
                  <span className="text-sm font-bold text-slate-900">Daily Routine Snapshot</span>
                </div>
                <span className="text-xs font-semibold text-slate-500">Live Aspirant Engine</span>
              </div>

              <div className="mt-4 space-y-3">
                <div className="rounded-xl bg-white p-4 border border-slate-200 shadow-2xs">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                    <span>POLITY & GOVERNANCE</span>
                    <span className="text-blue-600">GS2 Syllabus</span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 mt-1">
                    Constitutional Bodies & Election Commission Autonomy
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Matched with 4 historical PYQs from 2020, 2022, and 2024 Prelims.
                  </p>
                </div>

                <div className="rounded-xl bg-white p-4 border border-slate-200 shadow-2xs">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                    <span>SPACED REPETITION QUEUE</span>
                    <span className="text-amber-600">Due Today</span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 mt-1">
                    3 Mistake Items Pending Re-Verification
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Solve them once more to graduate them to permanent mastery status.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Pricing & Plans Overview */}
      <section className="py-14 px-4 sm:px-6 bg-slate-50 border-b border-slate-200">
        <div className="mx-auto max-w-7xl">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
              Transparent SaaS Pricing
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              Start Free. Upgrade As You Scale.
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Academic pricing with zero dark patterns or lock-in contracts.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {/* Free Plan */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Aspirant Foundation
                </span>
                <h3 className="text-xl font-extrabold text-slate-900 mt-1">Free Tier</h3>
                <div className="mt-3 text-3xl font-extrabold text-slate-900">
                  ₹0 <span className="text-xs font-normal text-slate-500">/ forever</span>
                </div>
                <p className="mt-2 text-xs text-slate-500">
                  Essential UPSC practice for candidates starting their syllabus journey.
                </p>

                <ul className="mt-6 space-y-2.5 text-xs text-slate-600">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>Browse official UPSC CSE PYQs (GS1 & CSAT)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>Core concept summaries & official answer keys</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>Interactive Learn Mode with instant feedback</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>Personal quota: 5 bookmarks & 3 study notes</span>
                  </li>
                </ul>
              </div>

              <div className="mt-8 pt-4 border-t border-slate-100">
                <a
                  href="/register"
                  className="block w-full rounded-xl border border-slate-300 bg-white py-2.5 text-center text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                >
                  Get Started Free
                </a>
              </div>
            </div>

            {/* Prelims Pro (Popular) */}
            <div className="rounded-2xl border-2 border-blue-600 bg-white p-6 shadow-md flex flex-col justify-between relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-blue-600 px-3 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider shadow-sm">
                Most Popular
              </div>

              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
                  Prelims Pro
                </span>
                <h3 className="text-xl font-extrabold text-slate-900 mt-1">Achiever Plan</h3>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-slate-900">₹799</span>
                  <span className="text-xs font-normal text-slate-500">/ month</span>
                </div>
                <div className="text-[11px] font-semibold text-emerald-600 mt-0.5">
                  or ₹5,499 / year (Save 42%)
                </div>
                <p className="mt-2 text-xs text-slate-500">
                  Complete examination simulator with authentic UPSC scoring & revision queue.
                </p>

                <ul className="mt-6 space-y-2.5 text-xs text-slate-600">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>Everything in Foundation Free</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>Full 2-Hour Timed Exam Simulator (+2.0 / -0.666 grading)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>Automated Spaced Mistake Repetition Engine</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>Diagnostic Weak Topic Detector (&lt;60% accuracy threshold)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>Unlimited bookmarks with custom tags & private study notes</span>
                  </li>
                </ul>
              </div>

              <div className="mt-8 pt-4 border-t border-slate-100">
                <a
                  href="/pricing"
                  className="block w-full rounded-xl bg-blue-600 py-2.5 text-center text-xs font-bold text-white shadow-sm hover:bg-blue-700 transition"
                >
                  Upgrade to Prelims Pro
                </a>
              </div>
            </div>

            {/* All-Access Scholar */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-700">
                  Ranker Suite
                </span>
                <h3 className="text-xl font-extrabold text-slate-900 mt-1">Scholar Tier</h3>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-slate-900">₹1,299</span>
                  <span className="text-xs font-normal text-slate-500">/ month</span>
                </div>
                <div className="text-[11px] font-semibold text-emerald-600 mt-0.5">
                  or ₹8,999 / year (Save 42%)
                </div>
                <p className="mt-2 text-xs text-slate-500">
                  For comprehensive multi-year revision and mock test mastery with priority access.
                </p>

                <ul className="mt-6 space-y-2.5 text-xs text-slate-600">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>Everything in Prelims Pro</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>Unlimited Full Exam Simulations & custom topic mocks</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>Comprehensive telemetry & time-per-question curve</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>Unlimited study notes with PDF syllabus linking</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>Priority question bank coverage & editorial reviews</span>
                  </li>
                </ul>
              </div>

              <div className="mt-8 pt-4 border-t border-slate-100">
                <a
                  href="/pricing"
                  className="block w-full rounded-xl border border-slate-300 bg-white py-2.5 text-center text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                >
                  View Scholar Details
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Frequently Asked Questions */}
      <section className="py-14 px-4 sm:px-6 bg-white border-b border-slate-200">
        <div className="mx-auto max-w-3xl">
          <div className="text-center mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
              Clear Answers
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              Frequently Asked Questions
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Everything you need to know about the methodology, data provenance, and platform rules.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="rounded-xl border border-slate-200 bg-white shadow-2xs overflow-hidden transition"
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(idx)}
                    className="flex w-full items-center justify-between px-5 py-4 text-left text-sm font-bold text-slate-900 hover:bg-slate-50 transition"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? (
                      <ChevronUp className="h-4 w-4 text-blue-600 shrink-0 ml-2" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-slate-400 shrink-0 ml-2" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-4 text-xs leading-relaxed text-slate-600 border-t border-slate-100 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 8. Final Call to Action */}
      <section className="bg-gradient-to-br from-blue-700 to-indigo-900 py-16 px-4 sm:px-6 text-white text-center">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Start Your Concept-Driven UPSC Practice Today
          </h2>
          <p className="mt-3 text-sm sm:text-base text-blue-100 max-w-xl mx-auto">
            Zero friction, zero paywalls. Begin solving authentic UPSC Civil Services questions now.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a
              href="/register"
              className="rounded-xl bg-white px-6 py-3.5 text-sm font-bold text-blue-900 shadow-md hover:bg-blue-50 transition"
            >
              Create Free Account
            </a>
            <a
              href="/mock-tests"
              className="rounded-xl border border-white/40 bg-white/10 px-6 py-3.5 text-sm font-bold text-white hover:bg-white/20 transition"
            >
              Take a Timed Test
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
