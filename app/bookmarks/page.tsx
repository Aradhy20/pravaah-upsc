"use client";

import React, { useState, useEffect } from "react";
import { QuestionCard } from "@/components/QuestionCard";
import { Bookmark, Compass } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

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
    <div className="min-h-screen bg-heritage-ivory flex flex-col font-sans text-heritage-dark">
      <Header />

      <main className="flex-1 mx-auto max-w-5xl px-4 py-8 sm:px-6 w-full">
        <div className="mb-8">
          <div className="flex items-center gap-2">
            <Bookmark className="h-6 w-6 text-heritage-burgundy fill-heritage-burgundy" />
            <h1 className="text-2xl sm:text-3xl font-serif font-black text-heritage-dark">
              Bookmarked Questions
            </h1>
          </div>
          <p className="mt-1 text-sm text-heritage-muted">
            Your saved questions for high-priority revision and quick reference
          </p>
        </div>

        {loading ? (
          <div className="py-20 text-center text-sm text-heritage-muted">
            Loading bookmarks...
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-heritage-border bg-white p-12 text-center text-heritage-muted">
            <Bookmark className="mx-auto h-12 w-12 text-heritage-muted/40 mb-3" />
            <h2 className="text-base font-serif font-bold text-heritage-dark">No Bookmarks Saved Yet</h2>
            <p className="mt-1 text-xs text-heritage-muted max-w-md mx-auto">
              Click the bookmark icon on any question in the PYQ Explorer to store it in your personal collection.
            </p>
            <a
              href="/prelims/pyqs"
              className="mt-4 inline-block rounded-xl bg-heritage-burgundy px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-heritage-wine transition"
            >
              Browse PYQs
            </a>
          </div>
        ) : (
          <div className="space-y-6">
            {items.map((b) => (
              <QuestionCard
                key={b.questionId || b.id}
                question={b.question}
                initialBookmarked={true}
              />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
