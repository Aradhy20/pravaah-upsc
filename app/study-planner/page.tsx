"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  BookOpen,
  Calendar,
  CheckCircle,
  Clock,
  RotateCw,
  Compass,
  ArrowRight,
  Sparkles,
  Award,
  AlertCircle,
  HelpCircle,
  ChevronRight,
  TrendingUp,
  Sliders,
  Check,
  Edit3,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/context";

export default function DailyStudyPlannerPage() {
  const { language, t } = useLanguage();
  const [plan, setPlan] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Custom schedule state
  const [targetExam, setTargetExam] = useState("UPSC CSE 2025");
  const [stage, setStage] = useState("INTERMEDIATE");
  const [dailyHours, setDailyHours] = useState(6);
  const [targetDate, setTargetDate] = useState("2025-05-25");
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([
    "Polity & Governance",
    "Economy",
    "Modern History",
  ]);
  const [customSchedule, setCustomSchedule] = useState<any | null>(null);
  const [generating, setGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<"COMPASS" | "CUSTOM_SCHEDULE">("COMPASS");

  const loadPlan = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/v1/study-planner/today");
      const data = await res.json();
      if (res.ok && data.success) {
        setPlan(data.studyPlan);
        if (data.studyPlan?.studentTarget) {
          const st = data.studyPlan.studentTarget;
          if (st.targetExam) setTargetExam(st.targetExam);
          if (st.dailyStudyHours) setDailyHours(st.dailyStudyHours);
          if (st.preparationStage) setStage(st.preparationStage);
        }
      } else {
        setError(data.error || "Failed to formulate study plan.");
      }
    } catch (e: any) {
      console.error("Failed to load study plan:", e);
      setError("Network error while connecting to study planner engine.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlan();
    try {
      const saved = localStorage.getItem("pravaah_custom_schedule");
      if (saved) {
        const parsed = JSON.parse(saved);
        setCustomSchedule(parsed);
        if (parsed.targetExam) setTargetExam(parsed.targetExam);
        if (parsed.preparationStage) setStage(parsed.preparationStage);
        if (parsed.dailyHours) setDailyHours(parsed.dailyHours);
        if (parsed.targetDate) setTargetDate(parsed.targetDate);
        if (parsed.prioritySubjects) setSelectedSubjects(parsed.prioritySubjects);
      }
    } catch (e) {
      // LocalStorage access fallback
    }
  }, []);

  const handleGenerateCustomSchedule = async () => {
    setGenerating(true);
    try {
      const res = await fetch("/api/v1/study-planner/custom", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetExam,
          preparationStage: stage,
          dailyHours,
          targetDate,
          prioritySubjects: selectedSubjects,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setCustomSchedule(data.data);
        setActiveTab("CUSTOM_SCHEDULE");
        try {
          localStorage.setItem("pravaah_custom_schedule", JSON.stringify(data.data));
        } catch (e) {
          // LocalStorage save fallback
        }
      }
    } catch (e) {
      console.error("Failed to generate schedule:", e);
    } finally {
      setGenerating(false);
    }
  };

  const toggleSubject = (subj: string) => {
    setSelectedSubjects((prev) =>
      prev.includes(subj) ? prev.filter((s) => s !== subj) : [...prev, subj]
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-heritage-ivory flex flex-col font-sans">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-heritage-burgundy border-t-transparent"></div>
            <p className="mt-2 text-sm text-heritage-secondary font-medium">Formulating your personalized study plan...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-heritage-ivory flex flex-col font-sans">
        <div className="flex-1 max-w-xl mx-auto px-4 py-16 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 border border-rose-200 shadow-xs">
            <AlertCircle className="h-7 w-7" />
          </div>
          <h1 className="font-serif text-xl font-bold text-heritage-text">Study Planner Temporarily Unavailable</h1>
          <p className="text-sm text-rose-700 mt-2">{error}</p>
          <div className="mt-6 flex justify-center gap-3">
            <button
              onClick={() => loadPlan()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-heritage-burgundy hover:bg-heritage-wine text-white text-xs font-bold transition shadow-xs"
            >
              <RotateCw className="h-3.5 w-3.5 text-heritage-gold" />
              Retry Formulating Plan
            </button>
            <Link
              href="/current-affairs"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-heritage-border hover:bg-heritage-cream text-heritage-text text-xs font-semibold transition"
            >
              Current Affairs
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const todayStudy = plan?.todayStudy;
  const importantPyqs = plan?.importantForUpsc?.connectedPyqs || [];
  const revisionItems = plan?.revisionNext?.items || [];

  return (
    <div className="min-h-screen bg-heritage-ivory flex flex-col font-sans">
      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Planner Header */}
        <div className="bg-gradient-to-r from-heritage-wine via-heritage-burgundy to-heritage-wine rounded-2xl p-6 sm:p-10 text-white shadow-gold border border-heritage-gold/30 mb-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-heritage-cream/15 text-heritage-gold text-xs font-bold mb-4 border border-heritage-gold/30 shadow-xs">
              <Calendar className="h-3.5 w-3.5" />
              Daily Aspirant Compass • {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </div>
            <h1 className="font-serif text-2xl sm:text-4xl font-bold tracking-tight">
              Your Daily <span className="text-heritage-gold">Preparation Architecture</span>
            </h1>
            <p className="mt-3 text-heritage-cream/90 text-sm sm:text-base leading-relaxed">
              Every day, Pravaah answers the three vital questions for every serious UPSC aspirant: What to study today, what is important from previous exams, and what to revise based on your mistakes.
            </p>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 bg-white p-3 rounded-2xl border border-heritage-border shadow-card">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("COMPASS")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === "COMPASS"
                  ? "bg-heritage-burgundy text-white shadow-xs"
                  : "bg-heritage-ivory text-heritage-secondary hover:bg-heritage-cream hover:text-heritage-text border border-heritage-border"
              }`}
            >
              <Compass className="h-4 w-4 text-heritage-gold" />
              Today's 3-Pillar Compass
            </button>
            <button
              onClick={() => setActiveTab("CUSTOM_SCHEDULE")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === "CUSTOM_SCHEDULE"
                  ? "bg-heritage-burgundy text-white shadow-xs"
                  : "bg-heritage-ivory text-heritage-secondary hover:bg-heritage-cream hover:text-heritage-text border border-heritage-border"
              }`}
            >
              <Sliders className="h-4 w-4 text-heritage-gold" />
              Custom Timetable Generator
              {customSchedule && (
                <span className="rounded-full bg-emerald-100 text-emerald-800 px-1.5 py-0.2 text-[10px] font-bold ml-1">
                  Active
                </span>
              )}
            </button>
          </div>

          <div className="text-xs text-heritage-secondary font-medium">
            {customSchedule ? "Customized to your daily hours" : "Standard Foundational Plan"}
          </div>
        </div>

        {/* TAB 1: 3-PILLAR DAILY COMPASS */}
        {activeTab === "COMPASS" && (
          <div className="space-y-8">
            {/* QUESTION 1: WHAT SHOULD I STUDY TODAY? */}
            <div className="bg-white rounded-2xl border border-heritage-border p-6 sm:p-8 shadow-card">
              <div className="flex items-center gap-3 mb-4">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-heritage-cream text-heritage-burgundy border border-heritage-border font-bold text-sm">
                  1
                </span>
                <div>
                  <span className="text-xs font-bold text-heritage-burgundy uppercase tracking-wider block">
                    First Priority of the Day
                  </span>
                  <h2 className="font-serif text-xl font-bold text-heritage-text">What should I study today?</h2>
                </div>
              </div>

              {todayStudy ? (
                <div className="bg-heritage-ivory rounded-xl p-5 border border-heritage-border mt-4">
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-heritage-burgundy text-white">
                      {todayStudy.syllabusPaper}
                    </span>
                    <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-white text-heritage-text border border-heritage-border">
                      {todayStudy.topic}
                    </span>
                    <span className="text-xs text-heritage-secondary ml-auto font-medium">
                      Source: {todayStudy.sourceName || "Official Releases (PIB/PRS)"}
                    </span>
                  </div>

                  <h3 className="font-serif text-base sm:text-lg font-bold text-heritage-text leading-snug">
                    {todayStudy.title}
                  </h3>
                  <p className="mt-2 text-xs sm:text-sm text-heritage-secondary leading-relaxed">
                    {todayStudy.summary}
                  </p>

                  {/* Prelims & Mains Takeaway Highlights */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-heritage-border/60 text-xs">
                    <div className="bg-white p-3.5 rounded-xl border border-heritage-border">
                      <span className="font-serif font-bold text-heritage-burgundy block mb-1">Prelims Core Theme:</span>
                      <p className="text-heritage-secondary leading-relaxed">{todayStudy.importancePrelims || "Key institutional roles and constitutional statutory safeguards."}</p>
                    </div>
                    <div className="bg-white p-3.5 rounded-xl border border-heritage-border">
                      <span className="font-serif font-bold text-heritage-burgundy block mb-1">Mains Core Dimension:</span>
                      <p className="text-heritage-secondary leading-relaxed">{todayStudy.importanceMains || "Structural reforms, inter-institutional autonomy, and policy governance."}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-5 flex flex-wrap gap-3 items-center">
                    {todayStudy.slug && (
                      <Link
                        href={`/current-affairs/${todayStudy.slug}`}
                        className="px-4 py-2 rounded-xl bg-heritage-burgundy hover:bg-heritage-wine text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
                      >
                        Read Full News Card & Explanations
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    )}

                    <Link
                      href="/daily-quiz"
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
                    >
                      <CheckCircle className="h-3.5 w-3.5" />
                      Attempt 5-Question Daily Quiz
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="p-4 text-xs text-heritage-secondary">Today's study agenda is being synchronized.</div>
              )}
            </div>

            {/* QUESTION 2: WHAT IS IMPORTANT FOR UPSC & HOW HAS IT BEEN ASKED? */}
            <div className="bg-white rounded-2xl border border-heritage-border p-6 sm:p-8 shadow-card">
              <div className="flex items-center gap-3 mb-4">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-heritage-cream text-heritage-burgundy border border-heritage-border font-bold text-sm">
                  2
                </span>
                <div>
                  <span className="text-xs font-bold text-heritage-burgundy uppercase tracking-wider block">
                    Historical Pattern & High-Yield Themes
                  </span>
                  <h2 className="font-serif text-xl font-bold text-heritage-text">
                    What is important for UPSC, and how has it been asked in previous exams?
                  </h2>
                </div>
              </div>

              <p className="text-xs text-heritage-secondary mb-4">
                Directly connected previous-year questions from our verified question database testing the same fundamental principles:
              </p>

              <div className="space-y-4">
                {importantPyqs.map((q: any) => (
                  <div
                    key={q.id}
                    className="bg-heritage-ivory rounded-xl p-4 sm:p-5 border border-heritage-border flex flex-col justify-between"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2 text-xs">
                      <span className="font-bold text-heritage-burgundy bg-heritage-cream px-2.5 py-0.5 rounded border border-heritage-border">
                        UPSC {q.year} • {q.paper} Question #{q.questionNumber}
                      </span>
                      <span className="text-xs text-heritage-secondary italic">
                        {q.rationale}
                      </span>
                    </div>

                    <p className="font-serif text-xs sm:text-sm font-bold text-heritage-text whitespace-pre-line leading-relaxed mb-3">
                      {q.questionText}
                    </p>

                    <div className="pt-2 border-t border-heritage-border/60 flex items-center justify-between">
                      <span className="text-[11px] text-heritage-secondary">Official Series A Verified Answer Available</span>
                      <Link
                        href={`/pyqs`}
                        className="inline-flex items-center gap-1 text-xs font-bold text-heritage-burgundy hover:underline"
                      >
                        Practice in Learn Mode
                        <ChevronRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* QUESTION 3: WHAT SHOULD I REVISE NEXT? */}
            <div className="bg-white rounded-2xl border border-heritage-border p-6 sm:p-8 shadow-card">
              <div className="flex items-center gap-3 mb-4">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-heritage-cream text-heritage-burgundy border border-heritage-border font-bold text-sm">
                  3
                </span>
                <div>
                  <span className="text-xs font-bold text-heritage-burgundy uppercase tracking-wider block">
                    Personalized Spaced-Repetition Algorithm
                  </span>
                  <h2 className="font-serif text-xl font-bold text-heritage-text">
                    What should I revise next based on my mistakes and weak areas?
                  </h2>
                </div>
              </div>

              <p className="text-xs text-heritage-secondary mb-4 leading-relaxed">
                {plan?.revisionNext?.instructions}
              </p>

              {revisionItems.length > 0 ? (
                <div className="space-y-3">
                  {revisionItems.map((item: any) => (
                    <div
                      key={item.scheduleId}
                      className="p-4 rounded-xl bg-heritage-cream/70 border border-heritage-gold/30 flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-serif font-bold text-heritage-burgundy block mb-0.5">
                          UPSC {item.year} {item.paper} • Q#{item.questionNumber}
                        </span>
                        <p className="text-heritage-text line-clamp-1">{item.questionText}</p>
                      </div>

                      <Link
                        href="/revision"
                        className="px-3.5 py-1.5 rounded-lg bg-heritage-burgundy hover:bg-heritage-wine text-white font-bold shrink-0 ml-4 flex items-center gap-1 shadow-xs transition"
                      >
                        <RotateCw className="h-3 w-3 text-heritage-gold" /> Revise Now
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 rounded-xl bg-heritage-ivory border border-heritage-border text-center text-xs text-heritage-secondary">
                  <CheckCircle className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
                  <span className="font-serif font-bold text-heritage-text block text-sm">Zero Overdue Mistakes Today!</span>
                  Attempt questions in the PYQ Explorer or Daily Quiz. Any missed questions will automatically queue here based on spaced repetition intervals.
                </div>
              )}

              <div className="mt-5 pt-4 border-t border-heritage-border/60 flex items-center justify-between">
                <span className="text-xs text-heritage-secondary">
                  Current Due Items: <span className="font-bold text-heritage-text">{plan?.revisionNext?.dueCount || 0}</span>
                </span>
                <Link
                  href="/revision"
                  className="text-xs font-bold text-heritage-burgundy hover:underline flex items-center gap-1"
                >
                  Go to Dedicated Revision Hub
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: INTERACTIVE CUSTOM TIMETABLE ARCHITECT */}
        {activeTab === "CUSTOM_SCHEDULE" && (
          <div className="space-y-8">
            {/* Customizer Controls Card */}
            <div className="bg-white rounded-2xl border border-heritage-border p-6 sm:p-8 shadow-card">
              <div className="flex items-center gap-2 mb-6">
                <Sliders className="h-5 w-5 text-heritage-gold" />
                <h2 className="font-serif text-lg font-bold text-heritage-text">
                  Configure Your Feasible Study Parameters
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-xs font-bold text-heritage-secondary uppercase tracking-wider mb-2">
                    Target Examination
                  </label>
                  <select
                    value={targetExam}
                    onChange={(e) => setTargetExam(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-heritage-border bg-heritage-ivory text-xs font-semibold text-heritage-text focus:ring-1 focus:ring-heritage-gold focus:outline-none"
                  >
                    <option value="UPSC CSE 2025">UPSC CSE 2025 (Prelims May 2025)</option>
                    <option value="UPSC CSE 2026">UPSC CSE 2026 (Foundation)</option>
                    <option value="UPSC CDS 2025">UPSC Combined Defence Services (CDS)</option>
                    <option value="UPSC CAPF 2025">UPSC Central Armed Police Forces (CAPF)</option>
                    <option value="UPSC NDA 2025">UPSC National Defence Academy (NDA)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-heritage-secondary uppercase tracking-wider mb-2">
                    Preparation Stage
                  </label>
                  <select
                    value={stage}
                    onChange={(e) => setStage(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-heritage-border bg-heritage-ivory text-xs font-semibold text-heritage-text focus:ring-1 focus:ring-heritage-gold focus:outline-none"
                  >
                    <option value="BEGINNER">Foundational Concept Building</option>
                    <option value="INTERMEDIATE">Intermediate (Syllabus + Topic PYQs)</option>
                    <option value="REVISION_AND_MOCKS">Intensive Revision & Timed Mocks</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-heritage-secondary uppercase tracking-wider mb-2">
                    Available Daily Hours: <span className="text-heritage-burgundy font-bold">{dailyHours} Hours</span>
                  </label>
                  <input
                    type="range"
                    min={2}
                    max={12}
                    step={1}
                    value={dailyHours}
                    onChange={(e) => setDailyHours(Number(e.target.value))}
                    className="w-full accent-heritage-burgundy cursor-pointer mt-2"
                  />
                  <div className="flex justify-between text-[10px] text-heritage-secondary mt-1">
                    <span>2 hrs (Working)</span>
                    <span>6 hrs (Balanced)</span>
                    <span>12 hrs (Full-time)</span>
                  </div>
                </div>
              </div>

              {/* Priority Subjects */}
              <div className="mt-6 pt-6 border-t border-heritage-border/60">
                <label className="block text-xs font-bold text-heritage-secondary uppercase tracking-wider mb-3">
                  Focus Subjects for this Phase (Select 2-3)
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    "Polity & Governance",
                    "Economy",
                    "Modern History",
                    "Geography",
                    "Environment & Ecology",
                    "Science & Tech",
                    "CSAT (Quant & Comprehension)",
                  ].map((subj) => {
                    const isSelected = selectedSubjects.includes(subj);
                    return (
                      <button
                        key={subj}
                        onClick={() => toggleSubject(subj)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                          isSelected
                            ? "bg-heritage-burgundy text-white shadow-xs"
                            : "bg-heritage-ivory text-heritage-text border border-heritage-border hover:bg-heritage-cream"
                        }`}
                      >
                        {isSelected && <Check className="h-3 w-3" />}
                        {subj}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-heritage-border/60 flex justify-end">
                <button
                  onClick={handleGenerateCustomSchedule}
                  disabled={generating}
                  className="px-6 py-2.5 rounded-xl bg-heritage-burgundy hover:bg-heritage-wine text-white text-xs font-bold transition shadow-xs flex items-center gap-2"
                >
                  <Sparkles className="h-4 w-4 text-heritage-gold" />
                  {generating ? "Calculating Schedule..." : "Generate Custom Schedule"}
                </button>
              </div>
            </div>

            {/* Render Custom Schedule Results if generated */}
            {customSchedule ? (
              <div className="space-y-6 animate-fade-in">
                {/* Strategy Summary */}
                <div className="bg-gradient-to-r from-heritage-wine via-heritage-burgundy to-heritage-wine rounded-2xl p-6 text-white shadow-gold border border-heritage-gold/30 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <span className="text-xs text-heritage-gold font-bold uppercase tracking-wider block mb-1">
                      Target: {customSchedule.targetExam}
                    </span>
                    <h3 className="font-serif text-xl font-bold">
                      {customSchedule.dailyHours} Hours/Day Structured Blueprint
                    </h3>
                    <p className="text-xs text-heritage-cream/90 mt-1">
                      {customSchedule.calculatedDaysRemaining} days remaining to target exam date.
                    </p>
                  </div>
                  <div className="rounded-xl bg-white/10 px-4 py-2 border border-white/20 text-right backdrop-blur-xs">
                    <span className="text-[10px] text-heritage-cream/80 block uppercase">Weekly Strategy</span>
                    <span className="text-xs font-bold text-emerald-300">Balanced PYQ + Revision</span>
                  </div>
                </div>

                {/* Daily Slots Table */}
                <div className="bg-white rounded-2xl border border-heritage-border p-6 shadow-card">
                  <h4 className="font-serif text-sm font-bold text-heritage-text mb-4 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-heritage-gold" />
                    Recommended Daily Time Slots
                  </h4>

                  <div className="space-y-3">
                    {customSchedule.slots.map((slot: any, idx: number) => (
                      <div
                        key={idx}
                        className="p-4 rounded-xl border border-heritage-border bg-heritage-ivory/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                      >
                        <div className="flex items-center gap-3">
                          <span className="font-mono font-bold text-heritage-burgundy bg-heritage-cream px-2.5 py-1 rounded border border-heritage-border">
                            {slot.time}
                          </span>
                          <div>
                            <span className="font-serif font-bold text-heritage-text block">{slot.focus}</span>
                            <span className="text-heritage-secondary">{slot.activity}</span>
                          </div>
                        </div>

                        <span className="font-bold text-heritage-secondary sm:text-right shrink-0">
                          {slot.durationMinutes} mins
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Weekly Protocol */}
                <div className="bg-white rounded-2xl border border-heritage-border p-6 shadow-card text-xs">
                  <h4 className="font-serif text-sm font-bold text-heritage-text mb-3">
                    Weekly Rhythm & Simulation Milestones
                  </h4>
                  <ul className="space-y-2 text-heritage-secondary">
                    {customSchedule.weeklyStrategy.map((strat: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span className="text-heritage-text">{strat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-heritage-border p-12 text-center bg-white text-heritage-secondary text-xs shadow-card">
                <Sliders className="h-8 w-8 text-heritage-gold mx-auto mb-2" />
                <p className="font-serif font-bold text-heritage-text text-sm">No Custom Schedule Formulated Yet</p>
                <p className="mt-1 text-heritage-secondary">
                  Select your daily available hours and target examination above, then click &quot;Generate Custom Schedule&quot;.
                </p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
