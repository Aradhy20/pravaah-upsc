"use client";

import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  CheckCircle,
  Clock,
  ExternalLink,
  Layers,
  Database,
  Filter,
  Search,
  AlertTriangle,
  FileText,
  BarChart2,
  RefreshCw,
} from "lucide-react";

interface ExamFamilyCoverage {
  code: string;
  name: string;
  targetYearsCount: number;
  completedYearsCount: number;
  harvestedQuestions: number;
  years: Array<{
    year: number;
    paperOrStage: string;
    status: string;
    notes?: string | null;
    officialSourceUrl?: string | null;
  }>;
}

interface CoverageData {
  summary: {
    totalTargets: number;
    totalQuestionsInDb: number;
    verifiedAnswersCount: number;
    totalKnowledgeSources: number;
    statusBreakdown: Record<string, number>;
    historicalSpan: string;
  };
  examFamilies: ExamFamilyCoverage[];
}

export default function CoverageMatrixPage() {
  const [coverage, setCoverage] = useState<CoverageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedExam, setSelectedExam] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");

  useEffect(() => {
    async function loadCoverage() {
      try {
        setLoading(true);
        const res = await fetch("/api/v1/coverage");
        const json = await res.json();
        if (json.success) {
          setCoverage(json.data);
        }
      } catch (e) {
        console.error("Failed to load coverage:", e);
      } finally {
        setLoading(false);
      }
    }
    loadCoverage();
  }, []);

  const filteredFamilies = coverage?.examFamilies.filter((ef) => {
    if (selectedExam !== "ALL" && ef.code !== selectedExam) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchesName = ef.name.toLowerCase().includes(q) || ef.code.toLowerCase().includes(q);
      const matchesYears = ef.years.some((y) => y.year.toString().includes(q) || y.paperOrStage.toLowerCase().includes(q));
      return matchesName || matchesYears;
    }
    return true;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return (
          <span className="inline-flex items-center gap-1 rounded bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-800">
            <CheckCircle className="h-3 w-3" /> Fully Verified
          </span>
        );
      case "EXTRACTED":
        return (
          <span className="inline-flex items-center gap-1 rounded bg-blue-100 px-2 py-0.5 text-[11px] font-bold text-blue-800">
            <Database className="h-3 w-3" /> Ingested in Bank
          </span>
        );
      case "DISCOVERED":
        return (
          <span className="inline-flex items-center gap-1 rounded bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-800">
            <Clock className="h-3 w-3" /> Source Catalogued
          </span>
        );
      case "UNAVAILABLE":
        return (
          <span className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-500">
            Not Conducted / Omitted
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
            Archive Target
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header Breadcrumbs & Title */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-800 mb-2">
            <ShieldCheck className="h-3.5 w-3.5" />
            Centralized UPSC Historical Knowledge Matrix
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            UPSC Examination Coverage & Completeness Engine
          </h1>
          <p className="mt-2 text-sm text-slate-600 max-w-3xl leading-relaxed">
            Multi-dimensional transparency matrix tracking 14 Central UPSC Examination Families across 32 historical years (1995–2026).
            All ingested records are bound to primary official gazettes, answer keys, and NCERT curriculum standards with zero artificial hallucinations.
          </p>
        </div>

        {/* Top Summary Metrics */}
        {coverage && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Tracking Targets</span>
              <div className="text-2xl font-black text-slate-900 mt-1">{coverage.summary.totalTargets} Papers</div>
              <span className="text-[11px] text-slate-500">14 Examination Families</span>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Questions in Database</span>
              <div className="text-2xl font-black text-blue-700 mt-1">{coverage.summary.totalQuestionsInDb.toLocaleString()}</div>
              <span className="text-[11px] text-blue-600 font-semibold">Active in PYQ Explorer</span>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Official Key Verified</span>
              <div className="text-2xl font-black text-emerald-700 mt-1">{coverage.summary.verifiedAnswersCount.toLocaleString()}</div>
              <span className="text-[11px] text-emerald-600 font-semibold">UPSC Series A Final Keys</span>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Knowledge Sources</span>
              <div className="text-2xl font-black text-indigo-700 mt-1">{coverage.summary.totalKnowledgeSources}</div>
              <span className="text-[11px] text-indigo-600 font-semibold">UPSC, NCERT, PIB & Gazette</span>
            </div>
          </div>
        )}

        {/* Filter & Search Bar */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 mb-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mr-1">Exam:</span>
            {["ALL", "CSE", "CDS", "NDA", "CAPF", "IFoS", "EPFO"].map((code) => (
              <button
                key={code}
                onClick={() => setSelectedExam(code)}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                  selectedExam === code
                    ? "bg-blue-700 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {code}
              </button>
            ))}
          </div>

          <div className="relative min-w-[240px] flex-1 sm:flex-initial">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by exam, stage, or year..."
              className="w-full rounded-lg border border-slate-200 bg-slate-50 pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Coverage Cards by Exam Family */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <RefreshCw className="h-8 w-8 animate-spin text-blue-600 mb-3" />
            <p className="text-sm font-semibold text-slate-600">Loading historical coverage matrix...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredFamilies?.map((ef) => (
              <div key={ef.code} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-md bg-blue-100 px-2.5 py-0.5 text-xs font-black text-blue-800">
                        {ef.code}
                      </span>
                      <h2 className="text-lg font-bold text-slate-900">{ef.name}</h2>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      {ef.targetYearsCount} target tracking cycles across 1995–2026
                    </p>
                  </div>

                  <div className="flex items-center gap-3 text-xs">
                    <div className="rounded-lg bg-slate-50 border border-slate-100 px-3 py-1.5 text-slate-600">
                      <span className="font-bold text-slate-900">{ef.years.length}</span> Paper Records
                    </div>
                    {ef.code === "CSE" && (
                      <a
                        href="/pyqs?paper=GS1"
                        className="rounded-lg bg-blue-50 border border-blue-200 px-3 py-1.5 font-bold text-blue-700 hover:bg-blue-100 transition"
                      >
                        Explore Questions →
                      </a>
                    )}
                  </div>
                </div>

                {/* Years Grid */}
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                  {ef.years.slice(0, 32).map((y, idx) => (
                    <div
                      key={idx}
                      className="rounded-xl border border-slate-100 bg-slate-50/60 p-2.5 flex flex-col justify-between hover:border-slate-300 transition"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-slate-900">{y.year}</span>
                        {y.officialSourceUrl && (
                          <a
                            href={y.officialSourceUrl}
                            target="_blank"
                            rel="noreferrer"
                            title="Official Archive Link"
                            className="text-slate-400 hover:text-blue-600"
                          >
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-500 truncate mt-1">
                        {y.paperOrStage}
                      </span>
                      <div className="mt-2">
                        {getStatusBadge(y.status)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Official Citation Footer Note */}
        <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            Integrity, Anti-Hallucination & Provenance Principles
          </h3>
          <p className="mt-2 text-xs text-slate-600 leading-relaxed">
            Pravaah UPSC strictly upholds examination fidelity. Where historical examination archives from earlier years (pre-2010 or specific recruitment tests) are unavailable digitally from the Union Public Service Commission archives, our database records them transparently as <code>NOT_HARVESTED</code> or <code>UNAVAILABLE</code> rather than artificially generating or fabricating synthetic questions.
          </p>
          <div className="mt-4 flex flex-wrap gap-4 text-xs font-semibold text-blue-700">
            <a href="https://www.upsc.gov.in/examinations/previous-question-papers" target="_blank" rel="noreferrer" className="hover:underline flex items-center gap-1">
              Official UPSC Question Paper Portal <ExternalLink className="h-3 w-3" />
            </a>
            <a href="https://ncert.nic.in/textbook.php" target="_blank" rel="noreferrer" className="hover:underline flex items-center gap-1">
              NCERT Textbook Portal <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
