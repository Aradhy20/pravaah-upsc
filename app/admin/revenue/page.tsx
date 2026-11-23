"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  TrendingUp,
  DollarSign,
  Users,
  ShieldAlert,
  ArrowUpRight,
  PieChart,
  Activity,
  Layers,
  Sparkles,
  CreditCard,
  RefreshCw,
  AlertCircle,
  HelpCircle,
} from "lucide-react";

export default function AdminRevenueDashboard() {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRevenue = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/v1/admin/revenue");
      const json = await res.json();
      if (res.ok && json.success) {
        setData(json.data);
      } else {
        setError(json.error?.message || json.error || "Admin authorization required");
      }
    } catch (e: any) {
      setError("Network error fetching revenue intelligence records.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRevenue();
  }, []);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-r-transparent"></div>
        <p className="mt-4 text-sm font-medium text-slate-600">Aggregating PostgreSQL SaaS revenue ledger...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
          <ShieldAlert className="mx-auto h-10 w-10 text-red-600 mb-3" />
          <h2 className="text-lg font-bold text-red-900">Admin Authorization Required</h2>
          <p className="mt-1 text-sm text-red-700">{error}</p>
          <div className="mt-4 flex justify-center gap-3">
            <Link
              href="/login"
              className="rounded-lg bg-red-700 px-4 py-2 text-xs font-semibold text-white hover:bg-red-800 transition"
            >
              Sign In as Administrator
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const overview = data?.overview || {};
  const planDist = data?.planDistribution || [];
  const unitEconomics = data?.unitEconomics || {};
  const simulations = data?.simulations || {};

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      {/* Page Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center mb-8">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-bold text-purple-800 uppercase tracking-wider">
              Executive Financials
            </span>
            <span className="text-xs text-slate-500">Live PostgreSQL Metrics</span>
          </div>
          <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold text-slate-900">
            SaaS Revenue & Subscription Intelligence
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Authoritative MRR, ARR, churn, subscriber cohort distribution, and unit economics.
          </p>
        </div>

        <button
          onClick={fetchRevenue}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-sm transition"
        >
          <RefreshCw className="h-3.5 w-3.5 text-slate-500" />
          <span>Refresh Ledger</span>
        </button>
      </div>

      {/* 4 Primary Top Metrics */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {/* Metric 1: MRR */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500">
            <span>Monthly Recurring (MRR)</span>
            <DollarSign className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">₹{overview.mrrRupees?.toLocaleString("en-IN") || 0}</span>
            <span className="text-xs text-emerald-700 font-semibold">Normalized</span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Annual Run Rate: <strong className="text-slate-800">₹{overview.arrRupees?.toLocaleString("en-IN") || 0}</strong>
          </p>
        </div>

        {/* Metric 2: Paid Subscribers */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500">
            <span>Paid Active Subscribers</span>
            <Users className="h-4 w-4 text-blue-600" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{overview.paidSubscribers || 0}</span>
            <span className="text-xs text-slate-500">/ {overview.totalUsers || 0} total</span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Free-to-Paid Conversion: <strong className="text-blue-700">{overview.conversionRatePercent || 0}%</strong>
          </p>
        </div>

        {/* Metric 3: Gross Cash Collected */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500">
            <span>Gross Revenue Collected</span>
            <CreditCard className="h-4 w-4 text-indigo-600" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">₹{overview.grossRevenueRupees?.toLocaleString("en-IN") || 0}</span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Refunds: <strong className="text-slate-800">₹{overview.refundAmountRupees || 0}</strong> ({overview.successfulTransactionsCount || 0} successful tx)
          </p>
        </div>

        {/* Metric 4: Churn Rate */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500">
            <span>Subscription Churn Rate</span>
            <Activity className="h-4 w-4 text-amber-600" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{overview.churnRatePercent || 0}%</span>
            <span className="text-xs text-emerald-600 font-semibold">&lt; 5% Benchmark</span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Based on active vs cancelled subscription history.
          </p>
        </div>
      </div>

      {/* Grid: Plan Distribution & Unit Economics */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 mb-8">
        {/* Section 1: Plan Distribution Breakdown */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Aspirant Plan Distribution</h3>
              <p className="text-xs text-slate-500">Subscribers across 4 active preparation tiers</p>
            </div>
            <PieChart className="h-5 w-5 text-slate-400" />
          </div>

          <div className="space-y-3">
            {planDist.map((p: any) => (
              <div key={p.code} className="rounded-xl border border-slate-100 bg-slate-50/70 p-3 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900">{p.name}</span>
                    <span className="rounded bg-slate-200 px-1.5 py-0.5 text-[10px] font-mono font-semibold text-slate-700">
                      Tier {p.tier}
                    </span>
                  </div>
                  <span className="text-xs text-slate-500">
                    {p.code === "FREE" && "₹0 / Free forever"}
                    {p.code === "PLUS" && "₹149/mo · ₹999/yr"}
                    {p.code === "PRO" && "₹299/mo · ₹1,999/yr (Flagship)"}
                    {p.code === "ELITE" && "₹499/mo · ₹3,499/yr"}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-lg font-black text-slate-900">{p.count}</span>
                  <p className="text-[10px] text-slate-500">subscribers</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 2: AI & Operating Unit Economics */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Unit Economics & AI Operating Costs</h3>
              <p className="text-xs text-slate-500">Live compute cost audit per student usage ledger</p>
            </div>
            <Layers className="h-5 w-5 text-slate-400" />
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-600">Total AI Mentor Queries Processed:</span>
              <strong className="text-slate-900 font-mono">{unitEconomics.totalAiMessagesProcessed || 0}</strong>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-600">Mains Answer Evaluations Executed:</span>
              <strong className="text-slate-900 font-mono">{unitEconomics.totalMainsEvaluationsProcessed || 0}</strong>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-600">Estimated Total AI Provider Cost:</span>
              <strong className="text-slate-900 font-mono">₹{unitEconomics.estimatedAiCostRupees || 0}</strong>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-600">Cloud Database & Hosting Infrastructure:</span>
              <strong className="text-slate-900 font-mono">₹{unitEconomics.estimatedInfraCostRupees || 1500}/mo</strong>
            </div>
            <div className="flex justify-between py-2 bg-emerald-50 rounded-lg px-2 text-emerald-900 font-semibold">
              <span>Gross Contribution Margin:</span>
              <span>{unitEconomics.contributionMarginPercent || 0}%</span>
            </div>
          </div>
          <p className="mt-3 text-[11px] text-slate-500 italic">
            * Note: Unit costs calibrated at ₹0.20 per AI query and ₹5.00 per structured 4-dimension Mains evaluation.
          </p>
        </div>
      </div>

      {/* Section 3: Revenue Projections & Financial Simulations */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Illustrative Growth & Cohort Simulations</h3>
            <p className="text-xs text-slate-500">Projections based on target conversion ratios and unit economics</p>
          </div>
          <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-800 uppercase">
            Estimates & Modeling
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {Object.entries(simulations).map(([key, sim]: [string, any]) => (
            <div key={key} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600">{sim.label}</span>
              <div className="mt-3 space-y-1.5 text-xs text-slate-700">
                <div className="flex justify-between">
                  <span>Paying Subscribers:</span>
                  <strong className="text-slate-900">{sim.subscribers}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Monthly Run Rate (MRR):</span>
                  <strong className="text-emerald-700 font-semibold">₹{sim.mrr?.toLocaleString("en-IN")}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Annualized (ARR):</span>
                  <strong className="text-slate-900">₹{sim.arr?.toLocaleString("en-IN")}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Est. AI Operating Cost:</span>
                  <span className="text-slate-600 font-mono">₹{sim.estimatedAiCost}</span>
                </div>
                <div className="flex justify-between border-t border-slate-200 pt-1.5 font-bold text-slate-900">
                  <span>Estimated Net Margin:</span>
                  <span className="text-emerald-700">{sim.netMargin}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
