"use client";

import React, { useState, useEffect } from "react";
import { ArrowLeft, Search, CheckCircle, FileEdit, AlertCircle } from "lucide-react";

export default function AdminQuestionsDirectory() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingQ, setEditingQ] = useState<any | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [saveSuccess, setSaveSuccess] = useState(false);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const url = filterStatus
        ? `/api/v1/admin/questions?status=${filterStatus}`
        : "/api/v1/admin/questions";
      const res = await fetch(url);
      const json = await res.json();
      if (json.success) {
        setQuestions(json.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [filterStatus]);

  const handleSaveEdit = async () => {
    if (!editingQ) return;
    try {
      const res = await fetch("/api/v1/admin/questions", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId: editingQ.id,
          questionText: editingQ.questionText,
          difficulty: editingQ.difficulty,
          status: editingQ.status,
          explanationSummary: editingQ.explanation,
          correctOption: editingQ.correctOption,
        }),
      });

      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => {
          setSaveSuccess(false);
          setEditingQ(null);
        }, 1200);
        fetchQuestions();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <a
            href="/admin"
            className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline mb-2"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Admin Console
          </a>
          <h1 className="text-2xl font-extrabold text-slate-900">
            Question Bank Manager
          </h1>
          <p className="text-xs text-slate-500">
            Review, edit stems, adjust difficulty ratings, and correct answer keys
          </p>
        </div>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700"
        >
          <option value="">All Statuses</option>
          <option value="PUBLISHED">Published</option>
          <option value="NEEDS_REVIEW">Needs Review</option>
          <option value="VERIFIED">Verified</option>
          <option value="DRAFT">Draft</option>
        </select>
      </div>

      {loading ? (
        <div className="py-20 text-center text-sm text-slate-400">Loading question records...</div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="p-3.5">ID / Paper</th>
                <th className="p-3.5">Year & Q#</th>
                <th className="p-3.5">Question Stem</th>
                <th className="p-3.5">Subject</th>
                <th className="p-3.5">Key</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {questions.map((q) => (
                <tr key={q.id} className="hover:bg-slate-50/50">
                  <td className="p-3.5 font-mono text-[11px] text-slate-400">
                    <span className="rounded bg-slate-100 px-1.5 py-0.5 text-slate-700 font-bold">
                      {q.paperCode}
                    </span>
                  </td>
                  <td className="p-3.5 font-bold text-slate-900">
                    {q.year} • Q.{q.questionNumber}
                  </td>
                  <td className="p-3.5 max-w-md truncate font-medium text-slate-800">
                    {q.questionText}
                  </td>
                  <td className="p-3.5 text-slate-600">{q.subject}</td>
                  <td className="p-3.5 font-bold text-emerald-700">({q.correctOption})</td>
                  <td className="p-3.5">
                    <span
                      className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                        q.status === "PUBLISHED"
                          ? "bg-emerald-100 text-emerald-800"
                          : q.status === "NEEDS_REVIEW"
                          ? "bg-amber-100 text-amber-800"
                          : q.status === "VERIFIED"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {q.status}
                    </span>
                  </td>
                  <td className="p-3.5 text-right">
                    <button
                      onClick={() => setEditingQ(q)}
                      className="rounded border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-bold text-blue-700 hover:bg-slate-100"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Inline Edit Modal */}
      {editingQ && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900">
                Edit Question: {editingQ.paperCode} {editingQ.year} Q.{editingQ.questionNumber}
              </h3>
              <button
                onClick={() => setEditingQ(null)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Question Stem</label>
                <textarea
                  rows={4}
                  value={editingQ.questionText}
                  onChange={(e) => setEditingQ({ ...editingQ, questionText: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 p-2.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Correct Answer Key</label>
                  <select
                    value={editingQ.correctOption}
                    onChange={(e) => setEditingQ({ ...editingQ, correctOption: e.target.value })}
                    className="w-full rounded border border-slate-300 p-2 text-xs"
                  >
                    <option value="A">Option A</option>
                    <option value="B">Option B</option>
                    <option value="C">Option C</option>
                    <option value="D">Option D</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Difficulty</label>
                  <select
                    value={editingQ.difficulty}
                    onChange={(e) => setEditingQ({ ...editingQ, difficulty: e.target.value })}
                    className="w-full rounded border border-slate-300 p-2 text-xs"
                  >
                    <option value="EASY">EASY</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HARD">HARD</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Lifecycle Status</label>
                  <select
                    value={editingQ.status}
                    onChange={(e) => setEditingQ({ ...editingQ, status: e.target.value })}
                    className="w-full rounded border border-slate-300 p-2 text-xs font-bold"
                  >
                    <option value="DRAFT">DRAFT</option>
                    <option value="NEEDS_REVIEW">NEEDS_REVIEW</option>
                    <option value="VERIFIED">VERIFIED</option>
                    <option value="PUBLISHED">PUBLISHED</option>
                    <option value="ARCHIVED">ARCHIVED</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Explanation Summary</label>
                <textarea
                  rows={3}
                  value={editingQ.explanation || ""}
                  onChange={(e) => setEditingQ({ ...editingQ, explanation: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 p-2.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-3">
              {saveSuccess ? (
                <span className="text-emerald-600 font-bold text-xs flex items-center gap-1">
                  <CheckCircle className="h-4 w-4" /> Saved Successfully!
                </span>
              ) : <span />}
              <div className="flex gap-2">
                <button
                  onClick={() => setEditingQ(null)}
                  className="rounded px-3 py-1.5 text-xs text-slate-500 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="rounded bg-blue-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-blue-700"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
