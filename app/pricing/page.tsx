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
    name: "Free Aspirant",
    tagline: "Essential UPSC PYQ practice with official answer keys",
    tier: 0,
    isPopular: false,
    prices: {
      MONTHLY: { amount: 0, discountPercent: 0 },
      QUARTERLY: { amount: 0, discountPercent: 0 },
      ANNUAL: { amount: 0, discountPercent: 0 },
    },
    features: [
      { code: "PYQ_PRACTICE", name: "Daily authentic PYQ practice (15 questions/day)", isIncluded: true },
      { code: "EXPLANATIONS", name: "Verified answer keys & foundational concept notes", isIncluded: true },
      { code: "DAILY_QUIZ", name: "Daily 5-question Prelims micro-quiz", isIncluded: true },
      { code: "SYLLABUS_MAP", name: "Standard syllabus outline explorer", isIncluded: true },
      { code: "BOOKMARKS_LIMIT", name: "Personal question bookmarks (5)", isIncluded: true },
      { code: "NOTES_LIMIT", name: "Private study notes quota (3)", isIncluded: true },
      { code: "TIMED_EXAMS", name: "Timed 2-Hour Examination Simulator", isIncluded: false },
      { code: "AI_MENTOR", name: "Pravaah AI Personal Mentor", isIncluded: false },
    ],
  },
  {
    id: "plan_plus",
    code: "PLUS",
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
      { code: "PYQ_PRACTICE", name: "Expanded daily practice (50 questions/day)", isIncluded: true },
      { code: "EXPLANATIONS", name: "Detailed pedagogical explanations & elimination notes", isIncluded: true },
      { code: "ADVANCED_ANALYTICS", name: "Subject-wise accuracy and speed analytics", isIncluded: true },
      { code: "MISTAKE_REVISION", name: "SuperMemo-2 Spaced Repetition Mistake Notebook", isIncluded: true },
      { code: "BOOKMARKS_LIMIT", name: "Personal bookmarks allowance (50)", isIncluded: true },
      { code: "NOTES_LIMIT", name: "Private study notes allowance (50)", isIncluded: true },
      { code: "TIMED_EXAMS", name: "Timed 2-Hour Examination Simulator", isIncluded: true },
      { code: "AI_MENTOR", name: "Pravaah AI Personal Mentor", isIncluded: false },
    ],
  },
  {
    id: "plan_pro",
    code: "PRO",
    name: "Aspirant Pro",
    tagline: "AI Personal Mentor, Mission Control, Syllabus Map and Mains Evaluation",
    tier: 2,
    isPopular: true,
    prices: {
      MONTHLY: { amount: 299, discountPercent: 0 },
      QUARTERLY: { amount: 799, discountPercent: 11 },
      ANNUAL: { amount: 1999, discountPercent: 44 },
    },
    features: [
      { code: "PYQ_PRACTICE", name: "Unlimited authentic PYQ catalogue practice", isIncluded: true },
      { code: "TIMED_EXAMS", name: "Full 2-Hour Timed Exam Simulator (+2.0 / -0.666 grading)", isIncluded: true },
      { code: "AI_MENTOR", name: "Pravaah AI Personal Mentor (100 messages/mo)", isIncluded: true },
      { code: "MISSION_CONTROL", name: "Pravaah Mission Control daily cockpit", isIncluded: true },
      { code: "SYLLABUS_MAP", name: "Syllabus Intelligence Map with micro-nodes", isIncluded: true },
      { code: "PRELIMS_READINESS", name: "Prelims Readiness Analytics (0-100 index)", isIncluded: true },
      { code: "MAINS_EVAL", name: "Mains answer evaluations (5 credits/mo)", isIncluded: true },
      { code: "CSAT_COACH", name: "CSAT Survival Coach & speed drills", isIncluded: true },
    ],
  },
  {
    id: "plan_elite",
    code: "ELITE",
    name: "Aspirant Elite",
    tagline: "Higher AI mentor allowance, deep diagnostics and priority support",
    tier: 3,
    isPopular: false,
    prices: {
      MONTHLY: { amount: 499, discountPercent: 0 },
      QUARTERLY: { amount: 1299, discountPercent: 13 },
      ANNUAL: { amount: 3499, discountPercent: 42 },
    },
    features: [
      { code: "PYQ_PRACTICE", name: "Unlimited authentic PYQ catalogue practice", isIncluded: true },
      { code: "AI_MENTOR", name: "Pravaah AI Personal Mentor (300 messages/mo)", isIncluded: true },
      { code: "MAINS_EVAL", name: "Mains answer evaluations (15 credits/mo)", isIncluded: true },
      { code: "CURRENT_AFFAIRS", name: "Current Affairs exam converter packages", isIncluded: true },
      { code: "TIMED_EXAMS", name: "Unlimited Full Exam Simulations & custom topic mocks", isIncluded: true },
      { code: "PRIORITY_SUPPORT", name: "Direct priority support desk & WhatsApp SLA", isIncluded: true },
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

  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [modalMessage, setModalMessage] = useState<string | null>(null);

  const handlePlanClick = async (plan: any) => {
    if (plan.tier === 0) {
      window.location.href = "/register";
      return;
    }
    setSelectedPlan(plan);
    setCheckoutLoading(true);
    try {
      const res = await fetch("/api/v1/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planCode: plan.canonicalCode || plan.code,
          billingInterval,
          couponCode: couponResult?.code || undefined,
        }),
      });
      const json = await res.json();
      if (res.status === 401) {
        window.location.href = `/login?redirect=${encodeURIComponent("/pricing")}`;
        return;
      }
      if (res.ok && json.success && json.data?.orderId) {
        window.location.href = `/checkout/${json.data.orderId}`;
        return;
      } else {
        setModalMessage(
          json.error?.message ||
            "Online payments are temporarily unavailable while our secure payment system is being configured. Please check back soon."
        );
        setShowCheckoutModal(true);
      }
    } catch {
      setModalMessage("Online checkout is currently being initialized. Please check back shortly.");
      setShowCheckoutModal(true);
    } finally {
      setCheckoutLoading(false);
    }
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
      a: "Every single question is cross-referenced with the official UPSC examination gazette and revised official answer keys (Series A standard). Explanations cite authoritative sources including NCERT, Laxmikanth, and the Constitution of India.",
    },
    {
      q: "Does the Timed Exam Simulator mimic real UPSC negative marking?",
      a: "Yes. In General Studies Paper I, correct answers receive +2.0 marks and incorrect answers lose 0.666 marks (-1/3rd penalty). In CSAT Paper II, correct answers receive +2.5 marks and incorrect answers lose 0.833 marks. Unattempted questions incur 0 penalty.",
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
        <span className="inline-flex items-center gap-1.5 rounded-full bg-heritage-cream border border-heritage-gold/40 px-3.5 py-1 text-xs font-bold text-heritage-burgundy uppercase tracking-wider mb-4 shadow-xs">
          <ShieldCheck className="h-4 w-4 text-heritage-gold" />
          Transparent, Predictable Pricing · 7-Day Unconditional Money-Back Guarantee
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-heritage-text leading-tight">
          Choose Your Preparation Plan. <span className="text-heritage-burgundy">Invest in Your UPSC Journey.</span>
        </h1>
        <p className="mt-4 text-base sm:text-lg text-heritage-secondary leading-relaxed">
          Start free, build consistency and unlock intelligent preparation tools when you are ready. Authentic UPSC question bank, AI Personal Mentor, and diagnostic readiness analytics.
        </p>

        {/* Current Active Plan Notice */}
        {userSubscription && (
          <div className="mt-6 inline-flex flex-wrap items-center justify-center gap-2 rounded-xl border border-heritage-gold/40 bg-heritage-ivory px-4 py-2 text-xs font-semibold text-heritage-text shadow-xs">
            <span>Your Current Plan:</span>
            <span className="rounded bg-heritage-burgundy px-2.5 py-0.5 font-bold text-white uppercase tracking-wider text-[11px]">
              {userSubscription.planName || "Free Aspirant"}
            </span>
            <Link href="/dashboard/billing" className="ml-2 text-heritage-burgundy font-bold underline hover:text-heritage-wine">
              Manage Usage & Credits →
            </Link>
          </div>
        )}

        {/* Cashfree Secure Payment Protection Badge */}
        <div className="mt-6 rounded-2xl border border-heritage-gold/50 bg-heritage-cream/70 p-4 text-xs text-heritage-text flex items-center justify-between text-left shadow-xs">
          <div className="flex items-start gap-3">
            <ShieldCheck className="h-5 w-5 text-heritage-gold shrink-0 mt-0.5" />
            <div>
              <p className="font-serif font-bold text-heritage-burgundy">100% Secure Checkout via Official Cashfree Gateway</p>
              <p className="mt-0.5 text-heritage-secondary leading-relaxed">
                Instant activation for UPI AutoPay, Instant UPI QR, NetBanking, and credit/debit cards with 256-bit bank-grade encryption. All subscriptions include transparent billing and verified tax receipts.
              </p>
            </div>
          </div>
        </div>

        {/* Billing Interval Toggle */}
        <div className="mt-8 inline-flex items-center rounded-2xl bg-heritage-ivory p-1.5 border border-heritage-border shadow-inner">
          <button
            onClick={() => setBillingInterval("MONTHLY")}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
              billingInterval === "MONTHLY" ? "bg-white text-heritage-text shadow-xs font-extrabold" : "text-heritage-secondary hover:text-heritage-text"
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingInterval("QUARTERLY")}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition flex items-center gap-1.5 ${
              billingInterval === "QUARTERLY" ? "bg-white text-heritage-text shadow-xs font-extrabold" : "text-heritage-secondary hover:text-heritage-text"
            }`}
          >
            <span>Quarterly</span>
            <span className="rounded-full bg-emerald-100 px-1.5 py-0.2 text-[9px] text-emerald-800 font-extrabold">Save ~11%</span>
          </button>
          <button
            onClick={() => setBillingInterval("ANNUAL")}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition flex items-center gap-1.5 ${
              billingInterval === "ANNUAL" ? "bg-heritage-burgundy text-white shadow-xs font-extrabold" : "text-heritage-secondary hover:text-heritage-text"
            }`}
          >
            <span>Annual</span>
            <span className={`rounded-full px-2 py-0.5 text-[9px] font-black uppercase ${
              billingInterval === "ANNUAL" ? "bg-heritage-wine text-heritage-gold" : "bg-emerald-100 text-emerald-800"
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
          const displayName = p.name || (p.code === "FREE" ? "Free Aspirant" : p.code === "PLUS" || p.code === "BEGINNER" ? "Aspirant Plus" : p.code === "PRO" || p.code === "ACHIEVER" ? "Aspirant Pro" : "Aspirant Elite");

          return (
            <div
              key={p.code}
              className={`relative flex flex-col justify-between rounded-2xl border p-6 transition-all duration-200 ${
                isPro
                  ? "border-heritage-burgundy bg-white shadow-gold ring-2 ring-heritage-burgundy ring-offset-2"
                  : "border-heritage-border bg-white shadow-card hover:shadow-hover"
              }`}
            >
              {isPro && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-heritage-burgundy px-4 py-0.5 text-[11px] font-bold text-white uppercase tracking-wider shadow border border-heritage-gold/40">
                  Most Recommended · Flagship
                </div>
              )}

              <div>
                <div className="flex items-center justify-between">
                  <h3 className="font-serif text-lg font-bold text-heritage-text">
                    {displayName}
                  </h3>
                  <span className="rounded bg-heritage-cream px-2 py-0.5 text-[10px] font-mono font-bold text-heritage-burgundy border border-heritage-border">
                    Tier {p.tier}
                  </span>
                </div>
                <p className="mt-1.5 text-xs text-heritage-secondary min-h-[36px] leading-relaxed">{p.tagline}</p>

                {/* Price Display */}
                <div className="mt-5 flex items-baseline gap-1 border-b border-heritage-border/60 pb-5">
                  <span className="font-serif text-3xl sm:text-4xl font-bold text-heritage-text">₹{price}</span>
                  <span className="text-xs text-heritage-secondary">
                    {billingInterval === "MONTHLY" && "/ month"}
                    {billingInterval === "QUARTERLY" && `/ quarter (₹${Math.round(price / 3)}/mo)`}
                    {billingInterval === "ANNUAL" && `/ year (₹${Math.round(price / 12)}/mo)`}
                  </span>
                  {priceObj?.discountPercent ? (
                    <span className="ml-auto rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                      Save {priceObj.discountPercent}%
                    </span>
                  ) : null}
                </div>

                {/* Features List */}
                <ul className="mt-5 space-y-2.5 text-xs text-heritage-text">
                  {p.features?.map((f: any, idx: number) => (
                    <li key={idx} className="flex items-start gap-2">
                      {f.isIncluded ? (
                        <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                      ) : (
                        <X className="h-4 w-4 text-heritage-secondary/40 shrink-0 mt-0.5" />
                      )}
                      <span className={f.isIncluded ? "text-heritage-text" : "text-heritage-secondary/50 line-through"}>
                        {f.name}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Button */}
              <div className="mt-8 pt-4 border-t border-heritage-border/60">
                <button
                  onClick={() => handlePlanClick(p)}
                  className={`w-full rounded-xl py-2.5 text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    isPro
                      ? "bg-heritage-burgundy text-white hover:bg-heritage-wine shadow-xs"
                      : isFree
                      ? "bg-heritage-ivory text-heritage-text hover:bg-heritage-cream border border-heritage-border"
                      : "border border-heritage-border bg-white text-heritage-text hover:bg-heritage-ivory"
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
          <span className="rounded-full bg-heritage-cream border border-heritage-gold/40 px-3.5 py-1 text-xs font-bold text-heritage-burgundy uppercase tracking-wider">
            Specialized Add-On Packs
          </span>
          <h2 className="font-serif mt-3 text-2xl sm:text-3xl font-bold text-heritage-text">
            Intensive Topic & Skill Learning Packs
          </h2>
          <p className="mt-2 text-sm text-heritage-secondary leading-relaxed">
            One-time targeted additions for specific UPSC preparation hurdles. No recurring subscription required.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3 lg:grid-cols-5">
          {packs.map((pack) => (
            <div key={pack.code} className="rounded-2xl border border-heritage-border bg-white p-5 shadow-card flex flex-col justify-between">
              <div>
                <span className="rounded bg-heritage-cream px-2 py-0.5 text-[10px] font-mono font-bold text-heritage-burgundy border border-heritage-border">
                  {pack.category}
                </span>
                <h3 className="font-serif mt-2.5 text-sm font-bold text-heritage-text">{pack.name}</h3>
                <p className="mt-1 text-xs text-heritage-secondary line-clamp-2 leading-relaxed">{pack.tagline}</p>
                <div className="font-serif mt-3 text-lg font-bold text-heritage-burgundy">₹{pack.priceRupees}</div>
              </div>
              <button
                onClick={() => {
                  setSelectedPlan({ name: pack.name, prices: { ANNUAL: { amount: pack.priceRupees } } });
                  setShowCheckoutModal(true);
                }}
                className="mt-4 w-full rounded-xl bg-heritage-ivory py-2 text-xs font-bold text-heritage-burgundy border border-heritage-border hover:bg-heritage-cream transition"
              >
                View Pack Details
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Promotional Coupon Banner */}
      <div className="mt-16 rounded-2xl border border-heritage-gold/40 bg-heritage-cream/60 p-6 max-w-3xl mx-auto shadow-card">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-1.5 font-serif font-bold text-heritage-burgundy text-sm">
              <Tag className="h-4 w-4 text-heritage-gold" />
              <span>Have a promotional coupon?</span>
            </div>
            <p className="text-xs text-heritage-secondary mt-0.5">
              Enter coupon code <code className="font-mono font-bold text-heritage-burgundy">LAKSHYA20</code> for 20% launch discount.
            </p>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <input
              type="text"
              placeholder="Coupon Code"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              className="rounded-xl border border-heritage-border bg-white px-3 py-1.5 text-xs font-mono uppercase text-heritage-text focus:outline-none focus:ring-1 focus:ring-heritage-gold"
            />
            <button
              onClick={handleApplyCoupon}
              disabled={couponLoading}
              className="rounded-xl bg-heritage-burgundy px-4 py-1.5 text-xs font-bold text-white hover:bg-heritage-wine transition shadow-xs"
            >
              {couponLoading ? "Checking..." : "Apply"}
            </button>
          </div>
        </div>
        {couponResult && (
          <div className="mt-3 rounded-xl bg-emerald-100 p-2.5 text-xs font-semibold text-emerald-800">
            ✅ {couponResult.description} (You save ₹{couponResult.discountAmount})
          </div>
        )}
        {couponError && (
          <div className="mt-3 rounded-xl bg-rose-100 p-2.5 text-xs font-semibold text-rose-800">
            ❌ {couponError}
          </div>
        )}
      </div>

      {/* Frequently Asked Questions */}
      <div className="mt-20 max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-heritage-text">Frequently Asked Questions</h2>
          <p className="mt-2 text-xs sm:text-sm text-heritage-secondary">
            Clear, transparent answers about billing, refunds, and entitlement policies.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div key={idx} className="rounded-2xl border border-heritage-border bg-white overflow-hidden shadow-card">
              <button
                onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                className="w-full py-4 px-5 text-left flex items-center justify-between gap-4 font-serif font-bold text-sm text-heritage-text hover:bg-heritage-ivory transition"
              >
                <span>{faq.q}</span>
                {expandedFaq === idx ? (
                  <ChevronUp className="h-4 w-4 text-heritage-gold shrink-0" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-heritage-secondary shrink-0" />
                )}
              </button>
              {expandedFaq === idx && (
                <div className="px-5 pb-4 text-xs sm:text-sm text-heritage-secondary leading-relaxed border-t border-heritage-border/60 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Contact & Support Section */}
      <div className="mt-16 rounded-2xl border border-heritage-border bg-heritage-ivory p-8 text-center max-w-2xl mx-auto shadow-card">
        <h3 className="font-serif text-base font-bold text-heritage-text">Have questions about plans or institutional access?</h3>
        <p className="mt-1 text-xs text-heritage-secondary">
          Reach out directly to Aradhy Jain (Founder & Lead Architect) for immediate assistance.
        </p>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-xs">
          <a
            href="tel:+917351522153"
            className="inline-flex items-center gap-1.5 rounded-xl border border-heritage-border bg-white px-3.5 py-2 font-semibold text-heritage-text hover:bg-heritage-cream transition shadow-xs"
          >
            <Phone className="h-3.5 w-3.5 text-heritage-burgundy" />
            <span>+91 7351522153</span>
          </a>
          <a
            href="https://wa.me/917351522153"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-50 px-3.5 py-2 font-semibold text-emerald-800 hover:bg-emerald-100 transition shadow-xs"
          >
            <MessageSquare className="h-3.5 w-3.5 text-emerald-600" />
            <span>WhatsApp Support</span>
          </a>
          <a
            href="mailto:jainaradhy123@gmail.com"
            className="inline-flex items-center gap-1.5 rounded-xl border border-heritage-border bg-white px-3.5 py-2 font-semibold text-heritage-text hover:bg-heritage-cream transition shadow-xs"
          >
            <Mail className="h-3.5 w-3.5 text-heritage-secondary" />
            <span>jainaradhy123@gmail.com</span>
          </a>
        </div>
      </div>

      {/* Honest Payment Verification Modal */}
      {showCheckoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-heritage-border animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-heritage-border pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-heritage-gold" />
                <h4 className="font-serif text-sm font-bold text-heritage-text">Payment System Status</h4>
              </div>
              <button
                onClick={() => setShowCheckoutModal(false)}
                className="rounded p-1 text-heritage-secondary hover:bg-heritage-ivory hover:text-heritage-text"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs text-heritage-secondary leading-relaxed">
              <p className="font-semibold text-heritage-text">
                You selected: <span className="text-heritage-burgundy font-bold">{selectedPlan?.name || "Aspirant Pro"}</span>
              </p>
              <div className="rounded-xl border border-heritage-gold/50 bg-heritage-cream/70 p-3.5 text-heritage-text">
                <div className="flex items-center gap-1.5 font-bold mb-1 text-heritage-burgundy">
                  <Clock className="h-4 w-4 text-heritage-gold" />
                  <span>Cashfree Payment Gateway Notice</span>
                </div>
                {modalMessage || "Our payment gateway is currently operating with official Cashfree Payments integration."}
              </div>
              <p>
                In the meantime, <strong>all learning features, PYQ banks, AI mentor trials, and test simulators remain 100% free and operational</strong> for all registered students.
              </p>
              <p className="text-[11px] text-heritage-secondary">
                No orders will be charged until official production payment keys are verified. Thank you for your support as we build Pravaah UPSC sustainably!
              </p>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setShowCheckoutModal(false)}
                className="rounded-xl bg-heritage-burgundy px-4 py-2 text-xs font-bold text-white hover:bg-heritage-wine transition shadow-xs"
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
