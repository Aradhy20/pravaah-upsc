"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  CreditCard,
  Zap,
  Sparkles,
  RotateCcw,
  Clock,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  FileText,
  Gift,
  HelpCircle,
  Phone,
  Mail,
  MessageSquare,
  Lock,
} from "lucide-react";

export default function StudentBillingDashboard() {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<any | null>(null);

  const loadBilling = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/v1/user/billing");
      const json = await res.json();
      if (res.ok && json.success) {
        setData(json.data);
      } else {
        setError(json.error || "Unable to load student billing profile.");
      }
    } catch (e: any) {
      console.error(e);
      setError("Network error while connecting to billing ledger.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBilling();
  }, []);

  const handleCopyReferral = () => {
    if (data?.referral?.shareUrl) {
      navigator.clipboard.writeText(data.referral.shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleCancelRenewal = async () => {
    if (!confirm("Are you sure you want to cancel subscription auto-renewal? You will retain access until the end of your billing cycle.")) {
      return;
    }
    try {
      setCancelling(true);
      const res = await fetch("/api/v1/user/subscription/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: "Student requested cancellation via billing dashboard" }),
      });
      const json = await res.json();
      if (json.success) {
        alert("Renewal cancelled successfully. Access remains active until period end.");
        await loadBilling();
      } else {
        alert(json.error?.message || "Failed to cancel renewal.");
      }
    } catch (e) {
      alert("Error cancelling subscription renewal.");
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-r-transparent"></div>
        <p className="mt-4 text-sm font-medium text-slate-600">Retrieving student subscription ledger...</p>
      </div>
    );
  }

  const plan = data?.plan || { name: "Free Aspirant", code: "FREE", tier: 0, isPaid: false };
  const usage = data?.usage || {};
  const subscription = data?.subscription;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      {/* Header */}
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-800 uppercase tracking-wider">
              Student Ledger
            </span>
            <span className="text-xs text-slate-500">Live Entitlement Status</span>
          </div>
          <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold text-slate-900">
            Subscription & Usage Dashboard
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Monitor plan allowances, AI credits, renewal dates, and invoice history.
          </p>
        </div>

        <Link
          href="/pricing"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-800 transition"
        >
          <Sparkles className="h-4 w-4" />
          <span>Explore All Plans</span>
        </Link>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-red-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Grid: Plan & Usage Overview */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Card 1: Active Subscription */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Current Plan
            </span>
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                plan.isPaid
                  ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                  : "bg-slate-100 text-slate-700"
              }`}
            >
              {plan.isPaid ? "ACTIVE SUBSCRIBER" : "FREE TIER"}
            </span>
          </div>

          <div className="mt-4">
            <h2 className="text-2xl font-black text-slate-900">{plan.name}</h2>
            <p className="mt-1 text-xs text-slate-500">
              {plan.tier === 0 && "Basic PYQ practice and public study tools"}
              {plan.tier === 1 && "Expanded catalog, verified notes and mistake tracking"}
              {plan.tier === 2 && "Flagship tier: AI Personal Mentor & Mission Control"}
              {plan.tier === 3 && "Elite tier: Maximum AI allowance and priority support"}
            </p>
          </div>

          {subscription ? (
            <div className="mt-6 space-y-2 border-t border-slate-100 pt-4 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Billing Interval:</span>
                <span className="font-semibold text-slate-900 uppercase">{subscription.billingInterval}</span>
              </div>
              <div className="flex justify-between">
                <span>Current Cycle End:</span>
                <span className="font-semibold text-slate-900">
                  {new Date(subscription.currentPeriodEnd).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Auto-Renewal:</span>
                <span className={subscription.cancelAtPeriodEnd ? "font-semibold text-amber-600" : "font-semibold text-emerald-600"}>
                  {subscription.cancelAtPeriodEnd ? "Cancelling at end of term" : "Enabled"}
                </span>
              </div>

              {!subscription.cancelAtPeriodEnd && (
                <div className="pt-3">
                  <button
                    onClick={handleCancelRenewal}
                    disabled={cancelling}
                    className="text-xs font-medium text-red-600 hover:text-red-700 underline"
                  >
                    {cancelling ? "Processing..." : "Cancel subscription renewal"}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="mt-6 border-t border-slate-100 pt-4">
              <p className="text-xs text-slate-500 mb-3">
                Unlock Pravaah AI Personal Mentor, full examination simulations, and Mains evaluations.
              </p>
              <Link
                href="/pricing"
                className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-100 transition"
              >
                <span>Upgrade to Aspirant Pro</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          )}
        </div>

        {/* Card 2: AI Mentor & Mains Evaluation Allowance */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              AI & Evaluation Credits
            </span>
            <Zap className="h-4 w-4 text-blue-600" />
          </div>

          {/* AI Mentor meter */}
          <div className="mt-4">
            <div className="flex justify-between text-xs font-semibold text-slate-700">
              <span>AI Mentor Queries</span>
              <span>
                {usage.aiMentorMessagesUsed} / {usage.aiMentorMessagesLimit || "0"}
              </span>
            </div>
            <div className="mt-1.5 h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full bg-blue-600 transition-all duration-300"
                style={{
                  width: `${
                    usage.aiMentorMessagesLimit > 0
                      ? Math.min(100, (usage.aiMentorMessagesUsed / usage.aiMentorMessagesLimit) * 100)
                      : 0
                  }%`,
                }}
              ></div>
            </div>
            <p className="mt-1 text-[11px] text-slate-500">
              Remaining: <strong className="text-slate-800">{usage.aiMentorRemaining ?? 0} messages</strong>
            </p>
          </div>

          {/* Mains Evaluation meter */}
          <div className="mt-5">
            <div className="flex justify-between text-xs font-semibold text-slate-700">
              <span>Mains Answer Evaluations</span>
              <span>
                {usage.mainsEvaluationsUsed} / {usage.mainsEvaluationsLimit || "0"}
              </span>
            </div>
            <div className="mt-1.5 h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full bg-purple-600 transition-all duration-300"
                style={{
                  width: `${
                    usage.mainsEvaluationsLimit > 0
                      ? Math.min(100, (usage.mainsEvaluationsUsed / usage.mainsEvaluationsLimit) * 100)
                      : 0
                  }%`,
                }}
              ></div>
            </div>
            <p className="mt-1 text-[11px] text-slate-500">
              Remaining: <strong className="text-slate-800">{usage.mainsEvaluationsRemaining ?? 0} answers</strong>
            </p>
          </div>

          <div className="mt-5 border-t border-slate-100 pt-3 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Next Allowance Reset:</span>
            <span className="font-medium text-slate-700">
              {usage.periodEnd
                ? new Date(usage.periodEnd).toLocaleDateString("en-IN", { day: "numeric", month: "short" })
                : "Monthly"}
            </span>
          </div>
        </div>

        {/* Card 3: Daily Practice & Quota */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Daily Practice Meter
            </span>
            <Clock className="h-4 w-4 text-emerald-600" />
          </div>

          <div className="mt-4">
            <div className="flex justify-between text-xs font-semibold text-slate-700">
              <span>Prelims Questions Today</span>
              <span>
                {usage.pyqAttemptsToday} / {usage.pyqDailyLimit >= 9999 ? "∞" : usage.pyqDailyLimit}
              </span>
            </div>
            <div className="mt-1.5 h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full bg-emerald-600 transition-all duration-300"
                style={{
                  width: `${
                    usage.pyqDailyLimit < 9999
                      ? Math.min(100, (usage.pyqAttemptsToday / usage.pyqDailyLimit) * 100)
                      : 10
                  }%`,
                }}
              ></div>
            </div>
            <p className="mt-1 text-[11px] text-slate-500">
              {usage.pyqDailyLimit >= 9999
                ? "Unlimited practice enabled with your active plan."
                : `${Math.max(0, usage.pyqDailyLimit - usage.pyqAttemptsToday)} questions remaining today.`}
            </p>
          </div>

          {/* Referral Box */}
          <div className="mt-6 rounded-xl border border-blue-100 bg-blue-50/60 p-3.5 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-blue-900">
              <Gift className="h-4 w-4 text-blue-700" />
              <span>Aspirant Referral Program</span>
            </div>
            <p className="mt-1 text-[11px] text-blue-800">
              Share Pravaah with fellow aspirants to earn reward credits when they register.
            </p>
            <div className="mt-2.5 flex items-center gap-2">
              <code className="rounded bg-white px-2 py-1 font-mono text-[11px] text-slate-800 border border-blue-200">
                {data?.referral?.code || "PRAVAAH-INVITE"}
              </code>
              <button
                onClick={handleCopyReferral}
                className="rounded bg-blue-700 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-blue-800 transition"
              >
                {copied ? "Copied!" : "Copy Link"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Invoices & Purchase History Table */}
      <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Payment & Invoicing History</h3>
            <p className="text-xs text-slate-500">Official GST-compliant receipts and transaction records</p>
          </div>
          <FileText className="h-5 w-5 text-slate-400" />
        </div>

        {data?.invoices && data.invoices.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 bg-slate-50 text-slate-600 uppercase font-semibold">
                <tr>
                  <th className="py-2.5 px-3">Receipt / Invoice #</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Amount</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {data.invoices.map((inv: any) => (
                  <tr key={inv.id}>
                    <td className="py-2.5 px-3 font-mono font-medium text-slate-900">{inv.receiptNumber}</td>
                    <td className="py-2.5 px-3">
                      {new Date(inv.date).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-slate-900">₹{inv.amount}</td>
                    <td className="py-2.5 px-3">
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <button
                        onClick={() => setSelectedReceipt(inv)}
                        className="text-blue-600 hover:text-blue-700 underline font-medium"
                      >
                        View Receipt
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center">
            <p className="text-xs text-slate-500">
              No historical billing transactions found. You are currently on the Free Aspirant plan.
            </p>
          </div>
        )}
      </div>

      {/* Support & Grievance Contact Box */}
      <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-bold text-slate-900">Need billing assistance or refund help?</h4>
          <p className="text-xs text-slate-600 mt-0.5">
            Direct access to Aradhy Jain (Lead Operations) with guaranteed 24-hour SLA.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <a
            href="tel:+917351522153"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-semibold text-slate-700 hover:bg-slate-100 transition"
          >
            <Phone className="h-3.5 w-3.5 text-blue-600" />
            <span>+91 7351522153</span>
          </a>
          <a
            href="https://wa.me/917351522153"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-1.5 font-semibold text-emerald-800 hover:bg-emerald-100 transition"
          >
            <MessageSquare className="h-3.5 w-3.5 text-emerald-600" />
            <span>WhatsApp Support</span>
          </a>
          <a
            href="mailto:jainaradhy123@gmail.com"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-semibold text-slate-700 hover:bg-slate-100 transition"
          >
            <Mail className="h-3.5 w-3.5 text-slate-600" />
            <span>jainaradhy123@gmail.com</span>
          </a>
        </div>
      </div>

      {/* Official Receipt Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Official Transaction Receipt</h4>
                  <p className="text-[11px] text-slate-500 font-mono">{selectedReceipt.receiptNumber}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedReceipt(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="mt-6 rounded-2xl bg-slate-50 border border-slate-100 p-5 space-y-3 text-xs">
              <div className="flex justify-between items-center border-b border-slate-200/60 pb-2.5">
                <span className="text-slate-500">Subscription Plan:</span>
                <span className="font-bold text-slate-900">{plan.name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Amount Paid:</span>
                <span className="font-bold text-slate-900 text-sm">
                  ₹{selectedReceipt.amount} {selectedReceipt.currency || "INR"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Transaction Status:</span>
                <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800 uppercase">
                  {selectedReceipt.status || "SUCCESS"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Payment Channel:</span>
                <span className="font-medium text-slate-700">
                  {selectedReceipt.paymentMethod || "Cashfree PG"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Transaction Date:</span>
                <span className="font-medium text-slate-700">
                  {new Date(selectedReceipt.date).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>
              {subscription && (
                <div className="flex justify-between items-center border-t border-slate-200/60 pt-2.5">
                  <span className="text-slate-500">Subscription Validity:</span>
                  <span className="font-semibold text-emerald-700">
                    Active through{" "}
                    {new Date(subscription.currentPeriodEnd).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
              )}
            </div>

            <div className="mt-6 flex items-center justify-between gap-3">
              <button
                onClick={() => typeof window !== "undefined" && window.print()}
                className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
              >
                <FileText className="h-4 w-4 text-slate-500" />
                <span>Print Invoice</span>
              </button>
              <button
                onClick={() => setSelectedReceipt(null)}
                className="rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white hover:bg-blue-700 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
