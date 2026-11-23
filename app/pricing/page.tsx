"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
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
  Phone,
  Mail,
  MessageSquare,
  Tag,
  Package,
} from "lucide-react";

const INITIAL_PLANS = [
  {
    id: "plan_free",
    code: "FREE",
    name: "Free Aspirant (Foundation)",
    tagline: "Essential UPSC PYQ practice with official answer keys",
    tier: 0,
    isPopular: false,
    prices: {
      MONTHLY: { amount: 0, discountPercent: 0 },
      QUARTERLY: { amount: 0, discountPercent: 0 },
      ANNUAL: { amount: 0, discountPercent: 0 },
    },
    features: [
      { code: "PYQ_PRACTICE", name: "Daily PYQ practice allowance (15 questions/day)", isIncluded: true },
      { code: "EXPLANATIONS", name: "Basic concept summaries and official answer keys", isIncluded: true },
      { code: "DAILY_QUIZ", name: "Daily 5-question Prelims quiz", isIncluded: true },
      { code: "SYLLABUS_MAP", name: "Basic syllabus explorer", isIncluded: true },
      { code: "TIMED_EXAMS", name: "Timed 2-Hour Examination Simulator", isIncluded: false },
      { code: "AI_MENTOR", name: "Pravaah AI Personal Mentor", isIncluded: false },
    ],
  },
  {
    id: "plan_beginner",
    code: "BEGINNER",
    name: "Aspirant Plus",
    tagline: "Structured practice, verified explanations and smart revision",
    tier: 1,
    isPopular: false,
    prices: {
      MONTHLY: { amount: 149, discountPercent: 0 },
      QUARTERLY: { amount: 399, discountPercent: 11 },
      ANNUAL: { amount: 999, discountPercent: 44 },
    },
    features: [
      { code: "PYQ_PRACTICE", name: "Expanded daily PYQ practice (50 questions/day)", isIncluded: true },
      { code: "EXPLANATIONS", name: "Detailed pedagogical explanations & elimination notes", isIncluded: true },
      { code: "ADVANCED_ANALYTICS", name: "Subject-wise performance analytics", isIncluded: true },
      { code: "MISTAKE_REVISION", name: "Mistake Notebook & Spaced Repetition", isIncluded: true },
    ],
  },
  {
    id: "plan_achiever",
    code: "ACHIEVER",
    name: "Aspirant Pro (Prelims Pro / Achiever)",
    tagline: "Unlimited practice, Timed Exam Simulator and AI Mentor credits",
    tier: 2,
    isPopular: true,
    prices: {
      MONTHLY: { amount: 299, discountPercent: 0 },
      QUARTERLY: { amount: 799, discountPercent: 11 },
      ANNUAL: { amount: 1999, discountPercent: 44 },
    },
    features: [
      { code: "PYQ_PRACTICE", name: "Unlimited daily PYQ practice", isIncluded: true },
      { code: "TIMED_EXAMS", name: "Timed Exam Simulator with real negative marking", isIncluded: true },
      { code: "AI_MENTOR", name: "Pravaah AI Mentor (30 query credits/month)", isIncluded: true },
      { code: "MAINS_EVAL", name: "Mains Answer Evaluation (5 evaluations/month)", isIncluded: true },
    ],
  },
  {
    id: "plan_scholar",
    code: "SCHOLAR",
    name: "Aspirant Elite",
    tagline: "Comprehensive mastery suite: high AI credits & all learning packs",
    tier: 3,
    isPopular: false,
    prices: {
      MONTHLY: { amount: 499, discountPercent: 0 },
      QUARTERLY: { amount: 1299, discountPercent: 13 },
      ANNUAL: { amount: 3499, discountPercent: 42 },
    },
    features: [
      { code: "AI_MENTOR", name: "High-quota AI Mentor (100 credits/month)", isIncluded: true },
      { code: "MAINS_EVAL", name: "Expanded Mains Evaluation (20 evaluations/month)", isIncluded: true },
      { code: "ALL_PACKS", name: "All 5 Specialized Learning Packs included", isIncluded: true },
    ],
  },
];

export default function PricingPage() {
  const [billingInterval, setBillingInterval] = useState<"MONTHLY" | "QUARTERLY" | "ANNUAL">("ANNUAL");
  const [plans, setPlans] = useState<any[]>(INITIAL_PLANS);
  const [packs, setPacks] = useState<any[]>([]);
  const [userSubscription, setUserSubscription] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any | null>(null);

  // Coupon state
  const [couponCode, setCouponCode] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponResult, setCouponResult] = useState<any | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);

  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [plansRes, subRes, packsRes] = await Promise.all([
        fetch("/api/v1/plans"),
        fetch("/api/v1/user/subscription"),
        fetch("/api/v1/packs"),
      ]);

      const plansJson = await plansRes.json();
      const subJson = await subRes.json();
      const packsJson = await packsRes.json();

      if (plansRes.ok && plansJson.success) {
        setPlans(plansJson.data || []);
      }
      if (subRes.ok && subJson.success) {
        setUserSubscription(subJson.data);
      }
      if (packsRes.ok && packsJson.success) {
        setPacks(packsJson.data || []);
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

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    try {
      setCouponLoading(true);
      setCouponError(null);
      const res = await fetch("/api/v1/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: couponCode,
          orderAmount: selectedPlan ? selectedPlan.prices[billingInterval]?.amount || 999 : 999,
          planCode: selectedPlan?.code || "ACHIEVER",
        }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setCouponResult(json.data);
      } else {
        setCouponError(json.error || "Invalid coupon code");
      }
    } catch {
      setCouponError("Failed to validate coupon");
    } finally {
      setCouponLoading(false);
    }
  };

  const handlePlanClick = (plan: any) => {
    if (plan.tier === 0) {
      window.location.href = "/register";
      return;
    }
    setSelectedPlan(plan);
    setShowCheckoutModal(true);
  };

  const faqs = [
    {
      q: "Can I cancel or switch my plan at any time?",
      a: "Yes. You can switch your billing period or cancel future renewals at any time from your student billing dashboard. Upon cancellation, your access remains uninterrupted until the end of your prepaid billing period.",
    },
    {
      q: "What happens to my study notes, bookmarks, and test history if my plan expires?",
      a: "All your saved attempts, historical scores, bookmarks, and private study notes are permanently preserved in your account. If your subscription expires, you revert to the Free plan with view-only access to historical records. We never delete student data.",
    },
    {
      q: "How are previous year questions and answer keys verified?",
      a: "Every single question is cross-referenced with the official UPSC examination gazette and revised official answer keys (Series A standard). Explanations cite authoritative sources including NCERT, Laxmikanth, and the Constitution.",
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
      a: "We offer a 7-Day Unconditional Money-Back Guarantee on all quarterly and annual subscriptions. If Pravaah does not substantially improve your UPSC preparation experience, contact our desk within 7 days for a 100% refund.",
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      {/* Page Header */}
      <div className="mx-auto max-w-3xl text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3.5 py-1 text-xs font-bold text-blue-800 uppercase tracking-wider mb-4">
          <ShieldCheck className="h-4 w-4 text-blue-700" />
          Transparent, Predictable Pricing · 7-Day Unconditional Money-Back Guarantee
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
          Choose Your Preparation Plan. <span className="text-blue-700">Invest in Your UPSC Journey.</span>
        </h1>
        <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed">
          Start free, build consistency and unlock intelligent preparation tools when you are ready. Authentic UPSC question bank, AI Personal Mentor, and diagnostic readiness analytics.
        </p>

        {/* Current Active Plan Notice */}
        {userSubscription && (
          <div className="mt-6 inline-flex flex-wrap items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50/80 px-4 py-2 text-xs font-semibold text-blue-900">
            <span>Your Current Plan:</span>
            <span className="rounded bg-blue-700 px-2.5 py-0.5 font-bold text-white uppercase tracking-wider text-[11px]">
              {userSubscription.planName || "Free Aspirant"}
            </span>
            <Link href="/dashboard/billing" className="ml-2 text-blue-700 underline hover:text-blue-900">
              Manage Usage & Credits →
            </Link>
          </div>
        )}

        {/* Notice of Dormant Checkout during Cashfree onboarding */}
        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50/90 p-4 text-xs text-amber-900 flex items-center justify-between text-left">
          <div className="flex items-start gap-3">
            <Clock className="h-5 w-5 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-amber-950">Online payments are temporarily unavailable</p>
              <p className="mt-0.5 text-amber-800">
                Our payment gateway is currently undergoing official compliance onboarding with <strong>Cashfree Payments</strong>.
                All learning features, PYQ banks, AI mentor trials, and test simulators remain 100% free and operational for all registered students.
              </p>
            </div>
          </div>
        </div>

        {/* Billing Interval Toggle */}
        <div className="mt-8 inline-flex items-center rounded-xl bg-slate-100 p-1.5 border border-slate-200 shadow-inner">
          <button
            onClick={() => setBillingInterval("MONTHLY")}
            className={`rounded-lg px-4 py-2 text-xs font-bold transition ${
              billingInterval === "MONTHLY" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingInterval("QUARTERLY")}
            className={`rounded-lg px-4 py-2 text-xs font-bold transition ${
              billingInterval === "QUARTERLY" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Quarterly <span className="ml-1 text-[10px] text-emerald-600 font-extrabold">Save ~15%</span>
          </button>
          <button
            onClick={() => setBillingInterval("ANNUAL")}
            className={`rounded-lg px-4 py-2 text-xs font-bold transition flex items-center gap-1.5 ${
              billingInterval === "ANNUAL" ? "bg-blue-700 text-white shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <span>Annual</span>
            <span className={`rounded-full px-1.5 py-0.2 text-[9px] font-black uppercase ${
              billingInterval === "ANNUAL" ? "bg-blue-900 text-blue-100" : "bg-emerald-100 text-emerald-800"
            }`}>
              Save ~44%
            </span>
          </button>
        </div>
      </div>

      {/* Plans Grid (4 Plans) */}
      <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4 items-stretch">
        {plans.map((p) => {
          const priceObj = p.prices ? p.prices[billingInterval] : null;
          const price = priceObj?.amount ?? 0;
          const isPro = p.code === "ACHIEVER" || p.code === "PRO" || p.tier === 2;
          const isFree = p.tier === 0;

          return (
            <div
              key={p.code}
              className={`relative flex flex-col justify-between rounded-2xl border p-6 transition-all duration-200 ${
                isPro
                  ? "border-blue-500 bg-white shadow-xl ring-2 ring-blue-600 ring-offset-2"
                  : "border-slate-200 bg-white shadow-sm hover:shadow-md"
              }`}
            >
              {isPro && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-blue-700 px-3.5 py-0.5 text-[11px] font-extrabold text-white uppercase tracking-wider shadow">
                  Most Recommended · Flagship
                </div>
              )}

              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-black text-slate-900">
                    {p.name === "Aspirant Foundation" || p.code === "FREE" ? "Free Aspirant (Foundation)" : p.name === "Prelims Pro" || p.code === "ACHIEVER" || p.code === "PRO" ? "Aspirant Pro (Prelims Pro / Achiever)" : p.name === "Syllabus Sprint" || p.code === "BEGINNER" || p.code === "PLUS" ? "Aspirant Plus" : p.name === "Ranker Suite" || p.code === "SCHOLAR" || p.code === "ELITE" ? "Aspirant Elite" : p.name}
                  </h3>
                  <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-mono font-bold text-slate-600">
                    Tier {p.tier}
                  </span>
                </div>
                <p className="mt-1.5 text-xs text-slate-500 min-h-[36px]">{p.tagline}</p>

                {/* Price Display */}
                <div className="mt-5 flex items-baseline gap-1 border-b border-slate-100 pb-5">
                  <span className="text-3xl sm:text-4xl font-black text-slate-900">₹{price}</span>
                  <span className="text-xs text-slate-500">
                    {billingInterval === "MONTHLY" && "/ month"}
                    {billingInterval === "QUARTERLY" && "/ quarter"}
                    {billingInterval === "ANNUAL" && "/ year"}
                  </span>
                </div>

                {/* Features List */}
                <ul className="mt-5 space-y-2.5 text-xs text-slate-700">
                  {p.features?.map((f: any, idx: number) => (
                    <li key={idx} className="flex items-start gap-2">
                      {f.isIncluded ? (
                        <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                      ) : (
                        <X className="h-4 w-4 text-slate-300 shrink-0 mt-0.5" />
                      )}
                      <span className={f.isIncluded ? "text-slate-800" : "text-slate-400 line-through"}>
                        {f.name}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Button */}
              <div className="mt-8 pt-4 border-t border-slate-100">
                <button
                  onClick={() => handlePlanClick(p)}
                  className={`w-full rounded-xl py-2.5 text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    isPro
                      ? "bg-blue-700 text-white hover:bg-blue-800 shadow-md"
                      : isFree
                      ? "bg-slate-100 text-slate-800 hover:bg-slate-200"
                      : "border border-slate-300 bg-white text-slate-800 hover:bg-slate-50"
                  }`}
                >
                  {isFree ? (
                    <span>Get Started Free</span>
                  ) : (
                    <>
                      <span>Choose {p.name.replace("Aspirant Foundation", "Free Aspirant")}</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Specialized Learning Packs Section */}
      <div className="mt-20">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-bold text-purple-800 uppercase tracking-wider">
            Specialized Add-On Packs
          </span>
          <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold text-slate-900">
            Intensive Topic & Skill Learning Packs
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            One-time targeted additions for specific UPSC preparation hurdles. No recurring subscription required.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3 lg:grid-cols-5">
          {packs.map((pack) => (
            <div key={pack.code} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col justify-between">
              <div>
                <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-mono font-semibold text-slate-700">
                  {pack.category}
                </span>
                <h3 className="mt-2 text-sm font-bold text-slate-900">{pack.name}</h3>
                <p className="mt-1 text-xs text-slate-500 line-clamp-2">{pack.tagline}</p>
                <div className="mt-3 text-lg font-black text-slate-900">₹{pack.priceRupees}</div>
              </div>
              <button
                onClick={() => {
                  setSelectedPlan({ name: pack.name, prices: { ANNUAL: { amount: pack.priceRupees } } });
                  setShowCheckoutModal(true);
                }}
                className="mt-4 w-full rounded-lg bg-slate-50 py-1.5 text-xs font-semibold text-blue-700 border border-blue-200 hover:bg-blue-100 transition"
              >
                View Pack Details
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Promotional Coupon Banner */}
      <div className="mt-16 rounded-2xl border border-blue-200 bg-blue-50/70 p-6 max-w-3xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-1.5 font-bold text-blue-900 text-sm">
              <Tag className="h-4 w-4 text-blue-700" />
              <span>Have a promotional coupon?</span>
            </div>
            <p className="text-xs text-blue-800 mt-0.5">
              Enter coupon code <code className="font-mono font-bold">LAKSHYA20</code> for 20% launch discount.
            </p>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <input
              type="text"
              placeholder="Coupon Code"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-mono uppercase text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <button
              onClick={handleApplyCoupon}
              disabled={couponLoading}
              className="rounded-lg bg-blue-700 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-blue-800 transition"
            >
              {couponLoading ? "Checking..." : "Apply"}
            </button>
          </div>
        </div>
        {couponResult && (
          <div className="mt-3 rounded-lg bg-emerald-100 p-2 text-xs font-semibold text-emerald-800">
            ✅ {couponResult.description} (You save ₹{couponResult.discountAmount})
          </div>
        )}
        {couponError && (
          <div className="mt-3 rounded-lg bg-red-100 p-2 text-xs font-semibold text-red-800">
            ❌ {couponError}
          </div>
        )}
      </div>

      {/* Frequently Asked Questions */}
      <div className="mt-20 max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Frequently Asked Questions</h2>
          <p className="mt-2 text-xs sm:text-sm text-slate-500">
            Clear, transparent answers about billing, refunds, and entitlement policies.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div key={idx} className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
              <button
                onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                className="w-full py-4 px-5 text-left flex items-center justify-between gap-4 font-bold text-sm text-slate-900 hover:bg-slate-50 transition"
              >
                <span>{faq.q}</span>
                {expandedFaq === idx ? (
                  <ChevronUp className="h-4 w-4 text-slate-400 shrink-0" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-slate-400 shrink-0" />
                )}
              </button>
              {expandedFaq === idx && (
                <div className="px-5 pb-4 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Contact & Support Section */}
      <div className="mt-16 rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center max-w-2xl mx-auto">
        <h3 className="text-base font-bold text-slate-900">Have questions about plans or institutional access?</h3>
        <p className="mt-1 text-xs text-slate-600">
          Reach out directly to Aradhy Jain (Founder & Lead Architect) for immediate assistance.
        </p>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-xs">
          <a
            href="tel:+917351522153"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 font-semibold text-slate-700 hover:bg-slate-100 transition shadow-sm"
          >
            <Phone className="h-3.5 w-3.5 text-blue-600" />
            <span>+91 7351522153</span>
          </a>
          <a
            href="https://wa.me/917351522153"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-300 bg-emerald-50 px-3.5 py-2 font-semibold text-emerald-800 hover:bg-emerald-100 transition shadow-sm"
          >
            <MessageSquare className="h-3.5 w-3.5 text-emerald-600" />
            <span>WhatsApp Support</span>
          </a>
          <a
            href="mailto:jainaradhy123@gmail.com"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 font-semibold text-slate-700 hover:bg-slate-100 transition shadow-sm"
          >
            <Mail className="h-3.5 w-3.5 text-slate-600" />
            <span>jainaradhy123@gmail.com</span>
          </a>
        </div>
      </div>

      {/* Honest Payment Verification Modal */}
      {showCheckoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-blue-600" />
                <h4 className="text-sm font-bold text-slate-900">Payment System Status</h4>
              </div>
              <button
                onClick={() => setShowCheckoutModal(false)}
                className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs text-slate-600 leading-relaxed">
              <p className="font-semibold text-slate-800">
                You selected: <span className="text-blue-700 font-bold">{selectedPlan?.name || "Aspirant Pro"}</span>
              </p>
              <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-3.5 text-amber-900">
                <div className="flex items-center gap-1.5 font-bold mb-1">
                  <Clock className="h-4 w-4 text-amber-700" />
                  <span>Merchant Compliance Verification in Progress</span>
                </div>
                Our payment gateway is currently undergoing official compliance onboarding with <strong>Cashfree Payments</strong>.
              </div>
              <p>
                In the meantime, <strong>all learning features, PYQ banks, AI mentor trials, and test simulators remain 100% free and operational</strong> for all registered students.
              </p>
              <p className="text-[11px] text-slate-500">
                No orders will be charged until official production payment keys are verified. Thank you for your support as we build Pravaah UPSC sustainably!
              </p>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setShowCheckoutModal(false)}
                className="rounded-xl bg-blue-700 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-800 transition"
              >
                Continue Learning for Free
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
