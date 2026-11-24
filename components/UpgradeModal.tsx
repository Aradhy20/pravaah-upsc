"use client";

import React, { useState } from "react";
import {
  X,
  Zap,
  CheckCircle,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Clock,
  RotateCw,
  BarChart2,
  Lock,
} from "lucide-react";

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  featureTitle?: string;
  featureDescription?: string;
  recommendedPlanCode?: "ACHIEVER" | "SCHOLAR" | "ASPIRANT_PRO" | "ASPIRANT_PLUS" | "ASPIRANT_ELITE" | string;
}

export function UpgradeModal({
  isOpen,
  onClose,
  featureTitle = "Timed 2-Hour Examination Simulator",
  featureDescription = "Unlock full exam condition simulation, automated negative marking (-0.66), and detailed syllabus weakness diagnostics.",
  recommendedPlanCode = "PRO",
}: UpgradeModalProps) {
  const [billingInterval, setBillingInterval] = useState<"MONTHLY" | "QUARTERLY" | "ANNUAL">("ANNUAL");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleUpiCheckout = async (planCode: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/v1/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productType: "SUBSCRIPTION",
          productId: planCode,
          billingInterval,
        }),
      });

      const json = await res.json();
      if (res.ok && json.success && json.data?.orderId) {
        window.location.href = `/checkout/${json.data.orderId}`;
        return;
      }

      await handleLegacyCheckout(planCode);
    } catch (e: any) {
      console.error(e);
      await handleLegacyCheckout(planCode);
    }
  };

  const handleLegacyCheckout = async (planCode: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/v1/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planCode,
          billingInterval,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        setError(json.error?.message || "Failed to initiate upgrade.");
        setLoading(false);
        return;
      }

      // In Sandbox / Dev mode, simulate activation webhook
      const webhookRes = await fetch("/api/v1/billing/webhook", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-webhook-signature": "whsec_pravaah_sandbox_secret_2026",
        },
        body: JSON.stringify({
          providerTxId: json.data.orderReference,
          status: "SUCCESS",
        }),
      });

      if (webhookRes.ok) {
        window.location.reload();
      } else {
        window.location.href = "/pricing";
      }
    } catch (e: any) {
      console.error(e);
      setError("Network error while connecting to payment gateway.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
        {/* Header gradient banner */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold px-3 py-1 mb-2 border border-amber-400/30">
            <Lock className="h-3 w-3" />
            <span>Premium Capability</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black tracking-tight">{featureTitle}</h2>
          <p className="mt-1.5 text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
            {featureDescription}
          </p>
        </div>

        {/* Content & Pricing */}
        <div className="p-6">
          {/* Billing interval toggle */}
          <div className="flex items-center justify-center mb-6">
            <div className="inline-flex p-1 bg-slate-100 rounded-xl">
              <button
                onClick={() => setBillingInterval("MONTHLY")}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  billingInterval === "MONTHLY" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600"
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingInterval("QUARTERLY")}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1 ${
                  billingInterval === "QUARTERLY"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <span>Quarterly</span>
                <span className={`rounded px-1 text-[9px] font-black ${
                  billingInterval === "QUARTERLY" ? "bg-amber-400 text-slate-900" : "bg-emerald-100 text-emerald-800"
                }`}>
                  -11%
                </span>
              </button>
              <button
                onClick={() => setBillingInterval("ANNUAL")}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                  billingInterval === "ANNUAL"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <span>Annual Commit</span>
                <span className="rounded bg-amber-400 text-slate-900 px-1.5 py-0.2 text-[10px] font-black">
                  SAVE 44%
                </span>
              </button>
            </div>
          </div>

          {/* Featured Plan Card: Aspirant Pro */}
          <div className="rounded-2xl border-2 border-blue-600 bg-blue-50/40 p-5 relative mb-6">
            <div className="absolute -top-3 right-6 rounded-full bg-blue-700 px-3 py-0.5 text-[11px] font-black text-white uppercase tracking-wider shadow-sm">
              Most Popular
            </div>

            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Aspirant Pro</h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  Complete exam simulator + AI Personal Mentor + Spaced Mistake Queue
                </p>
              </div>

              <div className="text-right">
                <div className="text-2xl font-black text-slate-900">
                  {billingInterval === "ANNUAL" ? "₹1,999" : billingInterval === "QUARTERLY" ? "₹799" : "₹299"}
                </div>
                <span className="text-[11px] text-slate-500 font-medium">
                  {billingInterval === "ANNUAL"
                    ? "billed annually (₹166/mo)"
                    : billingInterval === "QUARTERLY"
                    ? "billed quarterly (₹266/mo)"
                    : "per month"}
                </span>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700">
              <div className="flex items-center gap-1.5">
                <CheckCircle className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                <span>Unlimited 2-Hour Timed Mocks</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                <span>SuperMemo-2 Spaced Mistake Queue</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                <span>Negative Marking Penalty Diagnostics</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                <span>Pravaah AI Personal Mentor (100 msgs)</span>
              </div>
            </div>
          </div>

          {error && (
            <div className="p-3 mb-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
              {error}
            </div>
          )}

          {/* Action Button */}
          <button
            onClick={() => handleUpiCheckout("PRO")}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-sm shadow-lg shadow-blue-700/20 transition disabled:opacity-50"
          >
            {loading ? (
              <RotateCw className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Zap className="h-4 w-4" />
                <span>
                  Pay ₹{billingInterval === "ANNUAL" ? "1,999" : billingInterval === "QUARTERLY" ? "799" : "299"} via Instant UPI
                </span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>

          <div className="mt-4 flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-slate-400" />
              100% Verified Series A Ground Truth
            </span>
            <a href="/pricing" className="text-blue-600 hover:underline font-semibold">
              View all 4 plans & features →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
