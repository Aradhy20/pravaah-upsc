"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
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
  CreditCard,
  CheckCircle2,
} from "lucide-react";

function PricingContent() {
  const searchParams = useSearchParams();
  const autoCheckoutPlan = searchParams.get("autoCheckout") || searchParams.get("plan");
  const initialInterval = (searchParams.get("interval") as any) || "ANNUAL";

  const [billingInterval, setBillingInterval] = useState<"MONTHLY" | "QUARTERLY" | "ANNUAL">(
    ["MONTHLY", "QUARTERLY", "ANNUAL"].includes(initialInterval) ? initialInterval : "ANNUAL"
  );
  const [plans, setPlans] = useState<any[]>([]);
  const [userSubscription, setUserSubscription] = useState<any | null>(null);
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState<string | null>(null);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch plans and user status
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [plansRes, subRes, authRes] = await Promise.all([
        fetch("/api/v1/plans"),
        fetch("/api/v1/user/subscription"),
        fetch("/api/v1/auth/me"),
      ]);

      const plansJson = await plansRes.json();
      const subJson = await subRes.json();
      const authJson = await authRes.json();

      if (plansRes.ok && plansJson.success) {
        setPlans(plansJson.data || []);
      } else {
        setError(plansJson.error?.message || "Failed to load pricing catalogue from database.");
      }

      if (subRes.ok && subJson.success) {
        setUserSubscription(subJson.data);
      }

      if (authRes.ok && authJson.success && authJson.data.authenticated) {
        setCurrentUser(authJson.data.user);
      } else {
        setCurrentUser(null);
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

  // Handle auto-checkout trigger if coming back from register/login
  useEffect(() => {
    if (autoCheckoutPlan && plans.length > 0 && currentUser && !checkoutLoading && !checkoutSuccess) {
      const targetPlan = plans.find((p) => p.code === autoCheckoutPlan.toUpperCase());
      if (targetPlan && targetPlan.code !== "FREE" && userSubscription?.planCode !== targetPlan.code) {
        handleCheckout(targetPlan);
      }
    }
  }, [autoCheckoutPlan, plans, currentUser]);

  const handleCheckout = async (plan: any) => {
    if (plan.code === "FREE") {
      if (!currentUser) {
        window.location.href = "/register?plan=FREE";
      } else {
        alert("You are already eligible for the Aspirant Foundation Free plan.");
      }
      return;
    }

    // 1. If not authenticated, preserve selection and redirect to register
    if (!currentUser) {
      window.location.href = `/register?plan=${plan.code}&interval=${billingInterval}`;
      return;
    }

    try {
      setCheckoutLoading(true);
      setCheckoutSuccess(null);

      // 2. Create Checkout Session on Server
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

      // 3. In Sandbox / Development mode, trigger immediate verified webhook activation
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
          `🎉 Congratulations! You have successfully upgraded to ${plan.name} (${billingInterval.toLowerCase()} billing). All premium examination features and negative marking simulators are now active!`
        );
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
    if (
      !confirm(
        "Are you sure you want to cancel automatic renewal? You will retain access until your current billing period ends."
      )
    ) {
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
        alert(
          "Your subscription renewal has been cancelled. You retain full access until the end of your billing cycle."
        );
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
      q: "Can I cancel my subscription at any time?",
      a: "Yes. You can cancel your subscription at any time directly from your Billing Dashboard. When you cancel, you retain full access to all features until the conclusion of your current billing period with zero renewal charges.",
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
          Find the PYQ. Understand the concept. Learn from every mistake. Authentic UPSC CSE question bank, timed examination simulator, and diagnostic weakness analytics.
        </p>

        {/* Current Active Plan Notice */}
        {userSubscription && (
          <div className="mt-6 inline-flex flex-wrap items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50/80 px-4 py-2 text-xs font-semibold text-blue-900">
            <span>Your Current Plan:</span>
            <span className="rounded bg-blue-700 px-2.5 py-0.5 font-bold text-white uppercase tracking-wider text-[11px]">
              {userSubscription.planName}
            </span>
            <a
              href="/dashboard/billing"
              className="ml-2 font-bold text-blue-700 underline text-[11px] hover:text-blue-900"
            >
              View Billing & Receipts &rarr;
            </a>
          </div>
        )}

        {checkoutSuccess && (
          <div className="mt-6 rounded-2xl border border-emerald-300 bg-emerald-50 p-5 text-sm font-bold text-emerald-900 shadow-sm animate-fade-in text-left flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p>{checkoutSuccess}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <a
                href="/dashboard/billing"
                className="rounded-xl bg-emerald-700 px-4 py-2 text-xs font-bold text-white shadow hover:bg-emerald-800 transition"
              >
                View Receipts
              </a>
              <a
                href="/mock-tests"
                className="rounded-xl border border-emerald-300 bg-white px-4 py-2 text-xs font-bold text-emerald-800 hover:bg-emerald-50 transition"
              >
                Launch Mock Exam
              </a>
            </div>
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
            className="rounded-lg bg-blue-700 px-4 py-2 text-xs font-bold text-white hover:bg-blue-800 transition shadow"
          >
            Retry Loading Plans
          </button>
        </div>
      ) : loading ? (
        <div className="py-24 text-center text-sm font-semibold text-slate-400">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700 mb-2"></div>
          <p>Loading verified subscription plans from database...</p>
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
                        Free forever • No payment details needed
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
                    <a
                      href={currentUser ? "/dashboard" : "/register?plan=FREE"}
                      className="w-full block rounded-xl border border-slate-200 bg-slate-50 py-3 text-xs font-bold text-slate-700 hover:bg-slate-100 transition text-center"
                    >
                      {currentUser ? "Active Free Tier" : "Get Started Free"}
                    </a>
                  ) : (
                    <button
                      onClick={() => handleCheckout(p)}
                      disabled={checkoutLoading}
                      className={`w-full flex items-center justify-center gap-1.5 rounded-xl py-3 text-xs font-bold shadow-sm transition ${
                        isPopular
                          ? "bg-blue-700 text-white hover:bg-blue-800 shadow-blue-200"
                          : "bg-slate-900 text-white hover:bg-slate-800"
                      }`}
                    >
                      <span>
                        {!currentUser
                          ? `Select ${p.name}`
                          : userSubscription?.tier > p.tier
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
                <td className="py-3 px-4 text-center font-medium">1,079+ Published</td>
                <td className="py-3 px-4 text-center font-medium">1,079+ Published</td>
                <td className="py-3 px-4 text-center font-medium bg-blue-50/30">1,079+ Published</td>
                <td className="py-3 px-4 text-center font-medium">1,079+ Published</td>
              </tr>
              <tr>
                <td className="py-3 px-6 font-semibold text-slate-900">
                  Official Answer Keys & Pedagogical Explanations
                </td>
                <td className="py-3 px-4 text-center text-emerald-600 font-bold">✓ Included</td>
                <td className="py-3 px-4 text-center text-emerald-600 font-bold">✓ Included</td>
                <td className="py-3 px-4 text-center text-emerald-600 font-bold bg-blue-50/30">✓ Included</td>
                <td className="py-3 px-4 text-center text-emerald-600 font-bold">✓ Included</td>
              </tr>
              <tr>
                <td className="py-3 px-6 font-semibold text-slate-900">
                  Timed Examination Simulator (+2/-0.666 negative marking)
                </td>
                <td className="py-3 px-4 text-center text-slate-300 font-bold">✗</td>
                <td className="py-3 px-4 text-center text-slate-300 font-bold">✗</td>
                <td className="py-3 px-4 text-center text-emerald-600 font-bold bg-blue-50/30">
                  ✓ Full Simulation
                </td>
                <td className="py-3 px-4 text-center text-emerald-600 font-bold">
                  ✓ Full Simulation
                </td>
              </tr>
              <tr>
                <td className="py-3 px-6 font-semibold text-slate-900">
                  Diagnostic Subject Weakness Telemetry
                </td>
                <td className="py-3 px-4 text-center text-slate-400">Basic stats</td>
                <td className="py-3 px-4 text-center text-slate-400">Basic stats</td>
                <td className="py-3 px-4 text-center text-emerald-600 font-bold bg-blue-50/30">
                  ✓ Full Diagnostics
                </td>
                <td className="py-3 px-4 text-center text-emerald-600 font-bold">
                  ✓ Full Diagnostics
                </td>
              </tr>
              <tr>
                <td className="py-3 px-6 font-semibold text-slate-900">
                  Mistake Revision Queue (Spaced Repetition)
                </td>
                <td className="py-3 px-4 text-center text-slate-400">Basic</td>
                <td className="py-3 px-4 text-center text-emerald-600 font-bold">✓ Included</td>
                <td className="py-3 px-4 text-center text-emerald-600 font-bold bg-blue-50/30">
                  ✓ Full Queue
                </td>
                <td className="py-3 px-4 text-center text-emerald-600 font-bold">
                  ✓ Full Queue
                </td>
              </tr>
              <tr>
                <td className="py-3 px-6 font-semibold text-slate-900">Personal Saved Bookmarks</td>
                <td className="py-3 px-4 text-center font-mono">5 limit</td>
                <td className="py-3 px-4 text-center font-mono">50 limit</td>
                <td className="py-3 px-4 text-center text-emerald-600 font-bold bg-blue-50/30">
                  Unlimited
                </td>
                <td className="py-3 px-4 text-center text-emerald-600 font-bold">Unlimited</td>
              </tr>
              <tr>
                <td className="py-3 px-6 font-semibold text-slate-900">Private Study Notes</td>
                <td className="py-3 px-4 text-center font-mono">3 limit</td>
                <td className="py-3 px-4 text-center font-mono">50 limit</td>
                <td className="py-3 px-4 text-center text-emerald-600 font-bold bg-blue-50/30">
                  Unlimited
                </td>
                <td className="py-3 px-4 text-center text-emerald-600 font-bold">Unlimited</td>
              </tr>
              <tr>
                <td className="py-3 px-6 font-semibold text-slate-900">
                  Priority Verification & Dispute Audit
                </td>
                <td className="py-3 px-4 text-center text-slate-300 font-bold">✗</td>
                <td className="py-3 px-4 text-center text-slate-300 font-bold">✗</td>
                <td className="py-3 px-4 text-center text-slate-300 font-bold bg-blue-50/30">✗</td>
                <td className="py-3 px-4 text-center text-purple-700 font-bold">✓ Included</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Guarantee & Verification Callout */}
      <div className="mt-16 rounded-3xl border border-blue-200 bg-gradient-to-br from-blue-50/80 via-white to-indigo-50/40 p-8 sm:p-10 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-700 text-white">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Official UPSC Answer Keys</h4>
              <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                Every Prelims paper is cross-checked against final commission gazette answer keys. No unofficial or fabricated keys.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-700 text-white">
              <RotateCw className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Transparent Cancellation & Fair Access</h4>
              <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                Cancel anytime directly from your billing dashboard. Paid access is preserved until the end of your billing cycle.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-700 text-white">
              <CreditCard className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">No Hidden Taxes or Fees</h4>
              <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                All prices are GST-inclusive. You will never be charged surprise processing or gateway surcharges at checkout.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="mt-20 max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-extrabold text-slate-900">
            Frequently Asked Questions
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Everything you need to know about our billing, questions, and subscriptions
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = expandedFaq === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl border border-slate-200 bg-white overflow-hidden transition"
              >
                <button
                  onClick={() => setExpandedFaq(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between p-4 sm:p-5 text-left text-xs font-bold text-slate-900 hover:bg-slate-50"
                >
                  <span>{faq.q}</span>
                  {isOpen ? (
                    <ChevronUp className="h-4 w-4 text-slate-500 shrink-0" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-slate-500 shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <div className="px-4 pb-5 sm:px-5 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function PricingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[80vh] flex items-center justify-center p-4">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-700" />
        </div>
      }
    >
      <PricingContent />
    </Suspense>
  );
}
