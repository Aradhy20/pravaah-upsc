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

export default function DailyStudyPlannerPage() {
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
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-sm text-slate-500">Formulating your personalized study plan...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        <div className="flex-1 max-w-xl mx-auto px-4 py-16 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 border border-rose-200">
            <AlertCircle className="h-7 w-7" />
          </div>
          <h1 className="text-xl font-bold text-slate-900">Study Planner Temporarily Unavailable</h1>
          <p className="text-sm text-rose-700 mt-2">{error}</p>
          <div className="mt-6 flex justify-center gap-3">
            <button
              onClick={() => loadPlan()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow"
            >
              <RotateCw className="h-3.5 w-3.5" />
              Retry Formulating Plan
            </button>
            <Link
              href="/current-affairs"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold transition"
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
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Planner Header */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 rounded-2xl p-6 sm:p-10 text-white shadow-sm mb-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-200 text-xs font-semibold mb-4 border border-blue-400/20">
              <Calendar className="h-3.5 w-3.5" />
              Daily Aspirant Compass • {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Your Daily <span className="text-blue-400">Preparation Architecture</span>
            </h1>
            <p className="mt-3 text-slate-300 text-sm sm:text-base leading-relaxed">
              Every day, Pravaah answers the three vital questions for every serious UPSC aspirant: What to study today, what is important from previous exams, and what to revise based on your mistakes.
            </p>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("COMPASS")}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === "COMPASS"
                  ? "bg-blue-700 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <Compass className="h-4 w-4" />
              Today's 3-Pillar Compass
            </button>
            <button
              onClick={() => setActiveTab("CUSTOM_SCHEDULE")}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === "CUSTOM_SCHEDULE"
                  ? "bg-blue-700 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <Sliders className="h-4 w-4" />
              Custom Timetable Generator
              {customSchedule && (
                <span className="rounded-full bg-emerald-100 text-emerald-800 px-1.5 py-0.2 text-[10px] font-extrabold ml-1">
                  Active
                </span>
              )}
            </button>
          </div>

          <div className="text-xs text-slate-500 font-medium">
            {customSchedule ? "Customized to your daily hours" : "Standard Foundational Plan"}
          </div>
        </div>

        {/* TAB 1: 3-PILLAR DAILY COMPASS */}
        {activeTab === "COMPASS" && (
          <div className="space-y-8">
            {/* QUESTION 1: WHAT SHOULD I STUDY TODAY? */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-100 text-blue-700 font-black text-sm">
                  1
                </span>
                <div>
                  <span className="text-xs font-bold text-blue-700 uppercase tracking-wider block">
                    First Priority of the Day
                  </span>
                  <h2 className="text-xl font-bold text-slate-900">What should I study today?</h2>
                </div>
              </div>

              {todayStudy ? (
                <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 mt-4">
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-blue-600 text-white">
                      {todayStudy.syllabusPaper}
                    </span>
                    <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-white text-slate-700 border border-slate-200">
                      {todayStudy.topic}
                    </span>
                    <span className="text-xs text-slate-500 ml-auto font-medium">
                      Source: {todayStudy.sourceName || "Official Releases (PIB/PRS)"}
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                    {todayStudy.title}
                  </h3>
                  <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {todayStudy.summary}
                  </p>

                  {/* Prelims & Mains Takeaway Highlights */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-200 text-xs">
                    <div className="bg-white p-3 rounded-lg border border-slate-200">
                      <span className="font-bold text-blue-800 block mb-1">Prelims Core Theme:</span>
                      <p className="text-slate-600">{todayStudy.importancePrelims || "Key institutional roles and constitutional statutory safeguards."}</p>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-slate-200">
                      <span className="font-bold text-indigo-800 block mb-1">Mains Core Dimension:</span>
                      <p className="text-slate-600">{todayStudy.importanceMains || "Structural reforms, inter-institutional autonomy, and policy governance."}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-5 flex flex-wrap gap-3 items-center">
                    {todayStudy.slug && (
                      <Link
                        href={`/current-affairs/${todayStudy.slug}`}
                        className="px-4 py-2 rounded-lg bg-blue-700 hover:bg-blue-600 text-white text-xs font-bold transition-all shadow flex items-center gap-1.5"
                      >
                        Read Full News Card & Explanations
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    )}

                    <Link
                      href="/daily-quiz"
                      className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow flex items-center gap-1.5"
                    >
                      <CheckCircle className="h-3.5 w-3.5" />
                      Attempt 5-Question Daily Quiz
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="p-4 text-xs text-slate-500">Today's study agenda is being synchronized.</div>
              )}
            </div>

            {/* QUESTION 2: WHAT IS IMPORTANT FOR UPSC & HOW HAS IT BEEN ASKED? */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700 font-black text-sm">
                  2
                </span>
                <div>
                  <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider block">
                    Historical Pattern & High-Yield Themes
                  </span>
                  <h2 className="text-xl font-bold text-slate-900">
                    What is important for UPSC, and how has it been asked in previous exams?
                  </h2>
                </div>
              </div>

              <p className="text-xs text-slate-500 mb-4">
                Directly connected previous-year questions from our verified 1,079 question database testing the same fundamental principles:
              </p>

              <div className="space-y-4">
                {importantPyqs.map((q: any) => (
                  <div
                    key={q.id}
                    className="bg-slate-50 rounded-xl p-4 sm:p-5 border border-slate-200 flex flex-col justify-between"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2 text-xs">
                      <span className="font-extrabold text-indigo-800 bg-indigo-100 px-2.5 py-0.5 rounded">
                        UPSC {q.year} • {q.paper} Question #{q.questionNumber}
                      </span>
                      <span className="text-xs text-slate-500 italic">
                        {q.rationale}
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm font-semibold text-slate-800 whitespace-pre-line leading-relaxed mb-3">
                      {q.questionText}
                    </p>

                    <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                      <span className="text-[11px] text-slate-500">Official Series A Verified Answer Available</span>
                      <Link
                        href={`/pyqs`}
                        className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 hover:underline"
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
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-100 text-amber-800 font-black text-sm">
                  3
                </span>
                <div>
                  <span className="text-xs font-bold text-amber-800 uppercase tracking-wider block">
                    Personalized Spaced-Repetition Algorithm
                  </span>
                  <h2 className="text-xl font-bold text-slate-900">
                    What should I revise next based on my mistakes and weak areas?
                  </h2>
                </div>
              </div>

              <p className="text-xs text-slate-600 mb-4 leading-relaxed">
                {plan?.revisionNext?.instructions}
              </p>

              {revisionItems.length > 0 ? (
                <div className="space-y-3">
                  {revisionItems.map((item: any) => (
                    <div
                      key={item.scheduleId}
                      className="p-4 rounded-xl bg-amber-50/50 border border-amber-200/70 flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-bold text-amber-900 block mb-0.5">
                          UPSC {item.year} {item.paper} • Q#{item.questionNumber}
                        </span>
                        <p className="text-slate-700 line-clamp-1">{item.questionText}</p>
                      </div>

                      <Link
                        href="/revision"
                        className="px-3 py-1.5 rounded-lg bg-amber-700 hover:bg-amber-800 text-white font-bold shrink-0 ml-4 flex items-center gap-1"
                      >
                        <RotateCw className="h-3 w-3" /> Revise Now
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 rounded-xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-500">
                  <CheckCircle className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
                  <span className="font-bold text-slate-800 block text-sm">Zero Overdue Mistakes Today!</span>
                  Attempt questions in the PYQ Explorer or Daily Quiz. Any missed questions will automatically queue here based on spaced repetition intervals.
                </div>
              )}

              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  Current Due Items: <span className="font-bold text-slate-800">{plan?.revisionNext?.dueCount || 0}</span>
                </span>
                <Link
                  href="/revision"
                  className="text-xs font-bold text-blue-700 hover:underline flex items-center gap-1"
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
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
              <div className="flex items-center gap-2 mb-6">
                <Sliders className="h-5 w-5 text-blue-700" />
                <h2 className="text-lg font-extrabold text-slate-900">
                  Configure Your Feasible Study Parameters
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Target Examination
                  </label>
                  <select
                    value={targetExam}
                    onChange={(e) => setTargetExam(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  >
                    <option value="UPSC CSE 2025">UPSC CSE 2025 (Prelims May 2025)</option>
                    <option value="UPSC CSE 2026">UPSC CSE 2026 (Foundation)</option>
                    <option value="UPSC CDS 2025">UPSC Combined Defence Services (CDS)</option>
                    <option value="UPSC CAPF 2025">UPSC Central Armed Police Forces (CAPF)</option>
                    <option value="UPSC NDA 2025">UPSC National Defence Academy (NDA)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Preparation Stage
                  </label>
                  <select
                    value={stage}
                    onChange={(e) => setStage(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  >
                    <option value="BEGINNER">Foundational Concept Building</option>
                    <option value="INTERMEDIATE">Intermediate (Syllabus + Topic PYQs)</option>
                    <option value="REVISION_AND_MOCKS">Intensive Revision & Timed Mocks</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Available Daily Hours: <span className="text-blue-700 font-extrabold">{dailyHours} Hours</span>
                  </label>
                  <input
                    type="range"
                    min={2}
                    max={12}
                    step={1}
                    value={dailyHours}
                    onChange={(e) => setDailyHours(Number(e.target.value))}
                    className="w-full accent-blue-600 cursor-pointer mt-2"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                    <span>2 hrs (Working)</span>
                    <span>6 hrs (Balanced)</span>
                    <span>12 hrs (Full-time)</span>
                  </div>
                </div>
              </div>

              {/* Priority Subjects */}
              <div className="mt-6 pt-6 border-t border-slate-100">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
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
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                          isSelected
                            ? "bg-blue-600 text-white shadow-sm"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        {isSelected && <Check className="h-3 w-3" />}
                        {subj}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-slate-100 flex justify-end">
                <button
                  onClick={handleGenerateCustomSchedule}
                  disabled={generating}
                  className="px-6 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-600 text-white text-xs font-bold transition shadow flex items-center gap-2"
                >
                  <Sparkles className="h-4 w-4" />
                  {generating ? "Calculating Schedule..." : "Generate Custom Schedule"}
                </button>
              </div>
            </div>

            {/* Render Custom Schedule Results if generated */}
            {customSchedule ? (
              <div className="space-y-6 animate-fade-in">
                {/* Strategy Summary */}
                <div className="bg-gradient-to-br from-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <span className="text-xs text-indigo-300 font-bold uppercase tracking-wider block mb-1">
                      Target: {customSchedule.targetExam}
                    </span>
                    <h3 className="text-xl font-black">
                      {customSchedule.dailyHours} Hours/Day Structured Blueprint
                    </h3>
                    <p className="text-xs text-slate-300 mt-1">
                      {customSchedule.calculatedDaysRemaining} days remaining to target exam date.
                    </p>
                  </div>
                  <div className="rounded-xl bg-white/10 px-4 py-2 border border-white/10 text-right">
                    <span className="text-[10px] text-slate-300 block uppercase">Weekly Strategy</span>
                    <span className="text-xs font-bold text-emerald-400">Balanced PYQ + Revision</span>
                  </div>
                </div>

                {/* Daily Slots Table */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                  <h4 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-700" />
                    Recommended Daily Time Slots
                  </h4>

                  <div className="space-y-3">
                    {customSchedule.slots.map((slot: any, idx: number) => (
                      <div
                        key={idx}
                        className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                      >
                        <div className="flex items-center gap-3">
                          <span className="font-mono font-bold text-blue-800 bg-blue-50 px-2.5 py-1 rounded border border-blue-200">
                            {slot.time}
                          </span>
                          <div>
                            <span className="font-bold text-slate-900 block">{slot.focus}</span>
                            <span className="text-slate-600">{slot.activity}</span>
                          </div>
                        </div>

                        <span className="font-bold text-slate-500 sm:text-right shrink-0">
                          {slot.durationMinutes} mins
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Weekly Protocol */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm text-xs">
                  <h4 className="text-sm font-bold text-slate-900 mb-3">
                    Weekly Rhythm & Simulation Milestones
                  </h4>
                  <ul className="space-y-2 text-slate-700">
                    {customSchedule.weeklyStrategy.map((strat: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                        <span>{strat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 p-12 text-center bg-white text-slate-500 text-xs">
                <Sliders className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                <p className="font-bold text-slate-700 text-sm">No Custom Schedule Formulated Yet</p>
                <p className="mt-1 text-slate-500">
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
