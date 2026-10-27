"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { FilterBar } from "@/components/FilterBar";
import { QuestionCard, QuestionData } from "@/components/QuestionCard";
import { Loader2, AlertCircle, Compass, HelpCircle } from "lucide-react";

function PYQExplorerContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Initialize state from URL params
  const [selectedPaper, setSelectedPaper] = useState(searchParams?.get("paper") || "GS1");
  const [selectedYears, setSelectedYears] = useState<number[]>(() => {
    const y = searchParams?.get("years");
    return y ? y.split(",").map(Number).filter((n) => !isNaN(n)) : [];
  });
  const [selectedSubject, setSelectedSubject] = useState(searchParams?.get("subject") || "");
  const [searchQuery, setSearchQuery] = useState(searchParams?.get("q") || "");
  const [searchMode, setSearchMode] = useState<"smart" | "exact">("smart");

  const [questions, setQuestions] = useState<QuestionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [totalQuestions, setTotalQuestions] = useState(0);

  // Sync state to URL
  const updateURL = useCallback(
    (paper: string, years: number[], subject: string, q: string) => {
      const params = new URLSearchParams();
      if (paper) params.set("paper", paper);
      if (years.length > 0) params.set("years", years.join(","));
      if (subject) params.set("subject", subject);
      if (q.trim()) params.set("q", q.trim());

      router.replace(`/pyqs?${params.toString()}`, { scroll: false });
    },
    [router]
  );

  // Fetch Questions
  const fetchQuestions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (selectedPaper) params.set("paper", selectedPaper);
      if (selectedYears.length > 0) params.set("years", selectedYears.join(","));
      if (selectedSubject) params.set("subject", selectedSubject);
      if (searchQuery.trim()) params.set("q", searchQuery.trim());
      params.set("page", page.toString());
      params.set("limit", "15");

      const res = await fetch(`/api/v1/questions?${params.toString()}`);
      const json = await res.json();

      if (json.success) {
        setQuestions(json.data);
        setTotalQuestions(json.meta.total);
        setHasMore(json.meta.hasMore);
      } else {
        setError(json.error?.message || "Failed to load questions");
      }
    } catch (e: any) {
      console.error(e);
      setError("Network or server error while retrieving questions.");
    } finally {
      setLoading(false);
    }
  }, [selectedPaper, selectedYears, selectedSubject, searchQuery, page]);

  useEffect(() => {
    fetchQuestions();
    updateURL(selectedPaper, selectedYears, selectedSubject, searchQuery);
  }, [fetchQuestions, selectedPaper, selectedYears, selectedSubject, searchQuery, updateURL]);

  const handleClearAll = () => {
    setSelectedPaper("GS1");
    setSelectedYears([]);
    setSelectedSubject("");
    setSearchQuery("");
    setPage(1);
    router.replace("/pyqs", { scroll: false });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {/* Page Heading */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Compass className="h-6 w-6 text-blue-700" />
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Prelims PYQ Explorer
            </h1>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Browse verified past UPSC Civil Services Examination questions with official answer keys
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="/mock-tests"
            className="rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition shadow-sm"
          >
            Switch to Timed Exam Mode
          </a>
        </div>
      </div>

      {/* Filter Bar Component */}
      <FilterBar
        selectedPaper={selectedPaper}
        onPaperChange={(paper) => {
          setSelectedPaper(paper);
          setPage(1);
        }}
        selectedYears={selectedYears}
        onYearsChange={(years) => {
          setSelectedYears(years);
          setPage(1);
        }}
        selectedSubject={selectedSubject}
        onSubjectChange={(subject) => {
          setSelectedSubject(subject);
          setPage(1);
        }}
        searchQuery={searchQuery}
        onSearchChange={(q) => {
          setSearchQuery(q);
          setPage(1);
        }}
        searchMode={searchMode}
        onSearchModeChange={setSearchMode}
        onClearAll={handleClearAll}
        totalFilteredCount={totalQuestions}
      />

      {/* Questions Results Area */}
      <div className="mt-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-2" />
            <span className="text-sm font-medium">Loading verified questions...</span>
          </div>
        ) : error ? (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-center text-rose-800">
            <AlertCircle className="mx-auto h-8 w-8 text-rose-500 mb-2" />
            <p className="font-semibold">{error}</p>
            <button
              onClick={fetchQuestions}
              className="mt-3 rounded-lg bg-rose-700 px-4 py-1.5 text-xs font-bold text-white hover:bg-rose-800"
            >
              Retry
            </button>
          </div>
        ) : questions.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-500">
            <HelpCircle className="mx-auto h-12 w-12 text-slate-300 mb-3" />
            <h3 className="text-base font-bold text-slate-800">No Questions Found</h3>
            <p className="mt-1 text-xs text-slate-500 max-w-md mx-auto">
              No questions matched your current combination of filters. Try clearing your search keyword or switching between GS Paper 1 and CSAT.
            </p>
            <button
              onClick={handleClearAll}
              className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {questions.map((q) => (
              <QuestionCard key={q.id} question={q} />
            ))}

            {/* Pagination Controls */}
            <div className="flex items-center justify-between border-t border-slate-200 pt-6">
              <span className="text-xs text-slate-500">
                Page {page} of {Math.ceil(totalQuestions / 15) || 1}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="rounded-lg border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40"
                >
                  Previous Page
                </button>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={!hasMore}
                  className="rounded-lg border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40"
                >
                  Next Page
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PYQExplorerPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center text-slate-400">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      }
    >
      <PYQExplorerContent />
    </Suspense>
  );
}
