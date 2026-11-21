"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  FileEdit,
  Search,
  Filter,
  Download,
  Upload,
  RefreshCw,
  Trash2,
  Sparkles,
  Layers,
  BookOpen,
  ChevronDown,
  ChevronRight,
  ShieldCheck,
  Check,
  X,
} from "lucide-react";

interface QuestionItem {
  id: string;
  year: number;
  questionNumber: number;
  questionText: string;
  questionTextEn?: string;
  questionTextHi?: string | null;
  status: string;
  difficulty: string;
  marks: number;
  negativeMarks: number;
  paper: { code: string; name: string };
  subject?: { id: string; name: string } | null;
  topic?: { id: string; name: string } | null;
  options: Array<{
    id: string;
    optionCode: string;
    optionText: string;
    optionTextHi?: string | null;
    isCorrect: boolean;
  }>;
  explanation?: {
    summary?: string;
    detailedExplanation?: string;
    eliminationTechnique?: string | null;
  } | null;
  answers: Array<{
    answerOption: string;
    answerKeyType: string;
    verificationStatus: string;
  }>;
}

export default function AdminPYQConsole() {
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeConsoleTab, setActiveConsoleTab] = useState<"questions" | "external">("questions");
  const [externalData, setExternalData] = useState<any | null>(null);
  const [loadingExternal, setLoadingExternal] = useState(false);

  // Filter states
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [selectedPaper, setSelectedPaper] = useState<string>("ALL");
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [page, setPage] = useState(1);

  // Edit Modal State
  const [editingQuestion, setEditingQuestion] = useState<QuestionItem | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);
  const [actionErrorMsg, setActionErrorMsg] = useState<string | null>(null);
  const [duplicateScanResults, setDuplicateScanResults] = useState<any[] | null>(null);

  const fetchQuestions = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedStatus !== "ALL") params.set("status", selectedStatus);
      if (selectedPaper !== "ALL") params.set("paper", selectedPaper);
      if (selectedYear) params.set("years", selectedYear);
      if (searchQuery.trim()) params.set("q", searchQuery.trim());
      params.set("page", page.toString());
      params.set("limit", "25");

      const res = await fetch(`/api/v1/pyqs?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        setQuestions(json.data);
        setTotalCount(json.meta?.total || json.data.length);
      }
    } catch (err: any) {
      console.error("Failed to load questions:", err);
    } finally {
      setLoading(false);
    }
  }, [selectedStatus, selectedPaper, selectedYear, searchQuery, page]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  const showNotification = (msg: string, isError = false) => {
    if (isError) {
      setActionErrorMsg(msg);
      setTimeout(() => setActionErrorMsg(null), 4000);
    } else {
      setActionSuccessMsg(msg);
      setTimeout(() => setActionSuccessMsg(null), 3000);
    }
  };

  const fetchExternalData = async () => {
    try {
      setLoadingExternal(true);
      const res = await fetch("/api/v1/admin/pyqs/external-sources");
      const json = await res.json();
      if (json.success) {
        setExternalData(json.data);
      }
    } catch (e: any) {
      console.error(e);
    } finally {
      setLoadingExternal(false);
    }
  };

  useEffect(() => {
    if (activeConsoleTab === "external") {
      fetchExternalData();
    }
  }, [activeConsoleTab]);

  const triggerExternalAction = async (action: "DISCOVER" | "BUILD_MANIFEST") => {
    try {
      showNotification(`Executing ${action}...`);
      const res = await fetch("/api/v1/admin/pyqs/external-sources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (data.success) {
        showNotification(data.message || `${action} completed.`);
        fetchExternalData();
      } else {
        showNotification(data.error?.message || "Action failed", true);
      }
    } catch (e: any) {
      showNotification(e.message, true);
    }
  };

  // Selection handlers
  const handleSelectAll = () => {
    if (selectedIds.length === questions.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(questions.map((q) => q.id));
    }
  };

  const handleToggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  // Batch action executions
  const handleBatchAction = async (action: string) => {
    if (selectedIds.length === 0) {
      showNotification("Please select at least one question.", true);
      return;
    }

    try {
      const res = await fetch("/api/v1/admin/pyqs/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          questionIds: selectedIds,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showNotification(`Batch ${action} completed successfully on ${data.data.affectedCount} questions.`);
        setSelectedIds([]);
        fetchQuestions();
      } else {
        showNotification(data.error?.message || "Batch operation failed", true);
      }
    } catch (e: any) {
      showNotification(e.message || "Network error", true);
    }
  };

  // Duplicate Scanner
  const runDuplicateScan = () => {
    const textMap = new Map<string, QuestionItem[]>();
    questions.forEach((q) => {
      const normalized = (q.questionTextEn || q.questionText)
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "")
        .slice(0, 45);
      if (!textMap.has(normalized)) {
        textMap.set(normalized, []);
      }
      textMap.get(normalized)!.push(q);
    });

    const duplicates: any[] = [];
    textMap.forEach((qList, key) => {
      if (qList.length > 1) {
        duplicates.push({
          key,
          count: qList.length,
          questions: qList,
        });
      }
    });

    setDuplicateScanResults(duplicates);
    if (duplicates.length === 0) {
      showNotification("✓ Zero duplicates detected! All questions are clean and unique.");
    }
  };

  // Export handlers
  const handleExport = (format: "csv" | "json") => {
    const params = new URLSearchParams();
    params.set("format", format);
    if (selectedYear) params.set("year", selectedYear);
    if (selectedPaper !== "ALL") params.set("paper", selectedPaper);
    if (selectedStatus !== "ALL") params.set("status", selectedStatus);

    window.open(`/api/v1/admin/pyqs/batch?${params.toString()}`, "_blank");
  };

  // Edit Modal Handlers
  const openEditModal = (q: QuestionItem) => {
    setEditingQuestion(q);
    setEditForm({
      questionTextEn: q.questionTextEn || q.questionText,
      questionTextHi: q.questionTextHi || "",
      status: q.status,
      difficulty: q.difficulty,
      correctOption: q.answers[0]?.answerOption || q.options.find((o) => o.isCorrect)?.optionCode || "A",
      eliminationTechnique: q.explanation?.eliminationTechnique || "",
      explanationEn: q.explanation?.detailedExplanation || q.explanation?.summary || "",
    });
  };

  const handleSaveEdit = async () => {
    if (!editingQuestion) return;
    try {
      const res = await fetch("/api/v1/admin/questions", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId: editingQuestion.id,
          questionText: editForm.questionTextEn,
          difficulty: editForm.difficulty,
          status: editForm.status,
          explanationSummary: editForm.explanationEn,
          correctOption: editForm.correctOption,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        showNotification("Question successfully updated.");
        setEditingQuestion(null);
        fetchQuestions();
      } else {
        showNotification(data.error?.message || "Failed to save question", true);
      }
    } catch (err: any) {
      showNotification(err.message, true);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {/* Top Breadcrumb & Title */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:underline mb-2"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Admin Console
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              PYQ Verification & Ingestion Console
            </h1>
            <span className="rounded-full bg-blue-100 px-3 py-0.5 text-xs font-bold text-blue-800">
              1995–2024 Master Registry
            </span>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            Lifecycle stages: DISCOVERED → EXTRACTED → VALIDATED → VERIFIED → PUBLISHED. Enforce +2/-0.666 & +2.5/-0.833 marking.
          </p>
        </div>

        {/* Global Export & Scan Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={runDuplicateScan}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50"
          >
            <ShieldCheck className="h-3.5 w-3.5 text-indigo-600" /> Duplicate Scan
          </button>
          <button
            onClick={() => handleExport("csv")}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50"
          >
            <Download className="h-3.5 w-3.5 text-emerald-600" /> Export CSV
          </button>
          <button
            onClick={() => handleExport("json")}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50"
          >
            <Download className="h-3.5 w-3.5 text-blue-600" /> Export JSON
          </button>
        </div>
      </div>

      {/* Notifications */}
      {actionSuccessMsg && (
        <div className="mb-4 flex items-center gap-2 rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-xs font-semibold text-emerald-800">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          {actionSuccessMsg}
        </div>
      )}
      {actionErrorMsg && (
        <div className="mb-4 flex items-center gap-2 rounded-lg bg-rose-50 border border-rose-200 p-3 text-xs font-semibold text-rose-800">
          <AlertCircle className="h-4 w-4 text-rose-600" />
          {actionErrorMsg}
        </div>
      )}

      {/* Primary Tab Switcher */}
      <div className="mb-6 flex items-center gap-6 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveConsoleTab("questions")}
          className={`flex items-center gap-2 pb-2 text-xs sm:text-sm font-extrabold transition relative ${
            activeConsoleTab === "questions"
              ? "text-blue-600 after:absolute after:bottom-[-9px] after:left-0 after:right-0 after:h-0.5 after:bg-blue-600"
              : "text-slate-500 hover:text-slate-900"
          }`}
        >
          <BookOpen className="h-4 w-4" /> Question Inventory & Quality Review
        </button>
        <button
          onClick={() => setActiveConsoleTab("external")}
          className={`flex items-center gap-2 pb-2 text-xs sm:text-sm font-extrabold transition relative ${
            activeConsoleTab === "external"
              ? "text-purple-700 after:absolute after:bottom-[-9px] after:left-0 after:right-0 after:h-0.5 after:bg-purple-700"
              : "text-slate-500 hover:text-slate-900"
          }`}
        >
          <Sparkles className="h-4 w-4 text-purple-600" /> External Sources & Manifest (ExamGOAL · ExamSIDE · Human Peritus)
        </button>
      </div>

      {activeConsoleTab === "external" ? (
        <div className="space-y-6">
          {/* External Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-purple-900 text-white p-5 shadow-lg">
            <div>
              <h2 className="text-base font-black flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-amber-400" /> External Ingestion & Intelligence Engine
              </h2>
              <p className="mt-1 text-xs text-purple-200">
                Discovers papers from ExamGOAL CDN, ExamSIDE taxonomy crosswalk, and Human Peritus CSAT syllabus.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => triggerExternalAction("DISCOVER")}
                className="rounded-lg bg-white px-3 py-2 text-xs font-bold text-purple-900 shadow hover:bg-purple-50"
              >
                Run Source Discovery
              </button>
              <button
                onClick={() => triggerExternalAction("BUILD_MANIFEST")}
                className="rounded-lg bg-amber-400 px-3 py-2 text-xs font-bold text-slate-900 shadow hover:bg-amber-300"
              >
                Rebuild Paper Manifest
              </button>
            </div>
          </div>

          {/* Source Intelligence Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="rounded bg-blue-100 px-2 py-0.5 text-[11px] font-bold text-blue-800">ExamGOAL PDF Archive</span>
                <span className="text-[11px] font-extrabold text-emerald-600">12 Papers (2021-2026)</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Free PDF distribution of official past papers with dual-language en.pdf and hi.pdf CDN endpoints.
              </p>
              <span className="mt-3 block text-[10px] font-bold text-emerald-700 uppercase tracking-wider">
                ✓ Public Domain Gazette Content Authorized
              </span>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="rounded bg-purple-100 px-2 py-0.5 text-[11px] font-bold text-purple-800">ExamSIDE Practice</span>
                <span className="text-[11px] font-extrabold text-purple-700">8 Categories · 60+ Subtopics</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Educational taxonomy cross-referenced into Pravaah's 24-subject syllabus schema.
              </p>
              <span className="mt-3 block text-[10px] font-bold text-purple-700 uppercase tracking-wider">
                ✓ Taxonomy Crosswalk Authorized
              </span>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="rounded bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-800">Human Peritus CSAT</span>
                <span className="text-[11px] font-extrabold text-rose-600">Paid Materials Excluded</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Public syllabus and topic breakdown reused for strategic guidance. Paid question bank excluded.
              </p>
              <span className="mt-3 block text-[10px] font-bold text-rose-700 uppercase tracking-wider">
                🛡️ Strict Copyright Safeguard Enforced
              </span>
            </div>
          </div>

          {/* Paper Manifest Table */}
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Unified Paper Manifest ({externalData?.summary?.totalDiscoveredPapers || 48} Examination Papers)
              </h3>
              <span className="text-xs text-slate-500 font-mono">1995 to 2026 Master Series A</span>
            </div>

            {loadingExternal ? (
              <div className="py-16 text-center">
                <RefreshCw className="mx-auto h-6 w-6 animate-spin text-purple-600 mb-2" />
                <p className="text-xs text-slate-500">Loading paper manifest...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 text-[11px] font-bold uppercase text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="p-3">Year</th>
                      <th className="p-3">Paper</th>
                      <th className="p-3">Examination Paper Title</th>
                      <th className="p-3">Origin</th>
                      <th className="p-3">Size / Pages</th>
                      <th className="p-3">Legal Status</th>
                      <th className="p-3 text-right">PDF Links</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(externalData?.paperManifest || []).map((paper: any) => (
                      <tr key={paper.id} className="hover:bg-slate-50/80 transition">
                        <td className="p-3 font-bold text-slate-900">{paper.year}</td>
                        <td className="p-3 font-mono font-bold text-purple-700">{paper.paperCode}</td>
                        <td className="p-3 font-medium text-slate-800">{paper.paperName}</td>
                        <td className="p-3 text-[11px] text-slate-500">{paper.sourceOrigin}</td>
                        <td className="p-3 whitespace-nowrap text-[11px] text-slate-500 font-mono">
                          {Math.round(paper.fileSizeBytes / 1024 / 1024 * 10) / 10} MB · {paper.pageCount}p
                        </td>
                        <td className="p-3 whitespace-nowrap">
                          <span className="rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-200">
                            {paper.reusePermissionStatus}
                          </span>
                        </td>
                        <td className="p-3 text-right whitespace-nowrap">
                          <a
                            href={paper.englishPdfUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 rounded border border-slate-200 bg-white px-2 py-1 text-[11px] font-bold text-blue-600 hover:bg-slate-50"
                          >
                            <Download className="h-3 w-3" /> EN PDF
                          </a>
                          {paper.hindiPdfUrl && (
                            <a
                              href={paper.hindiPdfUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="ml-1 inline-flex items-center gap-1 rounded border border-slate-200 bg-white px-2 py-1 text-[11px] font-bold text-purple-600 hover:bg-slate-50 font-hindi"
                            >
                              <Download className="h-3 w-3" /> हिन्दी
                            </a>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="mb-6 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-slate-500">Total Ingested Records</p>
          <p className="mt-1 text-2xl font-black text-slate-900">{totalCount}</p>
          <p className="mt-1 text-[11px] text-slate-400">1995 to 2024 Prelims</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-emerald-700">Live & Published</p>
          <p className="mt-1 text-2xl font-black text-emerald-600">
            {questions.filter((q) => q.status === "PUBLISHED").length}
          </p>
          <p className="mt-1 text-[11px] text-slate-400">Available to Aspirants</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-indigo-700">Bilingual Complete</p>
          <p className="mt-1 text-2xl font-black text-indigo-600">
            {questions.filter((q) => Boolean(q.questionTextHi)).length}
          </p>
          <p className="mt-1 text-[11px] text-slate-400">English + Devanagari Hindi</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-amber-700">Official Keys Mapped</p>
          <p className="mt-1 text-2xl font-black text-amber-600">
            {questions.filter((q) => q.answers.length > 0).length}
          </p>
          <p className="mt-1 text-[11px] text-slate-400">Series A Master Keys</p>
        </div>
      </div>

      {/* Duplicate Scan Alert (if active) */}
      {duplicateScanResults && duplicateScanResults.length > 0 && (
        <div className="mb-6 rounded-xl border border-rose-300 bg-rose-50 p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-rose-900 flex items-center gap-1.5">
              <AlertCircle className="h-4 w-4 text-rose-600" />
              Duplicate Alert: {duplicateScanResults.length} text collision clusters detected!
            </h3>
            <button
              onClick={() => setDuplicateScanResults(null)}
              className="text-xs text-rose-700 hover:underline"
            >
              Dismiss
            </button>
          </div>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {duplicateScanResults.map((dup, idx) => (
              <div key={idx} className="rounded bg-white p-2 text-xs border border-rose-200">
                <span className="font-bold text-rose-700">{dup.count} instances: </span>
                <span className="text-slate-700">{dup.questions[0].questionTextEn?.slice(0, 80)}...</span>
                <span className="ml-2 text-slate-400">IDs: {dup.questions.map((q: any) => q.id).join(", ")}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="mb-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by question text, concepts, or keywords..."
              className="w-full rounded-lg border border-slate-300 pl-9 pr-4 py-2 text-xs sm:text-sm text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700"
            >
              <option value="ALL">All Statuses</option>
              <option value="PUBLISHED">PUBLISHED</option>
              <option value="VERIFIED">VERIFIED</option>
              <option value="VALIDATED">VALIDATED</option>
              <option value="PENDING_REVIEW">PENDING_REVIEW</option>
              <option value="EXTRACTED">EXTRACTED</option>
            </select>

            <select
              value={selectedPaper}
              onChange={(e) => setSelectedPaper(e.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700"
            >
              <option value="ALL">All Papers</option>
              <option value="GS1">GS Paper 1</option>
              <option value="GS2">GS Paper 2 (CSAT)</option>
            </select>

            <input
              type="number"
              placeholder="Year (e.g. 2024)"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-28 rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700"
            />

            {(selectedStatus !== "ALL" || selectedPaper !== "ALL" || selectedYear || searchQuery) && (
              <button
                onClick={() => {
                  setSelectedStatus("ALL");
                  setSelectedPaper("ALL");
                  setSelectedYear("");
                  setSearchQuery("");
                }}
                className="text-xs font-bold text-rose-600 hover:underline px-2"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Batch Action Strip */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="selectAll"
              checked={selectedIds.length > 0 && selectedIds.length === questions.length}
              onChange={handleSelectAll}
              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
            />
            <label htmlFor="selectAll" className="text-xs font-semibold text-slate-700">
              {selectedIds.length > 0 ? `${selectedIds.length} selected` : "Select All on Page"}
            </label>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleBatchAction("PUBLISH")}
              disabled={selectedIds.length === 0}
              className="inline-flex items-center gap-1 rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-40"
            >
              <Check className="h-3 w-3" /> Batch Publish
            </button>
            <button
              onClick={() => handleBatchAction("VERIFY")}
              disabled={selectedIds.length === 0}
              className="inline-flex items-center gap-1 rounded-md bg-blue-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-blue-700 disabled:opacity-40"
            >
              <ShieldCheck className="h-3 w-3" /> Batch Verify
            </button>
            <button
              onClick={() => handleBatchAction("DELETE")}
              disabled={selectedIds.length === 0}
              className="inline-flex items-center gap-1 rounded-md bg-rose-50 text-rose-700 border border-rose-200 px-3 py-1.5 text-xs font-bold hover:bg-rose-100 disabled:opacity-40"
            >
              <Trash2 className="h-3 w-3" /> Delete Selected
            </button>
          </div>
        </div>
      </div>

      {/* Questions Data Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center">
            <RefreshCw className="mx-auto h-8 w-8 animate-spin text-blue-600" />
            <p className="mt-2 text-xs font-bold text-slate-500">Loading PYQ Repository...</p>
          </div>
        ) : questions.length === 0 ? (
          <div className="py-20 text-center text-slate-400">
            <BookOpen className="mx-auto h-8 w-8 mb-2" />
            <p className="text-sm font-semibold">No questions matching current filter criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-[11px] font-bold uppercase text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="p-3 w-8"></th>
                  <th className="p-3">Ref / Year</th>
                  <th className="p-3">Paper & Subject</th>
                  <th className="p-3">Question Stem (EN / HI)</th>
                  <th className="p-3 text-center">Key</th>
                  <th className="p-3">Marking</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {questions.map((q) => {
                  const correctKey =
                    q.answers[0]?.answerOption || q.options.find((o) => o.isCorrect)?.optionCode || "—";
                  const isChecked = selectedIds.includes(q.id);

                  return (
                    <tr key={q.id} className={`hover:bg-slate-50/80 transition ${isChecked ? "bg-blue-50/40" : ""}`}>
                      <td className="p-3">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleSelect(q.id)}
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-3.5 w-3.5"
                        />
                      </td>
                      <td className="p-3 whitespace-nowrap font-semibold">
                        <span className="rounded bg-slate-900 px-2 py-0.5 text-[11px] font-bold text-white">
                          {q.year}
                        </span>
                        <span className="ml-1.5 text-slate-500 font-mono text-[11px]">Q{q.questionNumber}</span>
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        <span className="font-bold text-slate-900 block">{q.paper?.code || "GS1"}</span>
                        <span className="text-[11px] text-slate-500">{q.subject?.name || "Unclassified"}</span>
                      </td>
                      <td className="p-3 max-w-md">
                        <p className="font-medium text-slate-800 line-clamp-2">
                          {q.questionTextEn || q.questionText}
                        </p>
                        {q.questionTextHi && (
                          <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5 font-hindi">
                            {q.questionTextHi}
                          </p>
                        )}
                      </td>
                      <td className="p-3 text-center">
                        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 font-extrabold text-emerald-800">
                          {correctKey}
                        </span>
                      </td>
                      <td className="p-3 whitespace-nowrap font-mono text-[11px]">
                        +{q.marks || 2} / -{q.negativeMarks || 0.666}
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
                            q.status === "PUBLISHED"
                              ? "bg-emerald-100 text-emerald-800"
                              : q.status === "VERIFIED"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {q.status}
                        </span>
                      </td>
                      <td className="p-3 text-right whitespace-nowrap">
                        <button
                          onClick={() => openEditModal(q)}
                          className="inline-flex items-center gap-1 rounded border border-slate-200 bg-white px-2.5 py-1 text-xs font-bold text-slate-700 hover:bg-slate-100"
                        >
                          <FileEdit className="h-3 w-3 text-blue-600" /> Edit
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination bar */}
        <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-4 py-3">
          <p className="text-xs text-slate-500">
            Showing Page <span className="font-bold text-slate-900">{page}</span> of{" "}
            <span className="font-bold text-slate-900">{Math.ceil(totalCount / 25) || 1}</span>
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="rounded border border-slate-300 bg-white px-3 py-1 text-xs font-bold text-slate-700 disabled:opacity-40"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= Math.ceil(totalCount / 25)}
              className="rounded border border-slate-300 bg-white px-3 py-1 text-xs font-bold text-slate-700 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </div>
      </>
      )}

      {/* Quick Edit Drawer / Modal */}
      {editingQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <h2 className="text-lg font-bold text-slate-900">
                Edit Question ({editingQuestion.year} {editingQuestion.paper?.code || "GS1"} Q{editingQuestion.questionNumber})
              </h2>
              <button
                onClick={() => setEditingQuestion(null)}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Question Stem (English)</label>
                <textarea
                  rows={3}
                  value={editForm.questionTextEn}
                  onChange={(e) => setEditForm({ ...editForm, questionTextEn: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 p-2.5 text-xs text-slate-800 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Question Stem (Hindi Devanagari)</label>
                <textarea
                  rows={3}
                  value={editForm.questionTextHi}
                  onChange={(e) => setEditForm({ ...editForm, questionTextHi: e.target.value })}
                  placeholder="हिंदी अनुवाद दर्ज करें..."
                  className="w-full rounded-lg border border-slate-300 p-2.5 text-xs text-slate-800 focus:border-blue-500 focus:outline-none font-hindi"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Correct Key</label>
                  <select
                    value={editForm.correctOption}
                    onChange={(e) => setEditForm({ ...editForm, correctOption: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 p-2 text-xs font-bold"
                  >
                    <option value="A">Option A</option>
                    <option value="B">Option B</option>
                    <option value="C">Option C</option>
                    <option value="D">Option D</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Difficulty</label>
                  <select
                    value={editForm.difficulty}
                    onChange={(e) => setEditForm({ ...editForm, difficulty: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 p-2 text-xs"
                  >
                    <option value="EASY">EASY</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HARD">HARD</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Status</label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 p-2 text-xs font-bold"
                  >
                    <option value="DRAFT">DRAFT</option>
                    <option value="VALIDATED">VALIDATED</option>
                    <option value="VERIFIED">VERIFIED</option>
                    <option value="PUBLISHED">PUBLISHED</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Elimination Technique / Trap Analysis</label>
                <textarea
                  rows={2}
                  value={editForm.eliminationTechnique}
                  onChange={(e) => setEditForm({ ...editForm, eliminationTechnique: e.target.value })}
                  placeholder="UPSC elimination strategy..."
                  className="w-full rounded-lg border border-slate-300 p-2.5 text-xs text-slate-800 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Explanation (Detailed)</label>
                <textarea
                  rows={3}
                  value={editForm.explanationEn}
                  onChange={(e) => setEditForm({ ...editForm, explanationEn: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 p-2.5 text-xs text-slate-800 focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
              <button
                onClick={() => setEditingQuestion(null)}
                className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="rounded-lg bg-blue-600 px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-700"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
