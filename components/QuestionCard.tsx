"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Bookmark,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  FileEdit,
  Share2,
  BookOpen,
  Sparkles,
  Check,
  Flag,
  AlertTriangle,
  EyeOff,
  RotateCcw,
  ShieldCheck,
} from "lucide-react";

export interface OptionItem {
  id?: string;
  code: string;
  text: string;
  isCorrect?: boolean;
}

export interface QuestionData {
  id: string;
  year: number;
  questionNumber: number;
  paperCode: string;
  questionText: string;
  difficulty?: string;
  subject?: string;
  topic?: string;
  options: OptionItem[];
  correctOption: string;
  explanation?: {
    summary: string;
    detailedExplanation: string;
    eliminationTechnique?: string | null;
    sourceCitation?: string | null;
    relatedConcept?: string | null;
  } | null;
}

interface QuestionCardProps {
  question: QuestionData;
  initialBookmarked?: boolean;
  initialNote?: string;
  onAttemptRecorded?: (isCorrect: boolean) => void;
  activeKeyboard?: boolean;
}

export function QuestionCard({
  question,
  initialBookmarked = false,
  initialNote = "",
  onAttemptRecorded,
  activeKeyboard = false,
}: QuestionCardProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(initialBookmarked);
  const [noteContent, setNoteContent] = useState(initialNote);
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [noteSaved, setNoteSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isReporting, setIsReporting] = useState(false);
  const [reportReason, setReportReason] = useState("Discrepancy with official key");
  const [reportDetails, setReportDetails] = useState("");
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [reportSubmitted, setReportSubmitted] = useState(false);
  const [eliminatedOptions, setEliminatedOptions] = useState<Record<string, boolean>>({});
  const [mistakeReason, setMistakeReason] = useState<string | null>(null);
  const [mistakeLogged, setMistakeLogged] = useState(false);

  const handleLogMistakeReason = async (reason: string) => {
    setMistakeReason(reason);
    try {
      const res = await fetch("/api/v1/user/mistakes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId: question.id,
          mistakeReason: reason,
          intervalDays: 1,
        }),
      });
      if (res.ok) {
        setMistakeLogged(true);
        setTimeout(() => setMistakeLogged(false), 3000);
      }
    } catch (e) {
      console.error("Failed to log mistake reason:", e);
    }
  };

  const handleToggleEliminate = (optionCode: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedOption !== null) return;
    setEliminatedOptions((prev) => ({
      ...prev,
      [optionCode]: !prev[optionCode],
    }));
  };

  const handleSelectOption = useCallback(async (optionCode: string) => {
    if (selectedOption !== null) return; // already answered
    setSelectedOption(optionCode);
    setShowExplanation(true);

    const isCorrect = optionCode.toUpperCase() === question.correctOption.toUpperCase();
    if (onAttemptRecorded) onAttemptRecorded(isCorrect);

    // Call Learn attempt API in background
    try {
      await fetch("/api/v1/attempts/learn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId: question.id,
          selectedOption: optionCode,
          timeSpentSeconds: 30,
        }),
      });
    } catch (e) {
      console.error("Failed to record attempt:", e);
    }
  }, [selectedOption, question.correctOption, question.id, onAttemptRecorded]);

  const handleToggleBookmark = useCallback(async () => {
    const nextState = !isBookmarked;
    setIsBookmarked(nextState);
    try {
      await fetch("/api/v1/user/bookmarks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId: question.id }),
      });
    } catch (e) {
      console.error(e);
      setIsBookmarked(!nextState); // revert on error
    }
  }, [isBookmarked, question.id]);

  // Keyboard navigation when activeKeyboard is enabled (e.g., Focus Mode)
  useEffect(() => {
    if (!activeKeyboard) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      const key = e.key.toUpperCase();
      if (["A", "B", "C", "D"].includes(key) && selectedOption === null) {
        e.preventDefault();
        handleSelectOption(key);
      } else if (["1", "2", "3", "4"].includes(e.key) && selectedOption === null) {
        e.preventDefault();
        const codeMap: Record<string, string> = { "1": "A", "2": "B", "3": "C", "4": "D" };
        handleSelectOption(codeMap[e.key]);
      } else if (key === "E") {
        e.preventDefault();
        setShowExplanation((prev) => !prev);
      } else if (key === "S") {
        e.preventDefault();
        handleToggleBookmark();
      } else if (key === "N") {
        e.preventDefault();
        setIsEditingNote((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeKeyboard, selectedOption, handleSelectOption, handleToggleBookmark]);

  const handleSubmitReport = async () => {
    if (!reportReason || reportSubmitting) return;
    setReportSubmitting(true);
    try {
      const res = await fetch("/api/v1/questions/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId: question.id,
          reason: reportReason,
          description: reportDetails,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setReportSubmitted(true);
        setTimeout(() => {
          setIsReporting(false);
          setReportSubmitted(false);
          setReportDetails("");
        }, 2500);
      }
    } catch (e) {
      console.error("Failed to submit question report:", e);
    } finally {
      setReportSubmitting(false);
    }
  };

  const handleSaveNote = async () => {
    try {
      await fetch("/api/v1/user/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId: question.id,
          content: noteContent,
        }),
      });
      setNoteSaved(true);
      setIsEditingNote(false);
      setTimeout(() => setNoteSaved(false), 3000);
    } catch (e) {
      console.error("Failed to save note:", e);
    }
  };

  const handleShare = () => {
    if (typeof window !== "undefined") {
      const url = `${window.location.origin}/pyqs?q=${encodeURIComponent(question.questionText.slice(0, 40))}`;
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
      {/* Question Header & Badges */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3 text-xs">
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <span
            className={`rounded-md px-2.5 py-1 font-bold ${
              question.paperCode === "GS2"
                ? "bg-teal-50 text-teal-700 border border-teal-200"
                : "bg-blue-50 text-blue-700 border border-blue-200"
            }`}
          >
            {question.paperCode === "GS2" ? "CSAT Paper II" : "GS Paper I"}
          </span>
          <span className="rounded-md bg-slate-100 px-2.5 py-1 font-bold text-slate-700">
            {question.year}
          </span>
          <span className="font-semibold text-slate-500">
            Q.{question.questionNumber}
          </span>
          {question.subject && (
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 font-medium text-slate-600">
              {question.subject}
            </span>
          )}
          {question.topic && (
            <span className="hidden sm:inline-block rounded-full bg-slate-50 px-2 py-0.5 text-slate-400">
              {question.topic}
            </span>
          )}
        </div>

        {/* Card Utility Actions */}
        <div className="flex items-center gap-1">
          <button
            onClick={handleToggleBookmark}
            title={isBookmarked ? "Remove Bookmark" : "Save for Revision"}
            className={`rounded-lg p-1.5 transition ${
              isBookmarked
                ? "text-blue-600 bg-blue-50"
                : "text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            }`}
          >
            <Bookmark className={`h-4 w-4 ${isBookmarked ? "fill-blue-600" : ""}`} />
          </button>
          <button
            onClick={() => setIsEditingNote(!isEditingNote)}
            title="Add private study note"
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
          >
            <FileEdit className="h-4 w-4" />
          </button>
          <button
            onClick={handleShare}
            title="Copy question link"
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
          >
            {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Share2 className="h-4 w-4" />}
          </button>
          <button
            onClick={() => setIsReporting(!isReporting)}
            title="Report question error or key ambiguity"
            className={`rounded-lg p-1.5 transition ${
              isReporting
                ? "text-amber-600 bg-amber-50"
                : "text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            }`}
          >
            <Flag className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Question Body */}
      <div className="mt-4">
        <p className="whitespace-pre-line text-base font-medium leading-relaxed text-slate-800">
          {question.questionText}
        </p>
      </div>

      {/* Multiple Choice Options */}
      <div className="mt-5 space-y-2.5">
        {question.options.map((option) => {
          const isSelected = selectedOption === option.code;
          const isCorrect = option.code.toUpperCase() === question.correctOption.toUpperCase();
          const hasAnswered = selectedOption !== null;
          const isEliminated = Boolean(eliminatedOptions[option.code]);

          let optionStyle = "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50 text-slate-700";

          if (hasAnswered) {
            if (isCorrect) {
              optionStyle = "border-emerald-500 bg-emerald-50 text-emerald-900 font-semibold ring-1 ring-emerald-500/20";
            } else if (isSelected && !isCorrect) {
              optionStyle = "border-rose-400 bg-rose-50 text-rose-900 font-medium ring-1 ring-rose-400/20";
            } else {
              optionStyle = "border-slate-200 bg-slate-50/40 text-slate-400 opacity-80";
            }
          } else if (isEliminated) {
            optionStyle = "border-dashed border-slate-300 bg-slate-100/70 text-slate-400 opacity-60";
          }

          return (
            <div
              key={option.code}
              className={`group flex items-start gap-3 rounded-lg border p-3 transition duration-150 touch-target ${optionStyle}`}
            >
              <button
                type="button"
                onClick={() => handleSelectOption(option.code)}
                disabled={hasAnswered}
                className="flex flex-1 items-start gap-3 text-left focus:outline-none"
              >
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                    hasAnswered && isCorrect
                      ? "bg-emerald-600 text-white"
                      : hasAnswered && isSelected && !isCorrect
                      ? "bg-rose-600 text-white"
                      : isEliminated
                      ? "border border-slate-300 bg-slate-200 text-slate-400"
                      : "border border-slate-300 bg-slate-100 text-slate-600 group-hover:bg-blue-50 group-hover:text-blue-700 group-hover:border-blue-300"
                  }`}
                >
                  {option.code}
                </span>
                <span
                  className={`flex-1 text-sm leading-normal ${
                    isEliminated ? "line-through text-slate-400" : ""
                  }`}
                >
                  {option.text}
                </span>
              </button>

              {/* Status Icons and Option Elimination Control */}
              <div className="flex shrink-0 items-center gap-1.5 self-center">
                {hasAnswered && isCorrect && (
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                )}
                {hasAnswered && isSelected && !isCorrect && (
                  <XCircle className="h-5 w-5 text-rose-500" />
                )}
                {!hasAnswered && (
                  <button
                    type="button"
                    onClick={(e) => handleToggleEliminate(option.code, e)}
                    title={isEliminated ? "Restore option" : "Rule out / Eliminate option"}
                    className={`rounded p-1 text-xs transition ${
                      isEliminated
                        ? "text-blue-600 hover:text-blue-800 bg-blue-50"
                        : "text-slate-300 hover:text-slate-600 hover:bg-slate-200/60 opacity-0 group-hover:opacity-100 sm:opacity-70"
                    }`}
                  >
                    {isEliminated ? (
                      <span className="flex items-center gap-1 text-[11px] font-semibold text-blue-700">
                        <RotateCcw className="h-3.5 w-3.5" />
                        Restore
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[11px] font-medium text-slate-400 hover:text-rose-600">
                        <EyeOff className="h-3.5 w-3.5" />
                        Rule Out
                      </span>
                    )}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Smart Mistake Journal Selector */}
      {selectedOption !== null && selectedOption.toUpperCase() !== question.correctOption.toUpperCase() && (
        <div className="mt-4 rounded-xl border border-purple-200 bg-purple-50/70 p-3.5 text-xs animate-in fade-in">
          <div className="flex items-center justify-between">
            <span className="font-bold text-purple-950 flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-purple-700" />
              Smart Mistake Journal — Why did you struggle with this question?
            </span>
            {mistakeLogged && (
              <span className="text-emerald-700 font-bold text-[11px] bg-emerald-100 px-2 py-0.5 rounded">
                Saved to Revision Queue!
              </span>
            )}
          </div>
          <p className="text-[11px] text-purple-800/80 mt-1">
            Tagging your root cause calibrates spaced repetition and flags conceptual gaps in your analytics.
          </p>
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {[
              "Concept not clear",
              "Forgotten fact",
              "Misread question",
              "Incorrect option elimination",
              "Guess",
            ].map((reason) => (
              <button
                key={reason}
                onClick={() => handleLogMistakeReason(reason)}
                className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition border ${
                  mistakeReason === reason
                    ? "bg-purple-700 text-white border-purple-800 shadow-sm"
                    : "bg-white text-purple-900 border-purple-200 hover:bg-purple-100"
                }`}
              >
                {reason}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Inline Student Note Box (if open or exists) */}
      {(isEditingNote || noteContent) && (
        <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50/60 p-3 text-xs">
          <div className="flex items-center justify-between pb-1 text-amber-800 font-semibold">
            <span>Aspirant Private Note</span>
            {noteSaved && <span className="text-emerald-700 font-bold">Saved!</span>}
          </div>
          {isEditingNote ? (
            <div className="mt-1">
              <textarea
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder="Write your personal mnemonics, elimination tips or textbook references..."
                rows={2}
                className="w-full rounded border border-amber-300 bg-white p-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
              <div className="mt-2 flex justify-end gap-2">
                <button
                  onClick={() => setIsEditingNote(false)}
                  className="rounded px-2.5 py-1 text-slate-500 hover:bg-amber-100"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveNote}
                  className="rounded bg-amber-700 px-3 py-1 font-semibold text-white hover:bg-amber-800"
                >
                  Save Note
                </button>
              </div>
            </div>
          ) : (
            <p className="mt-1 text-slate-700">{noteContent}</p>
          )}
        </div>
      )}

      {/* Inline Issue Reporting Panel */}
      {isReporting && (
        <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50/70 p-3.5 text-xs animate-in fade-in duration-150">
          <div className="flex items-center justify-between pb-1 text-rose-900 font-bold">
            <span className="flex items-center gap-1.5">
              <AlertTriangle className="h-4 w-4 text-rose-600" />
              Report Question Issue
            </span>
            {reportSubmitted && (
              <span className="text-emerald-700 font-bold text-[11px] bg-emerald-100 px-2 py-0.5 rounded">
                Report logged for academic audit!
              </span>
            )}
          </div>
          {!reportSubmitted && (
            <div className="mt-2 space-y-2">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Reason for discrepancy:
                </label>
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full rounded border border-rose-300 bg-white p-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-rose-500"
                >
                  <option value="Discrepancy with official key">Discrepancy with official UPSC key</option>
                  <option value="Typo or wording error">Typo or wording transcription error</option>
                  <option value="Explanation error">Explanation or concept needs clarification</option>
                  <option value="Option formatting">Option formatting or alignment issue</option>
                </select>
              </div>
              <div>
                <textarea
                  value={reportDetails}
                  onChange={(e) => setReportDetails(e.target.value)}
                  placeholder="Provide reference or details (e.g. standard textbook, official gazette, question series)..."
                  rows={2}
                  className="w-full rounded border border-rose-300 bg-white p-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button
                  onClick={() => setIsReporting(false)}
                  className="rounded px-2.5 py-1 text-slate-600 hover:bg-rose-100"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitReport}
                  disabled={reportSubmitting}
                  className="rounded bg-rose-700 px-3.5 py-1 font-bold text-white hover:bg-rose-800 disabled:opacity-50"
                >
                  {reportSubmitting ? "Submitting..." : "Submit Report"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Explanation Toggle & Pedagogical Drawer */}
      <div className="mt-4 border-t border-slate-100 pt-3">
        <button
          onClick={() => setShowExplanation(!showExplanation)}
          className="flex items-center gap-1.5 text-xs font-semibold text-blue-700 hover:text-blue-900 transition"
        >
          <BookOpen className="h-4 w-4" />
          <span>{showExplanation ? "Hide Explanation" : "Show Detailed Concept Explanation"}</span>
          {showExplanation ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>

        {showExplanation && (
          <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50/90 p-4 sm:p-5 text-sm animate-in fade-in duration-200 space-y-4">
            {/* Header: Answer Key & Metadata */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/80 pb-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-md bg-emerald-600 px-2.5 py-1 text-xs font-extrabold text-white shadow-xs">
                  Official UPSC Key: Option ({question.correctOption})
                </span>
                <span className="inline-flex items-center gap-1 rounded-md bg-slate-200/70 px-2 py-0.5 text-xs font-medium text-slate-700">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                  Verified Academic Archive
                </span>
              </div>
              <div className="text-xs text-slate-500">
                {question.subject} {question.topic && `→ ${question.topic}`}
              </div>
            </div>

            {/* Core Concept Foundation */}
            <div>
              <div className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <span>Core Concept Foundation</span>
                {question.explanation?.relatedConcept && (
                  <span className="text-blue-700 font-semibold">• {question.explanation.relatedConcept}</span>
                )}
              </div>
              {question.explanation?.summary ? (
                <p className="mt-1 font-semibold text-slate-800 leading-snug">
                  {question.explanation.summary}
                </p>
              ) : (
                <p className="mt-1 text-xs text-slate-600">
                  Concept verification derived from UPSC official key syllabus mapping.
                </p>
              )}
            </div>

            {/* Why Option is Correct & Pedagogical Breakdown */}
            {question.explanation?.detailedExplanation && (
              <div className="rounded-lg border border-slate-200 bg-white p-3.5 text-xs text-slate-700 leading-relaxed space-y-1.5 shadow-xs">
                <p className="font-bold text-slate-900 uppercase tracking-wide text-[10px]">
                  Why Option ({question.correctOption}) is Correct & Statement Breakdown:
                </p>
                <p className="whitespace-pre-line text-slate-700">
                  {question.explanation.detailedExplanation}
                </p>
              </div>
            )}

            {/* Distractor Analysis & Elimination Strategy */}
            {question.explanation?.eliminationTechnique && (
              <div className="rounded-lg border border-blue-100 bg-blue-50/70 p-3.5 text-xs text-blue-950 shadow-xs">
                <span className="font-bold flex items-center gap-1.5 text-blue-900">
                  <Sparkles className="h-4 w-4 text-blue-600" />
                  Elimination Strategy & Distractor Analysis:
                </span>
                <p className="mt-1.5 text-slate-700 leading-relaxed">
                  {question.explanation.eliminationTechnique}
                </p>
              </div>
            )}

            {/* Verified Source Citation */}
            {question.explanation?.sourceCitation && (
              <div className="border-t border-slate-200/60 pt-2 text-[11px] font-medium text-slate-500 italic">
                Verified Source Reference: {question.explanation.sourceCitation}
              </div>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
