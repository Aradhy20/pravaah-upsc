"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { QuestionCard } from "@/components/QuestionCard";
import {
  Bookmark,
  Search,
  Filter,
  Trash2,
  ExternalLink,
  RotateCw,
  AlertCircle,
  X,
  BookOpen,
  ArrowRight,
} from "lucide-react";

export default function BookmarksPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("ALL");
  const [selectedYear, setSelectedYear] = useState("ALL");
  const [selectedPaper, setSelectedPaper] = useState("ALL");
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const loadBookmarks = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/v1/user/bookmarks");
      const json = await res.json();
      if (json.success) {
        setItems(json.data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookmarks();
  }, []);

  const handleRemoveBookmark = async (questionId: string) => {
    try {
      const res = await fetch("/api/v1/user/bookmarks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId }),
      });
      const json = await res.json();
      if (json.success) {
        setItems((prev) => prev.filter((b) => b.question.id !== questionId));
        setRemovingId(null);
        setNotice("Bookmark removed successfully.");
        setTimeout(() => setNotice(null), 3000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Derive unique filter options
  const subjects = useMemo(() => {
    const set = new Set<string>();
    items.forEach((b) => {
      if (b.question?.subject) set.add(b.question.subject);
    });
    return Array.from(set).sort();
  }, [items]);

  const years = useMemo(() => {
    const set = new Set<number>();
    items.forEach((b) => {
      if (b.question?.year) set.add(b.question.year);
    });
    return Array.from(set).sort((a, b) => b - a);
  }, [items]);

  const papers = useMemo(() => {
    const set = new Set<string>();
    items.forEach((b) => {
      if (b.question?.paperCode) set.add(b.question.paperCode);
    });
    return Array.from(set).sort();
  }, [items]);

  // Filtered bookmarks
  const filteredItems = useMemo(() => {
    return items.filter((b) => {
      const q = b.question;
      if (!q) return false;

      // Subject filter
      if (selectedSubject !== "ALL" && q.subject !== selectedSubject) {
        return false;
      }

      // Year filter
      if (selectedYear !== "ALL" && String(q.year) !== selectedYear) {
        return false;
      }

      // Paper filter
      if (selectedPaper !== "ALL" && q.paperCode !== selectedPaper) {
        return false;
      }

      // Search query
      if (searchQuery.trim().length > 0) {
        const query = searchQuery.toLowerCase();
        const textMatch = q.questionText?.toLowerCase().includes(query);
        const topicMatch = q.topic?.toLowerCase().includes(query);
        const subjectMatch = q.subject?.toLowerCase().includes(query);
        const explanationMatch = q.explanation?.summary?.toLowerCase().includes(query);
        if (!textMatch && !topicMatch && !subjectMatch && !explanationMatch) {
          return false;
        }
      }

      return true;
    });
  }, [items, searchQuery, selectedSubject, selectedYear, selectedPaper]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      {/* Page Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Bookmark className="h-6 w-6 text-blue-700 fill-blue-700" />
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Bookmarked Questions
            </h1>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            High-yield questions saved for targeted revision and conceptual mastery
          </p>
        </div>

        <Link
          href="/pyqs"
          className="self-start md:self-auto rounded-xl bg-blue-700 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-800 transition flex items-center gap-1.5"
        >
          <span>Explore More PYQs</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {notice && (
        <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-bold text-emerald-800 flex items-center justify-between animate-in fade-in">
          <span>{notice}</span>
          <button onClick={() => setNotice(null)} className="text-emerald-600 hover:text-emerald-900">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="relative md:col-span-1 lg:col-span-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search in questions or concepts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 py-2 text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          {/* Subject Filter */}
          <div>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="ALL">All Subjects ({items.length})</option>
              {subjects.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Year Filter */}
          <div>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="ALL">All Years</option>
              {years.map((y) => (
                <option key={y} value={String(y)}>
                  UPSC {y}
                </option>
              ))}
            </select>
          </div>

          {/* Paper Filter */}
          <div>
            <select
              value={selectedPaper}
              onChange={(e) => setSelectedPaper(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="ALL">All Papers (GS1 & CSAT)</option>
              {papers.map((p) => (
                <option key={p} value={p}>
                  {p === "GS1" ? "General Studies Paper 1" : p === "GS2" ? "CSAT Paper 2" : p}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Active Filter Count & Reset */}
        {(searchQuery || selectedSubject !== "ALL" || selectedYear !== "ALL" || selectedPaper !== "ALL") && (
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">
              Showing {filteredItems.length} of {items.length} bookmarks
            </span>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedSubject("ALL");
                setSelectedYear("ALL");
                setSelectedPaper("ALL");
              }}
              className="font-bold text-blue-600 hover:underline"
            >
              Reset all filters
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="py-20 text-center text-sm text-slate-400">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2" />
          <p>Loading personal bookmarks...</p>
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-500 shadow-sm">
          <Bookmark className="mx-auto h-12 w-12 text-slate-300 mb-3" />
          <h2 className="text-base font-bold text-slate-800">No Bookmarks Saved Yet</h2>
          <p className="mt-1 text-xs text-slate-500 max-w-md mx-auto">
            Click the bookmark icon on any question card in the PYQ Explorer to save it to your personal high-yield revision list.
          </p>
          <Link
            href="/pyqs"
            className="mt-5 inline-block rounded-xl bg-blue-700 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-blue-800 transition"
          >
            Go to PYQs Explorer
          </Link>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-500 shadow-sm">
          <Filter className="mx-auto h-10 w-10 text-slate-300 mb-2" />
          <h2 className="text-base font-bold text-slate-800">No Matching Bookmarks Found</h2>
          <p className="mt-1 text-xs text-slate-500">
            No questions matched your search query or filter combination.
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedSubject("ALL");
              setSelectedYear("ALL");
              setSelectedPaper("ALL");
            }}
            className="mt-4 rounded-xl bg-slate-100 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 px-1">
            <span>
              {filteredItems.length} question{filteredItems.length !== 1 ? "s" : ""} in view
            </span>
            <span className="text-slate-400">Click &apos;Solve in PYQs&apos; to view in sequential context</span>
          </div>

          {filteredItems.map((b) => (
            <div key={b.bookmarkId} className="relative group">
              {/* Question card header bar with fast removal & open link */}
              <div className="mb-2 flex items-center justify-between px-2 text-xs">
                <span className="rounded bg-blue-50 px-2 py-0.5 font-bold text-blue-700 border border-blue-100">
                  {b.question.paperCode} • {b.question.year} • Q.{b.question.questionNumber}
                </span>

                <div className="flex items-center gap-2">
                  <Link
                    href={`/pyqs?paper=${b.question.paperCode}&year=${b.question.year}&q=${encodeURIComponent(b.question.questionText.slice(0, 25))}`}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 font-semibold text-slate-600 hover:bg-slate-50 text-[11px] transition shadow-xs"
                    title="Open in PYQ Explorer"
                  >
                    <span>Open in Explorer</span>
                    <ExternalLink className="h-3 w-3" />
                  </Link>

                  <button
                    onClick={() => setRemovingId(b.question.id)}
                    className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1 font-semibold text-rose-700 hover:bg-rose-100 text-[11px] transition"
                    title="Remove from bookmarks"
                  >
                    <Trash2 className="h-3 w-3" />
                    <span>Remove</span>
                  </button>
                </div>
              </div>

              <QuestionCard question={b.question} initialBookmarked={true} />
            </div>
          ))}
        </div>
      )}

      {/* Remove Confirmation Dialog */}
      {removingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl border border-slate-200 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 border border-rose-100">
              <Trash2 className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Remove Bookmark?</h3>
            <p className="mt-1 text-xs text-slate-500 mb-5">
              This will remove the question from your personal bookmarks collection. You can bookmark it again anytime from the PYQ Explorer.
            </p>

            <div className="flex justify-center gap-2">
              <button
                onClick={() => setRemovingId(null)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
              >
                Keep Bookmark
              </button>
              <button
                onClick={() => handleRemoveBookmark(removingId)}
                className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-700 shadow-sm"
              >
                Yes, Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
