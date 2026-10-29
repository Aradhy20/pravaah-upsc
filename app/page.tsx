import React from "react";
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
} from "lucide-react";

export default function HomePage() {
  const popularKeywords = [
    "Fundamental Rights",
    "Monetary Policy Committee",
    "Indian Ocean Dipole",
    "Swamp Deer (Barasingha)",
    "Lagrange Point (L1)",
    "Mitakshara and Dayabhaga",
  ];

  const recentPapers = [
    { year: 2024, paper: "GS Paper 1", code: "GS1", count: 100, solvedCount: 100 },
    { year: 2024, paper: "CSAT Paper 2", code: "GS2", count: 80, solvedCount: 80 },
    { year: 2023, paper: "GS Paper 1", code: "GS1", count: 100, solvedCount: 100 },
    { year: 2023, paper: "CSAT Paper 2", code: "GS2", count: 80, solvedCount: 80 },
    { year: 2022, paper: "GS Paper 1", code: "GS1", count: 100, solvedCount: 100 },
  ];

  const subjectCards = [
    {
      title: "Polity & Governance",
      desc: "Constitutional articles, Parliament, Executive, Judiciary & Statutory bodies.",
      slug: "polity-governance",
      tag: "15-18 Qs / yr",
      color: "border-blue-200 bg-blue-50/40 text-blue-900",
    },
    {
      title: "Economy & Development",
      desc: "Monetary policy, fiscal deficits, banking, external trade & national accounts.",
      slug: "economy-development",
      tag: "14-16 Qs / yr",
      color: "border-emerald-200 bg-emerald-50/40 text-emerald-900",
    },
    {
      title: "Environment & Ecology",
      desc: "Protected area network, national parks, Ramsar sites, climate conventions.",
      slug: "environment-biodiversity",
      tag: "16-20 Qs / yr",
      color: "border-teal-200 bg-teal-50/40 text-teal-900",
    },
    {
      title: "History & Art & Culture",
      desc: "Ancient sites, temple architecture, freedom struggle & social movements.",
      slug: "history-culture",
      tag: "14-16 Qs / yr",
      color: "border-amber-200 bg-amber-50/40 text-amber-900",
    },
    {
      title: "Geography & Agriculture",
      desc: "Physical systems, rivers, monsoon circulation & cropping patterns.",
      slug: "geography-agriculture",
      tag: "10-12 Qs / yr",
      color: "border-indigo-200 bg-indigo-50/40 text-indigo-900",
    },
    {
      title: "CSAT Aptitude & Logic",
      desc: "Number systems, syllogisms, permutations & reading comprehension.",
      slug: "csat-quant",
      tag: "80 Qs (Qualifying)",
      color: "border-purple-200 bg-purple-50/40 text-purple-900",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden border-b border-slate-200 bg-white px-4 pt-12 pb-16 sm:px-6 sm:pt-20 sm:pb-24">
        <div className="mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50/80 px-3.5 py-1 text-xs font-bold text-blue-700 mb-6 shadow-sm">
            <Sparkles className="h-3.5 w-3.5 text-blue-600" />
            <span>High-Fidelity UPSC CSE Prelims PYQ Learning Platform</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 leading-[1.2]">
            Find the PYQ. Understand the concept.{" "}
            <span className="text-blue-700">Learn from every mistake.</span>
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
            No bloated paywalls or unverified coaching keys. Master 1,079 officially verified UPSC General Studies & CSAT questions (2019–2024 Series A) with statement-by-statement evidence, timed exam simulation, and automated spaced mistake revision.
          </p>

          {/* Prominent PYQ Search Box */}
          <div className="mt-8 mx-auto max-w-2xl">
            <form
              action="/pyqs"
              method="GET"
              className="flex items-center rounded-2xl border-2 border-slate-300 bg-white p-2 shadow-md transition focus-within:border-blue-600 focus-within:ring-4 focus-within:ring-blue-100"
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
                Search PYQs
              </button>
            </form>

            {/* Keyword Suggestions */}
            <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5 text-xs text-slate-500">
              <span className="font-semibold text-slate-400 mr-1">Popular Topics:</span>
              {popularKeywords.map((kw) => (
                <a
                  key={kw}
                  href={`/pyqs?q=${encodeURIComponent(kw)}`}
                  className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-slate-600 hover:border-blue-300 hover:text-blue-700 hover:bg-white transition"
                >
                  {kw}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Entry CTAs */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <a
              href="/pyqs?paper=GS1"
              className="rounded-xl border border-blue-600 bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-sm hover:bg-blue-700 transition flex items-center gap-2"
            >
              <Compass className="h-4 w-4" />
              <span>Explore GS Paper 1 PYQs</span>
            </a>
            <a
              href="/pyqs?paper=GS2"
              className="rounded-xl border border-teal-600 bg-teal-600 px-5 py-3 text-sm font-bold text-white shadow-sm hover:bg-teal-700 transition flex items-center gap-2"
            >
              <BrainCircuit className="h-4 w-4" />
              <span>Explore CSAT Paper 2 PYQs</span>
            </a>
            <a
              href="/mock-tests"
              className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50 transition flex items-center gap-2"
            >
              <Clock className="h-4 w-4" />
              <span>Start Timed Exam</span>
            </a>
          </div>

          {/* Daily Workflow Shortcuts */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs">
            <a
              href="/daily-quiz"
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition shadow-xs"
            >
              <CheckCircle className="h-3.5 w-3.5 text-blue-600" />
              <span>Today's Daily Quiz</span>
            </a>
            <a
              href="/current-affairs"
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 font-semibold text-slate-700 hover:bg-teal-50 hover:text-teal-700 hover:border-teal-200 transition shadow-xs"
            >
              <TrendingUp className="h-3.5 w-3.5 text-teal-600" />
              <span>Current Affairs & Syllabus Links</span>
            </a>
            <a
              href="/mains"
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 transition shadow-xs"
            >
              <BookOpen className="h-3.5 w-3.5 text-indigo-600" />
              <span>Mains & Essay Writing</span>
            </a>
            <a
              href="/exams"
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 font-semibold text-slate-700 hover:bg-amber-50 hover:text-amber-700 hover:border-amber-200 transition shadow-xs"
            >
              <Layers className="h-3.5 w-3.5 text-amber-600" />
              <span>Official UPSC Exams Directory</span>
            </a>
          </div>
        </div>
      </section>

      {/* 2. Year-Wise Practice Entry */}
      <section className="py-12 px-4 sm:px-6 bg-slate-50 border-b border-slate-200">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
                Official Archives
              </span>
              <h2 className="text-2xl font-bold text-slate-900 mt-1">
                Year-Wise Historical Papers
              </h2>
              <p className="text-sm text-slate-500 mt-0.5">
                Complete, officially verified papers with authentic UPSC answer keys
              </p>
            </div>
            <a
              href="/pyqs"
              className="mt-3 sm:mt-0 text-sm font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <span>Explore complete archive (2019–2024)</span>
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {recentPapers.map((p, idx) => (
              <a
                key={idx}
                href={`/pyqs?paper=${p.code}&years=${p.year}`}
                className="group rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:border-blue-400 hover:shadow-md transition"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xl font-extrabold text-slate-900 group-hover:text-blue-700 transition">
                    {p.year}
                  </span>
                  <span
                    className={`rounded text-[10px] font-bold px-1.5 py-0.5 ${
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
                    <CheckCircle className="h-3 w-3" /> 100% Keyed
                  </span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Subject-Wise Silos */}
      <section className="py-14 px-4 sm:px-6 bg-white border-b border-slate-200">
        <div className="mx-auto max-w-7xl">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
              Syllabus Mapping
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
              Practise by Subject & Topic
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Read your standard textbook, then immediately drill every corresponding PYQ from 2019 to 2024.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {subjectCards.map((subj) => (
              <a
                key={subj.slug}
                href={`/pyqs?subject=${encodeURIComponent(subj.title)}`}
                className={`group rounded-2xl border p-5 transition shadow-sm hover:shadow-md ${subj.color}`}
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-700 transition">
                    {subj.title}
                  </h3>
                  <span className="rounded-full bg-white/80 px-2.5 py-0.5 text-[11px] font-bold text-slate-700 border border-slate-200 shadow-sm">
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

      {/* 4. How Pravaah Works */}
      <section className="py-14 px-4 sm:px-6 bg-slate-50 border-b border-slate-200">
        <div className="mx-auto max-w-7xl">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
              The Learning Engine
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
              Built on Cognitive Retention Principles
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-700 mb-4 font-bold text-lg">
                1
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Interactive Learn Mode
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-600">
                Pick your answer and instantly discover why it is right or wrong. Every question features a statement-by-statement breakdown, elimination technique, and textbook reference.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 mb-4 font-bold text-lg">
                2
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Strict UPSC Exam Simulation
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-600">
                Experience realistic 2-hour pressure with standard UPSC negative marking (+2.0/-0.666 for GS1, +2.5/-0.833 for CSAT). Keys are protected server-side until final submission.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50 text-purple-700 mb-4 font-bold text-lg">
                3
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Automated Mistake Bank
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-600">
                Every question answered incorrectly is automatically scheduled in your personal Revision Queue. Re-test missed questions until full mastery is achieved.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Call to Action Banner */}
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
              href="/pyqs"
              className="rounded-full bg-white px-6 py-3 text-sm font-bold text-blue-900 shadow-lg hover:bg-blue-50 transition"
            >
              Launch PYQ Explorer
            </a>
            <a
              href="/mock-tests"
              className="rounded-full border border-white/40 bg-white/10 px-6 py-3 text-sm font-bold text-white hover:bg-white/20 transition"
            >
              Take a Timed Test
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
