"use client";

import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  UploadCloud,
  CheckCircle,
  FileText,
  Layers,
  ArrowRight,
  TrendingUp,
} from "lucide-react";

export default function AdminDashboardPage() {
  const [coverageData, setCoverageData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCoverage() {
      try {
        const res = await fetch("/api/v1/admin/coverage");
        const json = await res.json();
        if (json.success) {
          setCoverageData(json.data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadCoverage();
  }, []);

  const statusCounts = coverageData?.statusCounts || {
    DRAFT: 0,
    NEEDS_REVIEW: 0,
    VERIFIED: 0,
    PUBLISHED: 0,
    ARCHIVED: 0,
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-amber-600" />
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Content Administration & Verification Console
            </h1>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Enforce official UPSC answer-key provenance, review drafted questions, and manage publication
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <a
            href="/admin/ingestion"
            className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-indigo-700"
          >
            <Layers className="h-4 w-4" />
            <span>Ingestion Operations</span>
          </a>
          <a
            href="/admin/imports"
            className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-700"
          >
            <UploadCloud className="h-4 w-4" />
            <span>Import Batch</span>
          </a>
        </div>
      </div>

      {/* Question Status Metric Ribbon */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 mb-8">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Published Live
          </span>
          <p className="mt-2 text-3xl font-extrabold text-emerald-600">
            {statusCounts.PUBLISHED}
          </p>
          <span className="text-xs text-slate-500">Visible to all aspirants</span>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-5 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
            Needs Review
          </span>
          <p className="mt-2 text-3xl font-extrabold text-amber-700">
            {statusCounts.NEEDS_REVIEW}
          </p>
          <a href="/admin/review" className="text-xs font-semibold text-amber-800 hover:underline">
            Awaiting editorial sign-off &rarr;
          </a>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Verified Pending
          </span>
          <p className="mt-2 text-3xl font-extrabold text-blue-700">
            {statusCounts.VERIFIED}
          </p>
          <span className="text-xs text-slate-500">Ready for final publish batch</span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Raw Drafts
          </span>
          <p className="mt-2 text-3xl font-extrabold text-slate-600">
            {statusCounts.DRAFT}
          </p>
          <span className="text-xs text-slate-500">Parsed / Unchecked</span>
        </div>
      </div>

      {/* Admin Modules Navigation */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <a
          href="/admin/questions"
          className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:border-blue-400 hover:shadow-md transition"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700 mb-4">
            <FileText className="h-5 w-5" />
          </div>
          <h3 className="font-bold text-base text-slate-900 group-hover:text-blue-700 transition">
            Question Bank Directory
          </h3>
          <p className="mt-1 text-xs text-slate-500 leading-relaxed">
            Search, inspect, edit options, correct typographical errors, and update explanations.
          </p>
          <div className="mt-4 flex items-center gap-1 text-xs font-bold text-blue-700">
            <span>Manage questions</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </div>
        </a>

        <a
          href="/admin/review"
          className="group rounded-2xl border border-amber-200 bg-amber-50/40 p-6 shadow-sm hover:border-amber-400 hover:shadow-md transition"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-800 mb-4">
            <CheckCircle className="h-5 w-5" />
          </div>
          <h3 className="font-bold text-base text-slate-900 group-hover:text-amber-800 transition">
            Verification Queue
          </h3>
          <p className="mt-1 text-xs text-slate-600 leading-relaxed">
            Audit extracted questions, compare against official UPSC keys, and approve for publication.
          </p>
          <div className="mt-4 flex items-center gap-1 text-xs font-bold text-amber-800">
            <span>Review pending ({statusCounts.NEEDS_REVIEW})</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </div>
        </a>

        <a
          href="/admin/imports"
          className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:border-blue-400 hover:shadow-md transition"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 mb-4">
            <UploadCloud className="h-5 w-5" />
          </div>
          <h3 className="font-bold text-base text-slate-900 group-hover:text-emerald-700 transition">
            Structured Ingestion
          </h3>
          <p className="mt-1 text-xs text-slate-500 leading-relaxed">
            Upload structured JSON/CSV paper bundles with automatic schema validation and duplicate detection.
          </p>
          <div className="mt-4 flex items-center gap-1 text-xs font-bold text-emerald-700">
            <span>Launch batch uploader</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </div>
        </a>

        <a
          href="/admin/coverage"
          className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:border-blue-400 hover:shadow-md transition"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-700 mb-4">
            <TrendingUp className="h-5 w-5" />
          </div>
          <h3 className="font-bold text-base text-slate-900 group-hover:text-purple-700 transition">
            Coverage & Audit
          </h3>
          <p className="mt-1 text-xs text-slate-500 leading-relaxed">
            Track historical question count completeness by year (100 for GS1, 80 for CSAT) and subject.
          </p>
          <div className="mt-4 flex items-center gap-1 text-xs font-bold text-purple-700">
            <span>View coverage metrics</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </div>
        </a>

        <a
          href="/admin/plans"
          className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:border-blue-400 hover:shadow-md transition"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700 mb-4">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <h3 className="font-bold text-base text-slate-900 group-hover:text-blue-700 transition">
            Plans & Pricing Management
          </h3>
          <p className="mt-1 text-xs text-slate-500 leading-relaxed">
            Configure server-side plan pricing, discount percentages, and feature tier assignments.
          </p>
          <div className="mt-4 flex items-center gap-1 text-xs font-bold text-blue-700">
            <span>Configure plans & tiers</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </div>
        </a>

        <a
          href="/admin/subscriptions"
          className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:border-blue-400 hover:shadow-md transition"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700 mb-4">
            <FileText className="h-5 w-5" />
          </div>
          <h3 className="font-bold text-base text-slate-900 group-hover:text-indigo-700 transition">
            Subscribers & Revenue Ledger
          </h3>
          <p className="mt-1 text-xs text-slate-500 leading-relaxed">
            Monitor active subscriptions, review transaction records, and inspect audit events.
          </p>
          <div className="mt-4 flex items-center gap-1 text-xs font-bold text-indigo-700">
            <span>Inspect subscriber records</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </div>
        </a>
      </div>
    </div>
  );
}
