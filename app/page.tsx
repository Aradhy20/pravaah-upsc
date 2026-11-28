"use client";

import React, { useState } from "react";
import {
  BookOpen,
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
  RotateCcw,
  Zap,
  Award,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  BarChart2,
  Sliders,
  Check,
  FileCheck2,
  Target,
  FileText,
  Bookmark,
  Calendar,
  Lock,
  ChevronRight,
  Shield,
  Activity,
  CheckCircle2,
} from "lucide-react";

export default function HomePage() {
  const [interactiveOption, setInteractiveOption] = useState<string>("C");
  const [interactiveLang, setInteractiveLang] = useState<"EN" | "HI">("EN");
  const [pricingInterval, setPricingInterval] = useState<"MONTHLY" | "QUARTERLY" | "ANNUAL">("ANNUAL");
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const popularKeywords = [
    "Fundamental Rights",
    "Monetary Policy",
    "Indian Ocean Dipole",
    "Biodiversity",
    "Western Ghats",
    "Number Systems",
  ];

  const subjectCards = [
    {
      title: "Polity and Governance",
      desc: "Constitutional articles, Parliament, Executive, Judiciary, Federalism & Statutory bodies.",
      tag: "502+ Questions",
      href: "/pyqs?subject=polity",
      count: 502,
    },
    {
      title: "Economy and Development",
      desc: "Monetary policy, fiscal deficit, inflation targeting, external sector & banking reforms.",
      tag: "546+ Questions",
      href: "/pyqs?subject=economics",
      count: 546,
    },
    {
      title: "History and Art & Culture",
      desc: "Ancient sites, Mauryan & Gupta art, temple architecture, freedom struggle & social movements.",
      tag: "153+ Questions",
      href: "/pyqs?subject=modern-history",
      count: 153,
    },
    {
      title: "Geography and Agriculture",
      desc: "Geomorphology, monsoon circulation, river basins, cropping patterns & soil health.",
      tag: "288+ Questions",
      href: "/pyqs?subject=geography",
      count: 288,
    },
    {
      title: "Environment and Ecology",
      desc: "Protected area network, national parks, Ramsar wetlands, biodiversity & climate summits.",
      tag: "343+ Questions",
      href: "/pyqs?subject=environment",
      count: 343,
    },
    {
      title: "CSAT Aptitude and Logic",
      desc: "Reading comprehension, quantitative aptitude, data sufficiency, syllogisms & permutations.",
      tag: "48+ Papers",
      href: "/pyqs?paper=GS2",
      count: 48,
    },
  ];

  const coreFeatures = [
    {
      title: "Previous Year Questions",
      desc: "Comprehensive question bank spanning 1995–2024. Exact question numbering, option matching, and bilingual Hindi-English parity.",
      icon: <BookOpen className="h-5 w-5" />,
      href: "/pyqs",
      badge: "100% Authentic",
    },
    {
      title: "Prelims and CSAT Practice",
      desc: "Interactive question-solving with immediate concept feedback, statement-wise breakdown, and 33% CSAT qualifying telemetry.",
      icon: <Compass className="h-5 w-5" />,
      href: "/csat-coach",
      badge: "Target 66.7+",
    },
    {
      title: "Mains Answer Studio",
      desc: "Dedicated distraction-free workspace for GS1–GS4 and Essay writing with structured model answers, constitutional citations, and rubric scores.",
      icon: <FileText className="h-5 w-5" />,
      href: "/mains",
      badge: "AIR 1–20 Framework",
    },
    {
      title: "Timed Mock Tests",
      desc: "Authentic examination simulation with standard UPSC negative marking (+2.0 / -0.666), countdown timer, and question status palette.",
      icon: <Clock className="h-5 w-5" />,
      href: "/mock-tests",
      badge: "Real Exam Feel",
    },
    {
      title: "Smart Mistake Revision",
      desc: "Scientifically proven SM-2 spaced repetition engine. Automatically schedules re-tests for incorrect answers on Day 1, Day 3, and Day 7.",
      icon: <RotateCcw className="h-5 w-5" />,
      href: "/revision",
      badge: "Spaced Retention",
    },
    {
      title: "Daily Study Planner",
      desc: "Answers your 3 vital preparation questions every morning: What to study today? What to revise? How to diagnose weak microthemes?",
      icon: <Calendar className="h-5 w-5" />,
      href: "/study-planner",
      badge: "Daily Routine",
    },
  ];

  const trustMetrics = [
    { value: "2,095+", label: "Verified Authentic PYQs", subtitle: "Source-attributed official questions in active rotation" },
    { value: "235", label: "NCERT Curriculum Links", subtitle: "Relational conceptual mapping across 44 NCERT chapters" },
    { value: "100%", label: "Official Key Reconciliation", subtitle: "Officially mapped to UPSC published final gazette keys" },
    { value: "Series A", label: "Booklet Provenance", subtitle: "Strict Series A-D provenance with zero fabricated records" },
  ];

  const homeFaqs = [
    {
      q: "How are previous year questions and answer keys verified on Pravaah UPSC?",
      a: "Every question is matched directly against official UPSC examination master question papers and verified against official final revised answer keys published by the Union Public Service Commission. We do not invent questions or rely on unverified crowd-sourced solutions.",
    },
    {
      q: "How does Pravaah separate official PYQs from AI-generated practice questions?",
      a: "Pravaah enforces a strict Data Separation Policy at the database schema level. All official past-year questions carry the immutable tag 'OFFICIAL_UPSC_PYQ'. Generated practice questions live in a completely separate database table and are forcibly labelled 'GENERATED_PRACTICE_NOT_OFFICIAL_PYQ'. They are never mixed into official question bank statistics.",
    },
    {
      q: "How does the Smart Mistake Revision queue work?",
      a: "When you answer a question incorrectly during practice or timed mock tests, Pravaah automatically classifies the mistake and enrolls it into the SM-2 spaced repetition queue. You receive scheduled re-tests on Day 1, Day 3, and Day 7 to cement long-term memory.",
    },
    {
      q: "Does Pravaah support Hindi medium aspirants?",
      a: "Yes. Questions with official UPSC Hindi translations feature authentic Devanagari question stems, options, and pedagogical explanations. We never replace authentic gazette text with unverified automated translations.",
    },
    {
      q: "Are the free learning features permanently available?",
      a: "Yes. The Free Aspirant tier provides unlimited free access to the verified PYQ Explorer, daily quizzes, syllabus micro-topics, and NCERT mappings with zero payment required.",
    },
    {
      q: "What is the status of online subscription payments?",
      a: "Online checkout is safely dormant while our upcoming Cashfree payment gateway integration completes regulatory verification. All free practice tools, PYQ explorer, and daily learning workspaces are 100% active and unblocked.",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#FBF7F0] text-[#261B1E] selection:bg-[#741A2B]/15 selection:text-[#741A2B]">
      {/* 1. Hero Section: Indian Heritage Two-Column Academic Layout */}
      <section className="relative overflow-hidden border-b border-[#E7DDD4] bg-gradient-to-b from-[#F4EDE2] via-[#FBF7F0] to-[#FBF7F0] px-4 pt-10 pb-16 sm:px-6 sm:pt-16 sm:pb-24">
        {/* Subtle Decorative Architectural Motif Lines */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.035] bg-[radial-gradient(#741A2B_1px,transparent_1px)] [background-size:24px_24px]" />

        <div className="mx-auto max-w-7xl relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            
            {/* Left Column: Value Proposition, Search Bar, CTAs */}
            <div className="lg:col-span-7 text-left">
              {/* Heritage Trust Badge */}
              <div className="inline-flex items-center gap-2 rounded-full border border-[#E5C88E] bg-[#FAF2E6] px-4 py-1 text-xs font-bold text-[#741A2B] mb-5 shadow-xs">
                <span className="flex h-2 w-2 rounded-full bg-emerald-600 animate-pulse" />
                <span>Controlled Beta · 100% Authentic UPSC CSE Source-Backed Platform</span>
              </div>

              {/* Core Headline */}
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black font-editorial tracking-tight text-[#261B1E] leading-[1.14]">
                Find the PYQ. Understand the Concept.{" "}
                <span className="text-[#741A2B] relative inline-block">
                  Master Every Mistake.
                  <span className="absolute -bottom-1 left-0 right-0 h-1 bg-[#C69A4A]/60 rounded-full" />
                </span>
              </h1>

              {/* Supporting Description */}
              <p className="mt-5 text-base sm:text-lg text-[#786B68] leading-relaxed max-w-2xl font-normal">
                Prepare with source-backed questions, structured explanations and intelligent revision tools. Built for sincere civil services aspirants.
              </p>

              {/* Full-Width Search Bar */}
              <div className="mt-8">
                <form
                  action="/pyqs"
                  method="GET"
                  className="flex items-center w-full rounded-2xl border-2 border-[#E7DDD4] bg-white p-2 shadow-card transition focus-within:border-[#C69A4A] focus-within:ring-4 focus-within:ring-[#C69A4A]/15"
                >
                  <Search className="ml-3 h-5 w-5 text-[#C69A4A] shrink-0" />
                  <input
                    type="text"
                    name="q"
                    placeholder="Search topics, constitutional articles, treaties, or keywords..."
                    aria-label="Search previous year questions"
                    className="w-full bg-transparent px-3 py-2 text-sm sm:text-base text-[#261B1E] placeholder:text-[#786B68] focus:outline-none min-h-[44px]"
                  />
                  <button
                    type="submit"
                    className="shrink-0 rounded-xl bg-[#741A2B] px-6 py-2.5 text-sm font-bold text-white shadow-xs hover:bg-[#5E1422] transition min-h-[44px] flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C69A4A]"
                  >
                    Search PYQs
                  </button>
                </form>

                {/* Popular Topics Pill Tags */}
                <div className="mt-3.5 flex flex-wrap items-center gap-1.5 text-xs text-[#786B68]">
                  <span className="font-bold text-[#741A2B] mr-1">High-Yield Topics:</span>
                  {popularKeywords.map((kw) => (
                    <a
                      key={kw}
                      href={`/pyqs?q=${encodeURIComponent(kw)}`}
                      className="rounded-full border border-[#E7DDD4] bg-white/90 px-3 py-0.5 text-[11px] font-medium text-[#786B68] hover:border-[#C69A4A] hover:text-[#741A2B] hover:bg-[#FAF2E6] transition"
                    >
                      {kw}
                    </a>
                  ))}
                </div>
              </div>

              {/* Primary Action Buttons */}
              <div className="mt-8 flex flex-wrap items-center gap-3.5">
                <a
                  href="/register"
                  className="rounded-xl bg-[#741A2B] hover:bg-[#5E1422] px-7 py-3.5 text-sm font-bold text-white shadow-card hover:shadow-hover transition flex items-center gap-2.5 min-h-[48px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C69A4A] border border-[#C69A4A]/40"
                >
                  <span>Start Free Practice</span>
                  <ArrowRight className="h-4 w-4 text-[#E2C38E]" />
                </a>

                <a
                  href="/pyqs"
                  className="rounded-xl border border-[#E7DDD4] hover:border-[#C69A4A] bg-white px-6 py-3.5 text-sm font-bold text-[#261B1E] hover:bg-[#F4EDE2] transition flex items-center gap-2 min-h-[48px] shadow-xs"
                >
                  <Compass className="h-4 w-4 text-[#741A2B]" />
                  <span>Explore PYQs</span>
                </a>

                <a
                  href="/mock-tests"
                  className="rounded-xl border border-[#E7DDD4] hover:border-[#C69A4A] bg-white px-5 py-3.5 text-sm font-bold text-[#261B1E] hover:bg-[#F4EDE2] transition flex items-center gap-2 min-h-[48px] shadow-xs"
                >
                  <Clock className="h-4 w-4 text-[#C65A36]" />
                  <span>Timed Mock Tests</span>
                </a>
              </div>

              {/* Quick Feature Badges */}
              <div className="mt-8 flex flex-wrap items-center gap-3 pt-5 border-t border-[#E7DDD4]">
                <div className="flex items-center gap-1.5 text-xs text-[#786B68]">
                  <CheckCircle className="h-4 w-4 text-[#1E7E55]" />
                  <span>Zero Paywalls for Core Learning</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-[#786B68]">
                  <CheckCircle className="h-4 w-4 text-[#1E7E55]" />
                  <span>Official Series A Answer Keys</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-[#786B68]">
                  <CheckCircle className="h-4 w-4 text-[#1E7E55]" />
                  <span>Scientific SM-2 Mistake Retention</span>
                </div>
              </div>
            </div>

            {/* Right Column: Indian Architectural Frame + Product Workspace Preview */}
            <div className="lg:col-span-5 relative">
              {/* Subtle Heritage Jali/Arch Frame */}
              <div className="relative rounded-3xl border-2 border-[#C69A4A]/40 bg-white p-5 sm:p-7 shadow-card">
                {/* Heritage Decorative Header Stamp */}
                <div className="flex items-center justify-between pb-4 border-b border-[#E7DDD4]">
                  <div className="flex items-center gap-2">
                    <div className="h-2.5 w-2.5 rounded-full bg-[#741A2B]" />
                    <span className="text-xs font-bold font-editorial text-[#741A2B] tracking-wider uppercase">
                      UPSC Prelims 2024 • GS Paper I
                    </span>
                  </div>
                  <div className="flex items-center gap-1 rounded-full bg-[#FAF2E6] border border-[#E5C88E] px-2.5 py-0.5 text-[10px] font-bold text-[#8C6721]">
                    <span>Official Gazette Verified</span>
                  </div>
                </div>

                {/* Interactive Question Preview Box */}
                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs text-[#786B68] mb-1.5">
                    <span className="font-bold text-[#261B1E]">Question 3 of 100</span>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => setInteractiveLang("EN")}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          interactiveLang === "EN" ? "bg-[#741A2B] text-white" : "bg-[#F4EDE2] text-[#786B68]"
                        }`}
                      >
                        English
                      </button>
                      <button
                        onClick={() => setInteractiveLang("HI")}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          interactiveLang === "HI" ? "bg-[#741A2B] text-white" : "bg-[#F4EDE2] text-[#786B68]"
                        }`}
                      >
                        हिंदी
                      </button>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm font-semibold text-[#261B1E] leading-relaxed">
                    {interactiveLang === "EN"
                      ? "Under which of the following Articles of the Constitution of India has the Supreme Court placed the Right to be Free from the Adverse Effects of Climate Change?"
                      : "भारत के संविधान के निम्नलिखित में से किस अनुच्छेद के अंतर्गत सर्वोच्च न्यायालय ने जलवायु परिवर्तन के प्रतिकूल प्रभावों से मुक्त होने के अधिकार को मान्यता दी है?"}
                  </p>

                  {/* Multiple Choice Options */}
                  <div className="mt-3.5 space-y-2">
                    {[
                      { code: "A", en: "Article 14 only", hi: "केवल अनुच्छेद 14" },
                      { code: "B", en: "Article 19(1)(a)", hi: "अनुच्छेद 19(1)(क)" },
                      { code: "C", en: "Article 14 and Article 21", hi: "अनुच्छेद 14 और अनुच्छेद 21", isCorrect: true },
                      { code: "D", en: "Article 32", hi: "अनुच्छेद 32" },
                    ].map((opt) => {
                      const isSelected = interactiveOption === opt.code;
                      const isCorrect = opt.isCorrect;

                      return (
                        <div
                          key={opt.code}
                          onClick={() => setInteractiveOption(opt.code)}
                          className={`flex items-center justify-between p-2.5 rounded-xl border text-xs cursor-pointer transition ${
                            isSelected
                              ? isCorrect
                                ? "bg-[#EAF5EE] border-[#BDE2CF] text-[#1E7E55] font-bold"
                                : "bg-[#FAECEC] border-[#ECC4C4] text-[#A32D2D] font-bold"
                              : "bg-[#FBF7F0] border-[#E7DDD4] text-[#261B1E] hover:border-[#C69A4A]"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className={`flex h-5 w-5 items-center justify-center rounded-md text-[11px] font-bold ${
                                isSelected && isCorrect
                                  ? "bg-[#1E7E55] text-white"
                                  : isSelected
                                  ? "bg-[#A32D2D] text-white"
                                  : "bg-[#E7DDD4] text-[#786B68]"
                              }`}
                            >
                              {opt.code}
                            </span>
                            <span>{interactiveLang === "EN" ? opt.en : opt.hi}</span>
                          </div>
                          {isSelected && isCorrect && <CheckCircle2 className="h-4 w-4 text-[#1E7E55]" />}
                        </div>
                      );
                    })}
                  </div>

                  {/* Instant Pedagogical Note */}
                  <div className="mt-4 p-3 rounded-xl bg-[#FAF2E6] border border-[#E5C88E] text-[11px] leading-relaxed text-[#5D514E]">
                    <div className="flex items-center gap-1 font-bold text-[#741A2B] mb-0.5">
                      <ShieldCheck className="h-3.5 w-3.5 text-[#C69A4A]" />
                      <span>UPSC Official Answer Reference</span>
                    </div>
                    <span>
                      Supreme Court in <em>M.K. Ranjitsinh v. Union of India (2024)</em> affirmed that Articles 14 (Equality) and 21 (Life) encompass freedom from climate risks.
                    </span>
                  </div>
                </div>

                {/* Floating Metric Badges */}
                <div className="mt-4 pt-3 border-t border-[#E7DDD4] flex items-center justify-between text-[11px] text-[#786B68]">
                  <span className="flex items-center gap-1">
                    <Activity className="h-3 w-3 text-[#1E7E55]" />
                    <span>SM-2 Spaced Retention Enabled</span>
                  </span>
                  <a href="/pyqs?paper=GS1" className="font-bold text-[#741A2B] hover:underline flex items-center gap-1">
                    <span>Solve in Learn Mode</span>
                    <ChevronRight className="h-3 w-3" />
                  </a>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. Trust Metrics Section */}
      <section className="border-b border-[#E7DDD4] bg-white py-12 px-4 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            {trustMetrics.map((tm, idx) => (
              <div key={idx} className="flex flex-col items-center p-4 rounded-2xl bg-[#FBF7F0] border border-[#E7DDD4] shadow-xs">
                <div className="text-3xl sm:text-4xl font-extrabold font-editorial text-[#741A2B] tracking-tight">
                  {tm.value}
                </div>
                <div className="mt-1 text-sm font-bold text-[#261B1E]">{tm.label}</div>
                <div className="mt-1 text-[11px] text-[#786B68] max-w-[200px]">{tm.subtitle}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Core Features Section */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 bg-[#FBF7F0]">
        <div className="mx-auto max-w-7xl">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FAF2E6] px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-[#741A2B] border border-[#E5C88E] mb-3">
              Comprehensive UPSC Architecture
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold font-editorial text-[#261B1E] tracking-tight">
              Six Purpose-Built Preparation Workspaces
            </h2>
            <p className="mt-3 text-sm sm:text-base text-[#786B68]">
              Engineered to replace fragmented study methods with verified academic precision.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {coreFeatures.map((feat, idx) => (
              <a
                key={idx}
                href={feat.href}
                className="group flex flex-col justify-between p-6 rounded-2xl border border-[#E7DDD4] bg-white shadow-xs hover:shadow-card hover:border-[#C69A4A] transition"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#FAF2E6] text-[#741A2B] group-hover:bg-[#741A2B] group-hover:text-white transition shadow-xs">
                      {feat.icon}
                    </div>
                    <span className="text-[11px] font-bold text-[#8C6721] bg-[#FBF4E6] px-2.5 py-0.5 rounded-full border border-[#E5C88E]">
                      {feat.badge}
                    </span>
                  </div>
                  <h3 className="mt-4 text-lg font-bold font-editorial text-[#261B1E] group-hover:text-[#741A2B] transition">
                    {feat.title}
                  </h3>
                  <p className="mt-2 text-xs sm:text-sm text-[#786B68] leading-relaxed">
                    {feat.desc}
                  </p>
                </div>
                <div className="mt-6 pt-3 border-t border-[#F4EDE2] flex items-center justify-between text-xs font-bold text-[#741A2B]">
                  <span>Launch Workspace</span>
                  <ArrowRight className="h-4 w-4 text-[#C69A4A] transition-transform group-hover:translate-x-1" />
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Subject Explorer Section */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 bg-white border-y border-[#E7DDD4]">
        <div className="mx-auto max-w-7xl">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FAF2E6] px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-[#741A2B] border border-[#E5C88E] mb-3">
              Microtheme Breakdown
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold font-editorial text-[#261B1E] tracking-tight">
              Master the Syllabus by Subject & Microtheme
            </h2>
            <p className="mt-3 text-sm sm:text-base text-[#786B68]">
              Explore past year questions categorized across 209 microthemes to identify repeating high-yield themes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subjectCards.map((sc, idx) => (
              <a
                key={idx}
                href={sc.href}
                className="group p-6 rounded-2xl border border-[#E7DDD4] bg-[#FBF7F0] hover:bg-white hover:border-[#C69A4A] hover:shadow-card transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#741A2B] bg-[#F7ECEE] px-2.5 py-0.5 rounded-full border border-[#E8C5CB]">
                      {sc.tag}
                    </span>
                    <span className="text-[11px] font-semibold text-[#786B68]">Explore</span>
                  </div>
                  <h3 className="mt-4 text-lg font-bold font-editorial text-[#261B1E] group-hover:text-[#741A2B] transition">
                    {sc.title}
                  </h3>
                  <p className="mt-2 text-xs sm:text-sm text-[#786B68] leading-relaxed">
                    {sc.desc}
                  </p>
                </div>
                <div className="mt-5 pt-3 border-t border-[#E7DDD4] flex items-center justify-between text-xs font-bold text-[#741A2B]">
                  <span>Browse Questions</span>
                  <ArrowRight className="h-3.5 w-3.5 text-[#C69A4A] transition-transform group-hover:translate-x-1" />
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Mains Preparation Section */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 bg-[#FBF7F0]">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-6">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FAF2E6] px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-[#741A2B] border border-[#E5C88E] mb-3">
                Mains Answer Studio
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold font-editorial text-[#261B1E] tracking-tight leading-tight">
                Structure Rigorous Mains Answers with Authentic Rubrics
              </h2>
              <p className="mt-4 text-sm sm:text-base text-[#786B68] leading-relaxed">
                Move past vague advice. Practice authentic Mains GS Paper 1, 2, 3, 4 and Essay questions with structured analytical dimensions, constitutional article citations, model frameworks, and word-count timers.
              </p>

              <div className="mt-6 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#FAF2E6] text-[#741A2B] text-xs font-bold border border-[#E5C88E]">1</div>
                  <div className="text-xs sm:text-sm text-[#261B1E]">
                    <strong>Three-Tier Structure:</strong> Contextual Introduction, Multi-Dimensional Arguments, and Forward-Looking Conclusion.
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#FAF2E6] text-[#741A2B] text-xs font-bold border border-[#E5C88E]">2</div>
                  <div className="text-xs sm:text-sm text-[#261B1E]">
                    <strong>Legal & Constitutional Backing:</strong> Primary Supreme Court cases, Law Commission reports, and committee recommendations.
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#FAF2E6] text-[#741A2B] text-xs font-bold border border-[#E5C88E]">3</div>
                  <div className="text-xs sm:text-sm text-[#261B1E]">
                    <strong>Topper Copy Annotations:</strong> Benchmark your drafts against AIR 1–20 handwritten answer copies.
                  </div>
                </div>
              </div>

              <div className="mt-8 flex items-center gap-4">
                <a
                  href="/mains"
                  className="rounded-xl bg-[#741A2B] hover:bg-[#5E1422] px-6 py-3 text-sm font-bold text-white shadow-card transition"
                >
                  Enter Mains Studio
                </a>
                <a
                  href="/topper-copies"
                  className="rounded-xl border border-[#E7DDD4] bg-white hover:bg-[#F4EDE2] px-5 py-3 text-sm font-bold text-[#261B1E] transition"
                >
                  Browse Topper Copies
                </a>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="rounded-3xl border border-[#E7DDD4] bg-white p-6 shadow-card">
                <div className="flex items-center justify-between pb-3 border-b border-[#E7DDD4]">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#741A2B]">
                    GS Paper II • Governance & Polity (15 Marks / 250 Words)
                  </span>
                  <span className="text-[11px] font-bold text-[#8C6721] bg-[#FAF2E6] px-2 py-0.5 rounded border border-[#E5C88E]">
                    Mains 2024 Question
                  </span>
                </div>
                <h4 className="mt-3 text-sm sm:text-base font-bold font-editorial text-[#261B1E] leading-snug">
                  "The Governor's discretionary powers under Article 163 have often been a subject of constitutional contestation. Analyze in light of recent judicial pronouncements."
                </h4>

                <div className="mt-4 p-3.5 rounded-xl bg-[#FBF7F0] border border-[#E7DDD4] text-xs space-y-2">
                  <div className="font-bold text-[#741A2B]">Model Answer Dimension Guidance:</div>
                  <ul className="list-disc list-inside text-[#786B68] space-y-1">
                    <li><strong>Introduction:</strong> Constitutional role of the Governor as dual functionary (Constitutional Head & Union Emissary).</li>
                    <li><strong>Constitutional Anchor:</strong> Article 163(1) vs 163(2), Article 200 (Assent to bills), and Article 356.</li>
                    <li><strong>Judicial Doctrine:</strong> <em>Shamsher Singh (1974)</em>, <em>Nabam Rebia (2016)</em>, and State of Punjab (2023).</li>
                    <li><strong>Conclusion:</strong> Sarkaria & Punchhi Commission recommendations on fixed timelines.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Current Affairs & Historical PYQ Alignment */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 bg-white border-b border-[#E7DDD4]">
        <div className="mx-auto max-w-7xl">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FAF2E6] px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-[#741A2B] border border-[#E5C88E] mb-3">
              Government Ingestion
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold font-editorial text-[#261B1E] tracking-tight">
              Connect Daily Current Affairs to Historical UPSC Questions
            </h2>
            <p className="mt-3 text-sm sm:text-base text-[#786B68]">
              We link every official government release (PIB, Rajya Sabha Debates, Gazette notifications) directly to past-year questions so you study with exam perspective.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl border border-[#E7DDD4] bg-[#FBF7F0] shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#C65A36] bg-[#FDF0EB] px-2 py-0.5 rounded border border-[#F2C8B8]">
                Polity & Constitution
              </span>
              <h3 className="mt-3 text-base font-bold font-editorial text-[#261B1E]">
                Governor Assent to State Bills & Article 200 Timelines
              </h3>
              <p className="mt-2 text-xs text-[#786B68] leading-relaxed">
                Analysis of Supreme Court observations on 'as soon as possible' phraseology under Article 200 proviso.
              </p>
              <div className="mt-4 pt-3 border-t border-[#E7DDD4] flex items-center justify-between text-xs font-bold text-[#741A2B]">
                <span>Connected PYQs: 2013, 2023, 2024</span>
                <ArrowRight className="h-3.5 w-3.5 text-[#C69A4A]" />
              </div>
            </div>

            <div className="p-6 rounded-2xl border border-[#E7DDD4] bg-[#FBF7F0] shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C6721] bg-[#FBF4E6] px-2 py-0.5 rounded border border-[#E5C88E]">
                Environment & Biodiversity
              </span>
              <h3 className="mt-3 text-base font-bold font-editorial text-[#261B1E]">
                Kunming-Montreal Global Biodiversity Framework Fund (GBFF)
              </h3>
              <p className="mt-2 text-xs text-[#786B68] leading-relaxed">
                Ratification under GEF assembly and developing nation financing mechanism for 30x30 targets.
              </p>
              <div className="mt-4 pt-3 border-t border-[#E7DDD4] flex items-center justify-between text-xs font-bold text-[#741A2B]">
                <span>Connected PYQs: 2014, 2019, 2022</span>
                <ArrowRight className="h-3.5 w-3.5 text-[#C69A4A]" />
              </div>
            </div>

            <div className="p-6 rounded-2xl border border-[#E7DDD4] bg-[#FBF7F0] shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#1E7E55] bg-[#EAF5EE] px-2 py-0.5 rounded border border-[#BDE2CF]">
                Economy & Banking
              </span>
              <h3 className="mt-3 text-base font-bold font-editorial text-[#261B1E]">
                RBI Standing Liquidity Facility & T-Bill Operational Mechanics
              </h3>
              <p className="mt-2 text-xs text-[#786B68] leading-relaxed">
                Liquidity adjustment facility changes, SDF interest rates, and bank statutory reserve ratios.
              </p>
              <div className="mt-4 pt-3 border-t border-[#E7DDD4] flex items-center justify-between text-xs font-bold text-[#741A2B]">
                <span>Connected PYQs: 2018, 2020, 2024</span>
                <ArrowRight className="h-3.5 w-3.5 text-[#C69A4A]" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Membership Plans Section */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 bg-[#FBF7F0]" id="pricing">
        <div className="mx-auto max-w-7xl">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FAF2E6] px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-[#741A2B] border border-[#E5C88E] mb-3">
              Transparent Membership
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold font-editorial text-[#261B1E] tracking-tight">
              Invest in Academic Rigor. Free to Start.
            </h2>
            <p className="mt-3 text-sm sm:text-base text-[#786B68]">
              Free learning tools are always active. Premium features save preparation time and provide personalized mentorship.
            </p>

            {/* Interactive Billing Interval Selector */}
            <div className="mt-8 inline-flex items-center rounded-2xl bg-white p-1.5 border border-[#E7DDD4] shadow-xs">
              <button
                onClick={() => setPricingInterval("MONTHLY")}
                className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                  pricingInterval === "MONTHLY"
                    ? "bg-[#741A2B] text-white shadow-xs font-extrabold"
                    : "text-[#786B68] hover:text-[#261B1E]"
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setPricingInterval("QUARTERLY")}
                className={`rounded-xl px-4 py-2 text-xs font-bold transition flex items-center gap-1.5 ${
                  pricingInterval === "QUARTERLY"
                    ? "bg-[#741A2B] text-white shadow-xs font-extrabold"
                    : "text-[#786B68] hover:text-[#261B1E]"
                }`}
              >
                <span>Quarterly</span>
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[9px] font-black ${
                    pricingInterval === "QUARTERLY"
                      ? "bg-[#C69A4A] text-[#3A101A]"
                      : "bg-[#EAE4DC] text-[#741A2B]"
                  }`}
                >
                  Save ~11%
                </span>
              </button>
              <button
                onClick={() => setPricingInterval("ANNUAL")}
                className={`rounded-xl px-4 py-2 text-xs font-bold transition flex items-center gap-1.5 ${
                  pricingInterval === "ANNUAL"
                    ? "bg-[#741A2B] text-white shadow-xs font-extrabold"
                    : "text-[#786B68] hover:text-[#261B1E]"
                }`}
              >
                <span>Annual</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[9px] font-black uppercase ${
                    pricingInterval === "ANNUAL"
                      ? "bg-[#C69A4A] text-[#3A101A]"
                      : "bg-[#EAE4DC] text-[#741A2B]"
                  }`}
                >
                  Save ~44%
                </span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Plan 1: Free Aspirant */}
            <div className="p-6 rounded-2xl border border-[#E7DDD4] bg-white flex flex-col justify-between shadow-xs">
              <div>
                <span className="text-xs font-bold text-[#786B68] uppercase tracking-wider">Free Tier</span>
                <h3 className="mt-1 text-xl font-bold font-editorial text-[#261B1E]">Free Aspirant</h3>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold font-editorial text-[#261B1E]">₹0</span>
                  <span className="text-xs text-[#786B68]">/ forever</span>
                </div>
                <p className="mt-2 text-xs text-[#786B68]">Essential PYQ exploration and daily diagnostic drills.</p>
                <div className="mt-6 pt-4 border-t border-[#E7DDD4] space-y-2.5 text-xs text-[#261B1E]">
                  <div className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-[#1E7E55]" /><span>15 PYQs per day</span></div>
                  <div className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-[#1E7E55]" /><span>Daily 5-Question Quiz</span></div>
                  <div className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-[#1E7E55]" /><span>Syllabus Micro-Topics</span></div>
                  <div className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-[#1E7E55]" /><span>NCERT Chapter Mapping</span></div>
                </div>
              </div>
              <a href="/register" className="mt-6 block text-center rounded-xl border border-[#E7DDD4] bg-[#FBF7F0] hover:bg-[#F4EDE2] py-2.5 text-xs font-bold text-[#261B1E] transition">
                Start Free Today
              </a>
            </div>

            {/* Plan 2: Aspirant Plus */}
            <div className="p-6 rounded-2xl border border-[#E7DDD4] bg-white flex flex-col justify-between shadow-xs">
              <div>
                <span className="text-xs font-bold text-[#741A2B] uppercase tracking-wider">Tier 1</span>
                <h3 className="mt-1 text-xl font-bold font-editorial text-[#261B1E]">Aspirant Plus</h3>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold font-editorial text-[#741A2B]">
                    {pricingInterval === "MONTHLY" && "₹149"}
                    {pricingInterval === "QUARTERLY" && "₹399"}
                    {pricingInterval === "ANNUAL" && "₹999"}
                  </span>
                  <span className="text-xs text-[#786B68]">
                    {pricingInterval === "MONTHLY" && "/ month"}
                    {pricingInterval === "QUARTERLY" && "/ quarter (₹133/mo)"}
                    {pricingInterval === "ANNUAL" && "/ year (₹83/mo)"}
                  </span>
                </div>
                <p className="mt-2 text-xs text-[#786B68]">For consistent practice without daily question limits.</p>
                <div className="mt-6 pt-4 border-t border-[#E7DDD4] space-y-2.5 text-xs text-[#261B1E]">
                  <div className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-[#1E7E55]" /><span>Unlimited PYQ Practice</span></div>
                  <div className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-[#1E7E55]" /><span>SM-2 Spaced Mistake Queue</span></div>
                  <div className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-[#1E7E55]" /><span>1 Full-Length Mock Test/mo</span></div>
                  <div className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-[#1E7E55]" /><span>Detailed Explanations & Notes</span></div>
                </div>
              </div>
              <a href={`/pricing?plan=PLUS&interval=${pricingInterval}`} className="mt-6 block text-center rounded-xl bg-[#741A2B] hover:bg-[#5E1422] py-2.5 text-xs font-bold text-white transition shadow-xs">
                View Plan Details
              </a>
            </div>

            {/* Plan 3: Aspirant Pro (Popular) */}
            <div className="p-6 rounded-2xl border-2 border-[#C69A4A] bg-white flex flex-col justify-between shadow-card relative">
              <div className="absolute -top-3 right-5 bg-[#C69A4A] text-[#3A101A] px-3 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider">
                Most Popular
              </div>
              <div>
                <span className="text-xs font-bold text-[#8C6721] uppercase tracking-wider">Tier 2</span>
                <h3 className="mt-1 text-xl font-bold font-editorial text-[#261B1E]">Aspirant Pro</h3>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold font-editorial text-[#741A2B]">
                    {pricingInterval === "MONTHLY" && "₹299"}
                    {pricingInterval === "QUARTERLY" && "₹799"}
                    {pricingInterval === "ANNUAL" && "₹1,999"}
                  </span>
                  <span className="text-xs text-[#786B68]">
                    {pricingInterval === "MONTHLY" && "/ month"}
                    {pricingInterval === "QUARTERLY" && "/ quarter (₹266/mo)"}
                    {pricingInterval === "ANNUAL" && "/ year (₹166/mo)"}
                  </span>
                </div>
                <p className="mt-2 text-xs text-[#786B68]">Complete exam simulator with diagnostic mistake analysis.</p>
                <div className="mt-6 pt-4 border-t border-[#E7DDD4] space-y-2.5 text-xs text-[#261B1E]">
                  <div className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-[#1E7E55]" /><span>Everything in Plus</span></div>
                  <div className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-[#1E7E55]" /><span>Unlimited Timed Mock Tests</span></div>
                  <div className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-[#1E7E55]" /><span>Pravaah AI Personal Mentor (100 msgs)</span></div>
                  <div className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-[#1E7E55]" /><span>Mains Answer Evaluation (5/mo)</span></div>
                </div>
              </div>
              <a href={`/pricing?plan=PRO&interval=${pricingInterval}`} className="mt-6 block text-center rounded-xl bg-[#C69A4A] hover:bg-[#B88B39] py-2.5 text-xs font-bold text-[#3A101A] transition shadow-gold">
                View Plan Details
              </a>
            </div>

            {/* Plan 4: Aspirant Elite */}
            <div className="p-6 rounded-2xl border border-[#E7DDD4] bg-white flex flex-col justify-between shadow-xs">
              <div>
                <span className="text-xs font-bold text-[#741A2B] uppercase tracking-wider">Tier 3</span>
                <h3 className="mt-1 text-xl font-bold font-editorial text-[#261B1E]">Aspirant Elite</h3>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold font-editorial text-[#741A2B]">
                    {pricingInterval === "MONTHLY" && "₹499"}
                    {pricingInterval === "QUARTERLY" && "₹1,299"}
                    {pricingInterval === "ANNUAL" && "₹3,499"}
                  </span>
                  <span className="text-xs text-[#786B68]">
                    {pricingInterval === "MONTHLY" && "/ month"}
                    {pricingInterval === "QUARTERLY" && "/ quarter (₹433/mo)"}
                    {pricingInterval === "ANNUAL" && "/ year (₹291/mo)"}
                  </span>
                </div>
                <p className="mt-2 text-xs text-[#786B68]">VIP academic mentor access and unlimited evaluations.</p>
                <div className="mt-6 pt-4 border-t border-[#E7DDD4] space-y-2.5 text-xs text-[#261B1E]">
                  <div className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-[#1E7E55]" /><span>Everything in Pro</span></div>
                  <div className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-[#1E7E55]" /><span>Pravaah AI Personal Mentor (300 msgs)</span></div>
                  <div className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-[#1E7E55]" /><span>Mains Evaluations (15/mo)</span></div>
                  <div className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-[#1E7E55]" /><span>Priority Faculty Support & WhatsApp SLA</span></div>
                </div>
              </div>
              <a href={`/pricing?plan=ELITE&interval=${pricingInterval}`} className="mt-6 block text-center rounded-xl border border-[#E7DDD4] bg-[#FBF7F0] hover:bg-[#F4EDE2] py-2.5 text-xs font-bold text-[#261B1E] transition">
                View Plan Details
              </a>
            </div>
          </div>

          {/* Payment Safety State Notice */}
          <div className="mt-10 p-4 rounded-2xl bg-white border border-[#E7DDD4] max-w-2xl mx-auto text-center shadow-xs">
            <div className="flex items-center justify-center gap-2 text-xs font-bold text-[#741A2B]">
              <ShieldCheck className="h-4 w-4 text-[#C69A4A]" />
              <span>Official Cashfree Payment Gateway Active & Protected</span>
            </div>
            <p className="mt-1 text-[11px] text-[#786B68]">
              All transactions are processed through 256-bit bank-grade encryption via Cashfree Payments. Instant UPI QR, NetBanking, and RuPay/Visa/MasterCard supported with zero hidden charges.
            </p>
          </div>
        </div>
      </section>

      {/* 8. Frequently Asked Questions Section */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 bg-white border-t border-[#E7DDD4]">
        <div className="mx-auto max-w-3xl">
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FAF2E6] px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-[#741A2B] border border-[#E5C88E] mb-3">
              Answers & Policies
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold font-editorial text-[#261B1E] tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="mt-3 text-sm text-[#786B68]">
              Clear information about our academic methodology and platform policies.
            </p>
          </div>

          <div className="space-y-3.5">
            {homeFaqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;

              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-[#E7DDD4] bg-[#FBF7F0] transition overflow-hidden"
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="flex w-full items-center justify-between p-5 text-left text-sm sm:text-base font-bold text-[#261B1E] hover:text-[#741A2B] transition"
                  >
                    <span>{faq.q}</span>
                    <span className="ml-4 shrink-0 text-[#C69A4A]">
                      {isOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                    </span>
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 text-xs sm:text-sm text-[#786B68] leading-relaxed border-t border-[#E7DDD4] pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
