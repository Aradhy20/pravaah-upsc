"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  FileEdit,
  Search,
  Filter,
  Trash2,
  ExternalLink,
  Save,
  X,
  BookOpen,
  ArrowRight,
  Clock,
  Sparkles,
  CheckCircle2,
} from "lucide-react";

export default function NotesPage() {
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("ALL");
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const loadNotes = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/v1/user/notes");
      const json = await res.json();
      if (json.success) {
        setNotes(json.data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotes();
  }, []);

  const handleStartEdit = (note: any) => {
    setEditingNoteId(note.id);
    setEditContent(note.content);
  };

  const handleSaveEdit = async (note: any) => {
    setSaving(true);
    try {
      const res = await fetch("/api/v1/user/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId: note.questionId,
          content: editContent.trim(),
        }),
      });
      const json = await res.json();
      if (json.success) {
        setNotes((prev) =>
          prev.map((n) =>
            n.id === note.id
              ? { ...n, content: editContent.trim(), updatedAt: new Date().toISOString() }
              : n
          )
        );
        setEditingNoteId(null);
        setNotice("Note updated successfully.");
        setTimeout(() => setNotice(null), 3000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      const res = await fetch(`/api/v1/user/notes?id=${encodeURIComponent(noteId)}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.success) {
        setNotes((prev) => prev.filter((n) => n.id !== noteId));
        setDeletingId(null);
        setNotice("Note deleted successfully.");
        setTimeout(() => setNotice(null), 3000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const subjects = useMemo(() => {
    const set = new Set<string>();
    notes.forEach((n) => {
      if (n.question?.subject) set.add(n.question.subject);
    });
    return Array.from(set).sort();
  }, [notes]);

  const filteredNotes = useMemo(() => {
    return notes.filter((n) => {
      const q = n.question;
      if (!q) return false;

      // Subject filter
      if (selectedSubject !== "ALL" && q.subject !== selectedSubject) {
        return false;
      }

      // Search query
      if (searchQuery.trim().length > 0) {
        const query = searchQuery.toLowerCase();
        const contentMatch = n.content?.toLowerCase().includes(query);
        const questionMatch = q.questionText?.toLowerCase().includes(query);
        const subjectMatch = q.subject?.toLowerCase().includes(query);
        const topicMatch = q.topic?.toLowerCase().includes(query);
        if (!contentMatch && !questionMatch && !subjectMatch && !topicMatch) {
          return false;
        }
      }

      return true;
    });
  }, [notes, searchQuery, selectedSubject]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <FileEdit className="h-6 w-6 text-amber-600" />
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Aspirant Study Notes Workspace
            </h1>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Personal mnemonics, elimination rules, and textbook references organized by subject
          </p>
        </div>

        <Link
          href="/pyqs"
          className="self-start md:self-auto rounded-xl bg-amber-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-amber-700 transition flex items-center gap-1.5"
        >
          <span>Annotate More PYQs</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {notice && (
        <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-bold text-emerald-800 flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>{notice}</span>
          </div>
          <button onClick={() => setNotice(null)} className="text-emerald-600 hover:text-emerald-900">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Search and Filters */}
      <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Search input */}
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search in your notes, mnemonics, or question text..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 py-2 text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Subject Filter */}
          <div>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="ALL">All Subjects ({notes.length})</option>
              {subjects.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        {(searchQuery || selectedSubject !== "ALL") && (
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">
              Showing {filteredNotes.length} of {notes.length} notes
            </span>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedSubject("ALL");
              }}
              className="font-bold text-amber-700 hover:underline"
            >
              Reset filters
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="py-20 text-center text-sm text-slate-400">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600 mb-2" />
          <p>Loading personal study notes...</p>
        </div>
      ) : notes.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-500 shadow-sm">
          <FileEdit className="mx-auto h-12 w-12 text-slate-300 mb-3" />
          <h2 className="text-base font-bold text-slate-800">No Private Notes Saved</h2>
          <p className="mt-1 text-xs text-slate-500 max-w-md mx-auto">
            Click the note icon on any question card in the PYQ Explorer to save personal mnemonics, elimination logic, or textbook references.
          </p>
          <Link
            href="/pyqs"
            className="mt-5 inline-block rounded-xl bg-amber-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-amber-700 transition"
          >
            Browse PYQs Explorer
          </Link>
        </div>
      ) : filteredNotes.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-500 shadow-sm">
          <Filter className="mx-auto h-10 w-10 text-slate-300 mb-2" />
          <h2 className="text-base font-bold text-slate-800">No Matching Notes Found</h2>
          <p className="mt-1 text-xs text-slate-500">
            No notes matched your search query or subject filter.
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedSubject("ALL");
            }}
            className="mt-4 rounded-xl bg-slate-100 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredNotes.map((n) => {
            const isEditing = editingNoteId === n.id;

            return (
              <div
                key={n.id}
                className="rounded-2xl border border-amber-200/80 bg-amber-50/30 p-5 shadow-sm flex flex-col justify-between hover:border-amber-300 transition"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-center justify-between text-xs pb-3 border-b border-amber-200/60">
                    <span className="font-bold text-amber-900 bg-amber-100/70 px-2 py-0.5 rounded border border-amber-200">
                      {n.question.paperCode} • {n.question.year} • Q.{n.question.questionNumber}
                    </span>
                    <span className="text-slate-400 text-[11px] flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(n.updatedAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>

                  {/* Note Content / Editor */}
                  <div className="mt-3.5">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800">
                        Your Personal Annotation
                      </span>
                      {!isEditing && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleStartEdit(n)}
                            className="text-[11px] font-bold text-amber-700 hover:text-amber-900 underline"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => setDeletingId(n.id)}
                            className="text-[11px] font-bold text-rose-600 hover:text-rose-800"
                            title="Delete note"
                          >
                            <Trash2 className="h-3 w-3 inline" />
                          </button>
                        </div>
                      )}
                    </div>

                    {isEditing ? (
                      <div className="space-y-2">
                        <textarea
                          rows={4}
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          className="w-full rounded-xl border border-amber-300 bg-white p-3 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-inner"
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setEditingNoteId(null)}
                            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-bold text-slate-600 hover:bg-slate-50"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleSaveEdit(n)}
                            disabled={saving}
                            className="rounded-lg bg-amber-600 px-3 py-1 text-xs font-bold text-white hover:bg-amber-700 disabled:opacity-50 flex items-center gap-1"
                          >
                            <Save className="h-3 w-3" />
                            {saving ? "Saving..." : "Save Note"}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs font-medium text-slate-800 leading-relaxed bg-white p-3 rounded-xl border border-amber-200/70 shadow-2xs whitespace-pre-wrap">
                        {n.content}
                      </p>
                    )}
                  </div>

                  {/* Question Stem Excerpt */}
                  <div className="mt-4 pt-3 border-t border-amber-200/50">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Referenced Question Stem:
                    </span>
                    <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                      {n.question.questionText}
                    </p>
                  </div>
                </div>

                {/* Footer with Subject Tag and Link */}
                <div className="mt-4 pt-3 border-t border-amber-200/60 flex items-center justify-between text-xs">
                  <span className="rounded bg-slate-100 text-slate-700 px-2 py-0.5 text-[11px] font-semibold">
                    {n.question.subject}
                  </span>
                  <Link
                    href={`/pyqs?paper=${n.question.paperCode}&year=${n.question.year}&q=${encodeURIComponent(n.question.questionText.slice(0, 25))}`}
                    className="font-bold text-amber-900 hover:underline flex items-center gap-1"
                  >
                    <span>View Question in Explorer</span>
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl border border-slate-200 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 border border-rose-100">
              <Trash2 className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Delete Private Note?</h3>
            <p className="mt-1 text-xs text-slate-500 mb-5">
              This will permanently delete this annotation. You can create a new note for this question at any time.
            </p>

            <div className="flex justify-center gap-2">
              <button
                onClick={() => setDeletingId(null)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
              >
                Keep Note
              </button>
              <button
                onClick={() => handleDeleteNote(deletingId)}
                className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-700 shadow-sm"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
