"use client";

import React, { useState, useEffect } from "react";
import {
  Calendar,
  BookOpen,
  Clock,
  Target,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  Award,
  Zap,
  TrendingUp,
  Globe,
  AlertTriangle,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/context";

const OPTIONAL_SUBJECTS = [
  "Political Science & IR (PSIR)",
  "Sociology",
  "Geography",
  "History",
  "Public Administration",
  "Anthropology",
  "Economics",
  "Philosophy",
  "Law",
  "Commerce & Accountancy",
  "Agriculture",
  "Mathematics",
  "Hindi Literature (हिंदी साहित्य)",
  "Literature of an Indian Language",
  "General Studies / Yet to Decide",
];

const TARGET_YEARS = [
  {
    year: 2025,
    title: "Sprint Attempt (2025)",
    badge: "Immediate Cycle",
    desc: "Targeting the upcoming Prelims. Heavy focus on 5-year high-yield PYQs, error-notebook elimination, and timed full-length simulations.",
    recommendedDailyMin: 180,
  },
  {
    year: 2026,
    title: "Comprehensive Target (2026)",
    badge: "Most Popular",
    desc: "Complete 10-year topic-wise coverage, integrated current affairs linking, and weekly AI Mains answer grading.",
    recommendedDailyMin: 120,
  },
  {
    year: 2027,
    title: "Foundation Cohort (2027+)",
    badge: "Long-Term Mastery",
    desc: "Build conceptual clarity from NCERTs and standard references, mastering 1 subject per month with spaced repetition.",
    recommendedDailyMin: 60,
  },
];

const WEAK_AREAS_OPTIONS = [
  { id: "CSAT", label: "CSAT Paper II (Maths & Comprehension)" },
  { id: "ECONOMY", label: "Indian Economy & Budget/Banking" },
  { id: "POLITY", label: "Indian Polity, Articles & Judiciary" },
  { id: "ENVIRONMENT", label: "Environment, Ecology & Biodiversity" },
  { id: "HISTORY", label: "Modern Indian History & Art/Culture" },
  { id: "ETHICS", label: "GS4 Ethics & Case Studies" },
  { id: "CURRENT_AFFAIRS", label: "Current Affairs & Government Schemes" },
];

const DAILY_COMMITMENTS = [
  {
    minutes: 45,
    title: "Working Professional / College",
    desc: "15 targeted PYQs + 1 Current Affairs deep-dive daily. Ideal for aspirants managing a full-time job or college.",
    weeklyPyqTarget: 90,
  },
  {
    minutes: 90,
    title: "Focused Aspirant",
    desc: "30 PYQs with detailed concept breakdown + Daily 5-question test. Balanced standard preparation pace.",
    weeklyPyqTarget: 200,
  },
  {
    minutes: 180,
    title: "Full-Time Dedicated",
    desc: "60 PYQs across GS & CSAT + 1 AI-graded Mains answer draft daily. High-velocity preparation.",
    weeklyPyqTarget: 400,
  },
];

export default function OnboardingPage() {
  const { language, setLanguage } = useLanguage();
  const [step, setStep] = useState(1);
  const [selectedYear, setSelectedYear] = useState(2026);
  const [selectedMedium, setSelectedMedium] = useState<"en" | "hi">("en");
  const [selectedOptional, setSelectedOptional] = useState("Political Science & IR (PSIR)");
  const [selectedWeakAreas, setSelectedWeakAreas] = useState<string[]>(["CSAT", "ECONOMY"]);
  const [selectedCommitment, setSelectedCommitment] = useState(90);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    fetch("/api/v1/user/profile")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.success && data.data) {
          if (data.data.targetYear) setSelectedYear(data.data.targetYear);
          if (data.data.optionalSubject && data.data.optionalSubject !== "Not Selected") {
            setSelectedOptional(data.data.optionalSubject);
          }
          if (data.data.dailyGoalMinutes) setSelectedCommitment(data.data.dailyGoalMinutes);
          if (data.data.preferredLanguage) setSelectedMedium(data.data.preferredLanguage as "en" | "hi");
        }
      })
      .catch(() => {});
  }, []);

  const toggleWeakArea = (id: string) => {
    setSelectedWeakAreas((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleFinish = async () => {
    setSubmitting(true);
    setError(null);
    try {
      setLanguage(selectedMedium);
      const res = await fetch("/api/v1/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetYear: selectedYear,
          targetExam: "UPSC_CSE",
          optionalSubject: selectedOptional,
          dailyGoalMinutes: selectedCommitment,
          dailyStudyHours: selectedCommitment / 60,
          preferredLanguage: selectedMedium,
          weakSubjects: selectedWeakAreas.join(", "),
          preparationStage: selectedYear === 2025 ? "ADVANCED" : "INTERMEDIATE",
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setCompleted(true);
      } else {
        setError(data.error || "Failed to save onboarding preferences");
      }
    } catch (e: any) {
      console.error(e);
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (completed) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-xl text-center bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 shadow-xl shadow-slate-100">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 mb-6 ring-8 ring-emerald-50">
            <CheckCircle2 className="h-9 w-9" />
          </div>

          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 mb-3">
            <Sparkles className="h-3.5 w-3.5 text-blue-600" />
            Study Trajectory Configured
          </span>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {selectedMedium === "hi"
              ? `UPSC CSE ${selectedYear} हेतु आपका रोडमैप तैयार है!`
              : `You're Set for UPSC CSE ${selectedYear}!`}
          </h1>

          <p className="mt-3 text-sm text-slate-600 leading-relaxed">
            Your personalized learning track has been generated. Medium:{" "}
            <span className="font-bold text-slate-900">
              {selectedMedium === "hi" ? "हिंदी माध्यम (Hindi)" : "English Medium"}
            </span>
            , Target Optional:{" "}
            <span className="font-bold text-slate-900">{selectedOptional}</span> with{" "}
            <span className="font-bold text-slate-900">{selectedCommitment} mins/day</span> of deliberate practice.
          </p>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Daily Target</span>
              <p className="text-base font-extrabold text-slate-800 mt-0.5">{selectedCommitment} Minutes</p>
              <p className="text-xs text-slate-500 mt-1">Spaced repetition queue & Daily 5-Q Quiz</p>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Priority Focus</span>
              <p className="text-base font-extrabold text-slate-800 mt-0.5">
                {selectedWeakAreas.length > 0 ? selectedWeakAreas.join(", ") : "All Core Subjects"}
              </p>
              <p className="text-xs text-slate-500 mt-1">High-yield targeted practice sets</p>
            </div>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href="/dashboard"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-6 py-3.5 text-xs font-bold text-white shadow-md shadow-blue-700/20 hover:bg-blue-800 transition"
            >
              <span>Go to My Dashboard</span>
              <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href="/daily-quiz"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
            >
              <span>Take Diagnostic Quiz</span>
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl">
        {/* Onboarding Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold mb-3 border border-blue-200/60">
            <Target className="h-3.5 w-3.5" />
            <span>Step {step} of 4: Personalized Diagnostic</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {step === 1 && "Select Your Target Examination Year"}
            {step === 2 && "Choose Your Preparation Medium & Optional"}
            {step === 3 && "Identify Your Priority Focus / Weak Areas"}
            {step === 4 && "Set Your Daily Available Study Time"}
          </h1>
          <p className="mt-2 text-sm text-slate-500 max-w-md mx-auto">
            {step === 1 && "Pravaah tailors high-yield topic weightage and revision urgency based on your target cycle."}
            {step === 2 && "We present verified bilingual questions and official terminology tuned to your medium."}
            {step === 3 && "We will prioritize diagnostic sets and spaced repetitions to close your highest score gaps."}
            {step === 4 && "Consistency beats intensity. Pravaah will schedule optimal daily task sets for your budget."}
          </p>

          {/* Progress bar */}
          <div className="mx-auto mt-6 max-w-xs h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 transition-all duration-300 rounded-full"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs font-bold text-rose-700">
            {error}
          </div>
        )}

        {/* STEP 1: Target Year */}
        {step === 1 && (
          <div className="space-y-4">
            {TARGET_YEARS.map((item) => {
              const isSelected = selectedYear === item.year;
              return (
                <div
                  key={item.year}
                  onClick={() => setSelectedYear(item.year)}
                  className={`cursor-pointer rounded-2xl border p-5 sm:p-6 transition-all duration-200 bg-white ${
                    isSelected
                      ? "border-blue-600 ring-2 ring-blue-600/20 shadow-md"
                      : "border-slate-200 hover:border-slate-300 shadow-sm"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3.5">
                      <div
                        className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${
                          isSelected
                            ? "border-blue-600 bg-blue-600 text-white"
                            : "border-slate-300 bg-white"
                        }`}
                      >
                        {isSelected && <CheckCircle2 className="h-4 w-4" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-extrabold text-slate-900">{item.title}</h3>
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                            {item.badge}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-slate-500 leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* STEP 2: Medium & Optional Subject */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                <Globe className="h-4 w-4 text-blue-600" />
                <span>Primary Preparation Medium:</span>
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedMedium("en")}
                  className={`p-4 rounded-xl border text-center transition ${
                    selectedMedium === "en"
                      ? "border-blue-600 bg-blue-50/70 text-blue-900 ring-1 ring-blue-600 font-bold"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <div className="text-sm font-black">English Medium</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Standard English terminology</div>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedMedium("hi")}
                  className={`p-4 rounded-xl border text-center transition ${
                    selectedMedium === "hi"
                      ? "border-amber-600 bg-amber-50/70 text-amber-900 ring-1 ring-amber-600 font-bold"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <div className="text-sm font-black">हिंदी माध्यम (Hindi)</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">प्रामाणिक देवनागरी शब्दावली</div>
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h3 className="text-sm font-bold text-slate-700 mb-3">Select your Mains Optional:</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[260px] overflow-y-auto pr-1">
                {OPTIONAL_SUBJECTS.map((opt) => {
                  const isSelected = selectedOptional === opt;
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setSelectedOptional(opt)}
                      className={`flex items-center justify-between rounded-xl border p-3 text-left text-xs font-semibold transition ${
                        isSelected
                          ? "border-blue-600 bg-blue-50/70 text-blue-900 ring-1 ring-blue-600"
                          : "border-slate-200 hover:border-slate-300 text-slate-700 bg-white hover:bg-slate-50/50"
                      }`}
                    >
                      <span className="truncate">{opt}</span>
                      {isSelected && <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0 ml-2" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Weak / Priority Areas */}
        {step === 3 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Select subjects you want to strengthen first:</h3>
              <p className="text-xs text-slate-500 mt-1">
                Select 1 to 4 areas where your confidence is lowest. We will calibrate your first diagnostic milestones around them.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {WEAK_AREAS_OPTIONS.map((area) => {
                const isSelected = selectedWeakAreas.includes(area.id);
                return (
                  <button
                    key={area.id}
                    type="button"
                    onClick={() => toggleWeakArea(area.id)}
                    className={`flex items-center justify-between rounded-xl border p-3.5 text-left text-xs font-bold transition ${
                      isSelected
                        ? "border-amber-500 bg-amber-50/60 text-amber-950 ring-1 ring-amber-500 shadow-xs"
                        : "border-slate-200 hover:border-slate-300 text-slate-700 bg-white"
                    }`}
                  >
                    <span>{area.label}</span>
                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center border ${
                        isSelected ? "bg-amber-600 border-amber-600 text-white" : "border-slate-300 bg-slate-50"
                      }`}
                    >
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 4: Daily Commitment */}
        {step === 4 && (
          <div className="space-y-4">
            {DAILY_COMMITMENTS.map((item) => {
              const isSelected = selectedCommitment === item.minutes;
              return (
                <div
                  key={item.minutes}
                  onClick={() => setSelectedCommitment(item.minutes)}
                  className={`cursor-pointer rounded-2xl border p-5 sm:p-6 transition-all duration-200 bg-white ${
                    isSelected
                      ? "border-blue-600 ring-2 ring-blue-600/20 shadow-md"
                      : "border-slate-200 hover:border-slate-300 shadow-sm"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3.5">
                      <div
                        className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${
                          isSelected
                            ? "border-blue-600 bg-blue-600 text-white"
                            : "border-slate-300 bg-white"
                        }`}
                      >
                        {isSelected && <CheckCircle2 className="h-4 w-4" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-extrabold text-slate-900">{item.title}</h3>
                          <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-blue-700">
                            {item.minutes} mins / day
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-slate-500 leading-relaxed">{item.desc}</p>
                        <div className="mt-2 flex items-center gap-1.5 text-[11px] font-bold text-indigo-700">
                          <Zap className="h-3 w-3" /> Targets ~{item.weeklyPyqTarget} questions resolved per week
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="mt-8 flex items-center justify-between gap-4">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep((s) => s - 1)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-5 py-3 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
          ) : (
            <div />
          )}

          {step < 4 ? (
            <button
              type="button"
              onClick={() => setStep((s) => s + 1)}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-700 px-7 py-3 text-xs font-bold text-white shadow-md shadow-blue-700/20 hover:bg-blue-800 transition"
            >
              Continue to Step {step + 1} <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              disabled={submitting}
              onClick={handleFinish}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-8 py-3 text-xs font-bold text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-700 transition disabled:opacity-50"
            >
              {submitting ? "Configuring Trajectory..." : "Complete Setup & Launch"}
              <CheckCircle2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
