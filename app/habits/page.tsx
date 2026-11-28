"use client";

import React, { useState, useEffect } from "react";
import {
  Flame,
  CheckCircle2,
  Clock,
  BookOpen,
  Newspaper,
  PenTool,
  RotateCcw,
  Sparkles,
  TrendingUp,
  Award,
  Calendar,
} from "lucide-react";

interface HabitItem {
  id: string;
  name: string;
  category: string;
  targetMinutes: number;
  completed: boolean;
  streak: number;
  icon: string;
}

const DEFAULT_HABITS: HabitItem[] = [
  {
    id: "habit-1",
    name: "The Hindu / Indian Express Editorial & Notes",
    category: "Current Affairs",
    targetMinutes: 60,
    completed: true,
    streak: 14,
    icon: "newspaper",
  },
  {
    id: "habit-2",
    name: "GS Paper 1-4 Core Subject Study",
    category: "GS Core",
    targetMinutes: 180,
    completed: true,
    streak: 21,
    icon: "book",
  },
  {
    id: "habit-3",
    name: "Daily Prelims MCQ Drill (30 Questions)",
    category: "Prelims Practice",
    targetMinutes: 45,
    completed: false,
    streak: 9,
    icon: "check",
  },
  {
    id: "habit-4",
    name: "Daily 1 Mains Answer Writing with AI Review",
    category: "Mains Practice",
    targetMinutes: 30,
    completed: false,
    streak: 7,
    icon: "pen",
  },
  {
    id: "habit-5",
    name: "CSAT Quantitative Aptitude / Reasoning (15 Qs)",
    category: "CSAT",
    targetMinutes: 30,
    completed: false,
    streak: 5,
    icon: "trending",
  },
  {
    id: "habit-6",
    name: "Spaced Revision of Past Week Notes",
    category: "Revision",
    targetMinutes: 45,
    completed: false,
    streak: 12,
    icon: "rotate",
  },
];

export default function HabitTrackerPage() {
  const [habits, setHabits] = useState<HabitItem[]>(DEFAULT_HABITS);
  const [totalStudyMinutes, setTotalStudyMinutes] = useState(240);

  useEffect(() => {
    const saved = localStorage.getItem("pravaah_habits");
    if (saved) {
      try {
        setHabits(JSON.parse(saved));
      } catch (_) {}
    }
  }, []);

  const saveHabits = (newHabits: HabitItem[]) => {
    setHabits(newHabits);
    localStorage.setItem("pravaah_habits", JSON.stringify(newHabits));
  };

  const toggleHabit = (id: string) => {
    saveHabits(
      habits.map((h) => {
        if (h.id === id) {
          const nextCompleted = !h.completed;
          return {
            ...h,
            completed: nextCompleted,
            streak: nextCompleted ? h.streak + 1 : Math.max(0, h.streak - 1),
          };
        }
        return h;
      })
    );
  };

  const completedCount = habits.filter((h) => h.completed).length;
  const progressPercent = Math.round((completedCount / habits.length) * 100);
  const totalStreakDays = Math.max(...habits.map((h) => h.streak), 0);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-xs font-bold text-amber-800 mb-2">
          <Flame className="h-3.5 w-3.5 text-amber-600 fill-amber-500" />
          <span>IASBoard Inspired · Aspirant Discipline Engine</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          Civil Services Habit & Consistency Tracker
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          UPSC preparation is won through daily disciplined habits. Track your hours, editorial reading, and answer consistency.
        </p>
      </div>

      {/* Daily Progress & Streak Highlight */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Current Top Streak</span>
          <div className="flex items-center gap-2 mt-2">
            <Flame className="h-7 w-7 text-amber-500 fill-amber-500" />
            <span className="text-3xl font-black text-slate-900">{totalStreakDays} Days</span>
          </div>
          <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">Active Civil Services Streak</span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Daily Study Log</span>
          <div className="flex items-center gap-2 mt-2">
            <Clock className="h-7 w-7 text-blue-600" />
            <span className="text-3xl font-black text-slate-900">{(totalStudyMinutes / 60).toFixed(1)} hrs</span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Goal: 6.5 hours daily</span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Today's Routine</span>
          <div className="flex items-center gap-2 mt-2">
            <div className="text-3xl font-black text-slate-900">{progressPercent}%</div>
            <div className="flex-1 bg-slate-100 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            {completedCount} of {habits.length} habits logged
          </span>
        </div>
      </div>

      {/* Habit Checklist */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm mb-8">
        <h2 className="text-base font-extrabold text-slate-900 mb-4 flex items-center justify-between">
          <span>Daily Routine Checklist</span>
          <span className="text-xs font-semibold text-slate-400">Tap to toggle completion</span>
        </h2>

        <div className="space-y-3">
          {habits.map((habit) => (
            <div
              key={habit.id}
              onClick={() => toggleHabit(habit.id)}
              className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition ${
                habit.completed
                  ? "border-emerald-200 bg-emerald-50/40 text-emerald-950"
                  : "border-slate-200 hover:border-slate-300 bg-white"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`h-5 w-5 rounded-md flex items-center justify-center border transition ${
                    habit.completed
                      ? "border-emerald-600 bg-emerald-600 text-white"
                      : "border-slate-300 bg-white"
                  }`}
                >
                  {habit.completed && <CheckCircle2 className="h-4 w-4" />}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">{habit.name}</span>
                    <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                      {habit.category}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400">Target: {habit.targetMinutes} mins</span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-xs font-extrabold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                <Flame className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                <span>{habit.streak}d streak</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Aspirant Guidance Note */}
      <div className="rounded-2xl border border-indigo-100 bg-indigo-50/40 p-5 text-xs text-indigo-900 leading-relaxed">
        <span className="font-extrabold flex items-center gap-1.5 mb-1 text-indigo-950">
          <Sparkles className="h-4 w-4 text-indigo-600" /> Topper Principle: Compound Discipline
        </span>
        Consistency in newspaper analysis and answer writing over 180 continuous days contributes more to clearing the Civil Services Examination than sporadic 14-hour study sessions. Maintain your streak!
      </div>
    </div>
  );
}
