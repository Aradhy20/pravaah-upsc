"use client";

import React, { useState, useEffect, useMemo } from "react";
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
  Plus,
  Trash2,
  CalendarDays,
  Target,
  AlertTriangle,
  X,
  ListTodo,
} from "lucide-react";

const UPSC_SUBJECTS = [
  "Polity & Governance",
  "History & Art & Culture",
  "Geography",
  "Economy & Social Development",
  "Environment & Ecology",
  "Science & Technology",
  "CSAT & Reasoning",
  "Current Affairs",
  "Mains Answer Writing",
] as const;

export default function DailyStudyPlannerPage() {
  const [activeTab, setActiveTab] = useState<"MY_TASKS" | "COMPASS" | "CUSTOM_SCHEDULE">("MY_TASKS");
  const [timeView, setTimeView] = useState<"DAILY" | "WEEKLY" | "MONTHLY">("DAILY");

  // Study Compass & Today Plan State
  const [plan, setPlan] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // User Goals/Tasks State
  const [goals, setGoals] = useState<any[]>([]);
  const [goalsLoading, setGoalsLoading] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  // New Goal Modal State
  const [isAddingGoal, setIsAddingGoal] = useState(false);
  const [newSubject, setNewSubject] = useState<string>(UPSC_SUBJECTS[0]);
  const [newTitle, setNewTitle] = useState("");
  const [newHours, setNewHours] = useState<number>(2);
  const [newDueDate, setNewDueDate] = useState<string>(
    new Date(Date.now() + 86400000).toISOString().split("T")[0]
  );
  const [submittingGoal, setSubmittingGoal] = useState(false);

  // Edit Goal State
  const [editingGoal, setEditingGoal] = useState<any | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editSubject, setEditSubject] = useState<string>(UPSC_SUBJECTS[0]);
  const [editHours, setEditHours] = useState(2);
  const [editDueDate, setEditDueDate] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);
  const [deletingGoalId, setDeletingGoalId] = useState<string | null>(null);
  const [subjectFilter, setSubjectFilter] = useState<string>("All");

  // Custom schedule state
  const [targetExam, setTargetExam] = useState("UPSC CSE 2026");
  const [stage, setStage] = useState("INTERMEDIATE");
  const [dailyHours, setDailyHours] = useState(6);
  const [targetDate, setTargetDate] = useState("2026-05-24");
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([
    "Polity & Governance",
    "Economy & Social Development",
    "History & Art & Culture",
  ]);
  const [customSchedule, setCustomSchedule] = useState<any | null>(null);
  const [generating, setGenerating] = useState(false);

  // Load 3-pillar daily plan
  const loadPlan = async () => {
    try {
      setLoading(true);
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

  // Load personal user goals/tasks
  const loadGoals = async () => {
    try {
      setGoalsLoading(true);
      const res = await fetch("/api/v1/user/goals");
      const json = await res.json();
      if (json.success) {
        setGoals(json.data || []);
      }
    } catch (e) {
      console.error("Failed to load user goals:", e);
    } finally {
      setGoalsLoading(false);
    }
  };

  useEffect(() => {
    loadPlan();
    loadGoals();
  }, []);

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setSubmittingGoal(true);
    try {
      const res = await fetch("/api/v1/user/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle.trim(),
          subject: newSubject,
          targetHours: Number(newHours) || 2,
          targetDate: newDueDate || null,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setNewTitle("");
        setIsAddingGoal(false);
        setNotice("Study task added successfully!");
        setTimeout(() => setNotice(null), 3000);
        await loadGoals();
      } else {
        setNotice(json.error?.message || "Failed to create task.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingGoal(false);
    }
  };

  const handleToggleGoal = async (goal: any) => {
    try {
      const updatedAchieved = !goal.isAchieved;
      const res = await fetch("/api/v1/user/goals", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: goal.id,
          isAchieved: updatedAchieved,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setGoals((prev) =>
          prev.map((g) => (g.id === goal.id ? { ...g, isAchieved: updatedAchieved } : g))
        );
        setNotice(updatedAchieved ? "Task marked complete! Great work." : "Task reopened.");
        setTimeout(() => setNotice(null), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveEditGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGoal || !editTitle.trim()) return;
    setSavingEdit(true);
    try {
      const res = await fetch("/api/v1/user/goals", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingGoal.id,
          title: editTitle.trim(),
          subject: editSubject,
          targetHours: Number(editHours) || 2,
          targetDate: editDueDate || null,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setEditingGoal(null);
        setNotice("Task updated successfully.");
        setTimeout(() => setNotice(null), 3000);
        await loadGoals();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    try {
      const res = await fetch(`/api/v1/user/goals?id=${encodeURIComponent(goalId)}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.success) {
        setGoals((prev) => prev.filter((g) => g.id !== goalId));
        setDeletingGoalId(null);
        setNotice("Task deleted.");
        setTimeout(() => setNotice(null), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

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

  // Filter goals by time view: Daily (due within 2 days or overdue), Weekly (due within 7 days), Monthly (due within 30 days or all)
  // Filter goals by time view and subject filter
  const filteredGoals = useMemo(() => {
    let list = goals;
    if (subjectFilter !== "All") {
      list = list.filter((g) => g.subject === subjectFilter);
    }

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    if (timeView === "DAILY") {
      // Due today, tomorrow, overdue, or unscheduled
      const dayAfterTomorrow = new Date(startOfToday.getTime() + 2 * 86400000);
      return list.filter((g) => {
        if (!g.targetDate) return true;
        const d = new Date(g.targetDate);
        return d <= dayAfterTomorrow || g.isOverdue;
      });
    } else if (timeView === "WEEKLY") {
      const endOfWeek = new Date(startOfToday.getTime() + 7 * 86400000);
      return list.filter((g) => {
        if (!g.targetDate) return true;
        const d = new Date(g.targetDate);
        return d <= endOfWeek || g.isOverdue;
      });
    } else {
      // Monthly / All
      return list;
    }
  }, [goals, timeView, subjectFilter]);

  const activeGoalsCount = goals.filter((g) => !g.isAchieved).length;
  const completedGoalsCount = goals.filter((g) => g.isAchieved).length;
  const overdueGoalsCount = goals.filter((g) => g.isOverdue).length;
  const totalPlannedHours = goals
    .filter((g) => !g.isAchieved)
    .reduce((acc, curr) => acc + (curr.targetHours || 0), 0);

  const todayStudy = plan?.todayStudy;
  const importantPyqs = plan?.importantForUpsc?.connectedPyqs || [];
  const revisionItems = plan?.revisionNext?.items || [];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Planner Header Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 rounded-2xl p-6 sm:p-10 text-white shadow-sm mb-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-200 text-xs font-semibold mb-4 border border-blue-400/20">
              <Calendar className="h-3.5 w-3.5" />
              Daily Aspirant Compass • {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Aspirant <span className="text-blue-400">Study Workspace & Planner</span>
            </h1>
            <p className="mt-3 text-slate-300 text-sm sm:text-base leading-relaxed">
              Organize daily, weekly, and monthly syllabus goals across General Studies, CSAT, and Mains Answer Writing. Stay on track with automated spaced revision cues.
            </p>
          </div>
        </div>

        {/* Notice feedback */}
        {notice && (
          <div className="mb-6 rounded-xl border border-blue-200 bg-blue-50 p-3 text-xs font-bold text-blue-900 flex items-center justify-between animate-in fade-in">
            <span>{notice}</span>
            <button onClick={() => setNotice(null)} className="text-blue-700 hover:text-blue-900">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* View Switcher Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveTab("MY_TASKS")}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === "MY_TASKS"
                  ? "bg-blue-700 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <ListTodo className="h-4 w-4" />
              Personal Study Tasks ({activeGoalsCount})
            </button>
            <button
              onClick={() => setActiveTab("COMPASS")}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === "COMPASS"
                  ? "bg-blue-700 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <Compass className="h-4 w-4" />
              Today&apos;s 3-Pillar Compass
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
              Timetable Generator
            </button>
          </div>

          <div className="text-xs text-slate-500 font-medium">
            {activeGoalsCount} active tasks • {overdueGoalsCount} overdue
          </div>
        </div>

        {/* TAB 1: PERSONAL STUDY TASKS */}
        {activeTab === "MY_TASKS" && (
          <div className="space-y-6">
            {/* Task Management Header Stats & Time Horizon Filter */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <span className="text-[11px] font-bold text-slate-400 uppercase">Active Tasks</span>
                <p className="text-2xl font-black text-slate-900 mt-1">{activeGoalsCount}</p>
                <span className="text-xs text-slate-500">{completedGoalsCount} completed</span>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <span className="text-[11px] font-bold text-slate-400 uppercase">Planned Time</span>
                <p className="text-2xl font-black text-blue-700 mt-1">{totalPlannedHours.toFixed(1)}h</p>
                <span className="text-xs text-slate-500">Across pending targets</span>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <span className="text-[11px] font-bold text-slate-400 uppercase">Overdue Tasks</span>
                <p
                  className={`text-2xl font-black mt-1 ${
                    overdueGoalsCount > 0 ? "text-rose-600" : "text-emerald-600"
                  }`}
                >
                  {overdueGoalsCount}
                </p>
                <span className="text-xs text-slate-500">
                  {overdueGoalsCount > 0 ? "Requires reschedule" : "All on schedule"}
                </span>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm flex flex-col justify-between">
                <span className="text-[11px] font-bold text-slate-400 uppercase">Action</span>
                <button
                  onClick={() => setIsAddingGoal(true)}
                  className="w-full rounded-xl bg-blue-700 px-3 py-2 text-xs font-bold text-white hover:bg-blue-800 transition flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Plus className="h-4 w-4" />
                  <span>Create Study Task</span>
                </button>
              </div>
            </div>

            {/* Time View Switcher (Daily, Weekly, Monthly) & Subject Filter */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
              <div className="flex items-center gap-1.5 bg-slate-200/70 p-1 rounded-xl">
                <button
                  onClick={() => setTimeView("DAILY")}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                    timeView === "DAILY" ? "bg-white text-blue-800 shadow-xs" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Daily Horizon
                </button>
                <button
                  onClick={() => setTimeView("WEEKLY")}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                    timeView === "WEEKLY" ? "bg-white text-blue-800 shadow-xs" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Weekly View
                </button>
                <button
                  onClick={() => setTimeView("MONTHLY")}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                    timeView === "MONTHLY" ? "bg-white text-blue-800 shadow-xs" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Monthly / All View
                </button>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={subjectFilter}
                  onChange={(e) => setSubjectFilter(e.target.value)}
                  className="rounded-xl border border-slate-200 bg-white px-2.5 py-1 text-xs font-bold text-slate-700 shadow-xs focus:outline-none focus:ring-1 focus:ring-blue-600"
                >
                  <option value="All">All Subjects ({goals.length})</option>
                  {UPSC_SUBJECTS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <span className="text-xs text-slate-500 font-semibold">
                  ({filteredGoals.length} task{filteredGoals.length !== 1 ? "s" : ""})
                </span>
              </div>
            </div>

            {/* Tasks List */}
            {goalsLoading ? (
              <div className="py-16 text-center text-sm text-slate-400">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2" />
                <p>Loading your study tasks...</p>
              </div>
            ) : filteredGoals.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-500">
                <ListTodo className="mx-auto h-12 w-12 text-slate-300 mb-3" />
                <h3 className="text-base font-bold text-slate-800">No Study Tasks in this Horizon</h3>
                <p className="mt-1 text-xs text-slate-500 max-w-md mx-auto">
                  Add concrete study sessions for Polity, Modern History, Geography, CSAT, or Mains Answer Writing to track your daily progress.
                </p>
                <button
                  onClick={() => setIsAddingGoal(true)}
                  className="mt-4 rounded-xl bg-blue-700 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-800"
                >
                  + Add First Task
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredGoals.map((g) => (
                  <div
                    key={g.id}
                    className={`rounded-2xl border p-4 sm:p-5 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                      g.isAchieved
                        ? "bg-slate-50 border-slate-200 opacity-70"
                        : g.isOverdue
                        ? "bg-rose-50/50 border-rose-200"
                        : "bg-white border-slate-200 shadow-xs"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => handleToggleGoal(g)}
                        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition ${
                          g.isAchieved
                            ? "bg-emerald-600 border-emerald-600 text-white"
                            : "border-slate-300 hover:border-blue-600 bg-white"
                        }`}
                        title={g.isAchieved ? "Mark as pending" : "Mark as completed"}
                      >
                        {g.isAchieved && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                      </button>

                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h4
                            className={`text-sm font-bold ${
                              g.isAchieved ? "line-through text-slate-500" : "text-slate-900"
                            }`}
                          >
                            {g.title}
                          </h4>
                          {g.subject && (
                            <span className="rounded-md bg-blue-50 border border-blue-200 text-blue-700 px-2 py-0.5 font-bold text-[10px]">
                              {g.subject}
                            </span>
                          )}
                        </div>

                        <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                          <span className="flex items-center gap-1 font-semibold text-slate-700">
                            <Clock className="h-3 w-3 text-blue-600" />
                            {g.targetHours}h allocated
                          </span>

                          {g.targetDate && (
                            <>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <CalendarDays className="h-3 w-3 text-slate-400" />
                                Due {new Date(g.targetDate).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
                              </span>
                            </>
                          )}

                          {g.isOverdue && (
                            <span className="rounded bg-rose-100 text-rose-700 px-1.5 py-0.2 font-bold text-[10px]">
                              Overdue
                            </span>
                          )}

                          {g.daysRemaining !== null && g.daysRemaining >= 0 && !g.isAchieved && (
                            <span className="rounded bg-slate-100 text-slate-600 px-1.5 py-0.2 font-semibold text-[10px]">
                              {g.daysRemaining === 0 ? "Due Today" : `${g.daysRemaining}d remaining`}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      <button
                        onClick={() => {
                          setEditingGoal(g);
                          setEditTitle(g.title);
                          setEditSubject(g.subject || UPSC_SUBJECTS[0]);
                          setEditHours(g.targetHours || 2);
                          setEditDueDate(
                            g.targetDate ? new Date(g.targetDate).toISOString().split("T")[0] : ""
                          );
                        }}
                        className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setDeletingGoalId(g.id)}
                        className="rounded-lg border border-rose-200 bg-white px-2.5 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Upcoming Revision Integration */}
            {revisionItems.length > 0 && (
              <div className="mt-8 rounded-2xl border border-purple-200 bg-purple-50/40 p-5 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <RotateCw className="h-4 w-4 text-purple-700" />
                    <h3 className="text-sm font-bold text-slate-900">
                      Upcoming Spaced Revision Tasks ({revisionItems.length})
                    </h3>
                  </div>
                  <Link
                    href="/revision"
                    className="text-xs font-bold text-purple-700 hover:underline flex items-center gap-1"
                  >
                    <span>Full Revision Queue</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>

                <div className="space-y-2">
                  {revisionItems.slice(0, 3).map((item: any) => (
                    <div
                      key={item.scheduleId}
                      className="rounded-xl border border-purple-100 bg-white p-3 flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-bold text-purple-900 block">
                          UPSC {item.year} {item.paper} • Q#{item.questionNumber}
                        </span>
                        <p className="text-slate-600 line-clamp-1">{item.questionText}</p>
                      </div>
                      <Link
                        href="/revision"
                        className="rounded-lg bg-purple-700 px-3 py-1 font-bold text-white hover:bg-purple-800 shrink-0 ml-3"
                      >
                        Revise
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: 3-PILLAR DAILY COMPASS */}
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

                  <div className="mt-5 flex flex-wrap gap-3 items-center">
                    {todayStudy.slug && (
                      <Link
                        href={`/current-affairs/${todayStudy.slug}`}
                        className="px-4 py-2 rounded-lg bg-blue-700 hover:bg-blue-600 text-white text-xs font-bold transition-all shadow flex items-center gap-1.5"
                      >
                        Read News Card & Explanations
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
                <div className="p-4 text-xs text-slate-500">Today&apos;s study agenda is being synchronized.</div>
              )}
            </div>

            {/* QUESTION 2: WHAT IS IMPORTANT FOR UPSC? */}
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
                Directly connected previous-year questions testing identical foundational concepts:
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
                        href={`/pyqs?paper=${q.paper}&year=${q.year}`}
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
                {plan?.revisionNext?.instructions || "Review questions marked incorrect in previous sessions to prevent recurrence."}
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
                  All spaced repetition items are up to date.
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

        {/* TAB 3: TIMETABLE GENERATOR */}
        {activeTab === "CUSTOM_SCHEDULE" && (
          <div className="space-y-8">
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
                    <option value="UPSC CSE 2026">UPSC CSE 2026 (Foundation & Core)</option>
                    <option value="UPSC CSE 2027">UPSC CSE 2027 (Long-term Sprint)</option>
                    <option value="UPSC CDS 2026">UPSC Combined Defence Services (CDS)</option>
                    <option value="UPSC CAPF 2026">UPSC Central Armed Police Forces (CAPF)</option>
                    <option value="UPSC NDA 2026">UPSC National Defence Academy (NDA)</option>
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
                  {UPSC_SUBJECTS.map((subj) => {
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

        {/* Modal: Create Study Task */}
        {isAddingGoal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-slate-900">Create Study Target</h3>
                <button onClick={() => setIsAddingGoal(false)} className="text-slate-400 hover:text-slate-700">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleCreateGoal} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Subject / Theme
                  </label>
                  <select
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    {UPSC_SUBJECTS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Task / Topic Title
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Fundamental Rights Articles 14-18 Revision"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Target Hours
                    </label>
                    <input
                      type="number"
                      min={0.5}
                      max={12}
                      step={0.5}
                      value={newHours}
                      onChange={(e) => setNewHours(Number(e.target.value))}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Target Due Date
                    </label>
                    <input
                      type="date"
                      value={newDueDate}
                      onChange={(e) => setNewDueDate(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                </div>

                <div className="mt-6 flex justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsAddingGoal(false)}
                    className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingGoal}
                    className="rounded-xl bg-blue-700 px-4 py-2 text-xs font-bold text-white hover:bg-blue-800 disabled:opacity-50"
                  >
                    {submittingGoal ? "Adding..." : "Add Study Task"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Edit Study Task */}
        {editingGoal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-slate-900">Edit Study Task</h3>
                <button onClick={() => setEditingGoal(null)} className="text-slate-400 hover:text-slate-700">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSaveEditGoal} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Subject / Theme
                  </label>
                  <select
                    value={editSubject}
                    onChange={(e) => setEditSubject(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    {UPSC_SUBJECTS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Task Title
                  </label>
                  <input
                    type="text"
                    required
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Target Hours
                    </label>
                    <input
                      type="number"
                      min={0.5}
                      max={12}
                      step={0.5}
                      value={editHours}
                      onChange={(e) => setEditHours(Number(e.target.value))}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Due Date
                    </label>
                    <input
                      type="date"
                      value={editDueDate}
                      onChange={(e) => setEditDueDate(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                </div>

                <div className="mt-6 flex justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setEditingGoal(null)}
                    className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingEdit}
                    className="rounded-xl bg-blue-700 px-4 py-2 text-xs font-bold text-white hover:bg-blue-800 disabled:opacity-50"
                  >
                    {savingEdit ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Delete Confirmation */}
        {deletingGoalId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl border border-slate-200 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 border border-rose-100">
                <Trash2 className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Delete Study Task?</h3>
              <p className="mt-1 text-xs text-slate-500 mb-5">
                This will remove the target from your active schedule.
              </p>

              <div className="flex justify-center gap-2">
                <button
                  onClick={() => setDeletingGoalId(null)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Keep Task
                </button>
                <button
                  onClick={() => handleDeleteGoal(deletingGoalId)}
                  className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-700 shadow-sm"
                >
                  Yes, Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
