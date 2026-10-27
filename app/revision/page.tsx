"use client";

import React, { useState, useEffect } from "react";
import { QuestionCard } from "@/components/QuestionCard";
import { RotateCw, CheckCircle2, Clock, Calendar, Sparkles } from "lucide-react";

export default function RevisionPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRevisionQueue = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/v1/user/revision");
      const json = await res.json();
      if (json.success) {
        setItems(json.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRevisionQueue();
  }, []);

  const handleResolve = async (scheduleId: string) => {
    try {
      await fetch("/api/v1/user/revision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scheduleId, action: "resolve" }),
      });
      setItems((prev) => prev.filter((i) => i.scheduleId !== scheduleId));
    } catch (e) {
      console.error(e);
    }
  };

  const handleReschedule = async (scheduleId: string) => {
    try {
      await fetch("/api/v1/user/revision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scheduleId, action: "reschedule" }),
      });
      alert("Rescheduled for review in 3 days.");
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <div className="mb-8">
        <div className="flex items-center gap-2">
          <RotateCw className="h-6 w-6 text-purple-700" />
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Mistake Revision Queue
          </h1>
        </div>
        <p className="mt-1 text-sm text-slate-500">
          Spaced repetition queue for questions answered incorrectly during practice or tests
        </p>
      </div>

      {loading ? (
        <div className="py-20 text-center text-sm text-slate-400">
          Loading your revision queue...
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-emerald-300 bg-emerald-50/50 p-12 text-center">
          <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600 mb-3" />
          <h2 className="text-lg font-bold text-emerald-950">
            Zero Mistakes in Queue!
          </h2>
          <p className="mt-1 text-xs text-emerald-700 max-w-md mx-auto">
            You have mastered all previously missed questions. Keep practicing in the PYQ Explorer; any future mistakes will be automatically captured here.
          </p>
          <a
            href="/pyqs"
            className="mt-4 inline-block rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition"
          >
            Practise More PYQs
          </a>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="rounded-xl border border-purple-200 bg-purple-50/60 p-4 flex items-center justify-between text-xs text-purple-950">
            <span className="font-semibold">
              {items.length} question{items.length > 1 ? "s" : ""} currently scheduled for spaced revision
            </span>
            <span className="text-purple-700">Re-attempt until concept is clear</span>
          </div>

          {items.map((item) => (
            <div key={item.scheduleId} className="space-y-3">
              <div className="flex items-center justify-between px-2 text-xs text-slate-500">
                <span className="flex items-center gap-1.5 font-medium">
                  <Calendar className="h-3.5 w-3.5 text-purple-600" />
                  Scheduled Review (Attempted {item.repetitionCount} time
                  {item.repetitionCount > 1 ? "s" : ""})
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleReschedule(item.scheduleId)}
                    className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-slate-600 hover:bg-slate-50"
                  >
                    Remind in 3 Days
                  </button>
                  <button
                    onClick={() => handleResolve(item.scheduleId)}
                    className="rounded-md bg-emerald-600 px-3 py-1 font-bold text-white hover:bg-emerald-700 shadow-sm"
                  >
                    Mark as Mastered
                  </button>
                </div>
              </div>

              <QuestionCard question={item.question} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
