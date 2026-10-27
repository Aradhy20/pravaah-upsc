"use client";

import React, { useState, useEffect } from "react";
import { ArrowLeft, CheckCircle2, XCircle, ShieldCheck, AlertCircle, Sparkles } from "lucide-react";

export default function AdminReviewQueuePage() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const fetchReviewQueue = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/v1/admin/questions?status=NEEDS_REVIEW");
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
    fetchReviewQueue();
  }, []);

  const handleUpdateStatus = async (questionId: string, targetStatus: string) => {
    try {
      const res = await fetch("/api/v1/admin/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId, targetStatus }),
      });

      const json = await res.json();
      if (json.success) {
        setActionMessage(`Question transitioned to status: ${targetStatus}`);
        setQuestions((prev) => prev.filter((q) => q.id !== questionId));
        setTimeout(() => setActionMessage(null), 3000);
      } else {
        alert(json.error?.message || "Status update failed");
      }
    } catch (e: any) {
      console.error(e);
      alert("Error updating status");
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <a
            href="/admin"
            className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline mb-2"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Admin Console
          </a>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="h-7 w-7 text-amber-600" />
            Verification & Review Queue
          </h1>
          <p className="text-xs text-slate-500">
            Strict human review protocol. Cross-examine questions against official UPSC gazette before release.
          </p>
        </div>

        <span className="rounded-full bg-amber-100 px-3.5 py-1 text-xs font-bold text-amber-800">
          {questions.length} Pending Editorial Verification
        </span>
      </div>

      {actionMessage && (
        <div className="mb-6 rounded-xl border border-emerald-300 bg-emerald-50 p-4 text-xs font-bold text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <span>{actionMessage}</span>
        </div>
      )}

      {loading ? (
        <div className="py-20 text-center text-sm text-slate-400">Loading verification items...</div>
      ) : questions.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-emerald-300 bg-emerald-50/40 p-12 text-center text-emerald-950">
          <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600 mb-3" />
          <h2 className="text-base font-bold">Review Queue is Clear!</h2>
          <p className="mt-1 text-xs text-emerald-700 max-w-md mx-auto">
            All ingested questions have been audited and verified. Use the Ingestion Pipeline to upload new papers.
          </p>
          <a
            href="/admin/imports"
            className="mt-4 inline-block rounded-xl bg-emerald-700 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-800"
          >
            Import New Papers
          </a>
        </div>
      ) : (
        <div className="space-y-6">
          {questions.map((q) => (
            <div
              key={q.id}
              className="rounded-2xl border border-amber-200 bg-white p-6 shadow-sm hover:shadow-md transition"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100 text-xs">
                <div className="flex items-center gap-2">
                  <span className="rounded bg-amber-100 px-2 py-0.5 font-bold text-amber-800">
                    NEEDS_REVIEW
                  </span>
                  <span className="font-bold text-slate-900">
                    {q.paperCode} • {q.year} • Q.{q.questionNumber}
                  </span>
                  <span className="text-slate-500">{q.subject}</span>
                </div>
                <span className="text-[11px] text-slate-400">
                  Imported on: {new Date(q.createdAt).toLocaleDateString()}
                </span>
              </div>

              <div className="mt-4">
                <p className="whitespace-pre-line text-sm font-medium text-slate-800 leading-relaxed">
                  {q.questionText}
                </p>
              </div>

              {/* Proposed Answer Key & Summary */}
              <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-xs">
                <div className="flex items-center justify-between font-bold text-slate-800 mb-1">
                  <span>Authoritative Answer Key: Option ({q.correctOption})</span>
                  <span className="text-emerald-700 font-semibold">{q.optionsCount} Options Verified</span>
                </div>
                <p className="text-slate-600 leading-normal">
                  <strong>Explanation Draft:</strong> {q.explanation || "No explanation attached yet."}
                </p>
              </div>

              {/* Review Decision Buttons */}
              <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
                <button
                  onClick={() => handleUpdateStatus(q.id, "ARCHIVED")}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-500 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 transition"
                >
                  Reject & Archive
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleUpdateStatus(q.id, "VERIFIED")}
                    className="rounded-lg border border-blue-300 bg-blue-50 px-4 py-2 text-xs font-bold text-blue-700 hover:bg-blue-100 transition"
                  >
                    Mark as Verified
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(q.id, "PUBLISHED")}
                    className="rounded-lg bg-emerald-600 px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition"
                  >
                    Verify & Publish Live
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
