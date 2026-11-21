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

  // Floating Feedback Modal State (Matching IASBoard)
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [feedbackCategory, setFeedbackCategory] = useState<"QUESTION_ERROR" | "EXPLANATION_QUERY" | "FEATURE_REQUEST">("QUESTION_ERROR");
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackSent, setFeedbackSent] = useState(false);

  // Sync with global language changes
  useEffect(() => {
    if (globalLang === "hi") setDisplayLanguage("HI");
  }, [globalLang]);

  // Load Inventory Counts on Mount
  useEffect(() => {
    async function loadInventory() {
      try {
        const res = await fetch("/api/v1/pyqs/inventory");
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
  }, []);

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

  // Year Pill Palette Helpers (Matching IASBoard)
  const getYearBadgeStyle = (year: number, isSelected: boolean) => {
    if (isSelected) {
      return "bg-[#5b36e8] text-white font-extrabold shadow-md scale-105 border-[#5b36e8]";
    }

    // Soft pastel badge variations matching IASBoard palette
    const mod = year % 6;
    switch (mod) {
      case 0:
        return "bg-[#eceeff] text-[#4f5bd5] hover:bg-[#e0e4ff] border-transparent";
      case 1:
        return "bg-[#e8f7ee] text-[#1e874b] hover:bg-[#d6f2df] border-transparent";
      case 2:
        return "bg-[#fde8e8] text-[#c81e1e] hover:bg-[#fcd0d0] border-transparent";
      case 3:
        return "bg-[#fef3c7] text-[#92400e] hover:bg-[#fde68a] border-transparent";
      case 4:
        return "bg-[#e0f2fe] text-[#0369a1] hover:bg-[#bae6fd] border-transparent";
      default:
        return "bg-[#fce7f3] text-[#9d174d] hover:bg-[#fbcfe8] border-transparent";
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      {/* 1. Top Exam Selector Tabs (Matching IASBoard) */}
      <div className="flex items-center gap-6 border-b border-slate-200 pb-2 mb-6">
        <button
          onClick={() => {
            setActiveExamTab("CSE");
            setPage(1);
          }}
          className={`relative pb-2 text-sm font-extrabold transition ${
            activeExamTab === "CSE"
              ? "text-purple-700 after:absolute after:bottom-[-9px] after:left-0 after:right-0 after:h-0.5 after:bg-purple-700"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          UPSC CSE
        </button>
        <button
          onClick={() => {
            setActiveExamTab("OTHER");
            setPage(1);
          }}
          className={`relative pb-2 text-sm font-medium transition ${
            activeExamTab === "OTHER"
              ? "text-purple-700 font-extrabold after:absolute after:bottom-[-9px] after:left-0 after:right-0 after:h-0.5 after:bg-purple-700"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          Other UPSC Exams{" "}
          <span className="text-[11px] text-slate-400 font-normal ml-1 hidden sm:inline">
            CAPF · CDS · CISF · CGS · EPFO ...
          </span>
        </button>
      </div>

      {/* 2. Page Title & Mode Controls */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Prelims · Previous-Year Questions
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-600">
            Attempt real UPSC Prelims MCQs year by year — pick an option to see the answer, explanation and elimination technique.
          </p>
        </div>

        {/* Mode Switchers and Language Toggle */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Bilingual Toggle */}
          <div className="flex items-center rounded-lg border border-slate-200 bg-slate-100 p-0.5 text-xs font-bold">
            <button
              onClick={() => setDisplayLanguage("EN")}
              className={`rounded-md px-2.5 py-1 transition ${
                displayLanguage === "EN" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setDisplayLanguage("HI")}
              className={`rounded-md px-2.5 py-1 font-hindi transition ${
                displayLanguage === "HI" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              हिन्दी
            </button>
            <button
              onClick={() => setDisplayLanguage("BOTH")}
              className={`rounded-md px-2.5 py-1 transition ${
                displayLanguage === "BOTH" ? "bg-white text-purple-700 shadow-sm" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Both
            </button>
          </div>

          {/* Mode Selector */}
          <div className="flex items-center rounded-lg border border-slate-200 bg-white p-0.5 text-xs font-bold shadow-sm">
            <button
              onClick={() => setViewMode("practice")}
              className={`flex items-center gap-1 rounded-md px-3 py-1.5 transition ${
                viewMode === "practice" ? "bg-purple-50 text-purple-700" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <List className="h-3.5 w-3.5" /> Practice
            </button>
            <button
              onClick={() => setViewMode("focus")}
              className={`flex items-center gap-1 rounded-md px-3 py-1.5 transition ${
                viewMode === "focus" ? "bg-purple-50 text-purple-700" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Maximize2 className="h-3.5 w-3.5" /> Focus (1Q)
            </button>
            <button
              onClick={() => setViewMode("exam")}
              className={`flex items-center gap-1 rounded-md px-3 py-1.5 transition ${
                viewMode === "exam" ? "bg-amber-50 text-amber-800" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Clock className="h-3.5 w-3.5" /> Timed Exam
            </button>
          </div>
        </div>
      </div>

      {/* 3. Search Bar with Smart / Keyword Tabs (Matching IASBoard) */}
      <div className="mb-6 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSearchMode("smart")}
              className={`flex items-center gap-1.5 rounded-t-lg px-3.5 py-1.5 text-xs font-bold transition ${
                searchMode === "smart"
                  ? "bg-[#5b36e8] text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" /> Smart Search
            </button>
            <button
              onClick={() => setSearchMode("keyword")}
              className={`flex items-center gap-1.5 rounded-t-lg px-3.5 py-1.5 text-xs font-bold transition ${
                searchMode === "keyword"
                  ? "bg-slate-900 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <Search className="h-3.5 w-3.5" /> Keyword Search
            </button>
          </div>
          <span className="text-[11px] font-medium text-slate-500">
            2 of 3 free searches left
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
                ? '✨ Smart Search — ask in plain English, e.g. "questions on monsoon mechanism"'
                : '🔍 Keyword Search — e.g. "Article 39", "Ramsar", "Lopamudra"'
            }
            className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-4 pr-24 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-[#5b36e8] focus:outline-none focus:ring-1 focus:ring-[#5b36e8]"
          />
          <button
            onClick={fetchQuestions}
            className="absolute right-2 rounded-lg bg-[#5b36e8] px-5 py-2 text-xs font-bold text-white shadow hover:bg-[#4a28cb] transition"
          >
            Search
          </button>
        </div>
      </div>

      {/* 4. Filters Panel (Paper Toggle, Dynamic Year Pills, Subjects Dropdown) */}
      <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm space-y-4">
        {/* Filter Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
              FILTERS
            </span>
            {(selectedPaper !== "GS1" || selectedYear || selectedSubject || selectedDifficulty || searchQuery) && (
              <button
                onClick={handleClearAll}
                className="flex items-center gap-1 rounded-full bg-slate-900 text-white px-2.5 py-0.5 text-[11px] font-bold hover:bg-slate-800 transition"
              >
                Clear all <X className="h-3 w-3" />
              </button>
            )}
          </div>
          <span className="rounded-lg bg-[#eff2fe] text-[#4f5bd5] border border-[#dbe0fd] px-3 py-1 text-xs font-extrabold">
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
            className={`rounded-lg px-4 py-2 text-xs font-extrabold transition shadow-sm ${
              selectedPaper === "GS1"
                ? "bg-[#5b36e8] text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            GS Paper 1
          </button>
          <button
            onClick={() => {
              setSelectedPaper("GS2");
              setPage(1);
            }}
            className={`rounded-lg px-4 py-2 text-xs font-extrabold transition shadow-sm ${
              selectedPaper === "GS2"
                ? "bg-emerald-600 text-white"
                : "bg-[#e6f8ef] text-[#168a53] border border-[#bbf0d4] hover:bg-[#d6f2df]"
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
            className={`rounded-md border px-3 py-1 text-xs font-bold transition ${
              selectedYear === null
                ? "bg-purple-700 text-white border-purple-700 font-extrabold shadow-sm"
                : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
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
            className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50 hidden sm:inline-block"
          >
            Last 5 years <span className="text-[10px] text-slate-400">2020–2024</span>
          </button>

          {/* Preset Pill: Last 10 Years */}
          <button
            onClick={() => {
              setSelectedYear(2024);
              setPage(1);
            }}
            className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50 hidden md:inline-block"
          >
            Last 10 years <span className="text-[10px] text-slate-400">2015–2024</span>
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
                className={`rounded-md border px-2.5 py-1 text-xs font-bold transition flex items-center gap-1 ${getYearBadgeStyle(
                  item.year,
                  isSelected
                )}`}
              >
                <span>{item.year}</span>
                <span className={`text-[10px] ${isSelected ? "text-purple-200" : "opacity-75"}`}>
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
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 focus:border-purple-600 focus:outline-none"
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
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 focus:border-purple-600 focus:outline-none"
            >
              <option value="">All Difficulties</option>
              <option value="EASY">Easy</option>
              <option value="MEDIUM">Medium</option>
              <option value="HARD">Hard</option>
            </select>
          </div>

          {/* Marking Scheme Indicator */}
          <div className="flex items-center justify-end text-xs text-slate-500 font-mono">
            {selectedPaper === "GS2" ? (
              <span className="rounded bg-emerald-50 px-2 py-1 text-emerald-800 font-bold border border-emerald-200">
                CSAT Marking: +2.5 / -0.833
              </span>
            ) : (
              <span className="rounded bg-blue-50 px-2 py-1 text-blue-800 font-bold border border-blue-200">
                GS1 Marking: +2.0 / -0.666
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Timed Exam Floating Header */}
      {viewMode === "exam" && (
        <div className="mb-6 sticky top-4 z-30 rounded-xl bg-slate-900 text-white p-4 shadow-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-amber-400 animate-pulse" />
            <div>
              <p className="text-xs text-slate-400">Exam Timer</p>
              <p className="font-mono text-lg font-black text-amber-300">
                {Math.floor(examTimer / 3600)}h {Math.floor((examTimer % 3600) / 60)}m{" "}
                {examTimer % 60}s
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right text-xs">
              <span className="text-slate-400">Attempted: </span>
              <span className="font-bold text-white">
                {Object.keys(attemptedAnswers).length} / {questions.length}
              </span>
            </div>
            {!examSubmitted ? (
              <button
                onClick={() => setExamSubmitted(true)}
                className="rounded-lg bg-emerald-500 hover:bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow"
              >
                Submit Exam
              </button>
            ) : (
              <button
                onClick={() => {
                  setExamSubmitted(false);
                  setAttemptedAnswers({});
                }}
                className="rounded-lg bg-slate-700 hover:bg-slate-600 px-4 py-2 text-xs font-bold text-white"
              >
                Reset Exam
              </button>
            )}
          </div>
        </div>
      )}

      {/* Exam Score Summary Bar (when submitted) */}
      {viewMode === "exam" && examSubmitted && (
        <div className="mb-6 rounded-2xl bg-gradient-to-r from-purple-900 to-indigo-900 text-white p-6 shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <Award className="h-8 w-8 text-amber-400" />
            <div>
              <h2 className="text-xl font-black">Exam Performance Summary</h2>
              <p className="text-xs text-purple-200">
                Computed with UPSC official negative marking criteria
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div className="rounded-lg bg-white/10 p-3">
              <p className="text-xs text-purple-200">Final Score</p>
              <p className="text-2xl font-black text-amber-300">{examStats.totalMarks}</p>
            </div>
            <div className="rounded-lg bg-white/10 p-3">
              <p className="text-xs text-purple-200">Correct</p>
              <p className="text-2xl font-black text-emerald-400">{examStats.correct}</p>
            </div>
            <div className="rounded-lg bg-white/10 p-3">
              <p className="text-xs text-purple-200">Incorrect</p>
              <p className="text-2xl font-black text-rose-400">{examStats.incorrect}</p>
            </div>
            <div className="rounded-lg bg-white/10 p-3">
              <p className="text-xs text-purple-200">Accuracy</p>
              <p className="text-2xl font-black text-cyan-300">{examStats.accuracy}%</p>
            </div>
          </div>
        </div>
      )}

      {/* 5. Main Questions Display: 2-Column Grid matching IASBoard */}
      {loading ? (
        <div className="py-24 text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-purple-600 border-t-transparent mb-3" />
          <p className="text-xs font-bold text-slate-500">Loading authentic UPSC questions...</p>
        </div>
      ) : questions.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-20 text-center">
          <BookOpen className="mx-auto h-10 w-10 text-slate-400 mb-2" />
          <p className="text-base font-bold text-slate-700">No questions found</p>
          <p className="text-xs text-slate-500 mt-1">Try clearing your filters or choosing another year.</p>
          <button
            onClick={handleClearAll}
            className="mt-4 rounded-lg bg-purple-600 px-4 py-2 text-xs font-bold text-white hover:bg-purple-700"
          >
            Clear Filters
          </button>
        </div>
      ) : viewMode === "focus" ? (
        /* Focus Mode: 1 Question at a time with Keyboard / Arrow controls */
        <div className="max-w-3xl mx-auto space-y-4">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <span>Question {focusIndex + 1} of {questions.length}</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setFocusIndex((i) => Math.max(0, i - 1))}
                disabled={focusIndex === 0}
                className="rounded border border-slate-300 bg-white p-1 text-slate-700 disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => setFocusIndex((i) => Math.min(questions.length - 1, i + 1))}
                disabled={focusIndex === questions.length - 1}
                className="rounded border border-slate-300 bg-white p-1 text-slate-700 disabled:opacity-40"
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
        /* Grid Mode: 2 Columns on large screens, matching IASBoard layout */
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
        <div className="mt-8 flex items-center justify-between border-t border-slate-200 pt-4">
          <p className="text-xs text-slate-500">
            Page <span className="font-bold text-slate-900">{page}</span> of{" "}
            <span className="font-bold text-slate-900">{Math.ceil(totalCount / 24) || 1}</span>
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-sm disabled:opacity-40 hover:bg-slate-50"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={!hasMore}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-sm disabled:opacity-40 hover:bg-slate-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Note Modal */}
      {activeNoteModalQ && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <FileEdit className="h-4 w-4 text-purple-600" /> Study Note ({activeNoteModalQ.year} Q{activeNoteModalQ.questionNumber})
              </h3>
              <button
                onClick={() => setActiveNoteModalQ(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <textarea
              rows={4}
              value={tempNoteText}
              onChange={(e) => setTempNoteText(e.target.value)}
              placeholder="Write personal revision notes, mnemonics, or conceptual reminders..."
              className="mt-4 w-full rounded-lg border border-slate-300 p-3 text-xs text-slate-800 focus:border-purple-600 focus:outline-none"
            />
            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                onClick={() => setActiveNoteModalQ(null)}
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setUserNotes((prev) => ({ ...prev, [activeNoteModalQ.id]: tempNoteText }));
                  setActiveNoteModalQ(null);
                }}
                className="rounded-lg bg-purple-600 px-4 py-1.5 text-xs font-bold text-white shadow hover:bg-purple-700"
              >
                Save Note
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Feedback Button (Matching IASBoard Screenshot) */}
      <button
        onClick={() => {
          setFeedbackModalOpen(true);
          setFeedbackSent(false);
          setFeedbackText("");
        }}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full bg-[#5b36e8] px-5 py-3 text-xs font-bold text-white shadow-xl hover:bg-[#4a28cb] transition transform hover:scale-105"
      >
        <MessageSquare className="h-4 w-4" />
        <span>Feedback</span>
      </button>

      {/* Floating Feedback Modal */}
      {feedbackModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-[#5b36e8]" /> Aspirant Feedback & Correction
              </h3>
              <button
                onClick={() => setFeedbackModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {feedbackSent ? (
              <div className="py-8 text-center space-y-2">
                <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-600" />
                <h4 className="text-sm font-bold text-slate-900">Thank you for your feedback!</h4>
                <p className="text-xs text-slate-500">
                  Our academic team reviews all student reports against official UPSC master keys within 24 hours.
                </p>
                <button
                  onClick={() => setFeedbackModalOpen(false)}
                  className="mt-3 rounded-lg bg-[#5b36e8] px-4 py-1.5 text-xs font-bold text-white shadow hover:bg-[#4a28cb]"
                >
                  Close
                </button>
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                <div>
                  <label className="text-xs font-bold text-slate-700">Feedback Category</label>
                  <select
                    value={feedbackCategory}
                    onChange={(e: any) => setFeedbackCategory(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-xs font-semibold text-slate-700 focus:border-[#5b36e8] focus:outline-none"
                  >
                    <option value="QUESTION_ERROR">Report Question / Answer Key Discrepancy</option>
                    <option value="EXPLANATION_QUERY">Explanation & Elimination Technique Feedback</option>
                    <option value="FEATURE_REQUEST">Feature Request / Platform Improvement</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700">Your Feedback</label>
                  <textarea
                    rows={4}
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    placeholder="Describe any error, suggest improvement, or share your preparation feedback..."
                    className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 text-xs text-slate-800 focus:border-[#5b36e8] focus:outline-none"
                  />
                </div>
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => setFeedbackModalOpen(false)}
                    className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => setFeedbackSent(true)}
                    disabled={!feedbackText.trim()}
                    className="rounded-lg bg-[#5b36e8] px-4 py-1.5 text-xs font-bold text-white shadow hover:bg-[#4a28cb] disabled:opacity-40"
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
 * Question Card Item Component (Replicating exact IASBoard design)
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
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between">
      <div>
        {/* Top Badges Row (Year, Subject, Topic, Difficulty, Marking) */}
        <div className="flex flex-wrap items-center gap-1.5 mb-3">
          {/* Year Badge */}
          <span className="rounded bg-slate-900 px-2.5 py-0.5 text-xs font-black text-white">
            {question.year}
          </span>
          {/* Subject Badge */}
          {question.subject && (
            <span className="rounded bg-blue-100 text-blue-800 border border-blue-200 px-2.5 py-0.5 text-xs font-semibold">
              {question.subject}
            </span>
          )}
          {/* Topic Badge */}
          {question.topic && (
            <span className="rounded bg-amber-50 text-amber-900 border border-amber-200 px-2.5 py-0.5 text-xs font-medium hidden sm:inline-block">
              {question.topic}
            </span>
          )}
          {/* Difficulty Badge */}
          {question.difficulty && (
            <span className="rounded bg-amber-100 text-amber-800 px-2.5 py-0.5 text-xs font-semibold">
              {question.difficulty.toLowerCase()}
            </span>
          )}
          {/* Marks Badge */}
          <span className="ml-auto text-[11px] font-mono text-slate-400">
            +{marksPos} / -{marksNeg}
          </span>
        </div>

        {/* Question Statement */}
        <div className="mb-4">
          {(displayLanguage === "EN" || displayLanguage === "BOTH" || !question.questionTextHi) && (
            <h2 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
              Q{question.questionNumber}. {question.questionTextEn || question.questionText}
            </h2>
          )}

          {(displayLanguage === "HI" || (displayLanguage === "BOTH" && question.questionTextHi)) && (
            <h2 className="text-sm sm:text-base font-bold text-slate-800 font-hindi mt-1.5 leading-snug">
              प्र{question.questionNumber}. {question.questionTextHi}
            </h2>
          )}
        </div>

        {/* Clickable 4 Options (A, B, C, D) */}
        <div className="space-y-2 mb-4">
          {question.options.map((opt) => {
            const isSelected = attemptedCode === opt.code;
            const isThisOptionCorrect = opt.code === correctCode;

            let optionStyle =
              "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 text-slate-800";

            if (isRevealed) {
              if (isThisOptionCorrect) {
                optionStyle = "border-emerald-500 bg-emerald-50/70 text-emerald-950 font-semibold";
              } else if (isSelected && !isThisOptionCorrect) {
                optionStyle = "border-rose-400 bg-rose-50 text-rose-950 line-through opacity-80";
              } else {
                optionStyle = "border-slate-100 bg-slate-50/50 text-slate-400";
              }
            } else if (isSelected) {
              optionStyle = "border-purple-600 bg-purple-50 text-purple-900 font-bold";
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
                      ? "bg-[#5b36e8] text-white"
                      : "bg-slate-100 text-slate-700"
                  }`}
                >
                  {opt.code}
                </span>

                <div className="flex-1">
                  {(displayLanguage === "EN" || displayLanguage === "BOTH" || !opt.textHi) && (
                    <span>{opt.textEn || opt.text}</span>
                  )}
                  {(displayLanguage === "HI" || (displayLanguage === "BOTH" && opt.textHi)) && (
                    <span className="block font-hindi text-slate-700 mt-0.5">{opt.textHi}</span>
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
          <div className="rounded-xl border border-purple-100 bg-purple-50/40 p-4 space-y-3 mb-4 text-xs animate-in fade-in duration-200">
            {/* Official Answer & Score Result */}
            <div className="flex items-center justify-between pb-2 border-b border-purple-100">
              <span className="font-extrabold text-purple-950 flex items-center gap-1.5">
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

            {/* UPSC Elimination Technique & Trap Analysis (Flagship Feature) */}
            {question.explanation?.eliminationTechnique && (
              <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-amber-950 space-y-1">
                <p className="font-extrabold flex items-center gap-1 text-[11px] text-amber-900 uppercase tracking-wider">
                  <Sparkles className="h-3.5 w-3.5 text-amber-600" /> UPSC Elimination Technique & Trap Analysis
                </p>
                <p className="text-xs leading-relaxed text-amber-900">
                  {question.explanation.eliminationTechnique}
                </p>
              </div>
            )}

            {/* Pedagogical Explanation */}
            <div>
              <p className="font-bold text-slate-800 mb-1">Detailed Explanation:</p>
              <p className="leading-relaxed text-slate-700">
                {question.explanation?.detailedExplanation || question.explanation?.summary}
              </p>
              {question.explanation?.explanationHi && (
                <p className="leading-relaxed text-slate-700 font-hindi mt-2 pt-2 border-t border-purple-100">
                  {question.explanation.explanationHi}
                </p>
              )}
            </div>

            {/* Source Citation */}
            {(question.explanation?.sourceCitation || question.citations?.[0]) && (
              <p className="text-[11px] text-slate-500 pt-1 border-t border-purple-100">
                <span className="font-bold">Source Reference:</span>{" "}
                {question.explanation?.sourceCitation || question.citations?.[0]?.sourceName}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Card Action Footer (Bookmark, Study Note, Share, Reveal Toggle) */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-slate-400 text-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleBookmark}
            className={`flex items-center gap-1 transition ${
              isBookmarked ? "text-amber-500 font-bold" : "hover:text-slate-700"
            }`}
            title="Bookmark for revision"
          >
            <Bookmark className={`h-4 w-4 ${isBookmarked ? "fill-amber-500" : ""}`} />
            <span className="hidden sm:inline">Save</span>
          </button>

          <button
            onClick={onOpenNote}
            className="flex items-center gap-1 hover:text-slate-700 transition"
            title="Add personal study note"
          >
            <FileEdit className="h-4 w-4" />
            <span className="hidden sm:inline">Note</span>
          </button>

          <button
            onClick={onCopyLink}
            className="flex items-center gap-1 hover:text-slate-700 transition"
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
              className="text-purple-700 font-bold hover:underline text-xs"
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
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-purple-600 border-t-transparent mb-3" />
          <p className="text-xs font-bold text-slate-500">Loading Pravaah UPSC PYQ Platform...</p>
        </div>
      }
    >
      <PrelimsPYQContent />
    </Suspense>
  );
}
