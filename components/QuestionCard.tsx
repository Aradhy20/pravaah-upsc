"use client";

import React, { useState } from "react";
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
}

export function QuestionCard({
  question,
  initialBookmarked = false,
  initialNote = "",
  onAttemptRecorded,
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

  const handleSelectOption = async (optionCode: string) => {
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
  };

  const handleToggleBookmark = async () => {
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

          let optionStyle = "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50 text-slate-700";

          if (hasAnswered) {
            if (isCorrect) {
              optionStyle = "border-emerald-500 bg-emerald-50 text-emerald-900 font-semibold ring-1 ring-emerald-500/20";
            } else if (isSelected && !isCorrect) {
              optionStyle = "border-rose-400 bg-rose-50 text-rose-900 font-medium ring-1 ring-rose-400/20";
            } else {
              optionStyle = "border-slate-200 bg-slate-50/40 text-slate-400 opacity-80";
            }
          }

          return (
            <button
              key={option.code}
              onClick={() => handleSelectOption(option.code)}
              disabled={hasAnswered}
              className={`flex w-full items-start gap-3 rounded-lg border p-3 text-left transition duration-150 touch-target ${optionStyle}`}
            >
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  hasAnswered && isCorrect
                    ? "bg-emerald-600 text-white"
                    : hasAnswered && isSelected && !isCorrect
                    ? "bg-rose-600 text-white"
                    : "border border-slate-300 bg-slate-100 text-slate-600"
                }`}
              >
                {option.code}
              </span>
              <span className="flex-1 text-sm leading-normal">{option.text}</span>
              {hasAnswered && isCorrect && (
                <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600 mt-0.5" />
              )}
              {hasAnswered && isSelected && !isCorrect && (
                <XCircle className="h-5 w-5 shrink-0 text-rose-500 mt-0.5" />
              )}
            </button>
          );
        })}
      </div>

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
          <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50/80 p-4 text-sm animate-in fade-in duration-200">
            {/* Correct Answer Badge */}
            <div className="flex items-center gap-2 pb-2">
              <span className="rounded bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-800">
                Official UPSC Key: Option ({question.correctOption})
              </span>
              {question.explanation?.relatedConcept && (
                <span className="text-xs font-medium text-slate-500">
                  Concept: {question.explanation.relatedConcept}
                </span>
              )}
            </div>

            {/* Core Takeaway */}
            {question.explanation?.summary && (
              <p className="font-semibold text-slate-800 leading-snug">
                {question.explanation.summary}
              </p>
            )}

            {/* Statement Analysis */}
            {question.explanation?.detailedExplanation && (
              <div className="mt-2.5 text-xs text-slate-700 leading-relaxed space-y-1.5 border-t border-slate-200/60 pt-2.5">
                <p className="font-bold text-slate-900 uppercase tracking-wide text-[10px]">
                  Pedagogical Breakdown:
                </p>
                <p className="whitespace-pre-line">
                  {question.explanation.detailedExplanation}
                </p>
              </div>
            )}

            {/* Elimination Technique */}
            {question.explanation?.eliminationTechnique && (
              <div className="mt-2.5 rounded bg-blue-50/60 border border-blue-100 p-2.5 text-xs text-blue-950">
                <span className="font-bold flex items-center gap-1 text-blue-800">
                  <Sparkles className="h-3.5 w-3.5 text-blue-600" />
                  Elimination & Exam Technique:
                </span>
                <p className="mt-1 text-slate-700">{question.explanation.eliminationTechnique}</p>
              </div>
            )}

            {/* Standard Reference Citation */}
            {question.explanation?.sourceCitation && (
              <div className="mt-2 text-[11px] font-medium text-slate-500 italic">
                Source Reference: {question.explanation.sourceCitation}
              </div>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
