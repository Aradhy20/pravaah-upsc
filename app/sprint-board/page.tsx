"use client";

import React, { useState, useEffect } from "react";
import {
  Kanban,
  Plus,
  CheckCircle2,
  Clock,
  Calendar,
  Tag,
  ArrowRight,
  Flame,
  Target,
  Sparkles,
  BookOpen,
  Trash2,
} from "lucide-react";

interface SprintTask {
  id: string;
  title: string;
  subject: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  dueDate: string;
  column: "TODO" | "IN_PROGRESS" | "COMPLETED" | "REVISION";
}

const DEFAULT_TASKS: SprintTask[] = [
  {
    id: "task-1",
    title: "Solve 2024 Prelims GS1 Economy Questions (Q27-41)",
    subject: "Economy & Social Development",
    priority: "HIGH",
    dueDate: "Today",
    column: "IN_PROGRESS",
  },
  {
    id: "task-2",
    title: "Read NCERT Class 11 Climatology: Chapters 8-10",
    subject: "Geography & Agriculture",
    priority: "MEDIUM",
    dueDate: "Tomorrow",
    column: "TODO",
  },
  {
    id: "task-3",
    title: "Practice CSAT 2024 Basic Numeracy (Number Systems)",
    subject: "CSAT: Quantitative Aptitude",
    priority: "HIGH",
    dueDate: "Today",
    column: "TODO",
  },
  {
    id: "task-4",
    title: "Write GS2 Mains Answer: Judicial Review & Basic Structure",
    subject: "Polity & Governance",
    priority: "HIGH",
    dueDate: "29 Nov",
    column: "REVISION",
  },
  {
    id: "task-5",
    title: "Analyze The Hindu & PIB Editorial on Maritime Trade (Vizhinjam)",
    subject: "Current Affairs",
    priority: "MEDIUM",
    dueDate: "Done",
    column: "COMPLETED",
  },
];

export default function SprintBoardPage() {
  const [tasks, setTasks] = useState<SprintTask[]>(DEFAULT_TASKS);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskSubject, setNewTaskSubject] = useState("Polity & Governance");
  const [newTaskPriority, setNewTaskPriority] = useState<"HIGH" | "MEDIUM" | "LOW">("HIGH");
  const [showAddModal, setShowAddModal] = useState(false);

  // Load from local storage if available
  useEffect(() => {
    const saved = localStorage.getItem("pravaah_sprint_tasks");
    if (saved) {
      try {
        setTasks(JSON.parse(saved));
      } catch (_) {}
    }
  }, []);

  const saveTasks = (newTasks: SprintTask[]) => {
    setTasks(newTasks);
    localStorage.setItem("pravaah_sprint_tasks", JSON.stringify(newTasks));
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const newTask: SprintTask = {
      id: `task-${Date.now()}`,
      title: newTaskTitle.trim(),
      subject: newTaskSubject,
      priority: newTaskPriority,
      dueDate: "Today",
      column: "TODO",
    };

    saveTasks([newTask, ...tasks]);
    setNewTaskTitle("");
    setShowAddModal(false);
  };

  const moveTask = (taskId: string, targetCol: SprintTask["column"]) => {
    saveTasks(tasks.map((t) => (t.id === taskId ? { ...t, column: targetCol } : t)));
  };

  const deleteTask = (taskId: string) => {
    saveTasks(tasks.filter((t) => t.id !== taskId));
  };

  const columns: Array<{ id: SprintTask["column"]; label: string; countColor: string }> = [
    { id: "TODO", label: "To Do", countColor: "bg-slate-100 text-slate-700" },
    { id: "IN_PROGRESS", label: "In Progress", countColor: "bg-blue-100 text-blue-700" },
    { id: "REVISION", label: "Revision Queue", countColor: "bg-amber-100 text-amber-800" },
    { id: "COMPLETED", label: "Completed", countColor: "bg-emerald-100 text-emerald-700" },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-200 px-3 py-1 text-xs font-bold text-blue-800 mb-2">
            <Target className="h-3.5 w-3.5 text-blue-600" />
            <span>IASBoard Inspired · Aspirant Study Workflow</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Kanban className="h-7 w-7 text-blue-700" />
            Civil Services Sprint Board
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Organize daily syllabus targets, track active question drills, and maintain systematic spaced revision.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-blue-700 transition"
        >
          <Plus className="h-4 w-4" />
          <span>New Target</span>
        </button>
      </div>

      {/* Target Creation Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-slate-200">
            <h2 className="text-base font-extrabold text-slate-900 mb-4">Create Sprint Target</h2>
            <form onSubmit={handleAddTask} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Target Description</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Solve 2023 CSAT Reading Comprehension"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Subject</label>
                <select
                  value={newTaskSubject}
                  onChange={(e) => setNewTaskSubject(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-800 bg-white"
                >
                  <option value="Polity & Governance">Polity & Governance</option>
                  <option value="Economy & Social Development">Economy & Social Development</option>
                  <option value="Environment & Biodiversity">Environment & Biodiversity</option>
                  <option value="History & Art & Culture">History & Art & Culture</option>
                  <option value="Geography & Agriculture">Geography & Agriculture</option>
                  <option value="Science & Technology">Science & Technology</option>
                  <option value="CSAT: Quantitative Aptitude">CSAT: Quantitative Aptitude</option>
                  <option value="CSAT: Logical Reasoning">CSAT: Logical Reasoning</option>
                  <option value="CSAT: Reading Comprehension">CSAT: Reading Comprehension</option>
                  <option value="Current Affairs">Current Affairs</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Priority</label>
                <div className="grid grid-cols-3 gap-2">
                  {(["HIGH", "MEDIUM", "LOW"] as const).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setNewTaskPriority(p)}
                      className={`rounded-lg py-2 text-xs font-bold border transition ${
                        newTaskPriority === p
                          ? "border-blue-600 bg-blue-50 text-blue-700"
                          : "border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-lg px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700"
                >
                  Add Target
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Kanban Board Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {columns.map((col) => {
          const colTasks = tasks.filter((t) => t.column === col.id);
          return (
            <div
              key={col.id}
              className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 min-h-[500px] flex flex-col"
            >
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200/80">
                <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
                  {col.label}
                </h2>
                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${col.countColor}`}>
                  {colTasks.length}
                </span>
              </div>

              <div className="space-y-3 flex-1">
                {colTasks.length === 0 ? (
                  <div className="h-32 flex items-center justify-center text-xs text-slate-400 italic">
                    No active targets
                  </div>
                ) : (
                  colTasks.map((task) => (
                    <div
                      key={task.id}
                      className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs hover:shadow-sm transition"
                    >
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md truncate max-w-[180px]">
                          {task.subject}
                        </span>
                        <span
                          className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded ${
                            task.priority === "HIGH"
                              ? "bg-rose-50 text-rose-700 border border-rose-200"
                              : task.priority === "MEDIUM"
                              ? "bg-amber-50 text-amber-700 border border-amber-200"
                              : "bg-slate-50 text-slate-600 border border-slate-200"
                          }`}
                        >
                          {task.priority}
                        </span>
                      </div>

                      <p className="text-xs font-bold text-slate-900 leading-snug mb-3">
                        {task.title}
                      </p>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[10px] text-slate-400">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{task.dueDate}</span>
                        </div>

                        {/* Move Actions */}
                        <div className="flex items-center gap-1">
                          {col.id !== "TODO" && (
                            <button
                              onClick={() => moveTask(task.id, "TODO")}
                              title="Move to To Do"
                              className="p-1 hover:text-slate-800"
                            >
                              ←
                            </button>
                          )}
                          {col.id !== "IN_PROGRESS" && (
                            <button
                              onClick={() => moveTask(task.id, "IN_PROGRESS")}
                              title="Move to In Progress"
                              className="p-1 hover:text-blue-600 text-blue-700"
                            >
                              ▶
                            </button>
                          )}
                          {col.id !== "REVISION" && (
                            <button
                              onClick={() => moveTask(task.id, "REVISION")}
                              title="Move to Revision"
                              className="p-1 hover:text-amber-600 text-amber-700"
                            >
                              ↺
                            </button>
                          )}
                          {col.id !== "COMPLETED" && (
                            <button
                              onClick={() => moveTask(task.id, "COMPLETED")}
                              title="Mark Completed"
                              className="p-1 hover:text-emerald-600 text-emerald-700"
                            >
                              ✓
                            </button>
                          )}
                          <button
                            onClick={() => deleteTask(task.id)}
                            title="Delete"
                            className="p-1 hover:text-rose-600 text-slate-300 ml-1"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
