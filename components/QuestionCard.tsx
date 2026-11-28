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
import { useLanguage } from "@/lib/i18n/context";

export interface OptionItem {
  id?: string;
  code: string;
  label?: string;
  text: string;
  textEn?: string;
  textHi?: string | null;
  isCorrect?: boolean;
}

export interface QuestionData {
  id: string;
  recordId?: string;
  questionGroupId?: string | null;
  year: number;
  questionNumber: number;
  paperCode: string;
  questionText: string;
  questionTextEn?: string;
  questionTextHi?: string | null;
  language?: string;
  difficulty?: string;
  subject?: string;
  topic?: string;
  options: OptionItem[];
  correctOption: string;
  answerKeyType?: string;
  verificationStatus?: string;
  answerProvenance?: string;
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
    id?: string;
    sourceName: string;
    publisher?: string;
    sourceUrl?: string;
    evidenceType?: string;
    pageNumber?: string;
    citationText?: string;
  }>;
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
  const { language: globalLang } = useLanguage();
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(initialBookmarked);
  const [noteContent, setNoteContent] = useState(initialNote);
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [noteSaved, setNoteSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [langMode, setLangMode] = useState<"EN" | "HI" | "BOTH">(
    globalLang === "hi" && question.questionTextHi ? "HI" : "EN"
  );

  React.useEffect(() => {
    if (globalLang === "hi" && question.questionTextHi) {
      setLangMode("HI");
    } else if (globalLang === "en") {
      setLangMode("EN");
    }
  }, [globalLang, question.questionTextHi]);

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
    <article className="rounded-2xl border border-heritage-border bg-white p-5 sm:p-6 shadow-card hover:shadow-hover transition-shadow duration-200">
      {/* Question Header & Badges */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-heritage-border/60 pb-3 text-xs">
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <span
            className={`rounded-md px-2.5 py-1 font-bold ${
              question.paperCode === "GS2"
                ? "bg-heritage-saffron/10 text-heritage-saffron border border-heritage-saffron/30"
                : "bg-heritage-burgundy/10 text-heritage-burgundy border border-heritage-burgundy/30"
            }`}
          >
            {question.paperCode === "GS2" ? "CSAT Paper II" : "GS Paper I"}
          </span>
          <span className="rounded-md bg-heritage-cream px-2.5 py-1 font-bold text-heritage-burgundy border border-heritage-border">
            {question.year}
          </span>
          <span className="font-semibold text-heritage-secondary">
            Q.{question.questionNumber}
          </span>
          {question.subject && (
            <span className="rounded-full bg-heritage-ivory px-2.5 py-0.5 font-medium text-heritage-text border border-heritage-border">
              {question.subject}
            </span>
          )}
          {question.topic && (
            <span className="hidden sm:inline-block rounded-full bg-heritage-cream/40 px-2 py-0.5 text-heritage-secondary text-[11px]">
              {question.topic}
            </span>
          )}
          {question.answerKeyType && (
            <span
              className={`rounded-md px-2 py-0.5 text-[10px] font-bold border ${
                question.answerKeyType === "UPSC_FINAL_KEY"
                  ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                  : "bg-amber-50 text-amber-800 border-amber-200"
              }`}
            >
              {question.answerKeyType === "UPSC_FINAL_KEY" ? "Official UPSC Key" : "Faculty Key"}
            </span>
          )}
        </div>

        {/* Card Utility Actions & Bilingual Switcher */}
        <div className="flex items-center gap-1.5">
          {question.questionTextHi && (
            <div className="flex items-center rounded-lg border border-heritage-border bg-heritage-ivory p-0.5 text-[10px] font-bold mr-1">
              <button
                onClick={() => setLangMode("EN")}
                className={`rounded px-1.5 py-0.5 transition ${
                  langMode === "EN" ? "bg-heritage-burgundy text-white shadow-xs font-bold" : "text-heritage-secondary hover:text-heritage-text"
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLangMode("HI")}
                className={`rounded px-1.5 py-0.5 font-hindi transition ${
                  langMode === "HI" ? "bg-heritage-burgundy text-white shadow-xs font-bold" : "text-heritage-secondary hover:text-heritage-text"
                }`}
              >
                हि
              </button>
              <button
                onClick={() => setLangMode("BOTH")}
                className={`rounded px-1.5 py-0.5 transition ${
                  langMode === "BOTH" ? "bg-heritage-burgundy text-white shadow-xs font-bold" : "text-heritage-secondary hover:text-heritage-text"
                }`}
              >
                Both
              </button>
            </div>
          )}
          <button
            onClick={handleToggleBookmark}
            title={isBookmarked ? "Remove Bookmark" : "Save for Revision"}
            className={`rounded-lg p-1.5 transition ${
              isBookmarked
                ? "text-heritage-burgundy bg-heritage-cream"
                : "text-heritage-secondary hover:bg-heritage-ivory hover:text-heritage-text"
            }`}
          >
            <Bookmark className={`h-4 w-4 ${isBookmarked ? "fill-heritage-burgundy" : ""}`} />
          </button>
          <button
            onClick={() => setIsEditingNote(!isEditingNote)}
            title="Add private study note"
            className="rounded-lg p-1.5 text-heritage-secondary hover:bg-heritage-ivory hover:text-heritage-text transition"
          >
            <FileEdit className="h-4 w-4" />
          </button>
          <button
            onClick={handleShare}
            title="Copy question link"
            className="rounded-lg p-1.5 text-heritage-secondary hover:bg-heritage-ivory hover:text-heritage-text transition"
          >
            {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Share2 className="h-4 w-4" />}
          </button>
          <button
            onClick={() => setIsReporting(!isReporting)}
            title="Report question error or key ambiguity"
            className={`rounded-lg p-1.5 transition ${
              isReporting
                ? "text-heritage-saffron bg-heritage-saffron/10"
                : "text-heritage-secondary hover:bg-heritage-ivory hover:text-heritage-text"
            }`}
          >
            <Flag className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Question Body (Serif Editorial Styling) */}
      <div className="mt-4 space-y-3 font-serif">
        {langMode === "HI" && !question.questionTextHi && (
          <div className="rounded-lg border border-amber-200 bg-amber-50/70 p-3 text-xs text-amber-800 font-sans">
            <span className="font-semibold block mb-0.5">आधिकारिक हिंदी अनुवाद सत्यापन में (Translation Pending)</span>
            इस प्रश्न का आधिकारिक यूपीएससी हिंदी पाठ डिजिटलीकरण व सत्यापन प्रक्रिया में है। मूल अंग्रेजी पाठ नीचे दिया गया है:
          </div>
        )}
        {(langMode === "EN" || langMode === "BOTH" || !question.questionTextHi) && (
          <p className="whitespace-pre-line text-base sm:text-lg font-medium leading-relaxed text-heritage-text">
            {question.questionTextEn || question.questionText}
          </p>
        )}
        {(langMode === "HI" || langMode === "BOTH") && question.questionTextHi && (
          <p className={`whitespace-pre-line text-base sm:text-lg font-medium leading-relaxed text-heritage-text font-hindi ${langMode === "BOTH" ? "border-t border-heritage-border/60 pt-3 text-heritage-secondary" : ""}`}>
            {question.questionTextHi}
          </p>
        )}
      </div>

      {/* Multiple Choice Options */}
      <div className="mt-5 space-y-2.5 font-sans">
        {question.options.map((option) => {
          const isSelected = selectedOption === option.code;
          const isCorrect = option.code.toUpperCase() === question.correctOption.toUpperCase();
          const hasAnswered = selectedOption !== null;

          let optionStyle = "border-heritage-border bg-white hover:border-heritage-gold hover:bg-heritage-ivory/50 text-heritage-text";

          if (hasAnswered) {
            if (isCorrect) {
              optionStyle = "border-emerald-500 bg-emerald-50/80 text-emerald-950 font-semibold ring-1 ring-emerald-500/20";
            } else if (isSelected && !isCorrect) {
              optionStyle = "border-rose-400 bg-rose-50 text-rose-950 font-medium ring-1 ring-rose-400/20";
            } else {
              optionStyle = "border-heritage-border/40 bg-heritage-ivory/30 text-heritage-secondary/70 opacity-80";
            }
          }

          const optTextEn = option.textEn || option.text;
          const optTextHi = option.textHi;

          return (
            <button
              key={option.code}
              onClick={() => handleSelectOption(option.code)}
              disabled={hasAnswered}
              className={`flex w-full items-start gap-3 rounded-xl border p-3.5 text-left transition duration-150 touch-target ${optionStyle}`}
            >
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                  hasAnswered && isCorrect
                    ? "bg-emerald-600 text-white"
                    : hasAnswered && isSelected && !isCorrect
                    ? "bg-rose-600 text-white"
                    : "border border-heritage-border bg-heritage-cream text-heritage-burgundy"
                }`}
              >
                {option.code}
              </span>
              <div className="flex-1 text-sm leading-normal">
                {(langMode === "EN" || langMode === "BOTH" || !optTextHi) && (
                  <div>{optTextEn}</div>
                )}
                {(langMode === "HI" || langMode === "BOTH") && optTextHi && (
                  <div className={`font-hindi ${langMode === "BOTH" ? "text-xs text-heritage-secondary mt-0.5" : ""}`}>
                    {optTextHi}
                  </div>
                )}
              </div>
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

      {/* Inline Student Note Box */}
      {(isEditingNote || noteContent) && (
        <div className="mt-4 rounded-xl border border-heritage-gold/40 bg-heritage-ivory p-3.5 text-xs">
          <div className="flex items-center justify-between pb-1 text-heritage-burgundy font-semibold">
            <span>Aspirant Study Note</span>
            {noteSaved && <span className="text-emerald-700 font-bold">Saved!</span>}
          </div>
          {isEditingNote ? (
            <div className="mt-1">
              <textarea
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder="Write your personal mnemonics, elimination tips or textbook references..."
                rows={2}
                className="w-full rounded-lg border border-heritage-gold/50 bg-white p-2.5 text-xs text-heritage-text focus:outline-none focus:ring-1 focus:ring-heritage-gold"
              />
              <div className="mt-2 flex justify-end gap-2">
                <button
                  onClick={() => setIsEditingNote(false)}
                  className="rounded px-2.5 py-1 text-heritage-secondary hover:bg-heritage-cream"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveNote}
                  className="rounded-lg bg-heritage-burgundy px-3.5 py-1 font-semibold text-white hover:bg-heritage-wine transition"
                >
                  Save Note
                </button>
              </div>
            </div>
          ) : (
            <p className="mt-1 text-heritage-text leading-relaxed">{noteContent}</p>
          )}
        </div>
      )}

      {/* Inline Issue Reporting Panel */}
      {isReporting && (
        <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50/70 p-3.5 text-xs animate-in fade-in duration-150">
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
                <label className="block text-[11px] font-semibold text-heritage-text mb-1">
                  Reason for discrepancy:
                </label>
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full rounded border border-rose-300 bg-white p-1.5 text-xs text-heritage-text focus:outline-none focus:ring-1 focus:ring-rose-500"
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
                  className="w-full rounded border border-rose-300 bg-white p-2 text-xs text-heritage-text focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button
                  onClick={() => setIsReporting(false)}
                  className="rounded px-2.5 py-1 text-heritage-secondary hover:bg-rose-100"
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
      <div className="mt-4 border-t border-heritage-border/60 pt-3">
        <button
          onClick={() => setShowExplanation(!showExplanation)}
          className="flex items-center gap-1.5 text-xs font-bold text-heritage-burgundy hover:text-heritage-wine transition"
        >
          <BookOpen className="h-4 w-4 text-heritage-gold" />
          <span>{showExplanation ? "Hide Detailed Explanation" : "Show Official Answer & Concept Breakdown"}</span>
          {showExplanation ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>

        {showExplanation && (
          <div className="mt-3 rounded-xl border border-heritage-border bg-heritage-ivory/70 p-4 text-sm animate-in fade-in duration-200">
            {/* Correct Answer Badge */}
            <div className="flex items-center gap-2 pb-2">
              <span className="rounded-md bg-emerald-100 px-2.5 py-1 text-xs font-black text-emerald-800">
                Official UPSC Key: Option ({question.correctOption})
              </span>
              {question.explanation?.relatedConcept && (
                <span className="text-xs font-semibold text-heritage-secondary">
                  Concept: {question.explanation.relatedConcept}
                </span>
              )}
            </div>

            {/* Core Takeaway */}
            {question.explanation?.summary && (
              <p className="font-semibold text-heritage-text leading-snug">
                {question.explanation.summary}
              </p>
            )}

            {/* Statement Analysis (Bilingual Aware) */}
            {question.explanation && (
              <div className="mt-2.5 text-xs text-heritage-text leading-relaxed space-y-2 border-t border-heritage-border/60 pt-2.5">
                <p className="font-bold text-heritage-burgundy uppercase tracking-wider text-[10px]">
                  Pedagogical Breakdown:
                </p>
                {(langMode === "EN" || langMode === "BOTH" || !question.explanation.explanationHi) && (
                  <p className="whitespace-pre-line">
                    {question.explanation.detailedExplanation}
                  </p>
                )}
                {(langMode === "HI" || langMode === "BOTH") && question.explanation.explanationHi && (
                  <p className={`whitespace-pre-line font-hindi ${langMode === "BOTH" ? "border-t border-heritage-border/40 pt-2 font-medium" : ""}`}>
                    {question.explanation.explanationHi}
                  </p>
                )}
              </div>
            )}

            {/* Elimination Technique */}
            {question.explanation?.eliminationTechnique && (
              <div className="mt-3 rounded-xl bg-heritage-cream/90 border border-heritage-gold/40 p-3 text-xs text-heritage-text">
                <span className="font-bold flex items-center gap-1.5 text-heritage-burgundy">
                  <Sparkles className="h-3.5 w-3.5 text-heritage-gold" />
                  Elimination & Exam Technique:
                </span>
                <p className="mt-1 leading-relaxed text-heritage-text">{question.explanation.eliminationTechnique}</p>
              </div>
            )}

            {/* Standard Reference Citation & Official Gazette Evidence */}
            {question.explanation?.sourceCitation && (
              <div className="mt-2.5 text-[11px] font-medium text-heritage-secondary italic">
                Source Reference: {question.explanation.sourceCitation}
              </div>
            )}

            {/* Official Citations & Provenance Links */}
            {question.citations && question.citations.length > 0 && (
              <div className="mt-3 border-t border-heritage-border/60 pt-2 text-[11px] text-heritage-secondary flex flex-wrap items-center gap-2">
                <span className="font-bold text-heritage-text">Official Evidence:</span>
                {question.citations.map((c, i) => (
                  <a
                    key={i}
                    href={c.sourceUrl || "https://www.upsc.gov.in/examinations/previous-question-papers"}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 rounded bg-heritage-cream px-2 py-0.5 text-heritage-burgundy hover:text-heritage-wine hover:underline transition"
                  >
                    <span>{c.sourceName}</span>
                    {c.pageNumber && <span className="text-heritage-secondary">({c.pageNumber})</span>}
                  </a>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
