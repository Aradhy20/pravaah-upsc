"use client";

import React, { useState, useEffect } from "react";
import { FileEdit, BookOpen, Clock, ArrowRight } from "lucide-react";

export default function NotesPage() {
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadNotes() {
      try {
        const res = await fetch("/api/v1/user/notes");
        const json = await res.json();
        if (json.success) {
          setNotes(json.data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadNotes();
  }, []);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <div className="mb-8">
        <div className="flex items-center gap-2">
          <FileEdit className="h-6 w-6 text-amber-600" />
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Aspirant Study Notes Workspace
          </h1>
        </div>
        <p className="mt-1 text-sm text-slate-500">
          Personal mnemonics, elimination strategies, and textbook cross-references
        </p>
      </div>

      {loading ? (
        <div className="py-20 text-center text-sm text-slate-400">Loading notes...</div>
      ) : notes.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-500">
          <FileEdit className="mx-auto h-12 w-12 text-slate-300 mb-3" />
          <h2 className="text-base font-bold text-slate-800">No Private Notes Saved</h2>
          <p className="mt-1 text-xs text-slate-500 max-w-md mx-auto">
            Click the note icon on any question card to save quick annotations, memory tricks, or textbook references.
          </p>
          <a
            href="/pyqs"
            className="mt-4 inline-block rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-blue-700 transition"
          >
            Go to PYQs Explorer
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {notes.map((n) => (
            <div
              key={n.id}
              className="rounded-2xl border border-amber-200 bg-amber-50/40 p-5 shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs pb-2 border-b border-amber-200/60">
                  <span className="font-bold text-amber-900">
                    {n.question.paperCode} • {n.question.year} • Q.{n.question.questionNumber}
                  </span>
                  <span className="text-slate-400">
                    {new Date(n.updatedAt).toLocaleDateString()}
                  </span>
                </div>

                {/* Note Content */}
                <div className="mt-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800">
                    Your Personal Annotation:
                  </span>
                  <p className="mt-1 text-xs font-medium text-slate-800 leading-relaxed bg-white p-3 rounded-lg border border-amber-200">
                    {n.content}
                  </p>
                </div>

                {/* Question Context */}
                <div className="mt-4">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Question Context:
                  </span>
                  <p className="mt-1 text-xs text-slate-600 line-clamp-3">
                    {n.question.questionText}
                  </p>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-amber-200/60 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">{n.question.subject}</span>
                <a
                  href={`/pyqs?q=${encodeURIComponent(n.question.questionText.slice(0, 30))}`}
                  className="font-bold text-amber-900 hover:underline flex items-center gap-1"
                >
                  <span>Solve Question</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
