"use client";

import React, { useState, useEffect } from "react";
import {
  Check,
  X,
  ShieldCheck,
  Zap,
  Award,
  BookOpen,
  Clock,
  BarChart2,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Sparkles,
  ArrowRight,
  RotateCw,
  Lock,
} from "lucide-react";

export default function PricingPage() {
  const [billingInterval, setBillingInterval] = useState<"MONTHLY" | "QUARTERLY" | "ANNUAL">(
    "ANNUAL"
  );
  const [plans, setPlans] = useState<any[]>([]);
  const [userSubscription, setUserSubscription] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPlanForCheckout, setSelectedPlanForCheckout] = useState<any | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState<string | null>(null);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const [error, setError] = useState<string | null>(null);

  // Fetch plans and user subscription status
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [plansRes, subRes] = await Promise.all([
        fetch("/api/v1/plans"),
        fetch("/api/v1/user/subscription"),
      ]);

      const plansJson = await plansRes.json();
      const subJson = await subRes.json();

      if (plansRes.ok && plansJson.success) {
        setPlans(plansJson.data || []);
      } else {
        setError(plansJson.error?.message || "Failed to load pricing catalogue from database.");
      }
      if (subRes.ok && subJson.success) {
        setUserSubscription(subJson.data);
      }
    } catch (e: any) {
      console.error("Failed to load pricing data:", e);
      setError("Network error while connecting to billing database.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCheckout = async (plan: any) => {
    if (plan.code === "FREE") {
      alert("You are already eligible for the Aspirant Foundation Free plan.");
      return;
    }

    try {
      setCheckoutLoading(true);
      setCheckoutSuccess(null);

      // 1. Create Checkout Session
      const checkoutRes = await fetch("/api/v1/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planCode: plan.code,
          billingInterval,
        }),
      });

      const checkoutJson = await checkoutRes.json();
      if (!checkoutJson.success) {
        alert(checkoutJson.error?.message || "Checkout failed");
        setCheckoutLoading(false);
        return;
      }

      const orderData = checkoutJson.data;

      // 2. In Sandbox / Development mode, trigger immediate verified webhook activation
      const webhookRes = await fetch("/api/v1/billing/webhook", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-pravaah-webhook-signature": "pravaah_webhook_dev_secret_2026",
        },
        body: JSON.stringify({
          event: "payment.succeeded",
          orderId: orderData.orderId,
          planCode: plan.code,
          billingInterval,
          status: "SUCCESS",
        }),
      });

      const webhookJson = await webhookRes.json();
      if (webhookJson.success) {
        setCheckoutSuccess(
          `🎉 Congratulations! You have successfully upgraded to ${plan.name} (${billingInterval.toLowerCase()} billing). All premium examination features are now active!`
        );
        setSelectedPlanForCheckout(null);
        await loadData();
      } else {
        alert("Payment confirmation failed in sandbox.");
      }
    } catch (e: any) {
      console.error(e);
      alert("Error processing checkout transaction.");
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!confirm("Are you sure you want to cancel automatic renewal? You will retain access until your current billing period ends.")) {
      return;
    }
    try {
      const res = await fetch("/api/v1/user/subscription/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: "User requested through pricing page" }),
      });
      const json = await res.json();
      if (json.success) {
        alert("Your subscription renewal has been cancelled. You retain full access until the end of your billing cycle.");
        await loadData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const faqs = [
    {
      q: "Can I cancel or switch my plan at any time?",
      a: "Yes. You can switch your billing period or cancel future renewals at any time from your account settings. Upon cancellation, your access remains uninterrupted until the end of your prepaid billing period.",
    },
    {
      q: "What happens to my study notes, bookmarks, and test history if my plan expires?",
      a: "All your saved attempts, historical scores, bookmarks, and private study notes are permanently preserved in your account. If your subscription expires, you revert to the Free plan with view-only access to historical records.",
    },
    {
      q: "How are previous year questions and answer keys verified?",
      a: "Every single question is cross-referenced with the official UPSC examination gazette and revised official answer keys. No question is marked as verified or published without human editorial review.",
    },
    {
      q: "Does the Timed Exam Simulator mimic real UPSC negative marking?",
      a: "Yes. In General Studies Paper I, correct answers receive +2.0 marks and incorrect answers lose 0.666 marks (-1/3rd). In CSAT Paper II, correct answers receive +2.5 marks and incorrect answers lose 0.833 marks. Unattempted questions incur 0 penalty.",
    },
    {
      q: "Are taxes included in the displayed prices?",
      a: "The displayed prices are inclusive of applicable goods & services tax (GST). There are no hidden fees or automatic surcharges during checkout.",
    },
    {
      q: "What is your refund policy?",
      a: "We offer an unconditional 7-day money-back guarantee on all quarterly and annual subscriptions. If Pravaah does not substantially improve your UPSC PYQ learning experience, contact support within 7 days for a 100% refund.",
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      {/* Page Header */}
      <div className="mx-auto max-w-3xl text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3.5 py-1 text-xs font-bold text-blue-800 uppercase tracking-wider mb-4">
          <ShieldCheck className="h-4 w-4 text-blue-700" />
          Transparent, Predictable Pricing
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
          Invest in Your <span className="text-blue-700">Civil Services</span> Preparation
        </h1>
        <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed">
          Find the PYQ. Understand the concept. Learn from every mistake. Authentic UPSC CSE question bank, timed examination player, and diagnostic weakness analytics.
        </p>

        {/* Current Active Plan Notice */}
        {userSubscription && (
          <div className="mt-6 inline-flex flex-wrap items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50/80 px-4 py-2 text-xs font-semibold text-blue-900">
            <span>Your Current Plan:</span>
            <span className="rounded bg-blue-700 px-2.5 py-0.5 font-bold text-white uppercase tracking-wider text-[11px]">
              {userSubscription.planName}
            </span>
            {userSubscription.subscription?.cancelAtPeriodEnd && (
              <span className="text-amber-700 font-bold">
                (Cancels on {new Date(userSubscription.subscription.currentPeriodEnd).toLocaleDateString()})
              </span>
            )}
            {userSubscription.isPaid && !userSubscription.subscription?.cancelAtPeriodEnd && (
              <button
                onClick={handleCancelSubscription}
                className="ml-2 text-slate-500 hover:text-red-600 underline text-[11px] font-bold"
              >
                Cancel Renewal
              </button>
            )}
          </div>
        )}

        {checkoutSuccess && (
          <div className="mt-6 rounded-2xl border border-emerald-300 bg-emerald-50 p-4 text-sm font-bold text-emerald-900 shadow-sm animate-fade-in">
            {checkoutSuccess}
          </div>
        )}

        {/* Billing Period Selector */}
        <div className="mt-10 flex items-center justify-center">
          <div className="inline-flex rounded-2xl border border-slate-200 bg-slate-100 p-1.5 shadow-inner">
            <button
              onClick={() => setBillingInterval("MONTHLY")}
              className={`rounded-xl px-5 py-2 text-xs font-bold transition ${
                billingInterval === "MONTHLY"
                  ? "bg-white text-blue-800 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingInterval("QUARTERLY")}
              className={`rounded-xl px-5 py-2 text-xs font-bold transition flex items-center gap-1.5 ${
                billingInterval === "QUARTERLY"
                  ? "bg-white text-blue-800 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <span>Quarterly</span>
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-extrabold text-emerald-800">
                Save ~20%
              </span>
            </button>
            <button
              onClick={() => setBillingInterval("ANNUAL")}
              className={`rounded-xl px-5 py-2 text-xs font-bold transition flex items-center gap-1.5 ${
                billingInterval === "ANNUAL"
                  ? "bg-white text-blue-800 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <span>Annual</span>
              <span className="rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-extrabold text-white">
                Save ~40% (Best Value)
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Plan Cards Grid */}
      {error ? (
        <div className="my-12 rounded-3xl border border-rose-200 bg-white p-8 text-center max-w-lg mx-auto shadow-sm">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 border border-rose-100">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h2 className="text-base font-bold text-slate-900">Subscription Plans Unavailable</h2>
          <p className="mt-1 text-xs text-rose-700 mb-4">{error}</p>
          <button
            onClick={() => loadData()}
            className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 transition shadow"
          >
            Retry Loading Plans
          </button>
        </div>
      ) : loading ? (
        <div className="py-24 text-center text-sm font-semibold text-slate-400">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
          <p>Loading verified subscription plans...</p>
        </div>
      ) : (
        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {plans.map((p) => {
            const priceObj = p.prices[billingInterval] || { amount: 0, discountPercent: 0 };
            const isCurrent = userSubscription?.planCode === p.code;
            const isPopular = p.isPopular;

            // Monthly breakdown calculation
            let monthlyEquivalent = priceObj.amount;
            if (billingInterval === "QUARTERLY") monthlyEquivalent = Math.round(priceObj.amount / 3);
            if (billingInterval === "ANNUAL") monthlyEquivalent = Math.round(priceObj.amount / 12);

            return (
              <div
                key={p.code}
                className={`relative flex flex-col justify-between rounded-3xl border bg-white p-6 shadow-sm transition hover:shadow-md ${
                  isPopular
                    ? "border-blue-600 ring-2 ring-blue-600/20 shadow-blue-50"
                    : "border-slate-200"
                }`}
              >
                {isPopular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-blue-700 px-3.5 py-0.5 text-[10px] font-extrabold uppercase tracking-widest text-white shadow-sm">
                    Recommended For CSE
                  </div>
                )}

                <div>
                  {/* Plan Header */}
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-extrabold text-slate-900">{p.name}</h3>
                    <span
                      className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase ${
                        p.tier === 0
                          ? "bg-slate-100 text-slate-700"
                          : p.tier === 1
                          ? "bg-amber-100 text-amber-800"
                          : p.tier === 2
                          ? "bg-blue-100 text-blue-800"
                          : "bg-purple-100 text-purple-800"
                      }`}
                    >
                      Tier {p.tier}
                    </span>
                  </div>

                  <p className="mt-1.5 text-xs text-slate-500 min-h-[32px] leading-relaxed">
                    {p.tagline}
                  </p>

                  {/* Price */}
                  <div className="mt-5 border-t border-slate-100 pt-5">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl sm:text-4xl font-extrabold text-slate-900">
                        {priceObj.amount === 0 ? "₹0" : `₹${priceObj.amount}`}
                      </span>
                      {priceObj.amount > 0 && (
                        <span className="text-xs font-semibold text-slate-400">
                          / {billingInterval.toLowerCase()}
                        </span>
                      )}
                    </div>

                    {priceObj.amount > 0 && billingInterval !== "MONTHLY" && (
                      <p className="mt-1 text-[11px] font-medium text-emerald-700">
                        Equivalent to ₹{monthlyEquivalent}/month ({priceObj.discountPercent}% savings)
                      </p>
                    )}
                    {priceObj.amount === 0 && (
                      <p className="mt-1 text-[11px] font-medium text-slate-400">
                        Free forever • No credit card required
                      </p>
                    )}
                  </div>

                  {/* Feature Bullets */}
                  <div className="mt-6 space-y-3 border-t border-slate-100 pt-6">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Included Capabilities:
                    </span>
                    <ul className="space-y-2.5 text-xs text-slate-700">
                      {p.features.map((feat: any) => (
                        <li key={feat.code} className="flex items-start gap-2">
                          {feat.isIncluded ? (
                            <Check className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
                          ) : (
                            <X className="h-4 w-4 shrink-0 text-slate-300 mt-0.5" />
                          )}
                          <span className={feat.isIncluded ? "font-medium" : "text-slate-400 line-through"}>
                            {feat.name}
                            {feat.limitValue && (
                              <span className="ml-1 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-600">
                                max {feat.limitValue}
                              </span>
                            )}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Call to Action Button */}
                <div className="mt-8 border-t border-slate-100 pt-4">
                  {isCurrent ? (
                    <button
                      disabled
                      className="w-full rounded-xl bg-slate-100 py-3 text-xs font-bold text-slate-500 cursor-not-allowed text-center"
                    >
                      Current Active Plan
                    </button>
                  ) : p.tier === 0 ? (
                    <button
                      disabled
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 text-xs font-bold text-slate-600 text-center"
                    >
                      Included with Account
                    </button>
                  ) : (
                    <button
                      onClick={() => handleCheckout(p)}
                      disabled={checkoutLoading}
                      className={`w-full flex items-center justify-center gap-1.5 rounded-xl py-3 text-xs font-bold shadow-sm transition ${
                        isPopular
                          ? "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200"
                          : "bg-slate-900 text-white hover:bg-slate-800"
                      }`}
                    >
                      <span>
                        {userSubscription?.tier > p.tier
                          ? `Switch to ${p.name}`
                          : `Upgrade to ${p.name}`}
                      </span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Feature Comparison Matrix */}
      <div className="mt-20">
        <div className="text-center">
          <h2 className="text-2xl font-extrabold text-slate-900">
            Compare Plan Capabilities Side-by-Side
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Every feature corresponds to an authentic, tested engine capability in Pravaah.
          </p>
        </div>

        <div className="mt-8 overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="py-4 px-6">Feature & Module</th>
                <th className="py-4 px-4 text-center">Foundation (Free)</th>
                <th className="py-4 px-4 text-center">Sprint (Beginner)</th>
                <th className="py-4 px-4 text-center bg-blue-50/60 text-blue-900">
                  Prelims Pro (Achiever)
                </th>
                <th className="py-4 px-4 text-center">Ranker (Scholar)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              <tr>
                <td className="py-3 px-6 font-semibold text-slate-900">
                  UPSC CSE Prelims Question Bank (GS1 & CSAT)
                </td>
                <td className="py-3 px-4 text-center font-medium">Public Papers</td>
                <td className="py-3 px-4 text-center font-medium">Full Library</td>
                <td className="py-3 px-4 text-center font-bold bg-blue-50/30 text-blue-900">
                  Full Library + Series
                </td>
                <td className="py-3 px-4 text-center font-bold">Full Library + Series</td>
              </tr>
              <tr>
                <td className="py-3 px-6 font-semibold text-slate-900">
                  Pedagogical Concept Explanations & Elimination Techniques
                </td>
                <td className="py-3 px-4 text-center text-slate-500">Core Summary</td>
                <td className="py-3 px-4 text-center font-medium">Detailed Notes</td>
                <td className="py-3 px-4 text-center font-bold bg-blue-50/30 text-blue-900">
                  Complete Citations & Stems
                </td>
                <td className="py-3 px-4 text-center font-bold">Complete Citations & Stems</td>
              </tr>
              <tr>
                <td className="py-3 px-6 font-semibold text-slate-900">
                  Timed Examination Simulator (+2.0 / -0.666 Scoring)
                </td>
                <td className="py-3 px-4 text-center text-slate-300">
                  <X className="mx-auto h-4 w-4" />
                </td>
                <td className="py-3 px-4 text-center text-slate-300">
                  <X className="mx-auto h-4 w-4" />
                </td>
                <td className="py-3 px-4 text-center font-bold bg-blue-50/30 text-emerald-600">
                  <Check className="mx-auto h-5 w-5" />
                </td>
                <td className="py-3 px-4 text-center font-bold text-emerald-600">
                  <Check className="mx-auto h-5 w-5" />
                </td>
              </tr>
              <tr>
                <td className="py-3 px-6 font-semibold text-slate-900">
                  Diagnostic Weak Topic Detector (&lt;60% Accuracy Alert)
                </td>
                <td className="py-3 px-4 text-center text-slate-300">
                  <X className="mx-auto h-4 w-4" />
                </td>
                <td className="py-3 px-4 text-center text-slate-500">Subject Overview</td>
                <td className="py-3 px-4 text-center font-bold bg-blue-50/30 text-emerald-600">
                  <Check className="mx-auto h-5 w-5" />
                </td>
                <td className="py-3 px-4 text-center font-bold text-emerald-600">
                  <Check className="mx-auto h-5 w-5" />
                </td>
              </tr>
              <tr>
                <td className="py-3 px-6 font-semibold text-slate-900">
                  Spaced Repetition Mistake Queue
                </td>
                <td className="py-3 px-4 text-center text-slate-300">
                  <X className="mx-auto h-4 w-4" />
                </td>
                <td className="py-3 px-4 text-center text-slate-500">Manual Review List</td>
                <td className="py-3 px-4 text-center font-bold bg-blue-50/30 text-emerald-600">
                  Automated SM-2 Engine
                </td>
                <td className="py-3 px-4 text-center font-bold text-emerald-600">
                  Automated SM-2 Engine
                </td>
              </tr>
              <tr>
                <td className="py-3 px-6 font-semibold text-slate-900">
                  Personal Bookmarks Allowance
                </td>
                <td className="py-3 px-4 text-center font-medium">5 Bookmarks</td>
                <td className="py-3 px-4 text-center font-medium">50 Bookmarks</td>
                <td className="py-3 px-4 text-center font-bold bg-blue-50/30 text-blue-900">
                  Unlimited
                </td>
                <td className="py-3 px-4 text-center font-bold">Unlimited + Export</td>
              </tr>
              <tr>
                <td className="py-3 px-6 font-semibold text-slate-900">
                  Private Question Study Notes
                </td>
                <td className="py-3 px-4 text-center font-medium">3 Notes</td>
                <td className="py-3 px-4 text-center font-medium">50 Notes</td>
                <td className="py-3 px-4 text-center font-bold bg-blue-50/30 text-blue-900">
                  Unlimited
                </td>
                <td className="py-3 px-4 text-center font-bold">Unlimited</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Frequently Asked Questions */}
      <div className="mt-20">
        <div className="mx-auto max-w-2xl text-center">
          <HelpCircle className="mx-auto h-7 w-7 text-blue-700 mb-2" />
          <h2 className="text-2xl font-extrabold text-slate-900">
            Frequently Asked Questions
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Clear terms, no hidden restrictions, and simple renewal policies.
          </p>
        </div>

        <div className="mx-auto mt-8 max-w-3xl divide-y divide-slate-200 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          {faqs.map((f, idx) => (
            <div key={idx} className="py-4 first:pt-0 last:pb-0">
              <button
                onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                className="flex w-full items-center justify-between text-left text-sm font-bold text-slate-900"
              >
                <span>{f.q}</span>
                {expandedFaq === idx ? (
                  <ChevronUp className="h-4 w-4 text-slate-400 shrink-0" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-slate-400 shrink-0" />
                )}
              </button>
              {expandedFaq === idx && (
                <p className="mt-2 text-xs text-slate-600 leading-relaxed animate-fade-in">
                  {f.a}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Cancellation and Refund Policy Notice Card */}
      <div className="mt-12 mx-auto max-w-3xl rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-6 shadow-sm">
        <div className="flex items-start gap-3">
          <ShieldCheck className="h-6 w-6 text-blue-700 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-bold text-blue-950">
              7-Day Unconditional Money-Back Guarantee & Cancellation Policy
            </h3>
            <p className="mt-1 text-xs text-blue-900/80 leading-relaxed">
              We stand behind the pedagogical rigor of Pravaah. If you subscribe to any Quarterly or Annual plan and find that our platform does not enhance your preparation discipline, email <strong>support@pravaah.in</strong> within 7 calendar days of your payment for a full, no-questions-asked refund. Subscriptions can be cancelled at any time to prevent auto-renewal while preserving access through the end of the current billing cycle.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
