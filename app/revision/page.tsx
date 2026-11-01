"use client";

import React, { useState, useEffect } from "react";
import { QuestionCard } from "@/components/QuestionCard";
import {
  RotateCw,
  CheckCircle2,
  Clock,
  Calendar,
  Sparkles,
  Filter,
  Brain,
  AlertCircle,
} from "lucide-react";

export default function RevisionPage() {
  const [items, setItems] = useState<any[]>([]);
  const [mistakeData, setMistakeData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterReason, setFilterReason] = useState<string>("ALL");
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  const fetchRevisionData = async () => {
    try {
      setLoading(true);
      const [revRes, mistRes] = await Promise.all([
        fetch("/api/v1/user/revision"),
        fetch("/api/v1/user/mistakes"),
      ]);

      const revJson = await revRes.json();
      const mistJson = await mistRes.json();

      if (revJson.success) {
        setItems(revJson.data);
      }
      if (mistRes.ok && mistJson.success) {
        setMistakeData(mistJson.data);
      }
    } catch (e) {
      console.error("Failed to load revision data:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRevisionData();
  }, []);

  const handleResolve = async (scheduleId: string) => {
    try {
      await fetch("/api/v1/user/revision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scheduleId, action: "resolve" }),
      });
      setItems((prev) => prev.filter((i) => i.scheduleId !== scheduleId));
      setActionFeedback("Question marked as mastered!");
      setTimeout(() => setActionFeedback(null), 3000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleReschedule = async (scheduleId: string, days: number) => {
    try {
      const res = await fetch("/api/v1/user/revision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scheduleId, action: "reschedule", intervalDays: days }),
      });
      const json = await res.json();
      if (json.success) {
        setActionFeedback(`Rescheduled for review in ${days} day(s).`);
        setTimeout(() => setActionFeedback(null), 3000);
        await fetchRevisionData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Find mistake reason for a question if known
  const getMistakeReasonForQuestion = (questionId: string) => {
    if (!mistakeData?.items) return null;
    const found = mistakeData.items.find((m: any) => m.questionId === questionId);
    return found?.mistakeReason || null;
  };

  const filteredItems = items.filter((item) => {
    if (filterReason === "ALL") return true;
    const reason = getMistakeReasonForQuestion(item.question.id);
    return reason === filterReason;
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <RotateCw className="h-6 w-6 text-purple-700" />
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Spaced Revision Queue
            </h1>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Systematic spaced repetition queue (1, 3, 7, 14 days) for every question missed during practice or tests
          </p>
        </div>

        <a
          href="/pyqs"
          className="self-start sm:self-auto rounded-xl bg-purple-700 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-purple-800 transition"
        >
          Practise More PYQs &rarr;
        </a>
      </div>

      {actionFeedback && (
        <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-bold text-emerald-800 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{actionFeedback}</span>
        </div>
      )}

      {/* Mistake Root Cause Distribution Summary Card */}
      {mistakeData && mistakeData.totalMistakes > 0 && (
        <div className="mb-8 rounded-2xl border border-purple-200 bg-gradient-to-br from-purple-50/70 to-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-900">
            <Brain className="h-4 w-4 text-purple-700" />
            <span>Root-Cause Error Distribution</span>
          </div>
          <p className="mt-1 text-xs text-slate-600">
            Understanding why questions are missed prevents recurring negative marks in UPSC Prelims.
          </p>

          <div className="mt-4 flex flex-wrap gap-2 text-xs">
            {Object.entries(mistakeData.reasonDistribution || {}).map(([reason, count]: [string, any]) => (
              <button
                key={reason}
                onClick={() => setFilterReason(filterReason === reason ? "ALL" : reason)}
                className={`rounded-xl border px-3 py-1.5 font-semibold transition flex items-center gap-1.5 ${
                  filterReason === reason
                    ? "bg-purple-700 text-white border-purple-800 shadow-sm"
                    : count > 0
                    ? "bg-white text-purple-950 border-purple-200 hover:bg-purple-100"
                    : "bg-slate-50 text-slate-400 border-slate-200 cursor-default"
                }`}
              >
                <span>{reason}</span>
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                    filterReason === reason
                      ? "bg-purple-900 text-purple-100"
                      : "bg-purple-100 text-purple-800"
                  }`}
                >
                  {count}
                </span>
              </button>
            ))}
            {filterReason !== "ALL" && (
              <button
                onClick={() => setFilterReason("ALL")}
                className="text-xs font-bold text-purple-700 underline px-2"
              >
                Clear Filter
              </button>
            )}
          </div>
        </div>
      )}

      {loading ? (
        <div className="py-20 text-center text-sm text-slate-400">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-700 mb-2" />
          <p>Loading your personal revision queue...</p>
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-emerald-300 bg-emerald-50/50 p-12 text-center">
          <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600 mb-3" />
          <h2 className="text-lg font-bold text-emerald-950">
            Zero Mistakes in Queue!
          </h2>
          <p className="mt-1 text-xs text-emerald-700 max-w-md mx-auto">
            You have mastered all previously missed questions. Keep solving previous year questions; any future mistakes will be automatically scheduled here for spaced review.
          </p>
          <a
            href="/pyqs"
            className="mt-5 inline-block rounded-xl bg-emerald-700 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-800 transition"
          >
            Practise PYQs in Learn Mode
          </a>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="rounded-xl border border-purple-200 bg-purple-50/60 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-purple-950">
            <span className="font-semibold">
              {filteredItems.length} question{filteredItems.length !== 1 ? "s" : ""} scheduled for active revision
              {filterReason !== "ALL" && ` (filtered by "${filterReason}")`}
            </span>
            <span className="text-purple-700 font-medium">
              Review until concepts and elimination techniques are clear
            </span>
          </div>

          {filteredItems.map((item) => {
            const reason = getMistakeReasonForQuestion(item.question.id);
            return (
              <div key={item.scheduleId} className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1.5 font-medium text-slate-600">
                      <Calendar className="h-3.5 w-3.5 text-purple-600" />
                      Reviewed {item.repetitionCount} time{item.repetitionCount > 1 ? "s" : ""}
                    </span>
                    {reason && (
                      <span className="rounded-full bg-purple-100 border border-purple-200 px-2.5 py-0.5 text-[11px] font-bold text-purple-900">
                        {reason}
                      </span>
                    )}
                  </div>

                  {/* Configurable Spaced Repetition Scheduling Defaults */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[11px] font-semibold text-slate-400">Reschedule:</span>
                    <button
                      onClick={() => handleReschedule(item.scheduleId, 1)}
                      className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-50"
                      title="Review again tomorrow"
                    >
                      +1 Day
                    </button>
                    <button
                      onClick={() => handleReschedule(item.scheduleId, 3)}
                      className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-50"
                      title="Review in 3 days"
                    >
                      +3 Days
                    </button>
                    <button
                      onClick={() => handleReschedule(item.scheduleId, 7)}
                      className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-50"
                      title="Review in 1 week"
                    >
                      +7 Days
                    </button>
                    <button
                      onClick={() => handleReschedule(item.scheduleId, 14)}
                      className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-50"
                      title="Review in 2 weeks"
                    >
                      +14 Days
                    </button>
                    <button
                      onClick={() => handleResolve(item.scheduleId)}
                      className="rounded-lg bg-emerald-600 px-3 py-1 text-[11px] font-bold text-white hover:bg-emerald-700 shadow-sm ml-1"
                    >
                      Mark Mastered
                    </button>
                  </div>
                </div>

                <QuestionCard question={item.question} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
