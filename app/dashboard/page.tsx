"use client";

import React, { useState, useEffect } from "react";
import {
  BarChart2,
  CheckCircle,
  XCircle,
  Clock,
  RotateCw,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Compass,
  User,
  Shield,
  Layers,
  Sparkles,
  Award,
} from "lucide-react";

export default function DashboardPage() {
  const [data, setData] = useState<any | null>(null);
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [unauthenticated, setUnauthenticated] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = async () => {
    setLoading(true);
    setError(null);
    setUnauthenticated(false);

    try {
      // 1. Fetch authenticated user profile
      const userRes = await fetch("/api/v1/auth/me");
      const userJson = await userRes.json();

      if (!userRes.ok || !userJson.success || !userJson.data.authenticated) {
        setUnauthenticated(true);
        setLoading(false);
        return;
      }
      setCurrentUser(userJson.data.user);

      // 2. Fetch authenticated analytics
      const res = await fetch("/api/v1/analytics/dashboard");
      const json = await res.json();

      if (res.status === 401) {
        setUnauthenticated(true);
        return;
      }

      if (res.ok && json.success) {
        setData(json.data);
      } else {
        setError(json.error?.message || "Failed to retrieve learning analytics.");
      }
    } catch (e: any) {
      console.error("Dashboard fetch error:", e);
      setError("Network error while loading your learning analytics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const summary = data?.summary || {
    totalAttempted: 0,
    correctCount: 0,
    incorrectCount: 0,
    overallAccuracy: 0,
    totalStudyHours: 0,
    revisionQueueCount: 0,
  };

  const subjectPerformance = data?.subjectPerformance || [];
  const weakTopics = data?.weakTopics || [];

  // Unauthenticated Visitor State
  if (!loading && unauthenticated) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center px-4 py-16 sm:px-6">
        <div className="w-full max-w-md bg-white p-8 rounded-2xl border border-slate-200 shadow-sm text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 border border-blue-100">
            <BarChart2 className="h-6 w-6" />
          </div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Sign In to View Your Dashboard
          </h1>
          <p className="mt-2 text-xs leading-relaxed text-slate-500 mb-6">
            Your personal dashboard aggregates your real question attempts, accuracy analytics, spaced revision queue, and study streak.
          </p>
          <div className="space-y-2.5">
            <a
              href="/login"
              className="block w-full rounded-xl bg-blue-600 py-3 text-sm font-bold text-white shadow-sm hover:bg-blue-700 transition"
            >
              Sign In to Account
            </a>
            <a
              href="/register"
              className="block w-full rounded-xl border border-slate-300 bg-white py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 transition"
            >
              Create Free Aspirant Account
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {/* 1. Welcome Section */}
      <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100 text-blue-700 font-bold text-xs">
              {currentUser?.fullName?.[0]?.toUpperCase() || "A"}
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              Welcome back, {currentUser?.fullName || "Aspirant"}!
            </h1>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            Target Year: {currentUser?.profile?.targetYear ? `CSE ${currentUser.profile.targetYear}` : "CSE 2027"} • Daily Study Goal:{" "}
            {currentUser?.profile?.dailyGoalMinutes || 60} mins
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <a
            href="/study-planner"
            className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition flex items-center gap-1.5"
          >
            <BookOpen className="h-3.5 w-3.5 text-blue-600" />
            <span>Today's Plan</span>
          </a>
          <a
            href="/pyqs"
            className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-700 transition flex items-center gap-1.5"
          >
            <Compass className="h-3.5 w-3.5" />
            <span>Solve PYQs</span>
          </a>
        </div>
      </div>

      {loading ? (
        <div className="py-24 text-center text-sm text-slate-400">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent mb-3"></div>
          <div>Loading your private learning telemetry...</div>
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-rose-200 bg-white p-8 text-center max-w-lg mx-auto my-12 shadow-sm">
          <AlertTriangle className="h-8 w-8 text-rose-500 mx-auto mb-2" />
          <h2 className="text-base font-bold text-slate-900">Unable to Load Telemetry</h2>
          <p className="mt-1 text-xs text-rose-700 mb-4">{error}</p>
          <button
            onClick={loadDashboard}
            className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 transition"
          >
            Retry Connection
          </button>
        </div>
      ) : (
        <>
          {/* 2. KPI Cards */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-bold uppercase tracking-wider">Attempted</span>
                <Compass className="h-4 w-4 text-blue-600" />
              </div>
              <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-slate-900">
                {summary.totalAttempted}
              </div>
              <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-500">
                <span className="text-emerald-600 font-semibold">{summary.correctCount} Correct</span>
                <span>•</span>
                <span className="text-rose-600 font-semibold">{summary.incorrectCount} Missed</span>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-bold uppercase tracking-wider">Accuracy</span>
                <TrendingUp className="h-4 w-4 text-emerald-600" />
              </div>
              <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-slate-900">
                {summary.overallAccuracy}%
              </div>
              <div className="mt-1 text-[11px] text-slate-400">
                {summary.totalAttempted > 0
                  ? "Based on verified attempts"
                  : "Start solving to calculate"}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-bold uppercase tracking-wider">Study Time</span>
                <Clock className="h-4 w-4 text-indigo-600" />
              </div>
              <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-slate-900">
                {summary.totalStudyHours} <span className="text-base font-normal text-slate-500">hrs</span>
              </div>
              <div className="mt-1 text-[11px] text-slate-400">Time spent solving questions</div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-bold uppercase tracking-wider">Revision Queue</span>
                <RotateCw className="h-4 w-4 text-amber-600" />
              </div>
              <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-slate-900">
                {summary.revisionQueueCount}
              </div>
              <div className="mt-1 text-[11px] text-amber-700 font-medium">
                {summary.revisionQueueCount > 0 ? (
                  <a href="/revision" className="hover:underline">
                    Due for review &rarr;
                  </a>
                ) : (
                  "Zero pending mistakes"
                )}
              </div>
            </div>
          </div>

          {/* 3. Empty State or Actionable Recommendations */}
          {summary.totalAttempted === 0 ? (
            <div className="rounded-2xl border border-blue-200 bg-blue-50/50 p-8 text-center my-6 max-w-2xl mx-auto shadow-2xs">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-blue-600 shadow-sm border border-blue-100">
                <Sparkles className="h-6 w-6" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">Your Learning Journey Starts Here</h2>
              <p className="mt-1 text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                You haven&apos;t solved any questions yet. Begin with today&apos;s 5-question Daily Quiz or explore our 1,100 verified historical PYQs to see your topic analytics populate in real time.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <a
                  href="/daily-quiz"
                  className="rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-blue-700 transition"
                >
                  Start Today&apos;s Quiz
                </a>
                <a
                  href="/pyqs?paper=GS1&years=2024"
                  className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                >
                  Solve 2024 Prelims GS1
                </a>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Subject Breakdown */}
              <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Subject Accuracy Breakdown</h3>
                    <p className="text-xs text-slate-500">Real performance across syllabus pillars</p>
                  </div>
                  <a href="/pyqs" className="text-xs font-bold text-blue-600 hover:underline">
                    Filter by Subject &rarr;
                  </a>
                </div>

                <div className="space-y-4">
                  {subjectPerformance.map((subj: any, idx: number) => {
                    const accuracy =
                      subj.attempted > 0 ? Math.round((subj.correct / subj.attempted) * 100) : 0;
                    return (
                      <div key={idx} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-800">{subj.subject}</span>
                          <span className="text-slate-500 font-medium">
                            {accuracy}% ({subj.correct}/{subj.attempted})
                          </span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              accuracy >= 65
                                ? "bg-emerald-500"
                                : accuracy >= 40
                                ? "bg-amber-500"
                                : "bg-rose-500"
                            }`}
                            style={{ width: `${accuracy}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Weak Topics & Revision */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900 mb-1">Target Weak Areas</h3>
                  <p className="text-xs text-slate-500 mb-4">
                    Topics where mistake rate is currently high
                  </p>

                  {weakTopics.length > 0 ? (
                    <div className="space-y-2.5">
                      {weakTopics.slice(0, 4).map((top: any, idx: number) => (
                        <div
                          key={idx}
                          className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-xs"
                        >
                          <div className="font-bold text-slate-800">{top.topic}</div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            Accuracy: {top.accuracy}% ({top.attempted} attempts)
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-xs text-slate-500 py-6 text-center">
                      Great work! No persistent weak areas detected yet.
                    </div>
                  )}
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100">
                  <a
                    href="/revision"
                    className="block w-full rounded-xl bg-blue-50 py-2.5 text-center text-xs font-bold text-blue-700 hover:bg-blue-100 transition"
                  >
                    Open Revision Mistake Queue &rarr;
                  </a>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
