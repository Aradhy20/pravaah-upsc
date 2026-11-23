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
  ChevronDown,
  ChevronUp,
  HelpCircle,
  BarChart2,
  Sliders,
  Check,
  X,
  FileCheck2,
  Target,
  FileText,
} from "lucide-react";

export default function HomePage() {
  const [interactiveOption, setInteractiveOption] = useState<string | null>(null);
  const [interactiveLang, setInteractiveLang] = useState<"EN" | "HI" | "BOTH">("EN");
  const [pricingInterval, setPricingInterval] = useState<"MONTHLY" | "ANNUAL">("ANNUAL");
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

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
      title: "Polity & Governance",
      desc: "Constitutional articles, Parliament, Executive, Judiciary & Statutory bodies.",
      tag: "22 Questions",
      href: "/pyqs?subject=Polity%20%26%20Governance",
      color: "border-blue-200 bg-blue-50/30 text-blue-900",
    },
    {
      title: "Economy & Development",
      desc: "Monetary policy, fiscal deficits, banking, external trade & national accounts.",
      tag: "8 Questions",
      href: "/pyqs?subject=Economy%20%26%20Social%20Development",
      color: "border-emerald-200 bg-emerald-50/30 text-emerald-900",
    },
    {
      title: "Environment & Ecology",
      desc: "Protected area network, national parks, Ramsar sites, climate conventions.",
      tag: "7 Questions",
      href: "/pyqs?subject=Environment%20%26%20Biodiversity",
      color: "border-teal-200 bg-teal-50/30 text-teal-900",
    },
    {
      title: "History & Art & Culture",
      desc: "Ancient sites, temple architecture, freedom struggle & social movements.",
      tag: "11 Questions",
      href: "/pyqs?subject=History%20%26%20Art%20%26%20Culture",
      color: "border-amber-200 bg-amber-50/30 text-amber-900",
    },
    {
      title: "Geography & Agriculture",
      desc: "Physical systems, rivers, monsoon circulation & cropping patterns.",
      tag: "7 Questions",
      href: "/pyqs?subject=Geography%20%26%20Agriculture",
      color: "border-indigo-200 bg-indigo-50/30 text-indigo-900",
    },
    {
      title: "CSAT Aptitude & Logic",
      desc: "Number systems, reading comprehension, syllogisms & permutations.",
      tag: "47 Questions",
      href: "/pyqs?paper=GS2",
      color: "border-purple-200 bg-purple-50/30 text-purple-900",
    },
  ];

  const homeFaqs = [
    {
      q: "How are previous year questions and answer keys verified on Pravaah?",
      a: "Every question is transcribed directly from official UPSC examination master question papers (Series A) and matched to official UPSC final revised answer keys published in government gazettes.",
    },
    {
      q: "Does Pravaah support Hindi medium aspirants?",
      a: "Yes. Questions with verified official UPSC Hindi translations feature authentic Devanagari question stems, options, and pedagogical explanations. We never substitute authentic gazette text with unverified machine translations.",
    },
    {
      q: "What is the difference between GS Paper 1 and CSAT Paper 2 scoring?",
      a: "General Studies Paper 1 contains 100 questions (200 marks, +2.0 for correct, -0.666 for incorrect). CSAT Paper 2 contains 80 questions (200 marks, +2.5 for correct, -0.833 for incorrect) and requires 33% (66 marks) to qualify for Mains evaluation.",
    },
    {
      q: "How does the Spaced Mistake Revision Queue work?",
      a: "When you miss a question during practice or mock tests, it is automatically queued for spaced review using the SuperMemo-2 algorithm on Day 1, Day 3, and Day 7 until concept mastery is demonstrated.",
    },
    {
      q: "Are the free features permanently available?",
      a: "Yes. The Foundation plan provides unlimited free access to the verified PYQ Explorer, daily quizzes, syllabus micro-topics, and NCERT mappings with zero payment required.",
    },
    {
      q: "What is the status of online subscription payments?",
      a: "Paid checkout is temporarily paused while our secure Cashfree payment gateway integration completes regulatory verification. All free practice tools remain 100% active.",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* 1. Hero Section: Two-Column Academic Layout */}
      <section className="relative overflow-hidden border-b border-[#E4E7EC] bg-gradient-to-b from-[#F7F9FC] via-white to-white px-4 pt-10 pb-16 sm:px-6 sm:pt-14 sm:pb-20">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            
            {/* Left Column: Value Proposition, Search Bar, CTAs */}
            <div className="lg:col-span-7 text-left">
              {/* Trust Label */}
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50/90 px-3.5 py-1 text-xs font-bold text-[#2453E6] mb-4 shadow-xs">
                <Sparkles className="h-3.5 w-3.5 text-[#2453E6]" />
                <span>Verified UPSC CSE Academic Platform</span>
              </div>

              {/* Core Headline */}
              <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-[#101828] leading-[1.18]">
                Find the PYQ. Understand the Concept.{" "}
                <span className="text-[#2453E6]">Master Every Mistake.</span>
              </h1>

              {/* Supporting Description */}
              <p className="mt-4 text-sm sm:text-base text-[#475467] leading-relaxed font-normal max-w-2xl">
                Practice UPSC previous year questions with structured explanations, source references, concept mapping and bilingual learning support.
              </p>

              {/* Full-Width Accessible Search Bar */}
              <div className="mt-6">
                <form
                  action="/pyqs"
                  method="GET"
                  className="flex items-center w-full rounded-2xl border-2 border-[#E4E7EC] bg-white p-1.5 shadow-xs transition focus-within:border-[#2453E6] focus-within:ring-4 focus-within:ring-[#2453E6]/10"
                >
                  <Search className="ml-3 h-5 w-5 text-[#667085] shrink-0" />
                  <input
                    type="text"
                    name="q"
                    placeholder="Search topics, constitutional articles, treaties, or keywords..."
                    aria-label="Search previous year questions"
                    className="w-full bg-transparent px-3 py-2 text-sm sm:text-base text-[#101828] placeholder:text-[#667085] focus:outline-none min-h-[44px]"
                  />
                  <button
                    type="submit"
                    className="shrink-0 rounded-xl bg-[#2453E6] px-5 py-2.5 text-sm font-bold text-white shadow-xs hover:bg-[#1d44c2] transition min-h-[44px] flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2453E6]"
                  >
                    Search PYQs
                  </button>
                </form>

                {/* Popular Keywords */}
                <div className="mt-3 flex flex-wrap items-center gap-1.5 text-xs text-[#667085]">
                  <span className="font-semibold text-[#667085] mr-1">Popular Topics:</span>
                  {popularKeywords.map((kw) => (
                    <a
                      key={kw}
                      href={`/pyqs?q=${encodeURIComponent(kw)}`}
                      className="rounded-full border border-[#E4E7EC] bg-white px-2.5 py-0.5 text-[11px] font-medium text-[#475467] hover:border-[#2453E6] hover:text-[#2453E6] hover:bg-blue-50/40 transition"
                    >
                      {kw}
                    </a>
                  ))}
                </div>
              </div>

              {/* Primary Action Buttons */}
              <div className="mt-7 flex flex-wrap items-center gap-3">
                <a
                  href="/pyqs?paper=GS1"
                  className="rounded-xl bg-[#2453E6] hover:bg-[#1d44c2] px-5 py-3 text-sm font-bold text-white shadow-xs hover:shadow transition flex items-center gap-2 min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2453E6]"
                >
                  <BookOpen className="h-4 w-4" />
                  <span>Explore GS Paper I</span>
                </a>

                <a
                  href="/pyqs?paper=GS2"
                  className="rounded-xl border border-[#E4E7EC] hover:border-[#D0D5DD] bg-white px-5 py-3 text-sm font-bold text-[#101828] hover:bg-[#F7F9FC] transition flex items-center gap-2 min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2453E6]"
                >
                  <Compass className="h-4 w-4 text-[#12A878]" />
                  <span>Explore CSAT</span>
                </a>

                <a
                  href="/mock-tests"
                  className="rounded-xl border border-[#E4E7EC] hover:border-[#D0D5DD] bg-white px-4 py-3 text-sm font-bold text-[#101828] hover:bg-[#F7F9FC] transition flex items-center gap-2 min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2453E6]"
                >
                  <Clock className="h-4 w-4 text-[#F59E0B]" />
                  <span>Start Timed Practice</span>
                </a>
              </div>

              {/* Secondary Feature Links */}
              <div className="mt-6 flex flex-wrap items-center gap-2 pt-4 border-t border-[#E4E7EC]">
                <a
                  href="/syllabus"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-semibold text-[#2453E6] hover:bg-blue-100 transition"
                >
                  <Sparkles className="h-3 w-3" />
                  <span>UPSC Crack Engine & Vault</span>
                </a>
                <a
                  href="/system-flow"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#F7F9FC] border border-[#E4E7EC] px-2.5 py-1 text-xs font-semibold text-[#475467] hover:bg-slate-100 transition"
                >
                  <BrainCircuit className="h-3 w-3 text-indigo-600" />
                  <span>Aspirant Flow</span>
                </a>
                <a
                  href="/daily-quiz"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-[#12A878] hover:bg-emerald-100 transition"
                >
                  <CheckCircle className="h-3 w-3" />
                  <span>Daily Quiz</span>
                </a>
                <a
                  href="/current-affairs"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-teal-50 px-2.5 py-1 text-xs font-semibold text-teal-700 hover:bg-teal-100 transition"
                >
                  <TrendingUp className="h-3 w-3" />
                  <span>Current Affairs</span>
                </a>
                <a
                  href="/mains"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-purple-50 px-2.5 py-1 text-xs font-semibold text-purple-700 hover:bg-purple-100 transition"
                >
                  <FileCheck2 className="h-3 w-3" />
                  <span>Mains Answer Studio</span>
                </a>
              </div>
            </div>

            {/* Right Column: High-Trust Academic Study Visual & Verified Statistics */}
            <div className="lg:col-span-5">
              <div className="relative rounded-2xl overflow-hidden border border-[#E4E7EC] shadow-xl bg-[#101828] group">
                <div className="relative aspect-[4/3] sm:aspect-[16/11] w-full overflow-hidden">
                  <img
                    src="/images/upsc_trust_hero.jpg"
                    alt="Pravaah UPSC Official Preparation Platform - Academic Rigor & Verified Ground Truth"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#101828]/95 via-[#101828]/30 to-black/30" />

                  {/* Badges */}
                  <div className="absolute top-3.5 left-3.5 flex items-center gap-1.5 rounded-xl bg-[#101828]/90 backdrop-blur-md border border-white/20 px-3 py-1.5 text-[11px] font-bold text-white shadow-md">
                    <ShieldCheck className="h-4 w-4 text-[#12A878]" />
                    <span>Verified Series A Key</span>
                  </div>

                  <div className="absolute top-3.5 right-3.5 flex items-center gap-1.5 rounded-xl bg-blue-900/90 backdrop-blur-md border border-blue-400/30 px-3 py-1.5 text-[11px] font-bold text-blue-200 shadow-md">
                    <Sparkles className="h-3.5 w-3.5 text-[#F59E0B]" />
                    <span>SM-2 Retention Engine</span>
                  </div>

                  <div className="absolute bottom-3.5 left-4 right-4 text-left">
                    <div className="text-[10px] font-extrabold uppercase tracking-wider text-blue-300">
                      Academic Rigor For Serious Aspirants
                    </div>
                    <div className="text-xs sm:text-sm font-bold text-white leading-snug mt-0.5">
                      Pedagogical Evidence & Verified Official Master Keys
                    </div>
                  </div>
                </div>

                {/* Real Verified Production Statistics (Phase 3 Audited Counts) */}
                <div className="grid grid-cols-4 divide-x divide-slate-800 bg-[#101828] py-3.5 px-2 text-center text-white">
                  <div>
                    <div className="text-base sm:text-lg font-black text-blue-400">121</div>
                    <div className="text-[10px] font-medium text-[#667085] mt-0.5 leading-tight">Prelims Qs</div>
                  </div>
                  <div>
                    <div className="text-base sm:text-lg font-black text-[#12A878]">32</div>
                    <div className="text-[10px] font-medium text-[#667085] mt-0.5 leading-tight">Mains Qs</div>
                  </div>
                  <div>
                    <div className="text-base sm:text-lg font-black text-[#F59E0B]">41</div>
                    <div className="text-[10px] font-medium text-[#667085] mt-0.5 leading-tight">Hindi Devanagari</div>
                  </div>
                  <div>
                    <div className="text-base sm:text-lg font-black text-indigo-400">100%</div>
                    <div className="text-[10px] font-medium text-[#667085] mt-0.5 leading-tight">Verified Keys</div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. Verified Content Overview (3 Pedagogical Pillars) */}
      <section className="py-16 px-4 sm:px-6 bg-white border-b border-[#E4E7EC]">
        <div className="mx-auto max-w-7xl">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-[#2453E6]">
              Pedagogical Standards
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#101828] mt-1.5">
              Why Serious Aspirants Learn with Pravaah
            </h2>
            <p className="text-sm text-[#475467] mt-2">
              Replacing unverified coaching answer keys with official gazette data, cognitive repetition, and structured frameworks.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <div className="rounded-2xl border border-[#E4E7EC] bg-white p-6 sm:p-7 shadow-xs hover:shadow-md transition">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-[#2453E6] mb-5">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-[#101828]">Official Series A Ground Truth</h3>
              <p className="mt-2 text-xs sm:text-sm leading-relaxed text-[#475467]">
                Never prepare with conflicting coaching keys. Every question in our catalog is mapped to official UPSC Series A keys and backed by authoritative citations.
              </p>
              <div className="mt-4 pt-3 border-t border-[#E4E7EC] flex items-center gap-1 text-xs font-bold text-[#2453E6]">
                <span>121 Verified Prelims Questions</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </div>
            </div>

            <div className="rounded-2xl border border-[#E4E7EC] bg-white p-6 sm:p-7 shadow-xs hover:shadow-md transition">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-[#F59E0B] mb-5">
                <RotateCcw className="h-6 w-6" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-[#101828]">SuperMemo-2 Spaced Mistake Queue</h3>
              <p className="mt-2 text-xs sm:text-sm leading-relaxed text-[#475467]">
                Avoid passive re-reading. Pravaah automatically schedules every missed question in an adaptive spaced review queue on Day 1, Day 3, and Day 7.
              </p>
              <div className="mt-4 pt-3 border-t border-[#E4E7EC] flex items-center gap-1 text-xs font-bold text-[#F59E0B]">
                <span>Automated Spaced Intervals</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </div>
            </div>

            <div className="rounded-2xl border border-[#E4E7EC] bg-white p-6 sm:p-7 shadow-xs hover:shadow-md transition">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700 mb-5">
                <Sparkles className="h-6 w-6" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-[#101828]">Structured Mains Frameworks</h3>
              <p className="mt-2 text-xs sm:text-sm leading-relaxed text-[#475467]">
                Master 32 authentic Mains questions with multi-dimensional guidance: Introduction, body arguments, constitutional provisions, and balanced conclusions.
              </p>
              <div className="mt-4 pt-3 border-t border-[#E4E7EC] flex items-center gap-1 text-xs font-bold text-indigo-700">
                <span>GS1–GS4 & Essay Coverage</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Interactive PYQ Learning Sample */}
      <section className="py-16 px-4 sm:px-6 bg-[#F7F9FC] border-b border-[#E4E7EC]">
        <div className="mx-auto max-w-4xl">
          <div className="text-center mb-8">
            <span className="text-xs font-bold uppercase tracking-wider text-[#2453E6]">
              Interactive Learn Mode
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#101828] mt-1">
              Experience the Concept-Driven Question Player
            </h2>
            <p className="text-xs sm:text-sm text-[#475467] mt-1.5">
              Select an option below to test instant pedagogical feedback and elimination techniques.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-[#E4E7EC] p-6 sm:p-8 text-left shadow-md relative">
            {/* Question Header */}
            <div className="flex flex-wrap items-center justify-between gap-2 pb-4 mb-5 border-b border-[#E4E7EC] text-xs">
              <div className="flex items-center gap-2">
                <span className="font-extrabold uppercase tracking-wider text-[#2453E6] bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200/60">
                  UPSC CSE 2024 GS Paper I
                </span>
                <span className="text-[#667085] font-semibold">Marks: +2.0 / -0.66</span>
              </div>

              {/* Language Switcher for Question */}
              <div className="flex items-center rounded-lg border border-[#E4E7EC] bg-[#F7F9FC] p-0.5 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setInteractiveLang("EN")}
                  className={`px-2 py-0.5 rounded-md transition ${
                    interactiveLang === "EN"
                      ? "bg-white text-[#2453E6] shadow-xs"
                      : "text-[#667085] hover:text-[#101828]"
                  }`}
                >
                  EN
                </button>
                <button
                  type="button"
                  onClick={() => setInteractiveLang("HI")}
                  className={`px-2 py-0.5 rounded-md transition ${
                    interactiveLang === "HI"
                      ? "bg-white text-[#2453E6] shadow-xs"
                      : "text-[#667085] hover:text-[#101828]"
                  }`}
                >
                  HI
                </button>
                <button
                  type="button"
                  onClick={() => setInteractiveLang("BOTH")}
                  className={`px-2 py-0.5 rounded-md transition ${
                    interactiveLang === "BOTH"
                      ? "bg-white text-[#2453E6] shadow-xs"
                      : "text-[#667085] hover:text-[#101828]"
                  }`}
                >
                  Both
                </button>
              </div>
            </div>

            {/* Question Stem */}
            {(interactiveLang === "EN" || interactiveLang === "BOTH") && (
              <div>
                <p className="text-sm sm:text-base font-bold text-[#101828] leading-snug">
                  With reference to the Central Bank Digital Currency (CBDC) issued by the RBI, consider the following statements:
                </p>
                <ol className="mt-2.5 text-xs sm:text-sm text-[#475467] space-y-1.5 list-decimal list-inside leading-relaxed">
                  <li>It is a sovereign digital currency appearing as a direct liability on the RBI balance sheet.</li>
                  <li>It requires an underlying commercial bank deposit account for offline peer-to-peer transfers.</li>
                </ol>
                <p className="mt-2.5 text-xs sm:text-sm font-semibold text-[#101828]">
                  Which of the statements given above is/are correct?
                </p>
              </div>
            )}

            {(interactiveLang === "HI" || interactiveLang === "BOTH") && (
              <div className={interactiveLang === "BOTH" ? "mt-4 pt-4 border-t border-[#E4E7EC]" : ""}>
                <p className="text-sm sm:text-base font-bold text-[#101828] leading-relaxed">
                  भारतीय रिज़र्व बैंक (RBI) द्वारा जारी केंद्रीय बैंक डिजिटल मुद्रा (CBDC) के संदर्भ में, निम्नलिखित कथनों पर विचार कीजिए:
                </p>
                <ol className="mt-2.5 text-xs sm:text-sm text-[#475467] space-y-1.5 list-decimal list-inside leading-relaxed">
                  <li>यह एक संप्रभु डिजिटल मुद्रा है जो RBI की बैलेंस शीट पर प्रत्यक्ष देनदारी के रूप में दिखाई देती है।</li>
                  <li>इसके ऑफ़लाइन पीयर-टू-पीयर हस्तांतरण के लिए एक अंतर्निहित वाणिज्यिक बैंक जमा खाते की आवश्यकता होती है।</li>
                </ol>
                <p className="mt-2.5 text-xs sm:text-sm font-semibold text-[#101828]">
                  उपर्युक्त कथनों में से कौन-सा/से सही है/हैं?
                </p>
              </div>
            )}

            {/* Options */}
            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm font-semibold">
              {[
                { code: "A", textEn: "1 only", textHi: "केवल 1", correct: true },
                { code: "B", textEn: "2 only", textHi: "केवल 2", correct: false },
                { code: "C", textEn: "Both 1 and 2", textHi: "1 और 2 दोनों", correct: false },
                { code: "D", textEn: "Neither 1 nor 2", textHi: "न तो 1, न ही 2", correct: false },
              ].map((opt) => {
                const isSelected = interactiveOption === opt.code;
                return (
                  <button
                    key={opt.code}
                    onClick={() => setInteractiveOption(opt.code)}
                    className={`flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all min-h-[44px] ${
                      isSelected
                        ? opt.correct
                          ? "bg-emerald-50 border-[#12A878] text-emerald-950 shadow-xs"
                          : "bg-rose-50 border-[#DC2626] text-rose-950 shadow-xs"
                        : "bg-[#F7F9FC] border-[#E4E7EC] hover:bg-slate-100 text-[#101828]"
                    }`}
                  >
                    <span
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg font-bold text-xs ${
                        isSelected
                          ? opt.correct
                            ? "bg-[#12A878] text-white"
                            : "bg-[#DC2626] text-white"
                          : "bg-white text-[#475467] border border-[#E4E7EC]"
                      }`}
                    >
                      {opt.code}
                    </span>
                    <span>
                      {interactiveLang === "HI"
                        ? opt.textHi
                        : interactiveLang === "BOTH"
                        ? `${opt.textEn} / ${opt.textHi}`
                        : opt.textEn}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Explanation Section */}
            {interactiveOption && (
              <div className="mt-5 p-4 sm:p-5 rounded-xl bg-emerald-50/80 border border-emerald-200 text-xs sm:text-sm text-emerald-950 leading-relaxed animate-in fade-in duration-200">
                <div className="font-extrabold flex items-center gap-1.5 text-emerald-800 mb-2 text-sm">
                  <CheckCircle className="h-4 w-4" /> Correct Answer: Option A (1 only)
                </div>
                <p>
                  <strong>Statement 1 is correct:</strong> Digital Rupee (e₹) is sovereign currency issued by the Reserve Bank of India and appears as a direct liability on the central bank's balance sheet under the RBI Act, 1934.
                </p>
                <p className="mt-1.5">
                  <strong>Statement 2 is incorrect:</strong> Retail CBDC is structured as a tokenized digital bearer instrument that can be held directly in a digital wallet and transacted peer-to-peer without requiring an active commercial bank deposit account.
                </p>
                <div className="mt-3 pt-3 border-t border-emerald-200/80 flex flex-wrap items-center justify-between text-xs text-emerald-900 font-bold gap-2">
                  <span>Elimination Tip: Cross-check bearer token vs account-based settlement.</span>
                  <a href="/pyqs?paper=GS1" className="underline hover:text-emerald-950 flex items-center gap-1">
                    <span>Solve more GS1 questions</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 4. Subject-Wise Practice Grid */}
      <section className="py-16 px-4 sm:px-6 bg-white border-b border-[#E4E7EC]">
        <div className="mx-auto max-w-7xl">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-[#2453E6]">
              Syllabus Mapping
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#101828] mt-1.5">
              Practice by UPSC Subject Domain
            </h2>
            <p className="text-sm text-[#475467] mt-2">
              Read your standard textbook, then immediately drill every corresponding question with pedagogical rationales.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {subjectCards.map((subj) => (
              <a
                key={subj.title}
                href={subj.href}
                className={`group rounded-2xl border p-5 transition shadow-xs hover:shadow-md ${subj.color}`}
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-[#101828] group-hover:text-[#2453E6] transition">
                    {subj.title}
                  </h3>
                  <span className="rounded-full bg-white/95 px-2.5 py-0.5 text-[11px] font-bold text-[#475467] border border-[#E4E7EC]">
                    {subj.tag}
                  </span>
                </div>
                <p className="mt-2 text-xs sm:text-sm leading-relaxed text-[#475467]">{subj.desc}</p>
                <div className="mt-4 flex items-center gap-1 text-xs font-bold text-[#2453E6] group-hover:translate-x-1 transition-transform">
                  <span>Practice questions</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Prelims and CSAT Learning */}
      <section className="py-16 px-4 sm:px-6 bg-[#F7F9FC] border-b border-[#E4E7EC]">
        <div className="mx-auto max-w-7xl">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-[#2453E6]">
              Examination Structure
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#101828] mt-1.5">
              Prelims GS Paper I & CSAT Paper II
            </h2>
            <p className="text-sm text-[#475467] mt-2">
              Master the marking schemes, negative penalties, and qualifying criteria for both civil services preliminary papers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* GS Paper 1 Card */}
            <div className="rounded-2xl border border-[#E4E7EC] bg-white p-7 shadow-xs">
              <div className="flex items-center justify-between pb-4 border-b border-[#E4E7EC]">
                <div>
                  <span className="text-[11px] font-bold uppercase text-[#2453E6] bg-blue-50 px-2.5 py-1 rounded">
                    Merit Ranking Paper
                  </span>
                  <h3 className="text-xl font-black text-[#101828] mt-2">General Studies Paper I</h3>
                </div>
                <BookOpen className="h-8 w-8 text-[#2453E6]" />
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 text-center py-3 bg-[#F7F9FC] rounded-xl text-xs font-semibold">
                <div>
                  <div className="text-base font-extrabold text-[#101828]">100</div>
                  <div className="text-[10px] text-[#667085]">Questions</div>
                </div>
                <div>
                  <div className="text-base font-extrabold text-[#12A878]">+2.0</div>
                  <div className="text-[10px] text-[#667085]">Correct</div>
                </div>
                <div>
                  <div className="text-base font-extrabold text-[#DC2626]">-0.666</div>
                  <div className="text-[10px] text-[#667085]">Negative</div>
                </div>
              </div>
              <ul className="mt-5 space-y-2.5 text-xs sm:text-sm text-[#475467]">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-[#12A878] shrink-0" />
                  <span>Determines cutoff qualification for Civil Services Mains.</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-[#12A878] shrink-0" />
                  <span>Covers Polity, Economy, Environment, History, Geography, Sci & Tech.</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-[#12A878] shrink-0" />
                  <span>Statement-by-statement evidence and source gazettes.</span>
                </li>
              </ul>
              <div className="mt-6">
                <a
                  href="/pyqs?paper=GS1"
                  className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-[#2453E6] py-2.5 text-xs font-bold text-white hover:bg-[#1d44c2] transition"
                >
                  <span>Practice GS Paper I</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>

            {/* CSAT Paper 2 Card */}
            <div className="rounded-2xl border border-[#E4E7EC] bg-white p-7 shadow-xs">
              <div className="flex items-center justify-between pb-4 border-b border-[#E4E7EC]">
                <div>
                  <span className="text-[11px] font-bold uppercase text-[#12A878] bg-emerald-50 px-2.5 py-1 rounded">
                    Qualifying Paper (33% / 66 Marks)
                  </span>
                  <h3 className="text-xl font-black text-[#101828] mt-2">CSAT Paper II</h3>
                </div>
                <Compass className="h-8 w-8 text-[#12A878]" />
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 text-center py-3 bg-[#F7F9FC] rounded-xl text-xs font-semibold">
                <div>
                  <div className="text-base font-extrabold text-[#101828]">80</div>
                  <div className="text-[10px] text-[#667085]">Questions</div>
                </div>
                <div>
                  <div className="text-base font-extrabold text-[#12A878]">+2.5</div>
                  <div className="text-[10px] text-[#667085]">Correct</div>
                </div>
                <div>
                  <div className="text-base font-extrabold text-[#DC2626]">-0.833</div>
                  <div className="text-[10px] text-[#667085]">Negative</div>
                </div>
              </div>
              <ul className="mt-5 space-y-2.5 text-xs sm:text-sm text-[#475467]">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-[#12A878] shrink-0" />
                  <span>Requires minimum 66.0 marks out of 200 to qualify.</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-[#12A878] shrink-0" />
                  <span>Number systems, reading comprehension, syllogisms, probability.</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-[#12A878] shrink-0" />
                  <span>Pedagogical step-by-step arithmetic and logic derivations.</span>
                </li>
              </ul>
              <div className="mt-6">
                <a
                  href="/pyqs?paper=GS2"
                  className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-[#E4E7EC] bg-white py-2.5 text-xs font-bold text-[#101828] hover:bg-[#F7F9FC] transition"
                >
                  <span>Practice CSAT Paper II</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Mains and Answer Writing */}
      <section className="py-16 px-4 sm:px-6 bg-white border-b border-[#E4E7EC]">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-6">
              <span className="text-xs font-bold uppercase tracking-wider text-[#2453E6]">
                Mains Answer Studio
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#101828] mt-1.5 leading-tight">
                32 Authentic Mains Questions with Model Frameworks
              </h2>
              <p className="mt-3 text-sm text-[#475467] leading-relaxed">
                Develop structured answer writing discipline across GS Papers 1 to 4 and Essay. Every question includes structured guidance: introduction definitions, multi-stakeholder body arguments, relevant constitutional articles, and forward-looking conclusions.
              </p>
              <div className="mt-6 flex flex-wrap gap-2 text-xs font-bold">
                <span className="rounded-lg bg-blue-50 text-[#2453E6] px-3 py-1.5 border border-blue-200/60">
                  GS1: Heritage & Geography (8 Qs)
                </span>
                <span className="rounded-lg bg-emerald-50 text-[#12A878] px-3 py-1.5 border border-emerald-200/60">
                  GS2: Polity & IR (7 Qs)
                </span>
                <span className="rounded-lg bg-teal-50 text-teal-700 px-3 py-1.5 border border-teal-200/60">
                  GS3: Economy & Security (7 Qs)
                </span>
                <span className="rounded-lg bg-amber-50 text-[#F59E0B] px-3 py-1.5 border border-amber-200/60">
                  GS4: Ethics & Case Studies (6 Qs)
                </span>
                <span className="rounded-lg bg-purple-50 text-purple-700 px-3 py-1.5 border border-purple-200/60">
                  Essay Frameworks (4 Qs)
                </span>
              </div>
              <div className="mt-8">
                <a
                  href="/mains"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#2453E6] hover:bg-[#1d44c2] px-6 py-3 text-sm font-bold text-white shadow-xs transition"
                >
                  <span>Explore Mains Answer Studio</span>
                  <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="rounded-2xl border border-[#E4E7EC] bg-[#F7F9FC] p-6 shadow-xs">
                <div className="text-xs font-bold uppercase tracking-wider text-[#667085] mb-2">
                  Sample Framework Guidance • GS Paper 1 (Geography)
                </div>
                <h4 className="text-sm sm:text-base font-bold text-[#101828] leading-snug">
                  "Why is the South-West Monsoon in India experiencing increasing spatial and temporal variability in recent decades?"
                </h4>
                <div className="mt-4 space-y-2.5 text-xs text-[#475467] leading-relaxed">
                  <div className="p-3 bg-white rounded-xl border border-[#E4E7EC]">
                    <strong className="text-[#101828]">Introduction:</strong> Contextualize SW monsoon delivering 75% annual precipitation and IPCC findings on monsoon anomalies.
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-[#E4E7EC]">
                    <strong className="text-[#101828]">Body Dimensions:</strong> Detail ocean-atmospheric drivers (ENSO, IOD, MJO), tropospheric warming over Tibetan Plateau, aerosol-cloud interactions.
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-[#E4E7EC]">
                    <strong className="text-[#101828]">Way Forward:</strong> Climate-resilient agro-meteorological forecasting, micro-irrigation, and watershed management.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Study Planner and Revision */}
      <section className="py-16 px-4 sm:px-6 bg-[#F7F9FC] border-b border-[#E4E7EC]">
        <div className="mx-auto max-w-7xl">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-[#2453E6]">
              Study Discipline
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#101828] mt-1.5">
              Automated Revision & Daily Planning
            </h2>
            <p className="text-sm text-[#475467] mt-2">
              Transform random question-solving into systematic mastery with spaced repetition and target exam schedules.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="rounded-2xl border border-[#E4E7EC] bg-white p-7 shadow-xs">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-[#F59E0B] mb-4">
                <RotateCcw className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-[#101828]">Spaced Repetition Mistake Queue</h3>
              <p className="mt-2 text-xs sm:text-sm text-[#475467] leading-relaxed">
                Physical mistake notebooks are rarely reviewed. Pravaah captures every incorrectly answered question and serves it for review at scientifically proven memory consolidation intervals (1, 3, and 7 days).
              </p>
              <div className="mt-5">
                <a
                  href="/revision"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2453E6] hover:underline"
                >
                  <span>Open Mistake Notebook</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>

            <div className="rounded-2xl border border-[#E4E7EC] bg-white p-7 shadow-xs">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700 mb-4">
                <Sliders className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-[#101828]">Aspirant Daily Study Planner</h3>
              <p className="mt-2 text-xs sm:text-sm text-[#475467] leading-relaxed">
                Align daily study hours with your target UPSC attempt date. Allocate balanced focus between GS static subjects, CSAT practice, current affairs review, and weekly revision cycles.
              </p>
              <div className="mt-5">
                <a
                  href="/study-planner"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2453E6] hover:underline"
                >
                  <span>Set Up Daily Planner</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Current Affairs */}
      <section className="py-16 px-4 sm:px-6 bg-white border-b border-[#E4E7EC]">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 mb-10">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#2453E6]">
                Government Ingestion
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-[#101828] mt-1.5">
                Current Affairs Linked to Syllabus Micro-Topics
              </h2>
              <p className="text-sm text-[#475467] mt-1.5">
                Official PIB releases and Ministry updates connected directly to related historical PYQs.
              </p>
            </div>
            <a
              href="/current-affairs"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2453E6] hover:underline shrink-0"
            >
              <span>View All Briefs</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-2xl border border-[#E4E7EC] p-5 shadow-xs hover:shadow-md transition">
              <span className="rounded bg-blue-50 text-[#2453E6] px-2 py-0.5 text-[10px] font-bold uppercase">
                Economy & Banking
              </span>
              <h4 className="mt-3 text-sm font-bold text-[#101828] leading-snug">
                RBI Monetary Policy Committee: Inflation Targeting & Repo Rate Dynamic
              </h4>
              <p className="mt-2 text-xs text-[#475467] leading-relaxed">
                Analysis of the statutory 4% (+/- 2%) consumer price index framework under Section 45ZB of the RBI Act.
              </p>
              <div className="mt-4 pt-3 border-t border-[#E4E7EC] text-[11px] text-[#667085] flex items-center justify-between">
                <span>Source: PIB Release</span>
                <span className="font-semibold text-[#2453E6]">Linked: 2020 GS1 Q.12</span>
              </div>
            </div>

            <div className="rounded-2xl border border-[#E4E7EC] p-5 shadow-xs hover:shadow-md transition">
              <span className="rounded bg-teal-50 text-teal-700 px-2 py-0.5 text-[10px] font-bold uppercase">
                Environment & Law
              </span>
              <h4 className="mt-3 text-sm font-bold text-[#101828] leading-snug">
                Biological Diversity (Amendment) Act: Access and Benefit Sharing Rules
              </h4>
              <p className="mt-2 text-xs text-[#475467] leading-relaxed">
                National Biodiversity Authority provisions regarding local communities and commercial research permissions.
              </p>
              <div className="mt-4 pt-3 border-t border-[#E4E7EC] text-[11px] text-[#667085] flex items-center justify-between">
                <span>Source: Ministry Gazette</span>
                <span className="font-semibold text-[#2453E6]">Linked: 2023 GS1 Q.45</span>
              </div>
            </div>

            <div className="rounded-2xl border border-[#E4E7EC] p-5 shadow-xs hover:shadow-md transition">
              <span className="rounded bg-indigo-50 text-indigo-700 px-2 py-0.5 text-[10px] font-bold uppercase">
                Polity & Constitution
              </span>
              <h4 className="mt-3 text-sm font-bold text-[#101828] leading-snug">
                Delimitation Commission & Constitutional Quota Adjustments
              </h4>
              <p className="mt-2 text-xs text-[#475467] leading-relaxed">
                Constitutional provisions under Article 82 and 170 regarding territorial representation following decennial census.
              </p>
              <div className="mt-4 pt-3 border-t border-[#E4E7EC] text-[11px] text-[#667085] flex items-center justify-between">
                <span>Source: Law Ministry</span>
                <span className="font-semibold text-[#2453E6]">Linked: 2024 GS1 Q.8</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 9. Free Resource Library (Crack Engine & High-Yield Vault) */}
      <section className="py-16 px-4 sm:px-6 bg-[#F7F9FC] border-b border-[#E4E7EC]">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-3xl bg-[#101828] p-8 sm:p-12 text-white shadow-xl relative overflow-hidden">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-8 relative z-10">
              <div className="max-w-2xl text-left">
                <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/20 px-3.5 py-1 text-xs font-bold text-blue-200 mb-3 border border-blue-400/30">
                  <Sparkles className="h-3.5 w-3.5" />
                  Free Aspirant Resource Hub
                </div>
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white leading-tight">
                  The Complete UPSC Crack Engine & High-Yield Vault
                </h3>
                <p className="mt-3 text-sm sm:text-base text-slate-300 leading-relaxed">
                  Authoritative academic reference materials in one place: 53 micro-topic syllabus breakdowns, standard NCERT chapter mappings (Classes 6–12), booklists, static cheat sheets (Constitutional Articles, Amendments, National Parks), and preparation blueprints.
                </p>
              </div>

              <div className="shrink-0 flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                <a
                  href="/syllabus"
                  className="rounded-xl bg-[#2453E6] hover:bg-[#1d44c2] px-6 py-3.5 text-center text-sm font-bold text-white shadow-lg transition flex items-center justify-center gap-2 min-h-[44px]"
                >
                  <span>Explore Crack Vault</span>
                  <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 10. Pricing & Account Access */}
      <section className="py-16 px-4 sm:px-6 bg-white border-b border-[#E4E7EC]">
        <div className="mx-auto max-w-6xl text-center">
          <span className="text-xs font-bold uppercase tracking-wider text-[#2453E6]">
            Transparent Subscription
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-[#101828] mt-1.5">
            Invest in High-Yield UPSC Precision
          </h2>
          <p className="text-sm text-[#475467] mt-2 max-w-xl mx-auto">
            Choose a plan that matches your current preparation stage. Annual plans include a 42% discount.
          </p>

          {/* Billing Interval Toggle */}
          <div className="mt-6 inline-flex p-1 bg-[#F7F9FC] border border-[#E4E7EC] rounded-xl">
            <button
              onClick={() => setPricingInterval("MONTHLY")}
              className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
                pricingInterval === "MONTHLY"
                  ? "bg-white text-[#101828] shadow-xs"
                  : "text-[#475467] hover:text-[#101828]"
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setPricingInterval("ANNUAL")}
              className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                pricingInterval === "ANNUAL"
                  ? "bg-[#2453E6] text-white shadow-xs"
                  : "text-[#475467] hover:text-[#101828]"
              }`}
            >
              <span>Annual Plan</span>
              <span className="rounded bg-amber-400 text-slate-900 px-1.5 py-0.2 text-[10px] font-black">
                SAVE 42%
              </span>
            </button>
          </div>

          {/* Payment Gateway Migration Notice */}
          <div className="mt-8 mx-auto max-w-2xl rounded-xl border border-amber-200 bg-amber-50/90 p-3.5 text-center text-xs text-amber-900">
            <div className="flex items-center justify-center gap-2 font-bold">
              <Lock className="h-4 w-4 text-amber-700 shrink-0" />
              <span>Online payments are temporarily unavailable while our secure payment system is being configured.</span>
            </div>
            <p className="mt-1 text-[11px] text-amber-800">
              Free Aspirant Foundation access (121 Prelims questions, CSAT, daily quizzes, and syllabus vault) remains 100% active.
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            {/* Foundation Free */}
            <div className="rounded-2xl border border-[#E4E7EC] p-6 flex flex-col justify-between bg-white shadow-xs">
              <div>
                <h3 className="text-base font-bold text-[#101828]">Foundation</h3>
                <p className="text-xs text-[#475467] mt-1">Free forever for casual practice</p>
                <div className="mt-4 text-3xl font-black text-[#101828]">₹0</div>
                <div className="mt-6 space-y-2.5 text-xs text-[#475467]">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-[#12A878] shrink-0" />
                    <span>Verified PYQs in Learn Mode</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-[#12A878] shrink-0" />
                    <span>Daily Quiz diagnostic (5 Qs/day)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-[#12A878] shrink-0" />
                    <span>Syllabus Micro-Topics & NCERT Maps</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#98A2B3]">
                    <X className="h-4 w-4 text-slate-300 shrink-0" />
                    <span>Timed 2-Hour Examination Simulator</span>
                  </div>
                </div>
              </div>
              <a
                href="/register"
                className="mt-8 w-full block text-center py-2.5 rounded-xl border border-[#E4E7EC] bg-[#F7F9FC] text-xs font-bold text-[#101828] hover:bg-slate-100 transition min-h-[44px] flex items-center justify-center"
              >
                Start Free Practice
              </a>
            </div>

            {/* Achiever Pro */}
            <div className="rounded-2xl border-2 border-[#2453E6] p-6 flex flex-col justify-between bg-blue-50/20 shadow-md relative">
              <div className="absolute -top-3 right-6 rounded-full bg-[#2453E6] px-3 py-0.5 text-[10px] font-black text-white uppercase tracking-wider">
                Recommended
              </div>
              <div>
                <h3 className="text-base font-black text-[#101828]">Achiever (Prelims Pro)</h3>
                <p className="text-xs text-[#475467] mt-1">Targeting CSE Prelims 2025/2026</p>
                <div className="mt-4">
                  <span className="text-3xl font-black text-[#101828]">
                    {pricingInterval === "ANNUAL" ? "₹5,499" : "₹799"}
                  </span>
                  <span className="text-xs text-[#667085] ml-1">
                    {pricingInterval === "ANNUAL" ? "/ year (₹458/mo)" : "/ month"}
                  </span>
                </div>
                <div className="mt-6 space-y-2.5 text-xs text-[#475467] font-medium">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-[#12A878] shrink-0" />
                    <span>Unlimited Timed Mock Exams</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-[#12A878] shrink-0" />
                    <span>Automated SM-2 Spaced Mistake Queue</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-[#12A878] shrink-0" />
                    <span>Negative Marking Scoring Telemetry</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-[#12A878] shrink-0" />
                    <span>Unlimited Notes & Bookmarks</span>
                  </div>
                </div>
              </div>
              <button
                disabled
                className="mt-8 w-full flex items-center justify-center gap-1.5 rounded-xl bg-slate-100 border border-slate-200 py-3 text-xs font-bold text-slate-400 cursor-not-allowed min-h-[44px]"
              >
                <Lock className="h-3.5 w-3.5" />
                <span>Subscription Temporarily Paused</span>
              </button>
            </div>

            {/* Scholar */}
            <div className="rounded-2xl border border-[#E4E7EC] p-6 flex flex-col justify-between bg-white shadow-xs">
              <div>
                <h3 className="text-base font-bold text-[#101828]">Scholar (Ranker Suite)</h3>
                <p className="text-xs text-[#475467] mt-1">Comprehensive Prelims & Mains frameworks</p>
                <div className="mt-4">
                  <span className="text-3xl font-black text-[#101828]">
                    {pricingInterval === "ANNUAL" ? "₹8,999" : "₹1,299"}
                  </span>
                  <span className="text-xs text-[#667085] ml-1">
                    {pricingInterval === "ANNUAL" ? "/ year (₹749/mo)" : "/ month"}
                  </span>
                </div>
                <div className="mt-6 space-y-2.5 text-xs text-[#475467]">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-[#12A878] shrink-0" />
                    <span>Everything in Achiever Pro</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-[#12A878] shrink-0" />
                    <span>32 Authentic Mains Model Frameworks</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-[#12A878] shrink-0" />
                    <span>Case Law & Committee Citations</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-[#12A878] shrink-0" />
                    <span>High-Yield Static Cheat Sheet Vault</span>
                  </div>
                </div>
              </div>
              <button
                disabled
                className="mt-8 w-full flex items-center justify-center gap-1.5 rounded-xl bg-slate-100 border border-slate-200 py-3 text-xs font-bold text-slate-400 cursor-not-allowed min-h-[44px]"
              >
                <Lock className="h-3.5 w-3.5" />
                <span>Subscription Temporarily Paused</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 11. Frequently Asked Questions */}
      <section className="py-16 px-4 sm:px-6 bg-[#F7F9FC] border-b border-[#E4E7EC]">
        <div className="mx-auto max-w-3xl">
          <div className="text-center mb-10">
            <HelpCircle className="mx-auto h-7 w-7 text-[#2453E6] mb-2" />
            <h2 className="text-2xl sm:text-3xl font-black text-[#101828]">
              Frequently Asked Questions
            </h2>
            <p className="mt-1.5 text-xs sm:text-sm text-[#475467]">
              Clear information about question authenticity, bilingual coverage, and preparation tools.
            </p>
          </div>

          <div className="divide-y divide-[#E4E7EC] rounded-2xl border border-[#E4E7EC] bg-white p-6 shadow-xs">
            {homeFaqs.map((faq, idx) => (
              <div key={idx} className="py-4 first:pt-0 last:pb-0">
                <button
                  onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                  aria-expanded={openFaqIndex === idx}
                  className="flex w-full items-center justify-between text-left text-sm font-bold text-[#101828]"
                >
                  <span>{faq.q}</span>
                  {openFaqIndex === idx ? (
                    <ChevronUp className="h-4 w-4 text-[#667085] shrink-0" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-[#667085] shrink-0" />
                  )}
                </button>
                {openFaqIndex === idx && (
                  <p className="mt-2 text-xs sm:text-sm text-[#475467] leading-relaxed animate-in fade-in duration-150">
                    {faq.a}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 12. Final CTA Banner */}
      <section className="bg-[#101828] py-16 px-4 sm:px-6 text-white text-center">
        <div className="mx-auto max-w-3xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-blue-200 text-xs font-bold mb-4 border border-white/10">
            <Sparkles className="h-3.5 w-3.5" />
            UPSC CSE Academic Preparation
          </div>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
            Stop Guessing. Start Mastering Every PYQ.
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-300 max-w-xl mx-auto font-normal">
            Prepare with verified official Series A question papers, structured explanations, and spaced mistake retention.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a
              href="/register"
              className="rounded-xl bg-[#2453E6] hover:bg-[#1d44c2] px-6 py-3.5 text-sm font-bold text-white shadow-lg transition min-h-[44px] flex items-center justify-center"
            >
              Create Free Aspirant Account
            </a>
            <a
              href="/system-flow"
              className="rounded-xl border border-white/20 bg-white/5 px-6 py-3.5 text-sm font-bold text-white hover:bg-white/10 transition min-h-[44px] flex items-center justify-center"
            >
              View Daily Operating Loop
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
