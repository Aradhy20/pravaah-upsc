"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  BarChart2,
  CheckCircle2,
  XCircle,
  Clock,
  RotateCw,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Compass,
  Calendar,
  Award,
  Bookmark,
  FileEdit,
  Sliders,
  Check,
  Target,
  Sparkles,
  Zap,
  ChevronRight,
  Layers,
} from "lucide-react";

export default function DashboardPage() {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Edit Target Modal
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [targetYear, setTargetYear] = useState<number>(2027);
  const [dailyGoalMinutes, setDailyGoalMinutes] = useState<number>(60);
  const [optionalSubject, setOptionalSubject] = useState<string>("");
  const [savingGoal, setSavingGoal] = useState(false);

  const loadDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/v1/analytics/dashboard");
      const json = await res.json();
      if (res.ok && json.success) {
        setData(json.data);
        if (json.data.aspirant) {
          setTargetYear(json.data.aspirant.targetYear || 2027);
          setDailyGoalMinutes(json.data.aspirant.dailyGoalMinutes || 60);
          setOptionalSubject(json.data.aspirant.optionalSubject || "");
        }
      } else {
        setError(json.error?.message || "Failed to retrieve learning analytics.");
      }
    } catch (e: any) {
      console.error(e);
      setError("Network error while connecting to analytics service.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingGoal(true);
    try {
      const res = await fetch("/api/v1/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetYear: Number(targetYear),
          dailyGoalMinutes: Number(dailyGoalMinutes),
          optionalSubject: optionalSubject.trim() || null,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setIsEditingGoal(false);
        await loadDashboard();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingGoal(false);
    }
  };

  const aspirant = data?.aspirant || {
    fullName: "Aspirant",
    email: "",
    targetYear: 2027,
    optionalSubject: null,
    preparationStage: "Prelims Foundation & PYQ Orientation",
    dailyGoalMinutes: 60,
  };

  const today = data?.today || {
    todayAttemptsCount: 0,
    studyMinutes: 0,
    goalMinutes: 60,
    completionPercent: 0,
  };

  const weekly = data?.weekly || {
    totalMinutes: 0,
    targetMinutes: 420,
    completionPercent: 0,
    activity: [],
  };

  const coverage = data?.coverage || {
    totalPublishedQuestions: 1079,
    uniqueAttempted: 0,
    remaining: 1079,
    coveragePercent: 0,
  };

  const summary = data?.summary || {
    totalAttempted: 0,
    correctCount: 0,
    incorrectCount: 0,
    overallAccuracy: 0,
    totalStudyHours: 0,
    revisionQueueCount: 0,
    completedMocksCount: 0,
    averageMockScore: 0,
    highestMockScore: 0,
  };

  const paperBreakdown = data?.paperBreakdown || {
    gs1: { attempted: 0, correct: 0, incorrect: 0, accuracy: 0 },
    csat: { attempted: 0, correct: 0, incorrect: 0, accuracy: 0 },
  };

  const subjectPerformance = data?.subjectPerformance || [];
  const weakTopics = data?.weakTopics || [];
  const strongTopics = data?.strongTopics || [];
  const recentSessions = data?.recentSessions || [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {/* 1. Dashboard Header & Aspirant Badge */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Welcome, {aspirant.fullName}
            </h1>
            <span className="rounded-full bg-blue-100 border border-blue-200 px-3 py-0.5 text-xs font-bold text-blue-800">
              UPSC CSE {aspirant.targetYear}
            </span>
            {aspirant.optionalSubject && (
              <span className="rounded-full bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 text-xs font-semibold text-indigo-700">
                Optional: {aspirant.optionalSubject}
              </span>
            )}
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs sm:text-sm text-slate-500">
            <span className="font-semibold text-slate-700">Preparation Stage:</span>
            <span className="rounded-md bg-slate-100 px-2 py-0.5 font-bold text-slate-800 border border-slate-200">
              {aspirant.preparationStage}
            </span>
            <span>•</span>
            <span>Daily Target: {aspirant.dailyGoalMinutes} mins</span>
            <button
              onClick={() => setIsEditingGoal(true)}
              className="font-bold text-blue-600 hover:text-blue-800 underline ml-1 inline-flex items-center gap-1"
            >
              <Sliders className="h-3 w-3" />
              Customize Goal
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/study-planner"
            className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition shadow-sm flex items-center gap-1.5"
          >
            <Calendar className="h-3.5 w-3.5 text-blue-600" />
            Study Planner
          </Link>
          <Link
            href="/revision"
            className="rounded-xl border border-purple-200 bg-purple-50 px-3.5 py-2 text-xs font-bold text-purple-800 hover:bg-purple-100 transition shadow-sm flex items-center gap-1.5"
          >
            <RotateCw className="h-3.5 w-3.5 text-purple-600" />
            Revision ({summary.revisionQueueCount})
          </Link>
          <Link
            href="/pyqs"
            className="rounded-xl bg-blue-700 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-800 transition flex items-center gap-1.5"
          >
            <span>Solve PYQs</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-white p-8 text-center max-w-lg mx-auto my-12 shadow-sm">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 border border-rose-100">
            <BarChart2 className="h-6 w-6" />
          </div>
          <h2 className="text-base font-bold text-slate-900">Analytics Service Temporarily Unavailable</h2>
          <p className="mt-1 text-xs text-rose-700 mb-4">{error}</p>
          <button
            onClick={() => loadDashboard()}
            className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 transition shadow"
          >
            Retry Analytics
          </button>
        </div>
      ) : loading ? (
        <div className="py-24 text-center text-sm text-slate-400">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-3"></div>
          <p className="font-medium text-slate-600">Synthesizing personal study metrics & accuracy telemetry...</p>
        </div>
      ) : (
        <>
          {/* First-time Empty State Notification */}
          {summary.totalAttempted === 0 && (
            <div className="mb-8 rounded-2xl border border-blue-200 bg-blue-50/80 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
              <div>
                <h3 className="text-sm font-bold text-blue-900 flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-blue-600" />
                  Welcome to your Personal UPSC Workspace!
                </h3>
                <p className="text-xs text-blue-800/80 mt-1 max-w-2xl leading-relaxed">
                  Start answering previous year questions in Learn Mode or attempt the Daily 5-Question Quiz. Your accuracy, subject performance, mistake patterns, and study hours will populate here automatically.
                </p>
              </div>
              <div className="flex gap-2 shrink-0">
                <Link
                  href="/daily-quiz"
                  className="rounded-xl border border-blue-300 bg-white px-3.5 py-2 text-xs font-bold text-blue-700 shadow-sm hover:bg-blue-50 transition"
                >
                  Daily Quiz
                </Link>
                <Link
                  href="/pyqs"
                  className="rounded-xl bg-blue-700 px-4 py-2 text-xs font-bold text-white shadow hover:bg-blue-800 transition"
                >
                  Start PYQ Explorer &rarr;
                </Link>
              </div>
            </div>
          )}

          {/* 2. Today & Weekly Study Progress Overview */}
          <div className="mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Today's Progress */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-bold uppercase tracking-wider">Today&apos;s Study</span>
                <Clock className="h-4 w-4 text-blue-600" />
              </div>
              <div className="my-3">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl font-black text-slate-900">{today.studyMinutes}</span>
                  <span className="text-xs font-bold text-slate-500">/ {today.goalMinutes} mins</span>
                </div>
                <div className="mt-2 h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-blue-600 transition-all duration-500"
                    style={{ width: `${Math.min(100, today.completionPercent)}%` }}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>{today.todayAttemptsCount} questions today</span>
                <span className="font-bold text-blue-700">{today.completionPercent}% of goal</span>
              </div>
            </div>

            {/* Weekly Target Completion */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-bold uppercase tracking-wider">Weekly Target</span>
                <Target className="h-4 w-4 text-emerald-600" />
              </div>
              <div className="my-3">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl font-black text-slate-900">
                    {(weekly.totalMinutes / 60).toFixed(1)}h
                  </span>
                  <span className="text-xs font-bold text-slate-500">
                    / {(weekly.targetMinutes / 60).toFixed(0)}h target
                  </span>
                </div>
                <div className="mt-2 h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                    style={{ width: `${Math.min(100, weekly.completionPercent)}%` }}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Last 7 days</span>
                <span className="font-bold text-emerald-700">{weekly.completionPercent}% completed</span>
              </div>
            </div>

            {/* Net Accuracy */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-bold uppercase tracking-wider">Net Accuracy</span>
                <TrendingUp className="h-4 w-4 text-indigo-600" />
              </div>
              <div className="my-3">
                <p
                  className={`text-3xl font-black ${
                    summary.overallAccuracy >= 70
                      ? "text-emerald-600"
                      : summary.overallAccuracy >= 50
                      ? "text-blue-600"
                      : "text-amber-600"
                  }`}
                >
                  {summary.overallAccuracy}%
                </p>
                <span className="text-xs text-slate-500 block mt-1">
                  {summary.correctCount} correct • {summary.incorrectCount} mistakes
                </span>
              </div>
              <div className="text-xs text-slate-500">
                Target: &ge; 70% for Prelims cut-off
              </div>
            </div>

            {/* Syllabus Coverage */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-bold uppercase tracking-wider">PYQ Bank Coverage</span>
                <Layers className="h-4 w-4 text-purple-600" />
              </div>
              <div className="my-3">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl font-black text-slate-900">{coverage.uniqueAttempted}</span>
                  <span className="text-xs font-bold text-slate-500">
                    / {coverage.totalPublishedQuestions} PYQs
                  </span>
                </div>
                <div className="mt-2 h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-purple-600 transition-all duration-500"
                    style={{ width: `${Math.min(100, coverage.coveragePercent)}%` }}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>{coverage.remaining} questions remaining</span>
                <span className="font-bold text-purple-700">{coverage.coveragePercent}% done</span>
              </div>
            </div>
          </div>

          {/* 3. Performance Visualizations: 7-Day Activity & Paper Comparison */}
          <div className="mb-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Weekly Activity Visualization */}
            <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-base font-bold text-slate-900">7-Day Study & Practice Activity</h2>
                  <p className="text-xs text-slate-500">Daily questions attempted and minutes spent</p>
                </div>
                <span className="text-xs font-semibold text-slate-400">
                  Total: {weekly.totalMinutes} mins ({summary.totalAttempted} attempts)
                </span>
              </div>

              {weekly.activity.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400">No activity recorded this week.</div>
              ) : (
                <div className="mt-6">
                  <div className="grid grid-cols-7 gap-2 sm:gap-3 items-end h-40 pt-6">
                    {weekly.activity.map((day: any) => {
                      const maxMinutes = Math.max(60, ...weekly.activity.map((a: any) => a.minutes));
                      const heightPercent = Math.max(12, Math.round((day.minutes / maxMinutes) * 100));
                      const isToday = day.date === new Date().toISOString().split("T")[0];

                      return (
                        <div key={day.date} className="flex flex-col items-center h-full justify-end group">
                          {/* Value tooltip on hover */}
                          <span className="text-[10px] font-bold text-slate-500 mb-1 group-hover:text-blue-700 transition">
                            {day.attempted > 0 ? `${day.attempted}Q` : ""}
                          </span>
                          <div className="w-full bg-slate-100 rounded-t-lg h-full flex items-end overflow-hidden p-0.5">
                            <div
                              className={`w-full rounded-t-md transition-all duration-500 ${
                                isToday
                                  ? "bg-blue-600"
                                  : day.minutes > 0
                                  ? "bg-blue-400/80 hover:bg-blue-500"
                                  : "bg-transparent"
                              }`}
                              style={{ height: `${day.minutes > 0 ? heightPercent : 4}%` }}
                            />
                          </div>
                          <span
                            className={`mt-2 text-xs font-semibold ${
                              isToday ? "text-blue-700 font-extrabold" : "text-slate-500"
                            }`}
                          >
                            {day.dayName}
                          </span>
                          <span className="text-[10px] text-slate-400">{day.minutes}m</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* GS Paper 1 vs CSAT Comparison */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900 mb-1">GS Paper 1 vs CSAT</h2>
                <p className="text-xs text-slate-500 mb-5">Paper-specific accuracy and attempt distribution</p>

                <div className="space-y-5">
                  {/* GS1 */}
                  <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-4">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800">General Studies Paper 1</span>
                      <span className="rounded bg-blue-100 px-2 py-0.5 font-bold text-blue-800">
                        {paperBreakdown.gs1.accuracy}% Accuracy
                      </span>
                    </div>
                    <div className="mt-2.5 h-2 w-full rounded-full bg-slate-200 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-blue-600 transition-all duration-500"
                        style={{ width: `${Math.min(100, Math.max(4, paperBreakdown.gs1.accuracy))}%` }}
                      />
                    </div>
                    <div className="mt-2 flex justify-between text-[11px] text-slate-500">
                      <span>{paperBreakdown.gs1.attempted} attempted</span>
                      <span>
                        {paperBreakdown.gs1.correct} correct • {paperBreakdown.gs1.incorrect} mistakes
                      </span>
                    </div>
                  </div>

                  {/* CSAT */}
                  <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-4">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800">CSAT (Paper 2)</span>
                      <span className="rounded bg-indigo-100 px-2 py-0.5 font-bold text-indigo-800">
                        {paperBreakdown.csat.accuracy}% Accuracy
                      </span>
                    </div>
                    <div className="mt-2.5 h-2 w-full rounded-full bg-slate-200 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-indigo-600 transition-all duration-500"
                        style={{ width: `${Math.min(100, Math.max(4, paperBreakdown.csat.accuracy))}%` }}
                      />
                    </div>
                    <div className="mt-2 flex justify-between text-[11px] text-slate-500">
                      <span>{paperBreakdown.csat.attempted} attempted</span>
                      <span>
                        {paperBreakdown.csat.correct} correct • {paperBreakdown.csat.incorrect} mistakes
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400">Qualifying mark: 33% CSAT</span>
                <Link
                  href="/pyqs?paper=GS2"
                  className="font-bold text-blue-600 hover:underline flex items-center gap-1"
                >
                  <span>Practice CSAT</span>
                  <ChevronRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          </div>

          {/* 4. Subject Mastery Breakdown & Strengths/Weaknesses */}
          <div className="mb-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Subject-by-Subject Mastery (2 cols) */}
            <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Subject-by-Subject Mastery</h2>
                  <p className="text-xs text-slate-500">
                    Benchmark: &ge; 70% accuracy for solid Prelims qualification
                  </p>
                </div>
                <span className="text-xs font-semibold text-slate-400">
                  {subjectPerformance.length} Subjects Tracked
                </span>
              </div>

              {subjectPerformance.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400">
                  No subject attempts recorded yet. Solve questions in the Explorer to generate charts!
                </div>
              ) : (
                <div className="space-y-4">
                  {subjectPerformance.map((subj: any) => (
                    <div key={subj.subject} className="space-y-1.5">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-slate-800">{subj.subject}</span>
                        <span className="text-slate-600">
                          {subj.accuracy}% ({subj.correct}/{subj.attempted})
                        </span>
                      </div>
                      <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            subj.accuracy >= 70
                              ? "bg-emerald-500"
                              : subj.accuracy >= 50
                              ? "bg-blue-500"
                              : "bg-rose-500"
                          }`}
                          style={{ width: `${Math.min(100, Math.max(5, subj.accuracy))}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Priority Weak Topics & Strengths (1 col) */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  <h2 className="text-base font-bold text-slate-900">Priority Weak Topics</h2>
                </div>
                <p className="text-xs text-slate-500 mb-4">
                  Concepts where accuracy dropped below 60%. Recommended for targeted revision:
                </p>

                {weakTopics.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-xs text-slate-400">
                    🎉 No critical weak topics detected. Great consistency!
                  </div>
                ) : (
                  <div className="space-y-3">
                    {weakTopics.map((topic: any) => (
                      <div
                        key={topic.topic}
                        className="rounded-xl border border-slate-100 bg-slate-50/80 p-3"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-xs text-slate-800 truncate max-w-[160px]">
                            {topic.topic}
                          </span>
                          <span className="rounded bg-rose-100 px-1.5 py-0.5 text-[10px] font-bold text-rose-700">
                            {topic.accuracy}%
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400 block mt-0.5">
                          {topic.subject} • {topic.correct}/{topic.attempted} correct
                        </span>
                        <Link
                          href={`/pyqs?subject=${encodeURIComponent(topic.subject)}&topic=${encodeURIComponent(topic.topic)}`}
                          className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:underline"
                        >
                          <span>Drill this topic</span>
                          <ArrowRight className="h-3 w-3" />
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-6 border-t border-slate-100 pt-4">
                <Link
                  href="/revision"
                  className="flex items-center justify-center gap-1.5 w-full rounded-xl bg-purple-700 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-purple-800 transition"
                >
                  <RotateCw className="h-3.5 w-3.5" />
                  <span>Launch Mistake Revision ({summary.revisionQueueCount})</span>
                </Link>
              </div>
            </div>
          </div>

          {/* 5. Mock Test Score Progression & Sittings */}
          {recentSessions.length > 0 && (
            <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Timed Examination Sittings & Score Progression
                  </h2>
                  <p className="text-xs text-slate-500">
                    Average Net Score: {summary.averageMockScore} / 200 • Highest: {summary.highestMockScore} / 200
                  </p>
                </div>
                <Link
                  href="/mock-tests"
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 transition self-start sm:self-auto"
                >
                  View All Mock Tests &rarr;
                </Link>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                    <tr>
                      <th className="pb-3">Test Title</th>
                      <th className="pb-3">Paper</th>
                      <th className="pb-3">Net Score</th>
                      <th className="pb-3">Accuracy</th>
                      <th className="pb-3">Date Completed</th>
                      <th className="pb-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {recentSessions.map((sess: any) => (
                      <tr key={sess.sessionId}>
                        <td className="py-3 font-semibold text-slate-900">{sess.title}</td>
                        <td className="py-3">
                          <span className="rounded bg-blue-50 px-2 py-0.5 font-bold text-blue-700 border border-blue-100">
                            {sess.paperCode}
                          </span>
                        </td>
                        <td className="py-3 font-bold text-slate-900">
                          {sess.netScore} / {sess.totalMarks || 200}
                        </td>
                        <td className="py-3 font-bold text-blue-600">{sess.accuracy}%</td>
                        <td className="py-3 text-slate-400">
                          {new Date(sess.submittedAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>
                        <td className="py-3 text-right">
                          <Link
                            href={`/mock-tests/${sess.sessionId}/result`}
                            className="font-bold text-blue-600 hover:underline"
                          >
                            Review &rarr;
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 6. Aspirant Quick Workspace Hub */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              href="/study-planner"
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:border-blue-400 transition group flex flex-col justify-between"
            >
              <div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700 mb-3 group-hover:scale-105 transition">
                  <Calendar className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Personal Study Planner</h3>
                <p className="mt-1 text-xs text-slate-500">
                  Daily, weekly & monthly schedule with custom UPSC subject timetable
                </p>
              </div>
              <span className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-blue-600 group-hover:underline">
                Open Planner &rarr;
              </span>
            </Link>

            <Link
              href="/bookmarks"
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:border-blue-400 transition group flex flex-col justify-between"
            >
              <div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700 mb-3 group-hover:scale-105 transition">
                  <Bookmark className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Saved Bookmarks</h3>
                <p className="mt-1 text-xs text-slate-500">
                  Filter by subject, paper, and search high-yield questions
                </p>
              </div>
              <span className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-indigo-600 group-hover:underline">
                View Bookmarks &rarr;
              </span>
            </Link>

            <Link
              href="/notes"
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:border-amber-400 transition group flex flex-col justify-between"
            >
              <div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-700 mb-3 group-hover:scale-105 transition">
                  <FileEdit className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Private Study Notes</h3>
                <p className="mt-1 text-xs text-slate-500">
                  Personal annotations, mnemonics, and textbook references
                </p>
              </div>
              <span className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-amber-600 group-hover:underline">
                Open Notes Workspace &rarr;
              </span>
            </Link>

            <Link
              href="/revision"
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:border-purple-400 transition group flex flex-col justify-between"
            >
              <div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-700 mb-3 group-hover:scale-105 transition">
                  <RotateCw className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Spaced Mistake Journal</h3>
                <p className="mt-1 text-xs text-slate-500">
                  1/3/7/14-day repetition queue for questions answered incorrectly
                </p>
              </div>
              <span className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-purple-600 group-hover:underline">
                Review Mistakes ({summary.revisionQueueCount}) &rarr;
              </span>
            </Link>
          </div>
        </>
      )}

      {/* Goal Customization Modal */}
      {isEditingGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-slate-200">
            <h2 className="text-lg font-bold text-slate-900 mb-1">Customize Preparation Target</h2>
            <p className="text-xs text-slate-500 mb-5">
              Set your target UPSC examination year, daily study duration, and optional subject.
            </p>

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Target UPSC Exam Year
                </label>
                <select
                  value={targetYear}
                  onChange={(e) => setTargetYear(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <option value={2025}>UPSC CSE 2025</option>
                  <option value={2026}>UPSC CSE 2026</option>
                  <option value={2027}>UPSC CSE 2027</option>
                  <option value={2028}>UPSC CSE 2028</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Daily Study Goal (Minutes)
                </label>
                <input
                  type="number"
                  min={15}
                  max={720}
                  step={15}
                  value={dailyGoalMinutes}
                  onChange={(e) => setDailyGoalMinutes(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  {Math.round(dailyGoalMinutes / 60 * 10) / 10} hours per day
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Optional Subject (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. PSIR, Geography, Sociology, History"
                  value={optionalSubject}
                  onChange={(e) => setOptionalSubject(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="mt-6 flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditingGoal(false)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingGoal}
                  className="rounded-xl bg-blue-700 px-4 py-2 text-xs font-bold text-white hover:bg-blue-800 disabled:opacity-50"
                >
                  {savingGoal ? "Saving..." : "Save Targets"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
