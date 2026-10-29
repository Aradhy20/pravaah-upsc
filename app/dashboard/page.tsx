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
} from "lucide-react";

export default function DashboardPage() {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/v1/analytics/dashboard");
      const json = await res.json();
      if (res.ok && json.success) {
        setData(json.data);
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
  const recentSessions = data?.recentSessions || [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {/* Dashboard Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <BarChart2 className="h-6 w-6 text-blue-700" />
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Aspirant Learning Analytics
            </h1>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Real performance telemetry based on your actual attempts and timed papers
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/pyqs"
            className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-700 transition"
          >
            Solve More PYQs
          </a>
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
        <div className="py-20 text-center text-sm text-slate-400">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
          <p>Loading personal study analytics...</p>
        </div>
      ) : (
        <>
          {summary.totalAttempted === 0 && (
            <div className="mb-8 rounded-2xl border border-blue-200 bg-blue-50/70 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-blue-900">Welcome to your Personal Learning Dashboard!</h3>
                <p className="text-xs text-blue-800/80 mt-1">
                  You haven&apos;t solved any questions yet. Attempt previous year questions in Learn Mode or take the Daily Quiz to start tracking your subject accuracy, study hours, and spaced repetition revision queue.
                </p>
              </div>
              <a
                href="/pyqs"
                className="shrink-0 rounded-xl bg-blue-700 px-4 py-2 text-xs font-bold text-white shadow hover:bg-blue-800 transition"
              >
                Start Practicing PYQs &rarr;
              </a>
            </div>
          )}

      {/* Summary Stat Ribbon */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Attempted</span>
            <Compass className="h-4 w-4" />
          </div>
          <p className="mt-2 text-3xl font-extrabold text-slate-900">
            {summary.totalAttempted}
          </p>
          <span className="text-xs text-slate-500">
            {summary.correctCount} correct • {summary.incorrectCount} mistakes
          </span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Net Accuracy</span>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </div>
          <p
            className={`mt-2 text-3xl font-extrabold ${
              summary.overallAccuracy >= 70
                ? "text-emerald-600"
                : summary.overallAccuracy >= 50
                ? "text-blue-600"
                : "text-amber-600"
            }`}
          >
            {summary.overallAccuracy}%
          </p>
          <span className="text-xs text-slate-500">Across all syllabus subjects</span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Revision Bank</span>
            <RotateCw className="h-4 w-4 text-purple-600" />
          </div>
          <p className="mt-2 text-3xl font-extrabold text-purple-700">
            {summary.revisionQueueCount}
          </p>
          <a
            href="/revision"
            className="text-xs font-semibold text-purple-600 hover:underline"
          >
            Review pending mistakes &rarr;
          </a>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Time Invested</span>
            <Clock className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="mt-2 text-3xl font-extrabold text-slate-900">
            {summary.totalStudyHours}h
          </p>
          <span className="text-xs text-slate-500">Active solving & analysis</span>
        </div>
      </div>

      {/* Main Grid: Subject Mastery & Weak Topics */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Subject Mastery Breakdown (2 cols) */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Subject-by-Subject Mastery
              </h2>
              <p className="text-xs text-slate-500">
                Benchmark target: &ge; 70% accuracy for solid Prelims qualification
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

        {/* Weak Topics & Revision Trigger (1 col) */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              <h2 className="text-base font-bold text-slate-900">
                Priority Weak Topics
              </h2>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Concepts where your historical accuracy dropped below 60%. Recommended for immediate revision:
            </p>

            {weakTopics.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-xs text-slate-400">
                🎉 No critical weak topics detected. Keep practicing!
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
                    <a
                      href={`/pyqs?subject=${encodeURIComponent(topic.subject)}&topic=${encodeURIComponent(topic.topic)}`}
                      className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:underline"
                    >
                      <span>Drill this topic</span>
                      <ArrowRight className="h-3 w-3" />
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-6 border-t border-slate-100 pt-4">
            <a
              href="/revision"
              className="flex items-center justify-center gap-1.5 w-full rounded-xl bg-purple-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-purple-700 transition"
            >
              <RotateCw className="h-3.5 w-3.5" />
              <span>Launch Mistake Revision</span>
            </a>
          </div>
        </div>
      </div>

      {/* Recent Full Tests History */}
      {recentSessions.length > 0 && (
        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-base font-bold text-slate-900 mb-4">
            Recent Examination Sittings
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                <tr>
                  <th className="pb-3">Test Title</th>
                  <th className="pb-3">Paper</th>
                  <th className="pb-3">Net Score</th>
                  <th className="pb-3">Accuracy</th>
                  <th className="pb-3">Date Completed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {recentSessions.map((sess: any) => (
                  <tr key={sess.sessionId}>
                    <td className="py-3 font-semibold text-slate-900">{sess.title}</td>
                    <td className="py-3">
                      <span className="rounded bg-blue-50 px-2 py-0.5 font-bold text-blue-700">
                        {sess.paperCode}
                      </span>
                    </td>
                    <td className="py-3 font-bold text-slate-900">{sess.netScore} / 200</td>
                    <td className="py-3 font-bold text-blue-600">{sess.accuracy}%</td>
                    <td className="py-3 text-slate-400">
                      {new Date(sess.submittedAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      </>
    )}
  </div>
  );
}
