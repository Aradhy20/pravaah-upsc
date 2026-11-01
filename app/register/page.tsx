"use client";

import React, { useState } from "react";
import {
  BookOpen,
  UserPlus,
  ArrowRight,
  AlertCircle,
  Mail,
  Key,
  User,
  Calendar,
  CheckCircle,
  Clock,
  Sparkles,
} from "lucide-react";

export default function RegisterPage() {
  const [step, setStep] = useState<1 | 2>(1);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // Step 2: Onboarding Preferences
  const [targetYear, setTargetYear] = useState("2027");
  const [preparationStage, setPreparationStage] = useState("FOUNDATION");
  const [dailyGoalMinutes, setDailyGoalMinutes] = useState(60);
  const [optionalSubject, setOptionalSubject] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match. Please verify.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (!agreedToTerms) {
      setError("Please agree to the Terms of Service and Privacy Policy to proceed.");
      return;
    }

    // Move to Step 2: Personalize Onboarding
    setStep(2);
  };

  const handleCompleteRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: fullName.trim(),
          email: email.toLowerCase().trim(),
          password,
          targetYear: parseInt(targetYear),
          optionalSubject: optionalSubject.trim() || "General Studies",
          dailyGoalMinutes: dailyGoalMinutes || 60,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        // Store onboarding preferences locally for personalized experience
        localStorage.setItem("pravaah_stage", preparationStage);
        localStorage.setItem("pravaah_daily_goal", dailyGoalMinutes.toString());
        window.location.href = "/dashboard";
      } else {
        setError(data.error?.message || "Registration failed. Please check your credentials.");
        setStep(1); // Return to step 1 if account creation error
      }
    } catch (err: any) {
      setError(err.message || "An unexpected network error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 sm:px-6 bg-slate-50">
      <div className="w-full max-w-lg bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
        {/* Header with Step Indicator */}
        <div className="text-center mb-6">
          <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white mb-3 shadow-sm">
            <BookOpen className="h-5 w-5" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {step === 1 ? "Create Your Aspirant Account" : "Personalize Your UPSC Path"}
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            {step === 1
              ? "Start learning free with 1,100 verified PYQs, daily quizzes, and mistake revision."
              : "Step 2 of 2: Tailor your daily syllabus plan and revision recommendations."}
          </p>

          {/* Stepper Dots */}
          <div className="flex items-center justify-center gap-2 mt-4">
            <div
              className={`h-1.5 rounded-full transition-all ${
                step === 1 ? "w-8 bg-blue-600" : "w-2 bg-emerald-500"
              }`}
            />
            <div
              className={`h-1.5 rounded-full transition-all ${
                step === 2 ? "w-8 bg-blue-600" : "w-2 bg-slate-200"
              }`}
            />
          </div>
        </div>

        {error && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        {/* STEP 1: Account Information */}
        {step === 1 && (
          <form onSubmit={handleStep1Submit} className="space-y-4">
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
                  placeholder="e.g. Aarav Sharma"
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

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Password (Min 6 characters)
              </label>
              <div className="relative">
                <Key className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <Key className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex items-start gap-2 pt-1">
              <input
                id="terms"
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 mt-0.5"
              />
              <label htmlFor="terms" className="text-xs text-slate-600 leading-tight">
                I agree to the{" "}
                <a href="/terms" target="_blank" className="text-blue-600 underline">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="/privacy" target="_blank" className="text-blue-600 underline">
                  Privacy Policy
                </a>
                .
              </label>
            </div>

            <button
              type="submit"
              className="w-full mt-3 rounded-xl bg-blue-600 py-3 text-sm font-bold text-white shadow-sm hover:bg-blue-700 transition flex items-center justify-center gap-2"
            >
              <span>Continue to Onboarding</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        )}

        {/* STEP 2: Onboarding Customization */}
        {step === 2 && (
          <form onSubmit={handleCompleteRegistration} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Preparation Stage
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "FOUNDATION", label: "Foundation", desc: "Starting core texts" },
                  { id: "PRACTICE", label: "Intermediate", desc: "Solving PYQs" },
                  { id: "REVISION", label: "Mock & Test", desc: "Upcoming Prelims" },
                ].map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setPreparationStage(s.id)}
                    className={`rounded-xl border p-2.5 text-left transition ${
                      preparationStage === s.id
                        ? "border-blue-600 bg-blue-50 text-blue-900 ring-2 ring-blue-600/20"
                        : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <div className="text-xs font-bold">{s.label}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">{s.desc}</div>
                  </button>
                ))}
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
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white text-slate-900"
                >
                  <option value="2027">CSE 2027 (Upcoming Cycle)</option>
                  <option value="2028">CSE 2028</option>
                  <option value="2029">CSE 2029</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Daily Study Goal
                </label>
                <select
                  value={dailyGoalMinutes}
                  onChange={(e) => setDailyGoalMinutes(parseInt(e.target.value))}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white text-slate-900"
                >
                  <option value={30}>30 mins / day</option>
                  <option value={60}>60 mins / day</option>
                  <option value={90}>90 mins / day</option>
                  <option value={120}>120 mins / day</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Optional Subject (Optional)
              </label>
              <input
                type="text"
                value={optionalSubject}
                onChange={(e) => setOptionalSubject(e.target.value)}
                placeholder="e.g. PSIR, Geography, Sociology, History"
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900"
              />
            </div>

            <div className="pt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-1/3 rounded-xl border border-slate-300 py-3 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="w-2/3 rounded-xl bg-blue-600 py-3 text-xs font-bold text-white shadow-sm hover:bg-blue-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? "Creating Account..." : "Launch Learning Dashboard"}
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </form>
        )}

        {/* Footer Link */}
        <div className="mt-6 pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
          Already registered?{" "}
          <a href="/login" className="font-bold text-blue-600 hover:underline">
            Sign in here &rarr;
          </a>
        </div>
      </div>
    </div>
  );
}
