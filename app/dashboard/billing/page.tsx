"use client";

import React, { useState, useEffect } from "react";
import {
  CreditCard,
  ShieldCheck,
  Sparkles,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Receipt,
  RotateCcw,
  XCircle,
  HelpCircle,
  ExternalLink,
} from "lucide-react";

export default function BillingPage() {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelSuccess, setCancelSuccess] = useState<string | null>(null);

  const fetchBillingData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/v1/user/subscription");
      const json = await res.json();
      if (res.ok && json.success) {
        setData(json.data);
      } else {
        setError(json.error?.message || "Failed to retrieve billing information.");
      }
    } catch (e: any) {
      console.error(e);
      setError("Network error while connecting to subscription service.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBillingData();
  }, []);

  const handleCancelSubscription = async () => {
    try {
      setCancelLoading(true);
      const res = await fetch("/api/v1/user/subscription/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: "Self-serve cancellation from billing portal" }),
      });
      const json = await res.json();
      if (json.success) {
        setCancelSuccess(
          "Your automatic renewal has been cancelled. You retain full access to all premium features until your current period ends."
        );
        setShowCancelModal(false);
        await fetchBillingData();
      } else {
        alert(json.error?.message || "Cancellation failed. Please contact support.");
      }
    } catch (e) {
      console.error(e);
      alert("Error processing cancellation.");
    } finally {
      setCancelLoading(false);
    }
  };

  const getStatusBadge = (status: string | undefined, isPaid: boolean) => {
    if (!isPaid || !status) {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
          <span className="h-2 w-2 rounded-full bg-slate-400" />
          Free Plan
        </span>
      );
    }

    switch (status.toUpperCase()) {
      case "ACTIVE":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-bold text-emerald-800">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            Active
          </span>
        );
      case "PENDING":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-xs font-bold text-amber-800">
            <span className="h-2 w-2 rounded-full bg-amber-500" />
            Payment Pending
          </span>
        );
      case "PAST_DUE":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 border border-rose-200 px-3 py-1 text-xs font-bold text-rose-800">
            <span className="h-2 w-2 rounded-full bg-rose-500" />
            Payment Past Due
          </span>
        );
      case "CANCELLED":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 border border-slate-300 px-3 py-1 text-xs font-bold text-slate-700">
            <span className="h-2 w-2 rounded-full bg-slate-400" />
            Cancelled (Expires Soon)
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
            {status}
          </span>
        );
    }
  };

  const formatDate = (isoString?: string | null) => {
    if (!isoString) return "—";
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return isoString;
    }
  };

  const isPaid = data?.isPaid || false;
  const currentPlanName = data?.planName || "Aspirant Foundation (Free)";
  const sub = data?.subscription;
  const isCanceledAtEnd = sub?.cancelAtPeriodEnd;
  const payments = data?.recentPayments || [];

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      {/* Page Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <CreditCard className="h-6 w-6 text-blue-700" />
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Subscription & Billing
            </h1>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Manage your Pravaah membership tier, renewal schedule, and transaction receipts
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/pricing"
            className="inline-flex items-center gap-1.5 rounded-xl bg-blue-700 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-blue-800 transition"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>{isPaid ? "Change Membership Tier" : "Upgrade to Pro"}</span>
          </a>
        </div>
      </div>

      {cancelSuccess && (
        <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs text-emerald-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>{cancelSuccess}</span>
          </div>
          <button
            onClick={() => setCancelSuccess(null)}
            className="text-xs font-bold text-emerald-900 underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-white p-8 text-center max-w-md mx-auto my-12 shadow-sm">
          <AlertTriangle className="mx-auto h-10 w-10 text-rose-500 mb-2" />
          <h2 className="text-base font-bold text-slate-900">Unable to Load Billing Information</h2>
          <p className="mt-1 text-xs text-slate-600 mb-4">{error}</p>
          <button
            onClick={fetchBillingData}
            className="rounded-lg bg-blue-700 px-4 py-2 text-xs font-bold text-white hover:bg-blue-800 transition"
          >
            Retry Connection
          </button>
        </div>
      ) : loading ? (
        <div className="py-24 text-center text-sm text-slate-400">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700 mb-2" />
          <p>Retrieving verified subscription telemetry...</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Active Membership Overview Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Current Membership
                </span>
                <div className="flex items-center gap-3 mt-1">
                  <h2 className="text-2xl font-extrabold text-slate-900">{currentPlanName}</h2>
                  {getStatusBadge(sub?.status, isPaid)}
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  {isPaid
                    ? `Prepaid on ${sub?.billingInterval?.toLowerCase()} billing cycle.`
                    : "Full access to 1,079+ PYQs, standard explanations, and basic bookmarking."}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {!isPaid ? (
                  <a
                    href="/pricing"
                    className="rounded-xl bg-gradient-to-r from-blue-700 to-indigo-800 px-5 py-2.5 text-xs font-bold text-white shadow hover:from-blue-800 hover:to-indigo-900 transition flex items-center gap-2"
                  >
                    <span>Upgrade to Pro</span>
                    <ArrowRight className="h-4 w-4" />
                  </a>
                ) : (
                  <div className="flex items-center gap-2">
                    <a
                      href="/pricing"
                      className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                    >
                      Change Plan
                    </a>
                    {!isCanceledAtEnd && (
                      <button
                        onClick={() => setShowCancelModal(true)}
                        className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100 transition"
                      >
                        Cancel Renewal
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Key Subscription Dates Grid */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  <span>Period Start Date</span>
                </div>
                <p className="mt-2 text-base font-bold text-slate-900">
                  {formatDate(sub?.currentPeriodStart)}
                </p>
                <span className="text-[11px] text-slate-400">
                  {isPaid ? "Activated via verified payment" : "Account creation date"}
                </span>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                  <Clock className="h-4 w-4 text-purple-600" />
                  <span>{isCanceledAtEnd ? "Access Expiration Date" : "Renewal Date"}</span>
                </div>
                <p className="mt-2 text-base font-bold text-slate-900">
                  {formatDate(sub?.currentPeriodEnd)}
                </p>
                <span className="text-[11px] text-slate-400">
                  {isCanceledAtEnd
                    ? "Will revert to Free tier on this date"
                    : isPaid
                    ? "Scheduled auto-renewal date"
                    : "Free plan has no expiration"}
                </span>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  <span>Entitlement Tier</span>
                </div>
                <p className="mt-2 text-base font-bold text-slate-900">
                  Tier {data?.tier || 0} Level Access
                </p>
                <span className="text-[11px] text-slate-400">
                  {data?.tier >= 2
                    ? "Timed Simulator & Diagnostics Active"
                    : "Standard PYQ Practice Mode"}
                </span>
              </div>
            </div>

            {/* Cancellation Notice Banner if marked to cancel */}
            {isCanceledAtEnd && (
              <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900 flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Cancellation Scheduled</span>
                  <p className="mt-0.5 text-amber-800 leading-relaxed">
                    Your automatic renewal has been cancelled. Your paid benefits (Timed Mock Examinations, Advanced Analytics, and unlimited quotas) remain completely active until{" "}
                    <strong>{formatDate(sub?.currentPeriodEnd)}</strong>. After that date, your account will smoothly revert to the Free tier without losing any saved notes or attempt history.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Feature Entitlement Matrix Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
            <h3 className="text-base font-extrabold text-slate-900">
              Your Active Plan Feature Entitlements
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Server-enforced access rights and quota limits applied to your aspirant profile
            </p>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/50 p-3.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-800">1,079+ Verified Previous Year Questions</span>
                  <p className="text-slate-500 mt-0.5">
                    Full access to authentic 2019–2024 Prelims GS1 and CSAT papers with official keys.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/50 p-3.5">
                {data?.tier >= 2 ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <span className={`font-bold ${data?.tier >= 2 ? "text-slate-800" : "text-slate-400"}`}>
                    Timed UPSC Examination Simulator
                  </span>
                  <p className="text-slate-500 mt-0.5">
                    {data?.tier >= 2
                      ? "Official negative marking (+2.0/-0.666 GS1, +2.5/-0.833 CSAT) & anti-leak answer protection."
                      : "Locked. Requires Prelims Pro (Achiever) tier or higher."}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/50 p-3.5">
                {data?.tier >= 2 ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <span className={`font-bold ${data?.tier >= 2 ? "text-slate-800" : "text-slate-400"}`}>
                    Diagnostic Subject Weakness Telemetry
                  </span>
                  <p className="text-slate-500 mt-0.5">
                    {data?.tier >= 2
                      ? "Personalized subject and topic accuracy breakdown with mistake revision scheduling."
                      : "Locked. Requires Prelims Pro (Achiever) tier or higher."}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/50 p-3.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-800">
                    Saved Bookmarks & Private Notes Quota
                  </span>
                  <p className="text-slate-500 mt-0.5">
                    {data?.tier >= 2
                      ? "Unlimited private notes and question bookmarks."
                      : data?.tier === 1
                      ? "50 bookmarks and 50 notes quota."
                      : "5 bookmarks and 3 study notes quota on Free tier."}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Payment & Receipt History */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Payment & Receipt History</h3>
                <p className="mt-0.5 text-xs text-slate-500">
                  Immutable record of past transactions and invoices
                </p>
              </div>
              <Receipt className="h-5 w-5 text-slate-400" />
            </div>

            {payments.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                <Receipt className="mx-auto h-8 w-8 text-slate-300 mb-2" />
                <p>No billing transactions found on this account yet.</p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Invoices and payment receipts will be permanently recorded here upon checkout.
                </p>
              </div>
            ) : (
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider text-[10px]">
                      <th className="py-3 px-3">Date</th>
                      <th className="py-3 px-3">Order ID</th>
                      <th className="py-3 px-3">Amount</th>
                      <th className="py-3 px-3">Status</th>
                      <th className="py-3 px-3 text-right">Receipt</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {payments.map((p: any) => (
                      <tr key={p.id} className="hover:bg-slate-50 transition">
                        <td className="py-3 px-3 font-medium text-slate-700">
                          {formatDate(p.createdAt)}
                        </td>
                        <td className="py-3 px-3 font-mono text-[11px] text-slate-500">
                          {p.providerTxId}
                        </td>
                        <td className="py-3 px-3 font-bold text-slate-900">
                          ₹{p.amount} {p.currency}
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ${
                              p.status === "SUCCESS"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : p.status === "PENDING"
                                ? "bg-amber-50 text-amber-700 border border-amber-200"
                                : "bg-rose-50 text-rose-700 border border-rose-200"
                            }`}
                          >
                            {p.status}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <span className="text-[11px] text-slate-400 font-mono">
                            REC-{p.id.slice(-6).toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Confirmation Modal for Subscription Cancellation */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-slate-200">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 border border-rose-200">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <h3 className="text-center text-lg font-extrabold text-slate-900">
              Confirm Subscription Cancellation
            </h3>
            <p className="mt-2 text-center text-xs text-slate-600 leading-relaxed">
              Are you sure you want to turn off automatic renewal for your <strong>{currentPlanName}</strong> membership?
            </p>
            <div className="mt-4 rounded-xl bg-slate-50 p-3.5 text-xs text-slate-600 space-y-1.5 border border-slate-200">
              <p className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                <span>You will retain full access until {formatDate(sub?.currentPeriodEnd)}.</span>
              </p>
              <p className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                <span>Your saved notes, bookmarks, and test scores will never be deleted.</span>
              </p>
              <p className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                <span>No further charges will be made to your payment method.</span>
              </p>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowCancelModal(false)}
                disabled={cancelLoading}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
              >
                Keep Subscription
              </button>
              <button
                type="button"
                onClick={handleCancelSubscription}
                disabled={cancelLoading}
                className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-rose-700 transition disabled:opacity-50"
              >
                {cancelLoading ? "Processing..." : "Confirm Cancellation"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
