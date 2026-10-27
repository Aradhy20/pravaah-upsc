"use client";

import React, { useState, useEffect } from "react";
import { ArrowLeft, TrendingUp, CheckCircle, Database } from "lucide-react";

export default function AdminCoveragePage() {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCoverage() {
      try {
        const res = await fetch("/api/v1/admin/coverage");
        const json = await res.json();
        if (json.success) {
          setData(json.data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadCoverage();
  }, []);

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-16 text-center text-slate-400">
        Compiling database coverage metrics...
      </div>
    );
  }

  const { statusCounts, totalQuestions, papers, subjectCoverage } = data || {
    statusCounts: {},
    totalQuestions: 0,
    papers: [],
    subjectCoverage: [],
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <a
          href="/admin"
          className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline mb-2"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Admin Console
        </a>
        <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
          <TrendingUp className="h-7 w-7 text-purple-700" />
          Coverage & Database Quality Reports
        </h1>
        <p className="text-xs text-slate-500">
          Real-time audits of question paper completeness, answer-key verification rates, and topic representation
        </p>
      </div>

      {/* Global Status Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Total Questions</span>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">{totalQuestions}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <span className="text-[11px] font-bold text-emerald-700 uppercase">Published Live</span>
          <p className="text-2xl font-extrabold text-emerald-600 mt-1">{statusCounts.PUBLISHED || 0}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <span className="text-[11px] font-bold text-amber-700 uppercase">Needs Review</span>
          <p className="text-2xl font-extrabold text-amber-600 mt-1">{statusCounts.NEEDS_REVIEW || 0}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <span className="text-[11px] font-bold text-blue-700 uppercase">Verified Queue</span>
          <p className="text-2xl font-extrabold text-blue-700 mt-1">{statusCounts.VERIFIED || 0}</p>
        </div>
      </div>

      {/* Papers Completeness */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm mb-8">
        <h2 className="text-base font-bold text-slate-900 mb-4">
          Paper-by-Paper Completeness Target
        </h2>
        <div className="space-y-4">
          {papers.map((p: any) => (
            <div key={p.code} className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-800">
                  {p.name} ({p.code})
                </span>
                <span className="text-slate-500">
                  {p.questionCount} / {p.targetQuestions} target questions
                </span>
              </div>
              <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full rounded-full bg-blue-600 transition-all duration-500"
                  style={{
                    width: `${Math.min(100, Math.round((p.questionCount / p.targetQuestions) * 100))}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Subject Distribution */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-base font-bold text-slate-900 mb-4">
          Syllabus Subject Representation
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {subjectCoverage.map((sc: any) => (
            <div
              key={sc.slug}
              className="rounded-xl border border-slate-100 bg-slate-50 p-3 flex items-center justify-between"
            >
              <div>
                <strong className="text-slate-800">{sc.subject}</strong>
                <span className="text-[11px] text-slate-400 block">{sc.topicsCount} Topics</span>
              </div>
              <span className="rounded bg-blue-100 px-2 py-0.5 font-bold text-blue-800 text-xs">
                {sc.questionCount} Questions
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
