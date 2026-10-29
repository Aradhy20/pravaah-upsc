"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  FileText,
  Clock,
  CheckCircle,
  RotateCw,
  Sparkles,
  Save,
  BookOpen,
  HelpCircle,
  Award,
  AlertCircle,
  Eye,
  CheckSquare,
} from "lucide-react";

export default function MainsWorkspacePage() {
  const [selectedPaper, setSelectedPaper] = useState("GS1");
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeQuestion, setActiveQuestion] = useState<any | null>(null);
  const [userAnswer, setUserAnswer] = useState("");
  const [timeSeconds, setTimeSeconds] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [selfScore, setSelfScore] = useState<number>(7);
  const [selfNotes, setSelfNotes] = useState("");

  // Checklist states
  const [checklist, setChecklist] = useState({
    intro: false,
    multidimensional: false,
    caseStudyOrFact: false,
    wayForward: false,
    conclusion: false,
  });

  const loadMainsQuestions = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/v1/mains?paper=${selectedPaper}`);
      const data = await res.json();
      if (res.ok && data.success) {
        const qList = data.questions || [];
        setQuestions(qList);
        if (qList.length > 0) {
          const first = qList[0];
          setActiveQuestion(first);
          setUserAnswer(first.userDraft?.userAnswer || "");
          setSelfScore(first.userDraft?.selfEvaluationScore || 7);
          setSelfNotes(first.userDraft?.selfEvaluationNotes || "");
          setTimeSeconds(first.userDraft?.timeSpentSeconds || 0);
        } else {
          setActiveQuestion(null);
        }
      } else {
        setError(data.error || "Failed to load Mains questions.");
        setQuestions([]);
        setActiveQuestion(null);
      }
    } catch (e: any) {
      console.error("Failed to load mains questions:", e);
      setError("Network error while connecting to Mains repository.");
      setQuestions([]);
      setActiveQuestion(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMainsQuestions();
  }, [selectedPaper]);

  // Timer interval
  useEffect(() => {
    let interval: any = null;
    if (timerRunning) {
      interval = setInterval(() => {
        setTimeSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timerRunning]);

  const handleSelectQuestion = (q: any) => {
    setActiveQuestion(q);
    setUserAnswer(q.userDraft?.userAnswer || "");
    setSelfScore(q.userDraft?.selfEvaluationScore || 7);
    setSelfNotes(q.userDraft?.selfEvaluationNotes || "");
    setTimeSeconds(q.userDraft?.timeSpentSeconds || 0);
    setTimerRunning(false);
    setSaveSuccess(false);
  };

  const wordCount = userAnswer.trim().split(/\s+/).filter(Boolean).length;

  const handleSaveDraft = async () => {
    if (!activeQuestion || saving) return;
    setSaving(true);
    try {
      const res = await fetch("/api/v1/mains/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mainsQuestionId: activeQuestion.id,
          userAnswer,
          wordCount,
          timeSpentSeconds: timeSeconds,
          selfEvaluationScore: selfScore,
          selfEvaluationNotes: selfNotes,
          isSubmitted: false,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (e) {
      console.error("Failed to save draft:", e);
    } finally {
      setSaving(false);
    }
  };

  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Banner */}
        <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-blue-950 rounded-2xl p-6 sm:p-10 text-white shadow-sm mb-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-200 text-xs font-semibold mb-4 border border-indigo-400/20">
              <FileText className="h-3.5 w-3.5" />
              Official GS Mains Answer-Writing Workspace
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Mains Practice & <span className="text-blue-400">Answer Frameworks</span>
            </h1>
            <p className="mt-3 text-slate-300 text-sm sm:text-base leading-relaxed">
              Practice authentic previous-year questions from GS I, GS II, GS III, GS IV Ethics, and Essay. Track your speed with timed practice, stay within official word limits, and evaluate structure with standard UPSC rubrics.
            </p>
          </div>
        </div>

        {/* Paper selector tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {["GS1", "GS2", "GS3", "GS4", "ESSAY"].map((paper) => (
            <button
              key={paper}
              onClick={() => setSelectedPaper(paper)}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
                selectedPaper === paper
                  ? "bg-blue-700 text-white shadow-sm"
                  : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
              }`}
            >
              {paper === "ESSAY" ? "Essay Paper" : `Mains ${paper}`}
            </button>
          ))}
        </div>

        {/* Workspace Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Question Drawer (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
              <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 px-2">
                {loading ? "Questions (Loading...)" : `Questions (${questions.length})`}
              </h2>

              {error ? (
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 text-center">
                  <p className="font-semibold mb-2">{error}</p>
                  <button
                    onClick={() => loadMainsQuestions()}
                    className="px-3 py-1.5 rounded-lg bg-rose-700 text-white text-[11px] font-bold hover:bg-rose-800 transition"
                  >
                    Retry Loading
                  </button>
                </div>
              ) : loading ? (
                <div className="py-12 text-center text-xs text-slate-400">Loading verified questions...</div>
              ) : questions.length === 0 ? (
                <div className="p-4 text-xs text-slate-500 bg-slate-50 rounded-xl border border-slate-100 text-center">
                  <BookOpen className="h-6 w-6 text-slate-300 mx-auto mb-2" />
                  <p className="font-semibold text-slate-700">No published questions yet</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Questions for {selectedPaper === "ESSAY" ? "Essay" : selectedPaper} are currently undergoing human editorial review.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {questions.map((q) => {
                    const isSelected = activeQuestion?.id === q.id;
                    return (
                      <button
                        key={q.id}
                        onClick={() => handleSelectQuestion(q)}
                        className={`w-full text-left p-3 rounded-xl border text-xs transition-all ${
                          isSelected
                            ? "bg-blue-50/80 border-blue-600 text-blue-950 font-medium ring-2 ring-blue-600/10"
                            : "bg-white border-slate-100 hover:bg-slate-50 text-slate-700"
                        }`}
                      >
                        <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                          <span className="font-bold text-slate-700">
                            UPSC {q.year} • Q#{q.questionNumber}
                          </span>
                          <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 font-semibold">
                            {q.marks} Marks • {q.wordLimit}w
                          </span>
                        </div>
                        <p className="line-clamp-2 text-slate-800 leading-snug">{q.questionText}</p>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Answer Framework Tip Box */}
            {activeQuestion?.frameworkGuidance && (
              <div className="bg-indigo-50/60 rounded-2xl border border-indigo-100 p-5 shadow-sm text-xs text-slate-700 leading-relaxed">
                <span className="font-bold text-indigo-950 block mb-2 flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-indigo-700" />
                  Editorial Framework Guidance
                </span>
                <p className="whitespace-pre-line text-indigo-900/90">{activeQuestion.frameworkGuidance}</p>
              </div>
            )}
          </div>

          {/* Right: Answer Writing Editor (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            {activeQuestion ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
                {/* Active Question Header */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-4 mb-4 border-b border-slate-100 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded bg-blue-100 text-blue-800 font-bold">
                      {activeQuestion.paperCode}
                    </span>
                    <span className="font-semibold text-slate-700">
                      UPSC {activeQuestion.year} • Question #{activeQuestion.questionNumber}
                    </span>
                    <span className="text-slate-400">({activeQuestion.theme})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded">
                      {activeQuestion.marks} Marks
                    </span>
                    <span className="font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded">
                      Limit: {activeQuestion.wordLimit} Words
                    </span>
                  </div>
                </div>

                {/* Question Stem */}
                <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-relaxed mb-6">
                  {activeQuestion.questionText}
                </h3>

                {/* Editor Bar: Timer & Word Counter */}
                <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200 mb-4 text-xs">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setTimerRunning(!timerRunning)}
                      className={`px-3 py-1 rounded-lg font-bold flex items-center gap-1.5 transition-colors ${
                        timerRunning
                          ? "bg-rose-100 text-rose-700 border border-rose-200"
                          : "bg-slate-200 hover:bg-slate-300 text-slate-700"
                      }`}
                    >
                      <Clock className="h-3.5 w-3.5" />
                      {timerRunning ? "Pause Timer" : "Start Timer"}
                    </button>
                    <span className="font-mono text-sm font-bold text-slate-700">
                      {formatTimer(timeSeconds)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">Word Count:</span>
                    <span
                      className={`font-mono text-sm font-bold ${
                        wordCount > activeQuestion.wordLimit
                          ? "text-rose-600"
                          : wordCount > activeQuestion.wordLimit * 0.8
                          ? "text-emerald-600"
                          : "text-slate-700"
                      }`}
                    >
                      {wordCount} / {activeQuestion.wordLimit}
                    </span>
                  </div>
                </div>

                {/* Textarea */}
                <textarea
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder="Write your answer here using structured headings, bullet points, and clear introduction-body-conclusion dimensions..."
                  rows={14}
                  className="w-full p-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm text-slate-800 leading-relaxed font-sans placeholder:text-slate-400"
                />

                {/* Structure Checklist */}
                <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                  <span className="font-bold text-slate-800 block mb-2">
                    Structure Self-Audit Checklist:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <label className="flex items-center gap-2 text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={checklist.intro}
                        onChange={(e) => setChecklist({ ...checklist, intro: e.target.checked })}
                        className="rounded text-blue-600 focus:ring-blue-500 h-3.5 w-3.5"
                      />
                      Introduction with definition or context
                    </label>
                    <label className="flex items-center gap-2 text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={checklist.multidimensional}
                        onChange={(e) =>
                          setChecklist({ ...checklist, multidimensional: e.target.checked })
                        }
                        className="rounded text-blue-600 focus:ring-blue-500 h-3.5 w-3.5"
                      />
                      Multi-dimensional body (Social, Eco, Legal)
                    </label>
                    <label className="flex items-center gap-2 text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={checklist.caseStudyOrFact}
                        onChange={(e) =>
                          setChecklist({ ...checklist, caseStudyOrFact: e.target.checked })
                        }
                        className="rounded text-blue-600 focus:ring-blue-500 h-3.5 w-3.5"
                      />
                      Concrete examples, committee, or Article citations
                    </label>
                    <label className="flex items-center gap-2 text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={checklist.wayForward}
                        onChange={(e) => setChecklist({ ...checklist, wayForward: e.target.checked })}
                        className="rounded text-blue-600 focus:ring-blue-500 h-3.5 w-3.5"
                      />
                      Actionable Way Forward & Best practices
                    </label>
                  </div>
                </div>

                {/* Self-Evaluation Rubric Slider */}
                <div className="mt-6 p-4 bg-white rounded-xl border border-slate-200 text-xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-slate-800">
                      Self-Evaluation Score Rubric:
                    </span>
                    <span className="font-bold text-blue-700 text-sm">
                      {selfScore} / {activeQuestion.marks} Marks
                    </span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={activeQuestion.marks}
                    value={selfScore}
                    onChange={(e) => setSelfScore(Number(e.target.value))}
                    className="w-full accent-blue-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                    <span>1 (Poor / Off-topic)</span>
                    <span>Average (~50%)</span>
                    <span>{activeQuestion.marks} (Outstanding)</span>
                  </div>
                </div>

                {/* Save controls */}
                <div className="mt-6 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs">
                    {saveSuccess && (
                      <span className="text-emerald-600 font-bold flex items-center gap-1">
                        <CheckCircle className="h-4 w-4" /> Draft Saved Successfully!
                      </span>
                    )}
                  </div>

                  <button
                    onClick={handleSaveDraft}
                    disabled={saving}
                    className="px-6 py-2.5 rounded-lg bg-blue-700 hover:bg-blue-600 text-white text-xs font-bold transition-all shadow flex items-center gap-2 disabled:opacity-50"
                  >
                    <Save className="h-4 w-4" />
                    {saving ? "Saving Draft..." : "Save Answer Draft"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500">
                Select a question from the left drawer to begin writing.
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
