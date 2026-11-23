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
        <div className="flex items-center gap-2.5">
          <RotateCw className="h-6 w-6 text-heritage-burgundy" />
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-heritage-text">
            Mistake Revision Queue
          </h1>
        </div>
        <p className="mt-1 text-sm text-heritage-secondary">
          Algorithmic spaced repetition queue (SM-2 intervals) for questions answered incorrectly during practice or tests
        </p>
      </div>

      {loading ? (
        <div className="py-20 text-center text-sm text-heritage-secondary">
          Loading your revision queue...
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-heritage-gold/50 bg-heritage-cream/50 p-12 text-center shadow-card">
          <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600 mb-3" />
          <h2 className="font-serif text-lg font-bold text-heritage-text">
            Zero Mistakes in Queue!
          </h2>
          <p className="mt-1 text-xs text-heritage-secondary max-w-md mx-auto leading-relaxed">
            You have mastered all previously missed questions. Keep practicing in the PYQ Explorer; any future mistakes will be automatically captured here for Day 1, Day 3, and Day 7 revision.
          </p>
          <a
            href="/pyqs"
            className="mt-5 inline-block rounded-xl bg-heritage-burgundy px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-heritage-wine transition"
          >
            Practise More PYQs
          </a>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="rounded-2xl border border-heritage-gold/40 bg-heritage-ivory p-4 flex items-center justify-between text-xs text-heritage-text shadow-xs">
            <span className="font-semibold">
              {items.length} question{items.length > 1 ? "s" : ""} currently scheduled for spaced revision
            </span>
            <span className="text-heritage-burgundy font-bold">Re-attempt until concept is clear</span>
          </div>

          {items.map((item) => (
            <div key={item.scheduleId} className="space-y-3">
              <div className="flex items-center justify-between px-2 text-xs text-heritage-secondary">
                <span className="flex items-center gap-1.5 font-medium">
                  <Calendar className="h-3.5 w-3.5 text-heritage-gold" />
                  Scheduled Review (Attempted {item.repetitionCount} time
                  {item.repetitionCount > 1 ? "s" : ""})
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleReschedule(item.scheduleId)}
                    className="rounded-lg border border-heritage-border bg-white px-3 py-1.5 text-heritage-secondary hover:bg-heritage-ivory transition"
                  >
                    Remind in 3 Days
                  </button>
                  <button
                    onClick={() => handleResolve(item.scheduleId)}
                    className="rounded-lg bg-emerald-600 px-3.5 py-1.5 font-bold text-white hover:bg-emerald-700 shadow-xs transition"
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
