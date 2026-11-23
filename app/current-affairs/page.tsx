"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  BookOpen,
  Calendar,
  ExternalLink,
  Search,
  Filter,
  ArrowRight,
  CheckCircle,
  Clock,
  Sparkles,
  Bookmark,
  Share2,
} from "lucide-react";

export default function CurrentAffairsPage() {
  const [stories, setStories] = useState<any[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPaper, setSelectedPaper] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchStories = async () => {
    setLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams();
      queryParams.set("limit", "50");
      if (selectedPaper !== "ALL") queryParams.set("paper", selectedPaper);
      if (searchQuery) queryParams.set("search", searchQuery);

      const res = await fetch(`/api/v1/current-affairs?${queryParams.toString()}`);
      const data = await res.json();
      if (res.ok && data.success) {
        const storiesList = data.stories || data.data?.stories || [];
        setStories(storiesList);
        setTotal(data.meta?.total || data.data?.total || data.total || storiesList.length);
      } else {
        setError(data.error || "Failed to retrieve verified current affairs from database.");
      }
    } catch (e: any) {
      console.error("Failed to load current affairs:", e);
      setError("Network error while connecting to the current affairs database.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStories();
  }, [selectedPaper, searchQuery]);

  return (
    <div className="min-h-screen bg-heritage-ivory flex flex-col font-sans">
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-heritage-wine via-heritage-burgundy to-heritage-wine rounded-2xl p-6 sm:p-10 text-white shadow-gold border border-heritage-gold/30 mb-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-heritage-cream/15 text-heritage-gold text-xs font-bold mb-4 border border-heritage-gold/30">
              <Sparkles className="h-3.5 w-3.5" />
              Official Source-Aware Intelligence Pipeline
            </div>
            <h1 className="font-serif text-2xl sm:text-4xl font-bold tracking-tight">
              Daily Current Affairs <span className="text-heritage-gold">Connected to PYQs</span>
            </h1>
            <p className="mt-3 text-heritage-cream/90 text-sm sm:text-base leading-relaxed">
              Every story is sourced from authoritative public releases (PIB, RBI, Ministries, PRS), mapped to the UPSC syllabus, and linked directly to historical questions from our verified question bank (1995–2024 Prelims Series A: 74 GS1 & 47 CSAT).
            </p>

            <div className="mt-6 flex flex-wrap gap-4 items-center">
              <Link
                href="/daily-quiz"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-heritage-burgundy hover:bg-heritage-wine text-white text-sm font-bold transition-all shadow-xs border border-heritage-gold/30"
              >
                <CheckCircle className="h-4 w-4 text-heritage-gold" />
                Attempt Today's 5-Question Quiz
              </Link>
              <Link
                href="/study-planner"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-semibold transition-all border border-white/20"
              >
                <BookOpen className="h-4 w-4 text-heritage-cream" />
                Today's Study Plan
              </Link>
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mb-6 bg-white p-4 rounded-2xl border border-heritage-border shadow-card">
          {/* Syllabus Paper Tabs */}
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            {["ALL", "GS1", "GS2", "GS3", "GS4"].map((paper) => (
              <button
                key={paper}
                onClick={() => setSelectedPaper(paper)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedPaper === paper
                    ? "bg-heritage-burgundy text-white shadow-xs"
                    : "bg-heritage-ivory text-heritage-secondary hover:bg-heritage-cream hover:text-heritage-text border border-heritage-border"
                }`}
              >
                {paper === "ALL" ? "All Papers" : `Mains ${paper}`}
              </button>
            ))}
          </div>

          {/* Search input */}
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-heritage-secondary" />
            <input
              type="text"
              placeholder="Search PIB briefings, treaties, policies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-heritage-border bg-heritage-ivory/40 focus:outline-none focus:ring-2 focus:ring-heritage-gold/20 focus:border-heritage-gold text-heritage-text placeholder:text-heritage-secondary/70"
            />
          </div>
        </div>

        {/* Stories Feed */}
        {error ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-rose-200 shadow-card max-w-xl mx-auto my-8">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 mb-3 border border-rose-100">
              <BookOpen className="h-6 w-6" />
            </div>
            <h3 className="font-serif text-base font-bold text-heritage-text">Current Affairs Unavailable</h3>
            <p className="text-xs text-rose-700 mt-1 mb-4">{error}</p>
            <button
              onClick={() => fetchStories()}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-heritage-burgundy hover:bg-heritage-wine text-white text-xs font-bold transition shadow-xs"
            >
              Retry Loading Stories
            </button>
          </div>
        ) : loading ? (
          <div className="py-20 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-heritage-burgundy border-t-transparent"></div>
            <p className="mt-3 text-sm text-heritage-secondary font-medium">Loading verified current affairs...</p>
          </div>
        ) : stories.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-heritage-border shadow-card">
            <BookOpen className="h-10 w-10 text-heritage-gold mx-auto mb-3" />
            <h3 className="font-serif text-base font-bold text-heritage-text">No stories found</h3>
            <p className="text-sm text-heritage-secondary mt-1">Try adjusting your syllabus filter or search query.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 px-1">
              <span className="text-xs font-semibold text-heritage-secondary">
                Displaying <span className="text-heritage-text font-bold">{stories.length}</span> {stories.length === total ? "curated stories" : `of ${total} total stories`}
              </span>
              <span className="text-xs font-medium text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                ● 100% Sourced from Official Portals (PIB, RBI, MoEFCC, PRS)
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {stories.map((story) => (
              <div
                key={story.id}
                className="bg-white rounded-2xl border border-heritage-border shadow-card hover:shadow-hover transition-shadow flex flex-col justify-between overflow-hidden"
              >
                <div className="p-5 sm:p-6">
                  {/* Metadata Header */}
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-heritage-cream text-heritage-burgundy border border-heritage-border">
                        {story.topics[0]?.paper || "GS"}
                      </span>
                      <span className="text-xs font-medium text-heritage-secondary truncate max-w-[200px]">
                        {story.sourceName}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-heritage-secondary">
                      <Calendar className="h-3.5 w-3.5 text-heritage-gold" />
                      {new Date(story.publishedAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </div>
                  </div>

                  {/* Story Title */}
                  <Link href={`/current-affairs/${story.slug}`}>
                    <h2 className="font-serif text-lg font-bold text-heritage-text hover:text-heritage-burgundy transition-colors leading-snug">
                      {story.title}
                    </h2>
                  </Link>

                  {/* Concise Summary */}
                  <p className="mt-2.5 text-sm text-heritage-secondary leading-relaxed line-clamp-3">
                    {story.summary}
                  </p>

                  {/* Key Terms Chips */}
                  {story.terms && story.terms.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {story.terms.slice(0, 4).map((term: string, idx: number) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded text-[11px] font-medium bg-heritage-ivory text-heritage-text border border-heritage-border"
                        >
                          {term}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Connected Historical PYQ Banner */}
                  {story.linkedPyqsCount > 0 && (
                    <div className="mt-4 p-3 bg-heritage-cream/80 rounded-xl border border-heritage-gold/30 flex items-start gap-2.5">
                      <Clock className="h-4 w-4 text-heritage-gold mt-0.5 shrink-0" />
                      <div className="text-xs">
                        <span className="font-bold text-heritage-burgundy">
                          {story.linkedPyqsCount} Historical UPSC Question{story.linkedPyqsCount > 1 ? "s" : ""} Connected:
                        </span>{" "}
                        <span className="text-heritage-text font-medium">
                          {story.linkedPyqs.map((q: any) => `UPSC ${q.year} ${q.paper} Q#${q.questionNumber}`).join(", ")}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer action */}
                <div className="px-5 sm:px-6 py-3.5 bg-heritage-ivory/60 border-t border-heritage-border/60 flex items-center justify-between">
                  <span className="text-xs font-semibold text-heritage-secondary">
                    {story.topics[0]?.name?.split(":")[0] || "General Studies"}
                  </span>
                  <Link
                    href={`/current-affairs/${story.slug}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-heritage-burgundy hover:text-heritage-wine"
                  >
                    Read Full Card & PYQs
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
