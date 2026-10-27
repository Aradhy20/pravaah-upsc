"use client";

import React, { useState, useEffect } from "react";
import { QuestionCard } from "@/components/QuestionCard";
import { Bookmark, Compass } from "lucide-react";

export default function BookmarksPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadBookmarks() {
      try {
        const res = await fetch("/api/v1/user/bookmarks");
        const json = await res.json();
        if (json.success) {
          setItems(json.data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadBookmarks();
  }, []);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <div className="mb-8">
        <div className="flex items-center gap-2">
          <Bookmark className="h-6 w-6 text-blue-700 fill-blue-700" />
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Bookmarked Questions
          </h1>
        </div>
        <p className="mt-1 text-sm text-slate-500">
          Your saved questions for high-priority revision and quick reference
        </p>
      </div>

      {loading ? (
        <div className="py-20 text-center text-sm text-slate-400">
          Loading bookmarks...
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-500">
          <Bookmark className="mx-auto h-12 w-12 text-slate-300 mb-3" />
          <h2 className="text-base font-bold text-slate-800">No Bookmarks Saved Yet</h2>
          <p className="mt-1 text-xs text-slate-500 max-w-md mx-auto">
            Click the bookmark icon on any question in the PYQ Explorer to store it in your personal collection.
          </p>
          <a
            href="/pyqs"
            className="mt-4 inline-block rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-blue-700 transition"
          >
            Browse PYQs
          </a>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="text-xs font-semibold text-slate-500">
            {items.length} question{items.length > 1 ? "s" : ""} in your collection
          </div>
          {items.map((b) => (
            <QuestionCard
              key={b.bookmarkId}
              question={b.question}
              initialBookmarked={true}
            />
          ))}
        </div>
      )}
    </div>
  );
}
