"use client";

import React, { useState, useEffect, useCallback, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Search,
  Sparkles,
  X,
  CheckCircle2,
  XCircle,
  Bookmark,
  Share2,
  FileEdit,
  Flag,
  HelpCircle,
  List,
  Maximize2,
  Clock,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  BookOpen,
  Check,
  AlertTriangle,
  Award,
  MessageSquare,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/context";

interface OptionItem {
  id?: string;
  code: string;
  label?: string;
  text: string;
  textEn?: string;
  textHi?: string | null;
  isCorrect?: boolean;
}

interface QuestionData {
  id: string;
  recordId?: string;
  year: number;
  questionNumber: number;
  paperCode: string;
  examCategory?: string;
  questionText: string;
  questionTextEn?: string;
  questionTextHi?: string | null;
  difficulty?: string;
  marks?: number;
  negativeMarks?: number;
  subject?: string;
  subjectSlug?: string;
  topic?: string;
  options: OptionItem[];
  verifiedAnswer?: {
    answerOption: string;
    answerType: string;
    answerKeyType: string;
    verificationStatus: string;
    sourceName?: string;
  };
  explanation?: {
    summary: string;
    detailedExplanation: string;
    explanationEn?: string;
    explanationHi?: string | null;
    eliminationTechnique?: string | null;
    sourceCitation?: string | null;
    relatedConcept?: string | null;
  } | null;
  citations?: Array<{
    sourceName: string;
    citationText?: string;
    sourceUrl?: string;
  }>;
}

interface YearInventory {
  year: number;
  count: number;
}

interface SubjectInventory {
  id: string;
  name: string;
  slug: string;
  paperCode: string;
  count: number;
}

function PrelimsPYQContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { language: globalLang } = useLanguage();

  // Primary Navigation / Exam Tab
  const [activeExamTab, setActiveExamTab] = useState<"CSE" | "OTHER">("CSE");

  // Filter States
  const [selectedPaper, setSelectedPaper] = useState<string>(searchParams?.get("paper") || "GS1");
  const [selectedYear, setSelectedYear] = useState<number | null>(() => {
    const y = searchParams?.get("year") || searchParams?.get("years");
    return y ? parseInt(y) : null;
  });
  const [selectedSubject, setSelectedSubject] = useState<string>(searchParams?.get("subject") || "");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>(searchParams?.get("q") || "");
  const [searchMode, setSearchMode] = useState<"smart" | "keyword">("smart");

  // Bilingual Mode State: EN | HI | BOTH
  const [displayLanguage, setDisplayLanguage] = useState<"EN" | "HI" | "BOTH">(
    globalLang === "hi" ? "HI" : "EN"
  );

  // Practice vs Exam Mode
  const [viewMode, setViewMode] = useState<"practice" | "focus" | "exam">("practice");
  const [focusIndex, setFocusIndex] = useState(0);

  // Timed Exam State
  const [examTimer, setExamTimer] = useState<number>(7200); // 120 minutes in seconds
  const [examSubmitted, setExamSubmitted] = useState<boolean>(false);

  // Data States
  const [questions, setQuestions] = useState<QuestionData[]>([]);
  const [yearInventory, setYearInventory] = useState<YearInventory[]>([]);
  const [subjectInventory, setSubjectInventory] = useState<SubjectInventory[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  // User interactive state (answers attempted, bookmarked, notes)
  const [attemptedAnswers, setAttemptedAnswers] = useState<Record<string, string>>({});
  const [bookmarkedIds, setBookmarkedIds] = useState<Record<string, boolean>>({});
  const [userNotes, setUserNotes] = useState<Record<string, string>>({});
  const [activeNoteModalQ, setActiveNoteModalQ] = useState<QuestionData | null>(null);
  const [tempNoteText, setTempNoteText] = useState("");
  const [copiedQuestionId, setCopiedQuestionId] = useState<string | null>(null);

  // Floating Feedback Modal State
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [feedbackCategory, setFeedbackCategory] = useState<"QUESTION_ERROR" | "EXPLANATION_QUERY" | "FEATURE_REQUEST">("QUESTION_ERROR");
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackSent, setFeedbackSent] = useState(false);

  // Sync with global language changes
  useEffect(() => {
    if (globalLang === "hi") setDisplayLanguage("HI");
  }, [globalLang]);

  // Load Inventory Counts whenever paper filter changes
  useEffect(() => {
    async function loadInventory() {
      try {
        const queryParams = new URLSearchParams();
        if (selectedPaper && selectedPaper !== "ALL") {
          queryParams.set("paper", selectedPaper);
        }
        const res = await fetch(`/api/v1/pyqs/inventory?${queryParams.toString()}`);
        const json = await res.json();
        if (json.success) {
          setYearInventory(json.data.years || []);
          setSubjectInventory(json.data.subjects || []);
        }
      } catch (e) {
        console.error("Failed to load inventory:", e);
      }
    }
    loadInventory();
  }, [selectedPaper]);

  // Update URL search parameters
  const updateURL = useCallback(
    (paper: string, year: number | null, subject: string, q: string) => {
      const params = new URLSearchParams();
      if (paper) params.set("paper", paper);
      if (year) params.set("year", year.toString());
      if (subject) params.set("subject", subject);
      if (q.trim()) params.set("q", q.trim());
      router.replace(`/prelims/pyqs?${params.toString()}`, { scroll: false });
    },
    [router]
  );

  // Fetch Questions
  const fetchQuestions = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.set("exam", activeExamTab === "CSE" ? "CSE" : "ALL");
      if (selectedPaper) params.set("paper", selectedPaper);
      if (selectedYear) params.set("year", selectedYear.toString());
      if (selectedSubject) params.set("subject", selectedSubject);
      if (selectedDifficulty) params.set("difficulty", selectedDifficulty);
      if (searchQuery.trim()) params.set("q", searchQuery.trim());
      params.set("page", page.toString());
      params.set("limit", "24");

      const res = await fetch(`/api/v1/pyqs?${params.toString()}`);
      const json = await res.json();

      if (json.success) {
        setQuestions(json.data);
        setTotalCount(json.meta?.total || json.data.length);
        setHasMore(json.meta?.hasMore || false);
      }
    } catch (e) {
      console.error("Failed to fetch questions:", e);
    } finally {
      setLoading(false);
    }
  }, [activeExamTab, selectedPaper, selectedYear, selectedSubject, selectedDifficulty, searchQuery, page]);

  useEffect(() => {
    fetchQuestions();
    updateURL(selectedPaper, selectedYear, selectedSubject, searchQuery);
  }, [fetchQuestions, selectedPaper, selectedYear, selectedSubject, searchQuery, updateURL]);

  // Handle Option Click
  const handleOptionSelect = (questionId: string, optionCode: string) => {
    if (viewMode === "exam" && !examSubmitted) {
      setAttemptedAnswers((prev) => ({ ...prev, [questionId]: optionCode }));
      return;
    }

    if (!attemptedAnswers[questionId]) {
      setAttemptedAnswers((prev) => ({ ...prev, [questionId]: optionCode }));
    }
  };

  // Clear all filters
  const handleClearAll = () => {
    setSelectedPaper("GS1");
    setSelectedYear(null);
    setSelectedSubject("");
    setSelectedDifficulty("");
    setSearchQuery("");
    setPage(1);
    router.replace("/prelims/pyqs", { scroll: false });
  };

  // Bookmark toggle
  const toggleBookmark = (id: string) => {
    setBookmarkedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Copy shareable question link
  const copyQuestionLink = (id: string) => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(`${window.location.origin}/prelims/pyqs?q=${id}`);
      setCopiedQuestionId(id);
      setTimeout(() => setCopiedQuestionId(null), 2000);
    }
  };

  // Exam Timer Countdown
  useEffect(() => {
    if (viewMode !== "exam" || examSubmitted) return;
    const interval = setInterval(() => {
      setExamTimer((t) => (t > 0 ? t - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [viewMode, examSubmitted]);

  // Calculate Exam Score
  const examStats = useMemo(() => {
    let attempted = 0;
    let correct = 0;
    let incorrect = 0;
    let totalMarks = 0;

    questions.forEach((q) => {
      const selected = attemptedAnswers[q.id];
      const correctOption =
        q.verifiedAnswer?.answerOption || q.options.find((o) => o.isCorrect)?.code || "A";
      const marksPositive = q.marks || (q.paperCode === "GS2" ? 2.5 : 2.0);
      const marksNegative = q.negativeMarks || (q.paperCode === "GS2" ? 0.833 : 0.666);

      if (selected) {
        attempted++;
        if (selected === correctOption) {
          correct++;
          totalMarks += marksPositive;
        } else {
          incorrect++;
          totalMarks -= marksNegative;
        }
      }
    });

    return {
      attempted,
      correct,
      incorrect,
      totalMarks: Math.max(0, totalMarks).toFixed(2),
      accuracy: attempted > 0 ? Math.round((correct / attempted) * 100) : 0,
    };
  }, [questions, attemptedAnswers]);

  // Heritage Year Badge Style Helper
  const getYearBadgeStyle = (year: number, isSelected: boolean) => {
    if (isSelected) {
      return "bg-heritage-burgundy text-white font-extrabold shadow-xs scale-105 border-heritage-burgundy";
    }
    return "bg-white text-heritage-secondary hover:border-heritage-gold hover:text-heritage-text border-heritage-border";
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {/* 1. Top Exam Selector Tabs */}
      <div className="flex items-center gap-6 border-b border-heritage-border pb-2 mb-6">
        <button
          onClick={() => {
            setActiveExamTab("CSE");
            setPage(1);
          }}
          className={`relative pb-2 text-sm font-serif font-bold transition ${
            activeExamTab === "CSE"
              ? "text-heritage-burgundy after:absolute after:bottom-[-9px] after:left-0 after:right-0 after:h-0.5 after:bg-heritage-burgundy"
              : "text-heritage-secondary hover:text-heritage-text"
          }`}
        >
          UPSC CSE
        </button>
        <button
          onClick={() => {
            setActiveExamTab("OTHER");
            setPage(1);
          }}
          className={`relative pb-2 text-sm font-serif font-medium transition ${
            activeExamTab === "OTHER"
              ? "text-heritage-burgundy font-bold after:absolute after:bottom-[-9px] after:left-0 after:right-0 after:h-0.5 after:bg-heritage-burgundy"
              : "text-heritage-secondary hover:text-heritage-text"
          }`}
        >
          Other UPSC Exams{" "}
          <span className="text-[11px] text-heritage-secondary/70 font-sans font-normal ml-1 hidden sm:inline">
            CAPF · CDS · CISF · CGS · EPFO ...
          </span>
        </button>
      </div>

      {/* 2. Page Title & Mode Controls */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-heritage-text">
            Prelims · Previous-Year Questions <span className="sr-only">Prelims PYQ Explorer</span>
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-heritage-secondary">
            Attempt official UPSC Prelims MCQs year by year — instant bilingual toggle, Series A official answer keys, and pedagogical trap analysis.
          </p>
        </div>

        {/* Mode Switchers and Language Toggle */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Bilingual Toggle */}
          <div className="flex items-center rounded-xl border border-heritage-border bg-heritage-ivory p-0.5 text-xs font-bold">
            <button
              onClick={() => setDisplayLanguage("EN")}
              className={`rounded-lg px-2.5 py-1 transition ${
                displayLanguage === "EN" ? "bg-heritage-burgundy text-white shadow-xs font-bold" : "text-heritage-secondary hover:text-heritage-text"
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setDisplayLanguage("HI")}
              className={`rounded-lg px-2.5 py-1 font-hindi transition ${
                displayLanguage === "HI" ? "bg-heritage-burgundy text-white shadow-xs font-bold" : "text-heritage-secondary hover:text-heritage-text"
              }`}
            >
              हिन्दी
            </button>
            <button
              onClick={() => setDisplayLanguage("BOTH")}
              className={`rounded-lg px-2.5 py-1 transition ${
                displayLanguage === "BOTH" ? "bg-heritage-burgundy text-white shadow-xs font-bold" : "text-heritage-secondary hover:text-heritage-text"
              }`}
            >
              Both
            </button>
          </div>

          {/* Mode Selector */}
          <div className="flex items-center rounded-xl border border-heritage-border bg-white p-0.5 text-xs font-bold shadow-card">
            <button
              onClick={() => setViewMode("practice")}
              className={`flex items-center gap-1 rounded-lg px-3 py-1.5 transition ${
                viewMode === "practice" ? "bg-heritage-cream text-heritage-burgundy font-bold" : "text-heritage-secondary hover:text-heritage-text"
              }`}
            >
              <List className="h-3.5 w-3.5 text-heritage-gold" /> Practice
            </button>
            <button
              onClick={() => setViewMode("focus")}
              className={`flex items-center gap-1 rounded-lg px-3 py-1.5 transition ${
                viewMode === "focus" ? "bg-heritage-cream text-heritage-burgundy font-bold" : "text-heritage-secondary hover:text-heritage-text"
              }`}
            >
              <Maximize2 className="h-3.5 w-3.5 text-heritage-gold" /> Focus (1Q)
            </button>
            <button
              onClick={() => setViewMode("exam")}
              className={`flex items-center gap-1 rounded-lg px-3 py-1.5 transition ${
                viewMode === "exam" ? "bg-heritage-saffron/15 text-heritage-saffron font-bold" : "text-heritage-secondary hover:text-heritage-text"
              }`}
            >
              <Clock className="h-3.5 w-3.5 text-heritage-saffron" /> Timed Exam
            </button>
          </div>
        </div>
      </div>

      {/* 3. Search Bar with Smart / Keyword Tabs */}
      <div className="mb-6 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSearchMode("smart")}
              className={`flex items-center gap-1.5 rounded-t-xl px-3.5 py-1.5 text-xs font-bold transition ${
                searchMode === "smart"
                  ? "bg-heritage-burgundy text-white shadow-xs"
                  : "bg-heritage-cream/60 text-heritage-secondary hover:bg-heritage-cream hover:text-heritage-text"
              }`}
            >
              <Sparkles className="h-3.5 w-3.5 text-heritage-gold" /> Smart Search
            </button>
            <button
              onClick={() => setSearchMode("keyword")}
              className={`flex items-center gap-1.5 rounded-t-xl px-3.5 py-1.5 text-xs font-bold transition ${
                searchMode === "keyword"
                  ? "bg-heritage-wine text-white shadow-xs"
                  : "bg-heritage-cream/60 text-heritage-secondary hover:bg-heritage-cream hover:text-heritage-text"
              }`}
            >
              <Search className="h-3.5 w-3.5 text-heritage-gold" /> Keyword Search
            </button>
          </div>
          <span className="text-[11px] font-medium text-heritage-secondary">
            Verified official UPSC question bank
          </span>
        </div>

        <div className="relative flex items-center">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchQuestions()}
            placeholder={
              searchMode === "smart"
                ? '✨ Smart Search — ask in plain English, e.g. "questions on monsoon mechanism or biodiversity treaties"'
                : '🔍 Keyword Search — e.g. "Article 39", "Ramsar", "Lopamudra", "Green Hydrogen"'
            }
            className="w-full rounded-2xl border border-heritage-border bg-white py-3 pl-4 pr-28 text-sm text-heritage-text shadow-card placeholder:text-heritage-secondary/70 focus:border-heritage-gold focus:outline-none focus:ring-2 focus:ring-heritage-gold/20"
          />
          <button
            onClick={fetchQuestions}
            className="absolute right-2 rounded-xl bg-heritage-burgundy px-5 py-2 text-xs font-bold text-white shadow hover:bg-heritage-wine transition"
          >
            Search
          </button>
        </div>
      </div>

      {/* 4. Filters Panel */}
      <div className="mb-6 rounded-2xl border border-heritage-border bg-white p-4 sm:p-5 shadow-card space-y-4">
        {/* Filter Header */}
        <div className="flex items-center justify-between pb-2 border-b border-heritage-border/60">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-heritage-secondary">
              FILTERS
            </span>
            {(selectedPaper !== "GS1" || selectedYear || selectedSubject || selectedDifficulty || searchQuery) && (
              <button
                onClick={handleClearAll}
                className="flex items-center gap-1 rounded-full bg-heritage-wine text-white px-2.5 py-0.5 text-[11px] font-bold hover:bg-heritage-burgundy transition"
              >
                Clear all <X className="h-3 w-3" />
              </button>
            )}
          </div>
          <span className="rounded-lg bg-heritage-cream text-heritage-burgundy border border-heritage-border px-3 py-1 text-xs font-extrabold">
            {totalCount} questions
          </span>
        </div>

        {/* Paper Switcher Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              setSelectedPaper("GS1");
              setPage(1);
            }}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition shadow-xs ${
              selectedPaper === "GS1"
                ? "bg-heritage-burgundy text-white"
                : "bg-heritage-ivory text-heritage-secondary hover:bg-heritage-cream hover:text-heritage-text border border-heritage-border"
            }`}
          >
            GS Paper 1 <span className="sr-only">(GS Paper I)</span>
          </button>
          <button
            onClick={() => {
              setSelectedPaper("GS2");
              setPage(1);
            }}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition shadow-xs ${
              selectedPaper === "GS2"
                ? "bg-heritage-saffron text-white"
                : "bg-heritage-ivory text-heritage-secondary hover:bg-heritage-cream hover:text-heritage-text border border-heritage-border"
            }`}
          >
            GS Paper 2 (CSAT)
          </button>
        </div>

        {/* Year Pills Row with Count Badges */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 pt-1">
          <button
            onClick={() => {
              setSelectedYear(null);
              setPage(1);
            }}
            className={`rounded-lg border px-3 py-1 text-xs font-bold transition ${
              selectedYear === null
                ? "bg-heritage-burgundy text-white border-heritage-burgundy font-extrabold shadow-xs"
                : "border-heritage-border bg-white text-heritage-secondary hover:bg-heritage-ivory"
            }`}
          >
            All years
          </button>

          {/* Preset Pill: Last 5 Years */}
          <button
            onClick={() => {
              setSelectedYear(2024);
              setPage(1);
            }}
            className="rounded-lg border border-heritage-border bg-white px-2.5 py-1 text-xs font-medium text-heritage-secondary hover:bg-heritage-ivory hidden sm:inline-block transition"
          >
            Last 5 years <span className="text-[10px] text-heritage-secondary/70">2020–2024</span>
          </button>

          {/* Preset Pill: Last 10 Years */}
          <button
            onClick={() => {
              setSelectedYear(2024);
              setPage(1);
            }}
            className="rounded-lg border border-heritage-border bg-white px-2.5 py-1 text-xs font-medium text-heritage-secondary hover:bg-heritage-ivory hidden md:inline-block transition"
          >
            Last 10 years <span className="text-[10px] text-heritage-secondary/70">2015–2024</span>
          </button>

          {/* Dynamic Year Pills */}
          {yearInventory.map((item) => {
            const isSelected = selectedYear === item.year;
            return (
              <button
                key={item.year}
                onClick={() => {
                  setSelectedYear(isSelected ? null : item.year);
                  setPage(1);
                }}
                className={`rounded-lg border px-2.5 py-1 text-xs font-bold transition flex items-center gap-1 ${getYearBadgeStyle(
                  item.year,
                  isSelected
                )}`}
              >
                <span>{item.year}</span>
                <span className={`text-[10px] ${isSelected ? "text-heritage-gold" : "opacity-75"}`}>
                  ({item.count})
                </span>
              </button>
            );
          })}
        </div>

        {/* Taxonomy & Difficulty Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
          {/* Subject Dropdown */}
          <div>
            <select
              value={selectedSubject}
              onChange={(e) => {
                setSelectedSubject(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-xl border border-heritage-border bg-white px-3 py-2 text-xs font-semibold text-heritage-text focus:border-heritage-gold focus:outline-none"
            >
              <option value="">All subjects</option>
              {subjectInventory
                .filter((s) => (selectedPaper ? s.paperCode === selectedPaper : true))
                .map((s) => (
                  <option key={s.id} value={s.slug}>
                    {s.name} ({s.count})
                  </option>
                ))}
            </select>
          </div>

          {/* Difficulty Dropdown */}
          <div>
            <select
              value={selectedDifficulty}
              onChange={(e) => {
                setSelectedDifficulty(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-xl border border-heritage-border bg-white px-3 py-2 text-xs font-semibold text-heritage-text focus:border-heritage-gold focus:outline-none"
            >
              <option value="">All Difficulties</option>
              <option value="EASY">Easy</option>
              <option value="MEDIUM">Medium</option>
              <option value="HARD">Hard</option>
            </select>
          </div>

          {/* Marking Scheme Indicator */}
          <div className="flex items-center justify-end text-xs text-heritage-secondary font-mono">
            {selectedPaper === "GS2" ? (
              <span className="rounded-lg bg-heritage-saffron/10 px-2.5 py-1 text-heritage-saffron font-bold border border-heritage-saffron/30">
                CSAT Marking: +2.5 / -0.833
              </span>
            ) : (
              <span className="rounded-lg bg-heritage-burgundy/10 px-2.5 py-1 text-heritage-burgundy font-bold border border-heritage-burgundy/30">
                GS1 Marking: +2.0 / -0.666
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Timed Exam Floating Header */}
      {viewMode === "exam" && (
        <div className="mb-6 sticky top-4 z-30 rounded-2xl bg-heritage-wine text-white p-4 shadow-xl border border-heritage-gold/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-heritage-gold animate-pulse" />
            <div>
              <p className="text-xs text-heritage-gold/80">Exam Timer</p>
              <p className="font-mono text-lg font-black text-heritage-gold">
                {Math.floor(examTimer / 3600)}h {Math.floor((examTimer % 3600) / 60)}m{" "}
                {examTimer % 60}s
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right text-xs">
              <span className="text-heritage-cream/70">Attempted: </span>
              <span className="font-bold text-white">
                {Object.keys(attemptedAnswers).length} / {questions.length}
              </span>
            </div>
            {!examSubmitted ? (
              <button
                onClick={() => setExamSubmitted(true)}
                className="rounded-xl bg-emerald-600 hover:bg-emerald-700 px-4 py-2 text-xs font-bold text-white shadow transition"
              >
                Submit Exam
              </button>
            ) : (
              <button
                onClick={() => {
                  setExamSubmitted(false);
                  setAttemptedAnswers({});
                }}
                className="rounded-xl bg-heritage-burgundy hover:bg-heritage-wine px-4 py-2 text-xs font-bold text-white transition"
              >
                Reset Exam
              </button>
            )}
          </div>
        </div>
      )}

      {/* Exam Score Summary Bar (when submitted) */}
      {viewMode === "exam" && examSubmitted && (
        <div className="mb-6 rounded-2xl bg-gradient-to-r from-heritage-burgundy to-heritage-wine text-white p-6 shadow-gold border border-heritage-gold/30">
          <div className="flex items-center gap-3 mb-4">
            <Award className="h-8 w-8 text-heritage-gold" />
            <div>
              <h2 className="font-serif text-xl font-bold">Exam Performance Summary</h2>
              <p className="text-xs text-heritage-cream/80">
                Computed with official UPSC negative marking criteria
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div className="rounded-xl bg-white/10 p-3.5 backdrop-blur-xs">
              <p className="text-xs text-heritage-cream/80">Final Score</p>
              <p className="text-2xl font-black text-heritage-gold">{examStats.totalMarks}</p>
            </div>
            <div className="rounded-xl bg-white/10 p-3.5 backdrop-blur-xs">
              <p className="text-xs text-heritage-cream/80">Correct</p>
              <p className="text-2xl font-black text-emerald-300">{examStats.correct}</p>
            </div>
            <div className="rounded-xl bg-white/10 p-3.5 backdrop-blur-xs">
              <p className="text-xs text-heritage-cream/80">Incorrect</p>
              <p className="text-2xl font-black text-rose-300">{examStats.incorrect}</p>
            </div>
            <div className="rounded-xl bg-white/10 p-3.5 backdrop-blur-xs">
              <p className="text-xs text-heritage-cream/80">Accuracy</p>
              <p className="text-2xl font-black text-amber-200">{examStats.accuracy}%</p>
            </div>
          </div>
        </div>
      )}

      {/* 5. Main Questions Display: 2-Column Grid */}
      {loading ? (
        <div className="py-24 text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-heritage-burgundy border-t-transparent mb-3" />
          <p className="text-xs font-bold text-heritage-secondary">Loading authentic UPSC questions...</p>
        </div>
      ) : questions.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-heritage-border bg-white py-20 text-center shadow-card">
          <BookOpen className="mx-auto h-10 w-10 text-heritage-gold mb-2" />
          <p className="font-serif text-lg font-bold text-heritage-text">No questions found</p>
          <p className="text-xs text-heritage-secondary mt-1">Try clearing your filters or choosing another year.</p>
          <button
            onClick={handleClearAll}
            className="mt-4 rounded-xl bg-heritage-burgundy px-5 py-2.5 text-xs font-bold text-white hover:bg-heritage-wine transition"
          >
            Clear Filters
          </button>
        </div>
      ) : viewMode === "focus" ? (
        /* Focus Mode: 1 Question at a time with Keyboard / Arrow controls */
        <div className="max-w-3xl mx-auto space-y-4">
          <div className="flex items-center justify-between text-xs font-bold text-heritage-secondary">
            <span>Question {focusIndex + 1} of {questions.length}</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setFocusIndex((i) => Math.max(0, i - 1))}
                disabled={focusIndex === 0}
                className="rounded-lg border border-heritage-border bg-white p-1.5 text-heritage-text disabled:opacity-40 hover:bg-heritage-ivory"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => setFocusIndex((i) => Math.min(questions.length - 1, i + 1))}
                disabled={focusIndex === questions.length - 1}
                className="rounded-lg border border-heritage-border bg-white p-1.5 text-heritage-text disabled:opacity-40 hover:bg-heritage-ivory"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
          <QuestionCardItem
            question={questions[focusIndex]}
            attemptedCode={attemptedAnswers[questions[focusIndex].id]}
            onSelectOption={(code) => handleOptionSelect(questions[focusIndex].id, code)}
            isBookmarked={Boolean(bookmarkedIds[questions[focusIndex].id])}
            onToggleBookmark={() => toggleBookmark(questions[focusIndex].id)}
            onOpenNote={() => {
              setActiveNoteModalQ(questions[focusIndex]);
              setTempNoteText(userNotes[questions[focusIndex].id] || "");
            }}
            onCopyLink={() => copyQuestionLink(questions[focusIndex].id)}
            isCopied={copiedQuestionId === questions[focusIndex].id}
            displayLanguage={displayLanguage}
            showInstantFeedback={true}
          />
        </div>
      ) : (
        /* Grid Mode: 2 Columns on large screens */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {questions.map((q) => (
            <QuestionCardItem
              key={q.id}
              question={q}
              attemptedCode={attemptedAnswers[q.id]}
              onSelectOption={(code) => handleOptionSelect(q.id, code)}
              isBookmarked={Boolean(bookmarkedIds[q.id])}
              onToggleBookmark={() => toggleBookmark(q.id)}
              onOpenNote={() => {
                setActiveNoteModalQ(q);
                setTempNoteText(userNotes[q.id] || "");
              }}
              onCopyLink={() => copyQuestionLink(q.id)}
              isCopied={copiedQuestionId === q.id}
              displayLanguage={displayLanguage}
              showInstantFeedback={(viewMode as string) !== "exam" || examSubmitted}
            />
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {!loading && questions.length > 0 && (
        <div className="mt-8 flex items-center justify-between border-t border-heritage-border pt-4">
          <p className="text-xs text-heritage-secondary">
            Page <span className="font-bold text-heritage-text">{page}</span> of{" "}
            <span className="font-bold text-heritage-text">{Math.ceil(totalCount / 24) || 1}</span>
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="rounded-xl border border-heritage-border bg-white px-3.5 py-2 text-xs font-bold text-heritage-text shadow-xs disabled:opacity-40 hover:bg-heritage-ivory transition"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={!hasMore}
              className="rounded-xl border border-heritage-border bg-white px-3.5 py-2 text-xs font-bold text-heritage-text shadow-xs disabled:opacity-40 hover:bg-heritage-ivory transition"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Note Modal */}
      {activeNoteModalQ && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-heritage-border">
            <div className="flex items-center justify-between pb-3 border-b border-heritage-border">
              <h3 className="font-serif text-sm font-bold text-heritage-text flex items-center gap-1.5">
                <FileEdit className="h-4 w-4 text-heritage-gold" /> Study Note ({activeNoteModalQ.year} Q{activeNoteModalQ.questionNumber})
              </h3>
              <button
                onClick={() => setActiveNoteModalQ(null)}
                className="text-heritage-secondary hover:text-heritage-text"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <textarea
              rows={4}
              value={tempNoteText}
              onChange={(e) => setTempNoteText(e.target.value)}
              placeholder="Write personal revision notes, mnemonics, or conceptual reminders..."
              className="mt-4 w-full rounded-xl border border-heritage-border p-3 text-xs text-heritage-text focus:border-heritage-gold focus:outline-none"
            />
            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                onClick={() => setActiveNoteModalQ(null)}
                className="rounded-lg border border-heritage-border px-3.5 py-1.5 text-xs font-bold text-heritage-secondary hover:bg-heritage-ivory"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setUserNotes((prev) => ({ ...prev, [activeNoteModalQ.id]: tempNoteText }));
                  setActiveNoteModalQ(null);
                }}
                className="rounded-lg bg-heritage-burgundy px-4 py-1.5 text-xs font-bold text-white shadow hover:bg-heritage-wine transition"
              >
                Save Note
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Feedback Button */}
      <button
        onClick={() => {
          setFeedbackModalOpen(true);
          setFeedbackSent(false);
          setFeedbackText("");
        }}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full bg-heritage-burgundy px-5 py-3 text-xs font-bold text-white shadow-gold hover:bg-heritage-wine transition transform hover:scale-105"
      >
        <MessageSquare className="h-4 w-4 text-heritage-gold" />
        <span>Feedback</span>
      </button>

      {/* Floating Feedback Modal */}
      {feedbackModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-heritage-border">
            <div className="flex items-center justify-between pb-3 border-b border-heritage-border">
              <h3 className="font-serif text-sm font-bold text-heritage-text flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-heritage-gold" /> Aspirant Feedback & Correction
              </h3>
              <button
                onClick={() => setFeedbackModalOpen(false)}
                className="text-heritage-secondary hover:text-heritage-text"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {feedbackSent ? (
              <div className="py-6 text-center">
                <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-600 mb-2" />
                <p className="font-serif text-sm font-bold text-heritage-text">Thank you for your feedback!</p>
                <p className="text-xs text-heritage-secondary mt-1">Our academic team will audit this within 24 hours.</p>
                <button
                  onClick={() => setFeedbackModalOpen(false)}
                  className="mt-4 rounded-xl bg-heritage-burgundy px-4 py-2 text-xs font-bold text-white"
                >
                  Close
                </button>
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold text-heritage-secondary mb-1">Category</label>
                  <select
                    value={feedbackCategory}
                    onChange={(e: any) => setFeedbackCategory(e.target.value)}
                    className="w-full rounded-xl border border-heritage-border p-2 text-xs text-heritage-text focus:outline-none focus:ring-1 focus:ring-heritage-gold"
                  >
                    <option value="QUESTION_ERROR">Discrepancy in question or key</option>
                    <option value="EXPLANATION_QUERY">Explanation query or suggestion</option>
                    <option value="FEATURE_REQUEST">Feature request / UI improvement</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-heritage-secondary mb-1">Details</label>
                  <textarea
                    rows={4}
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    placeholder="Describe the issue or improvement..."
                    className="w-full rounded-xl border border-heritage-border p-3 text-xs text-heritage-text focus:outline-none focus:ring-1 focus:ring-heritage-gold"
                  />
                </div>
                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    onClick={() => setFeedbackModalOpen(false)}
                    className="rounded-lg border border-heritage-border px-3 py-1.5 text-xs font-bold text-heritage-secondary hover:bg-heritage-ivory"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => setFeedbackSent(true)}
                    disabled={!feedbackText.trim()}
                    className="rounded-lg bg-heritage-burgundy px-4 py-1.5 text-xs font-bold text-white shadow hover:bg-heritage-wine disabled:opacity-40 transition"
                  >
                    Submit Feedback
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Question Card Item Component
 */
function QuestionCardItem({
  question,
  attemptedCode,
  onSelectOption,
  isBookmarked,
  onToggleBookmark,
  onOpenNote,
  onCopyLink,
  isCopied,
  displayLanguage,
  showInstantFeedback,
}: {
  question: QuestionData;
  attemptedCode?: string;
  onSelectOption: (code: string) => void;
  isBookmarked: boolean;
  onToggleBookmark: () => void;
  onOpenNote: () => void;
  onCopyLink: () => void;
  isCopied: boolean;
  displayLanguage: "EN" | "HI" | "BOTH";
  showInstantFeedback: boolean;
}) {
  const [showExplanationManual, setShowExplanationManual] = useState(false);

  const correctCode =
    question.verifiedAnswer?.answerOption ||
    question.options.find((o) => o.isCorrect)?.code ||
    "A";

  const isAttempted = Boolean(attemptedCode);
  const isCorrect = isAttempted && attemptedCode === correctCode;
  const isRevealed = (isAttempted && showInstantFeedback) || showExplanationManual;

  const marksPos = question.marks || (question.paperCode === "GS2" ? 2.5 : 2.0);
  const marksNeg = question.negativeMarks || (question.paperCode === "GS2" ? 0.833 : 0.666);

  return (
    <div className="rounded-2xl border border-heritage-border bg-white p-5 shadow-card hover:shadow-hover transition flex flex-col justify-between">
      <div>
        {/* Top Badges Row */}
        <div className="flex flex-wrap items-center gap-1.5 mb-3">
          {/* Year Badge */}
          <span className="rounded bg-heritage-wine px-2.5 py-0.5 text-xs font-bold text-white">
            {question.year}
          </span>
          {/* Subject Badge */}
          {question.subject && (
            <span className="rounded bg-heritage-cream text-heritage-burgundy border border-heritage-border px-2.5 py-0.5 text-xs font-semibold">
              {question.subject}
            </span>
          )}
          {/* Topic Badge */}
          {question.topic && (
            <span className="rounded bg-heritage-ivory text-heritage-secondary border border-heritage-border px-2.5 py-0.5 text-xs font-medium hidden sm:inline-block">
              {question.topic}
            </span>
          )}
          {/* Difficulty Badge */}
          {question.difficulty && (
            <span className="rounded bg-heritage-gold/20 text-heritage-burgundy border border-heritage-gold/30 px-2.5 py-0.5 text-xs font-semibold">
              {question.difficulty.toLowerCase()}
            </span>
          )}
          {/* Marks Badge */}
          <span className="ml-auto text-[11px] font-mono text-heritage-secondary">
            +{marksPos} / -{marksNeg}
          </span>
        </div>

        {/* Question Statement */}
        <div className="mb-4">
          {(displayLanguage === "EN" || displayLanguage === "BOTH" || !question.questionTextHi) && (
            <h2 className="font-serif text-sm sm:text-base font-bold text-heritage-text leading-snug">
              Q{question.questionNumber}. {question.questionTextEn || question.questionText}
            </h2>
          )}

          {(displayLanguage === "HI" || (displayLanguage === "BOTH" && question.questionTextHi)) && (
            <h2 className="font-serif text-sm sm:text-base font-bold text-heritage-text font-hindi mt-1.5 leading-snug">
              प्र{question.questionNumber}. {question.questionTextHi}
            </h2>
          )}
        </div>

        {/* Clickable 4 Options (A, B, C, D) */}
        <div className="space-y-2 mb-4 font-sans">
          {question.options.map((opt) => {
            const isSelected = attemptedCode === opt.code;
            const isThisOptionCorrect = opt.code === correctCode;

            let optionStyle =
              "border-heritage-border bg-white hover:border-heritage-gold hover:bg-heritage-ivory/50 text-heritage-text";

            if (isRevealed) {
              if (isThisOptionCorrect) {
                optionStyle = "border-emerald-500 bg-emerald-50/80 text-emerald-950 font-semibold";
              } else if (isSelected && !isThisOptionCorrect) {
                optionStyle = "border-rose-400 bg-rose-50 text-rose-950 line-through opacity-80";
              } else {
                optionStyle = "border-heritage-border/40 bg-heritage-ivory/30 text-heritage-secondary/70";
              }
            } else if (isSelected) {
              optionStyle = "border-heritage-burgundy bg-heritage-cream text-heritage-burgundy font-bold";
            }

            return (
              <button
                key={opt.code}
                onClick={() => onSelectOption(opt.code)}
                disabled={isRevealed}
                className={`w-full rounded-xl border p-3 text-left text-xs sm:text-sm transition flex items-start gap-3 ${optionStyle}`}
              >
                <span
                  className={`inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                    isRevealed && isThisOptionCorrect
                      ? "bg-emerald-600 text-white"
                      : isRevealed && isSelected && !isThisOptionCorrect
                      ? "bg-rose-500 text-white"
                      : isSelected
                      ? "bg-heritage-burgundy text-white"
                      : "bg-heritage-cream border border-heritage-border text-heritage-burgundy"
                  }`}
                >
                  {opt.code}
                </span>

                <div className="flex-1">
                  {(displayLanguage === "EN" || displayLanguage === "BOTH" || !opt.textHi) && (
                    <span>{opt.textEn || opt.text}</span>
                  )}
                  {(displayLanguage === "HI" || (displayLanguage === "BOTH" && opt.textHi)) && (
                    <span className="block font-hindi text-heritage-text mt-0.5">{opt.textHi}</span>
                  )}
                </div>

                {isRevealed && isThisOptionCorrect && (
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 ml-auto" />
                )}
                {isRevealed && isSelected && !isThisOptionCorrect && (
                  <XCircle className="h-4 w-4 shrink-0 text-rose-500 ml-auto" />
                )}
              </button>
            );
          })}
        </div>

        {/* Revealed Explanation & Elimination Drawer */}
        {isRevealed && (
          <div className="rounded-xl border border-heritage-gold/30 bg-heritage-ivory/80 p-4 space-y-3 mb-4 text-xs animate-in fade-in duration-200">
            {/* Official Answer & Score Result */}
            <div className="flex items-center justify-between pb-2 border-b border-heritage-border/60">
              <span className="font-bold text-heritage-burgundy flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Official UPSC Final Key:{" "}
                <span className="rounded bg-emerald-600 text-white px-2 py-0.5 text-xs font-black">
                  Option {correctCode}
                </span>
              </span>
              {isAttempted && (
                <span
                  className={`font-mono font-bold ${
                    isCorrect ? "text-emerald-700" : "text-rose-600"
                  }`}
                >
                  {isCorrect ? `+${marksPos} Marks` : `-${marksNeg} Negative`}
                </span>
              )}
            </div>

            {/* UPSC Elimination Technique & Trap Analysis */}
            {question.explanation?.eliminationTechnique && (
              <div className="rounded-xl bg-heritage-cream/90 border border-heritage-gold/40 p-3 text-heritage-text space-y-1">
                <p className="font-bold flex items-center gap-1.5 text-[11px] text-heritage-burgundy uppercase tracking-wider">
                  <Sparkles className="h-3.5 w-3.5 text-heritage-gold" /> UPSC Elimination Technique & Trap Analysis
                </p>
                <p className="text-xs leading-relaxed text-heritage-text">
                  {question.explanation.eliminationTechnique}
                </p>
              </div>
            )}

            {/* Pedagogical Explanation */}
            <div>
              <p className="font-bold text-heritage-burgundy mb-1 uppercase tracking-wider text-[10px]">Detailed Explanation:</p>
              <p className="leading-relaxed text-heritage-text">
                {question.explanation?.detailedExplanation || question.explanation?.summary}
              </p>
              {question.explanation?.explanationHi && (
                <p className="leading-relaxed text-heritage-text font-hindi mt-2 pt-2 border-t border-heritage-border/40">
                  {question.explanation.explanationHi}
                </p>
              )}
            </div>

            {/* Source Citation */}
            {(question.explanation?.sourceCitation || question.citations?.[0]) && (
              <p className="text-[11px] text-heritage-secondary pt-1 border-t border-heritage-border/60">
                <span className="font-bold text-heritage-text">Source Reference:</span>{" "}
                {question.explanation?.sourceCitation || question.citations?.[0]?.sourceName}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Card Action Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-heritage-border/60 text-heritage-secondary text-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleBookmark}
            className={`flex items-center gap-1 transition ${
              isBookmarked ? "text-heritage-burgundy font-bold" : "hover:text-heritage-text"
            }`}
            title="Bookmark for revision"
          >
            <Bookmark className={`h-4 w-4 ${isBookmarked ? "fill-heritage-burgundy" : ""}`} />
            <span className="hidden sm:inline">Save</span>
          </button>

          <button
            onClick={onOpenNote}
            className="flex items-center gap-1 hover:text-heritage-text transition"
            title="Add personal study note"
          >
            <FileEdit className="h-4 w-4" />
            <span className="hidden sm:inline">Note</span>
          </button>

          <button
            onClick={onCopyLink}
            className="flex items-center gap-1 hover:text-heritage-text transition"
            title="Copy question link"
          >
            {isCopied ? <Check className="h-4 w-4 text-emerald-600" /> : <Share2 className="h-4 w-4" />}
            <span className="hidden sm:inline">{isCopied ? "Copied" : "Share"}</span>
          </button>
        </div>

        <div>
          {!isAttempted && (
            <button
              onClick={() => setShowExplanationManual((prev) => !prev)}
              className="text-heritage-burgundy font-bold hover:underline text-xs"
            >
              {showExplanationManual ? "Hide Answer" : "Reveal Answer"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PrelimsPYQPage() {
  return (
    <Suspense
      fallback={
        <div className="py-24 text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-heritage-burgundy border-t-transparent mb-3" />
          <p className="text-xs font-bold text-heritage-secondary">
            Loading Pravaah UPSC Prelims PYQ Explorer Platform (GS Paper I & CSAT)...
          </p>
        </div>
      }
    >
      <PrelimsPYQContent />
    </Suspense>
  );
}
