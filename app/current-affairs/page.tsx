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
  const [loading, setLoading] = useState(true);
  const [selectedPaper, setSelectedPaper] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function fetchStories() {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        if (selectedPaper !== "ALL") queryParams.set("paper", selectedPaper);
        if (searchQuery) queryParams.set("search", searchQuery);

        const res = await fetch(`/api/v1/current-affairs?${queryParams.toString()}`);
        const data = await res.json();
        if (data.success) {
          setStories(data.stories || []);
        }
      } catch (e) {
        console.error("Failed to load current affairs:", e);
      } finally {
        setLoading(false);
      }
    }
    fetchStories();
  }, [selectedPaper, searchQuery]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-2xl p-6 sm:p-10 text-white shadow-sm mb-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-200 text-xs font-semibold mb-4 border border-blue-400/20">
              <Sparkles className="h-3.5 w-3.5" />
              Official Source-Aware Intelligence Pipeline
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Daily Current Affairs <span className="text-blue-400">Connected to PYQs</span>
            </h1>
            <p className="mt-3 text-slate-300 text-sm sm:text-base leading-relaxed">
              Every story is sourced from authoritative public releases (PIB, RBI, Ministries, PRS), mapped to the UPSC syllabus, and linked directly to historical questions from our verified 1,085+ question bank.
            </p>

            <div className="mt-6 flex flex-wrap gap-4 items-center">
              <Link
                href="/daily-quiz"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-all shadow"
              >
                <CheckCircle className="h-4 w-4" />
                Attempt Today's 5-Question Quiz
              </Link>
              <Link
                href="/study-planner"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm font-semibold transition-all border border-white/10"
              >
                <BookOpen className="h-4 w-4" />
                Today's Study Plan
              </Link>
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mb-6 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          {/* Syllabus Paper Tabs */}
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            {["ALL", "GS1", "GS2", "GS3", "GS4"].map((paper) => (
              <button
                key={paper}
                onClick={() => setSelectedPaper(paper)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  selectedPaper === paper
                    ? "bg-blue-700 text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {paper === "ALL" ? "All Papers" : `Mains ${paper}`}
              </button>
            ))}
          </div>

          {/* Search input */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search current affairs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            />
          </div>
        </div>

        {/* Stories Feed */}
        {loading ? (
          <div className="py-20 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-3 text-sm text-slate-500 font-medium">Loading verified current affairs...</p>
          </div>
        ) : stories.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center border border-slate-200">
            <BookOpen className="h-10 w-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No stories found</h3>
            <p className="text-sm text-slate-500 mt-1">Try adjusting your syllabus filter or search query.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {stories.map((story) => (
              <div
                key={story.id}
                className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between overflow-hidden"
              >
                <div className="p-5 sm:p-6">
                  {/* Metadata Header */}
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                        {story.topics[0]?.paper || "GS"}
                      </span>
                      <span className="text-xs font-medium text-slate-500 truncate max-w-[200px]">
                        {story.sourceName}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-slate-400">
                      <Calendar className="h-3.5 w-3.5" />
                      {new Date(story.publishedAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </div>
                  </div>

                  {/* Story Title */}
                  <Link href={`/current-affairs/${story.slug}`}>
                    <h2 className="text-lg font-bold text-slate-900 hover:text-blue-700 transition-colors leading-snug">
                      {story.title}
                    </h2>
                  </Link>

                  {/* Concise Summary */}
                  <p className="mt-2.5 text-sm text-slate-600 leading-relaxed line-clamp-3">
                    {story.summary}
                  </p>

                  {/* Key Terms Chips */}
                  {story.terms && story.terms.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {story.terms.slice(0, 4).map((term: string, idx: number) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-600"
                        >
                          {term}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Connected Historical PYQ Banner */}
                  {story.linkedPyqsCount > 0 && (
                    <div className="mt-4 p-3 bg-indigo-50/70 rounded-lg border border-indigo-100 flex items-start gap-2.5">
                      <Clock className="h-4 w-4 text-indigo-700 mt-0.5 shrink-0" />
                      <div className="text-xs">
                        <span className="font-bold text-indigo-900">
                          {story.linkedPyqsCount} Historical UPSC Question{story.linkedPyqsCount > 1 ? "s" : ""} Connected:
                        </span>{" "}
                        <span className="text-indigo-800">
                          {story.linkedPyqs.map((q: any) => `UPSC ${q.year} ${q.paper} Q#${q.questionNumber}`).join(", ")}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer action */}
                <div className="px-5 sm:px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">
                    {story.topics[0]?.name?.split(":")[0] || "General Studies"}
                  </span>
                  <Link
                    href={`/current-affairs/${story.slug}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 hover:text-blue-800"
                  >
                    Read Full Card & PYQs
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
