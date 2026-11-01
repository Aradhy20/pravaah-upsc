"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  BookOpen,
  UserPlus,
  ArrowRight,
  AlertCircle,
  Mail,
  Key,
  User,
  Calendar,
  Eye,
  EyeOff,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Lock,
} from "lucide-react";

function RegisterContent() {
  const searchParams = useSearchParams();
  const selectedPlanCode = searchParams.get("plan");
  const selectedInterval = searchParams.get("interval") || "ANNUAL";

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // Dynamically compute upcoming examination cycles based on current system date
  const currentYear = new Date().getFullYear();
  const nextAttemptYear = currentYear < 2027 ? 2027 : currentYear;
  const targetYearOptions = [
    { value: String(nextAttemptYear), label: `${nextAttemptYear} (Target Attempt)` },
    { value: String(nextAttemptYear + 1), label: `${nextAttemptYear + 1} (Next Cycle)` },
    { value: String(nextAttemptYear + 2), label: `${nextAttemptYear + 2} (Two-Year Foundation)` },
    { value: String(nextAttemptYear + 3), label: `${nextAttemptYear + 3} (Long-Term Foundation)` },
  ];

  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [targetYear, setTargetYear] = useState(String(nextAttemptYear));
  const [optionalSubject, setOptionalSubject] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Authenticated state check
  const [authChecked, setAuthChecked] = useState(false);
  const [currentSessionUser, setCurrentSessionUser] = useState<any | null>(null);

  useEffect(() => {
    async function checkExistingAuth() {
      try {
        const res = await fetch("/api/v1/auth/me");
        const json = await res.json();
        if (json.success && json.data.authenticated) {
          setCurrentSessionUser(json.data.user);
        }
      } catch (e) {
        console.error("Auth check error:", e);
      } finally {
        setAuthChecked(true);
      }
    }
    checkExistingAuth();
  }, []);

  const handleSignOutAndContinue = async () => {
    try {
      await fetch("/api/v1/auth/logout", { method: "POST" });
      setCurrentSessionUser(null);
    } catch (e) {
      console.error(e);
    }
  };

  const getPlanDetails = (code: string | null) => {
    if (!code) return null;
    switch (code.toUpperCase()) {
      case "ACHIEVER":
        return {
          name: "Prelims Pro (Flagship)",
          price: selectedInterval === "ANNUAL" ? "₹5,499/yr" : selectedInterval === "QUARTERLY" ? "₹1,899/qtr" : "₹799/mo",
          tag: "Timed exam simulation + negative marking + AI diagnostics",
        };
      case "BEGINNER":
        return {
          name: "Syllabus Sprint",
          price: selectedInterval === "ANNUAL" ? "₹2,999/yr" : selectedInterval === "QUARTERLY" ? "₹999/qtr" : "₹399/mo",
          tag: "Extended study quotas & full PYQ exploration",
        };
      case "SCHOLAR":
        return {
          name: "Ranker Suite",
          price: selectedInterval === "ANNUAL" ? "₹8,999/yr" : selectedInterval === "QUARTERLY" ? "₹2,999/qtr" : "₹1,299/mo",
          tag: "Comprehensive suite with priority review audit",
        };
      case "FREE":
      default:
        return {
          name: "Aspirant Foundation",
          price: "Free",
          tag: "1,079+ PYQs with official answer keys & verified explanations",
        };
    }
  };

  const planInfo = getPlanDetails(selectedPlanCode);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match. Please re-enter.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (!agreeTerms) {
      setError("Please accept the Terms of Service & Aspirant Honor Code to register.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: fullName.trim(),
          email: email.trim().toLowerCase(),
          password,
          targetYear: parseInt(targetYear),
          optionalSubject: optionalSubject.trim() || "General Studies",
        }),
      });

      const data = await res.json();
      if (data.success) {
        // If a paid plan was pre-selected, preserve it through to pricing/checkout
        if (selectedPlanCode && selectedPlanCode !== "FREE") {
          window.location.href = `/pricing?autoCheckout=${selectedPlanCode}&interval=${selectedInterval}`;
        } else {
          window.location.href = "/dashboard";
        }
      } else {
        setError(data.error?.message || "Registration failed. Please check your details.");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // If already logged in as Administrator, prevent confusing mixed-state
  if (authChecked && currentSessionUser?.role === "ADMIN") {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 sm:px-6">
        <div className="w-full max-w-md rounded-2xl border border-amber-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-700 border border-amber-200">
            <ShieldCheck className="h-7 w-7" />
          </div>
          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-900">
            Active Administrator Session
          </span>
          <h1 className="mt-3 text-xl font-extrabold text-slate-900">
            Signed in as Administrator
          </h1>
          <p className="mt-2 text-xs text-slate-600 leading-relaxed">
            You are currently signed in as <strong>{currentSessionUser.email}</strong>. An administrator account cannot be converted to a new aspirant account.
          </p>
          <div className="mt-6 flex flex-col gap-2.5">
            <a
              href="/admin"
              className="w-full rounded-xl bg-amber-700 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-amber-800 transition"
            >
              Open Admin Portal
            </a>
            <button
              onClick={handleSignOutAndContinue}
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
            >
              Sign Out & Register New Aspirant
            </button>
          </div>
        </div>
      </div>
    );
  }

  // If already logged in as Aspirant, offer direct route to dashboard
  if (authChecked && currentSessionUser && currentSessionUser.role !== "ADMIN") {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 sm:px-6">
        <div className="w-full max-w-md rounded-2xl border border-blue-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-700 border border-blue-200">
            <CheckCircle2 className="h-7 w-7" />
          </div>
          <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-900">
            Already Registered
          </span>
          <h1 className="mt-3 text-xl font-extrabold text-slate-900">
            Welcome back, {currentSessionUser.fullName}!
          </h1>
          <p className="mt-2 text-xs text-slate-600 leading-relaxed">
            You are signed in as <strong>{currentSessionUser.email}</strong>. Your study progress, saved notes, and revision queue are ready.
          </p>
          <div className="mt-6 flex flex-col gap-2.5">
            <a
              href={selectedPlanCode && selectedPlanCode !== "FREE" ? `/pricing?autoCheckout=${selectedPlanCode}&interval=${selectedInterval}` : "/dashboard"}
              className="w-full rounded-xl bg-blue-700 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-blue-800 transition"
            >
              {selectedPlanCode && selectedPlanCode !== "FREE" ? `Proceed to Upgrade (${planInfo?.name})` : "Go to Aspirant Dashboard"}
            </a>
            <button
              onClick={handleSignOutAndContinue}
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
            >
              Sign Out & Create Different Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 sm:px-6">
      <div className="w-full max-w-md space-y-6 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
        {/* Selected Plan Callout Banner if coming from /pricing */}
        {planInfo && selectedPlanCode && selectedPlanCode !== "FREE" && (
          <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-3.5 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-blue-700 shrink-0" />
              <div>
                <span className="font-bold text-blue-950">Selected Plan: {planInfo.name}</span>
                <p className="text-[11px] text-blue-800">{planInfo.price} • {planInfo.tag}</p>
              </div>
            </div>
            <a href="/pricing" className="text-[11px] font-bold text-blue-700 underline shrink-0">
              Change
            </a>
          </div>
        )}

        <div className="text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-700 to-indigo-800 text-white mb-3 shadow-sm">
            <UserPlus className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Create Aspirant Account
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Join Pravaah UPSC with full PYQ exploration, personal bookmarks, and mistake tracking.
          </p>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Aarav Sharma"
                className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="aarav@example.com"
                className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Key className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-8 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <Key className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Target Exam Year
              </label>
              <select
                value={targetYear}
                onChange={(e) => setTargetYear(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent bg-white"
              >
                {targetYearOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Optional Subject
              </label>
              <input
                type="text"
                value={optionalSubject}
                onChange={(e) => setOptionalSubject(e.target.value)}
                placeholder="e.g. PSIR, Geography"
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              />
            </div>
          </div>

          {/* Terms and Honor Code Agreement */}
          <div className="pt-1">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-xs text-slate-600 leading-snug">
                I agree to the{" "}
                <a href="/terms" target="_blank" className="text-blue-700 font-semibold underline">
                  Terms of Service
                </a>{" "}
                and commit to the authentic UPSC Aspirant Honor Code.
              </span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 rounded-xl bg-blue-700 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-blue-800 transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading
              ? "Creating Aspirant Account..."
              : selectedPlanCode && selectedPlanCode !== "FREE"
              ? `Register & Continue to ${planInfo?.name || "Checkout"}`
              : "Complete Free Registration"}
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        <div className="pt-2 text-center text-xs text-slate-500">
          Already have an account?{" "}
          <a
            href={selectedPlanCode ? `/login?plan=${selectedPlanCode}&interval=${selectedInterval}` : "/login"}
            className="font-bold text-blue-700 hover:underline"
          >
            Sign In here
          </a>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[80vh] flex items-center justify-center p-4">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-700" />
        </div>
      }
    >
      <RegisterContent />
    </Suspense>
  );
}
