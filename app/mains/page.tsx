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
  ShieldCheck,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/context";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function MainsWorkspacePage() {
  const { language, t } = useLanguage();
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
  const [evaluating, setEvaluating] = useState(false);
  const [aiEvaluation, setAiEvaluation] = useState<any | null>(null);

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

    try {
      if (q.userDraft?.aiFeedbackJson) {
        setAiEvaluation(JSON.parse(q.userDraft.aiFeedbackJson));
      } else {
        setAiEvaluation(null);
      }
    } catch {
      setAiEvaluation(null);
    }
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

  const handleEvaluateWithAI = async () => {
    if (!activeQuestion || evaluating) return;
    if (wordCount < 30) {
      alert("Please write at least 30 words before requesting AI evaluation.");
      return;
    }
    setEvaluating(true);
    try {
      const res = await fetch("/api/v1/mains/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mainsQuestionId: activeQuestion.id,
          userAnswer,
        }),
      });
      const data = await res.json();
      if (data.success && data.evaluation) {
        setAiEvaluation(data.evaluation);
        setSelfScore(data.evaluation.totalScore);
      } else {
        alert(data.error || "Failed to evaluate answer.");
      }
    } catch (e) {
      console.error("Failed to evaluate with AI:", e);
      alert("Network error evaluating Mains answer.");
    } finally {
      setEvaluating(false);
    }
  };

  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-heritage-ivory flex flex-col font-sans">
      <Header />
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Banner */}
        <div className="bg-gradient-to-r from-heritage-wine via-heritage-burgundy to-heritage-wine rounded-2xl p-6 sm:p-10 text-white shadow-gold border border-heritage-gold/30 mb-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-heritage-cream/15 text-heritage-gold text-xs font-bold mb-4 border border-heritage-gold/30">
              <FileText className="h-3.5 w-3.5" />
              {language === "hi" ? "आधिकारिक GS मुख्य परीक्षा उत्तर लेखन कार्यक्षेत्र" : "Official GS Mains Answer-Writing Workspace"}
            </div>
            <h1 className="font-serif text-2xl sm:text-4xl font-bold tracking-tight">
              {language === "hi" ? (
                <>मुख्य परीक्षा अभ्यास एवं <span className="text-heritage-gold">उत्तर संरचना</span></>
              ) : (
                <>Mains Practice & <span className="text-heritage-gold">Answer Frameworks</span></>
              )}
            </h1>
            <p className="mt-3 text-heritage-cream/90 text-sm sm:text-base leading-relaxed">
              {language === "hi"
                ? "GS 1, GS 2, GS 3, GS 4 नीतिशास्त्र एवं निबंध के प्रामाणिक विगत वर्ष प्रश्नों का अभ्यास करें। टाइमर के साथ गति ट्रैक करें, शब्द सीमा में रहें और मानक 10-आयामी UPSC रूब्रिक्स द्वारा मूल्यांकन प्राप्त करें।"
                : "Practice authentic previous-year questions from GS I, GS II, GS III, GS IV Ethics, and Essay. Track your speed with timed practice, stay within official word limits, and evaluate structure with standard UPSC rubrics."}
            </p>
          </div>
        </div>

        {/* Paper selector tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {["GS1", "GS2", "GS3", "GS4", "ESSAY"].map((paper) => (
            <button
              key={paper}
              onClick={() => setSelectedPaper(paper)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                selectedPaper === paper
                  ? "bg-heritage-burgundy text-white shadow-xs font-extrabold"
                  : "bg-white border border-heritage-border text-heritage-text hover:bg-heritage-cream"
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
            <div className="bg-white rounded-2xl border border-heritage-border p-4 shadow-card">
              <h2 className="text-xs font-bold text-heritage-secondary uppercase tracking-wider mb-3 px-2">
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
                <div className="py-12 text-center text-xs text-heritage-secondary">Loading verified questions...</div>
              ) : questions.length === 0 ? (
                <div className="p-4 text-xs text-heritage-secondary bg-heritage-ivory rounded-xl border border-heritage-border text-center">
                  <BookOpen className="h-6 w-6 text-heritage-gold mx-auto mb-2" />
                  <p className="font-serif font-bold text-heritage-text">No published questions yet</p>
                  <p className="text-[11px] text-heritage-secondary mt-0.5">
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
                        className={`w-full text-left p-3.5 rounded-xl border text-xs transition-all ${
                          isSelected
                            ? "bg-heritage-cream border-heritage-burgundy text-heritage-burgundy font-medium ring-1 ring-heritage-burgundy/20"
                            : "bg-white border-heritage-border hover:bg-heritage-ivory text-heritage-text"
                        }`}
                      >
                        <div className="flex items-center justify-between text-[11px] text-heritage-secondary mb-1">
                          <span className="font-bold text-heritage-text">
                            UPSC CSE {q.year} • Q.{q.questionNumber}
                          </span>
                          <span className="bg-heritage-ivory px-1.5 py-0.5 rounded text-heritage-secondary font-semibold border border-heritage-border">
                            {q.marks}M • {q.wordLimit}w
                          </span>
                        </div>
                        <p className="font-serif line-clamp-2 text-heritage-text leading-snug">{q.questionText}</p>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Answer Framework Tip Box */}
            {activeQuestion?.frameworkGuidance && (
              <div className="bg-heritage-cream/80 rounded-2xl border border-heritage-gold/40 p-5 shadow-xs text-xs text-heritage-text leading-relaxed">
                <span className="font-bold text-heritage-burgundy block mb-2 flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-heritage-gold" />
                  Editorial Framework Guidance
                </span>
                <p className="whitespace-pre-line text-heritage-text leading-relaxed">{activeQuestion.frameworkGuidance}</p>
              </div>
            )}
          </div>

          {/* Right: Answer Writing Editor (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            {activeQuestion ? (
              <div className="bg-white rounded-2xl border border-heritage-border p-6 sm:p-8 shadow-card">
                {/* Active Question Header */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-4 mb-4 border-b border-heritage-border/60 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded bg-heritage-burgundy/10 text-heritage-burgundy font-bold border border-heritage-burgundy/20">
                      {activeQuestion.paperCode}
                    </span>
                    <span className="font-semibold text-heritage-text">
                      UPSC CSE {activeQuestion.year} • Question {activeQuestion.questionNumber}
                    </span>
                    {activeQuestion.theme && (
                      <span className="text-heritage-secondary font-serif">({activeQuestion.theme})</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-heritage-text bg-heritage-cream px-2.5 py-1 rounded border border-heritage-border">
                      {activeQuestion.marks} Marks
                    </span>
                    <span className="font-bold text-heritage-text bg-heritage-cream px-2.5 py-1 rounded border border-heritage-border">
                      Limit: {activeQuestion.wordLimit} Words
                    </span>
                  </div>
                </div>

                {/* Question Stem */}
                <h3 className="font-serif text-base sm:text-lg font-bold text-heritage-text leading-relaxed mb-6">
                  {activeQuestion.questionText}
                </h3>

                {/* Editor Bar: Timer & Word Counter */}
                <div className="flex items-center justify-between bg-heritage-ivory p-3 rounded-xl border border-heritage-border mb-4 text-xs">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setTimerRunning(!timerRunning)}
                      className={`px-3 py-1 rounded-lg font-bold flex items-center gap-1.5 transition-colors ${
                        timerRunning
                          ? "bg-rose-100 text-rose-700 border border-rose-200"
                          : "bg-heritage-cream hover:bg-heritage-cream/80 text-heritage-text border border-heritage-border"
                      }`}
                    >
                      <Clock className="h-3.5 w-3.5 text-heritage-gold" />
                      {timerRunning ? "Pause Timer" : "Start Timer"}
                    </button>
                    <span className="font-mono text-sm font-bold text-heritage-text">
                      {formatTimer(timeSeconds)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-heritage-secondary">Word Count:</span>
                    <span
                      className={`font-mono text-sm font-bold ${
                        wordCount > activeQuestion.wordLimit
                          ? "text-rose-600"
                          : wordCount > activeQuestion.wordLimit * 0.8
                          ? "text-emerald-700"
                          : "text-heritage-text"
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
                  className="w-full p-4 rounded-xl border border-heritage-border focus:outline-none focus:ring-2 focus:ring-heritage-gold/30 focus:border-heritage-gold text-sm sm:text-base text-heritage-text leading-relaxed font-serif placeholder:text-heritage-secondary/70 bg-white"
                />

                {/* Structure Checklist */}
                <div className="mt-6 p-4 bg-heritage-ivory rounded-xl border border-heritage-border text-xs">
                  <span className="font-serif font-bold text-heritage-burgundy block mb-2">
                    Structure Self-Audit Checklist:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <label className="flex items-center gap-2 text-heritage-text cursor-pointer">
                      <input
                        type="checkbox"
                        checked={checklist.intro}
                        onChange={(e) => setChecklist({ ...checklist, intro: e.target.checked })}
                        className="rounded text-heritage-burgundy focus:ring-heritage-gold h-3.5 w-3.5"
                      />
                      Introduction with definition or context
                    </label>
                    <label className="flex items-center gap-2 text-heritage-text cursor-pointer">
                      <input
                        type="checkbox"
                        checked={checklist.multidimensional}
                        onChange={(e) =>
                          setChecklist({ ...checklist, multidimensional: e.target.checked })
                        }
                        className="rounded text-heritage-burgundy focus:ring-heritage-gold h-3.5 w-3.5"
                      />
                      Multi-dimensional body (Social, Eco, Legal)
                    </label>
                    <label className="flex items-center gap-2 text-heritage-text cursor-pointer">
                      <input
                        type="checkbox"
                        checked={checklist.caseStudyOrFact}
                        onChange={(e) =>
                          setChecklist({ ...checklist, caseStudyOrFact: e.target.checked })
                        }
                        className="rounded text-heritage-burgundy focus:ring-heritage-gold h-3.5 w-3.5"
                      />
                      Concrete examples, committee, or Article citations
                    </label>
                    <label className="flex items-center gap-2 text-heritage-text cursor-pointer">
                      <input
                        type="checkbox"
                        checked={checklist.wayForward}
                        onChange={(e) => setChecklist({ ...checklist, wayForward: e.target.checked })}
                        className="rounded text-heritage-burgundy focus:ring-heritage-gold h-3.5 w-3.5"
                      />
                      Actionable Way Forward & Best practices
                    </label>
                  </div>
                </div>

                {/* Self-Evaluation Rubric Slider */}
                <div className="mt-6 p-4 bg-white rounded-xl border border-heritage-border text-xs shadow-xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-serif font-bold text-heritage-text">
                      Self-Evaluation Score Rubric:
                    </span>
                    <span className="font-serif font-bold text-heritage-burgundy text-sm">
                      {selfScore} / {activeQuestion.marks} Marks
                    </span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={activeQuestion.marks}
                    value={selfScore}
                    onChange={(e) => setSelfScore(Number(e.target.value))}
                    className="w-full accent-heritage-burgundy cursor-pointer"
                  />
                  <div className="flex justify-between text-[11px] text-heritage-secondary mt-1">
                    <span>1 (Poor / Off-topic)</span>
                    <span>Average (~50%)</span>
                    <span>{activeQuestion.marks} (Outstanding)</span>
                  </div>
                </div>

                {/* AI Evaluation Scorecard */}
                {aiEvaluation && (
                  <div className="mt-6 p-5 sm:p-6 bg-gradient-to-br from-heritage-ivory via-heritage-cream/40 to-white rounded-2xl border-2 border-heritage-gold/40 shadow-card animate-in fade-in-50">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-heritage-border/60 pb-3 mb-4">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-heritage-burgundy text-white shadow-xs">
                          <Sparkles className="h-4 w-4 text-heritage-gold" />
                        </div>
                        <div>
                          <h4 className="font-serif text-sm font-bold text-heritage-text">UPSC AI Pedagogical Evaluation</h4>
                          <span className="text-[11px] font-medium text-heritage-secondary">
                            Evaluated against official UPSC CSE Mains rubrics
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="font-serif text-xl font-bold text-heritage-burgundy">
                          {aiEvaluation.totalScore} / {activeQuestion.marks}
                        </span>
                        <span className="text-[10px] text-heritage-secondary block font-bold">UPSC ESTIMATED MARKS</span>
                      </div>
                    </div>

                    <p className="text-xs text-heritage-text leading-relaxed mb-4">
                      {aiEvaluation.summaryCritique}
                    </p>

                    {/* 4 Dimension Breakdowns */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                      {aiEvaluation.dimensions?.map((dim: any, idx: number) => (
                        <div key={idx} className="bg-white p-3.5 rounded-xl border border-heritage-border shadow-xs">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="font-bold text-heritage-text">{dim.name}</span>
                            <span className="font-serif font-bold text-heritage-burgundy">
                              {dim.score} / {dim.maxScore}
                            </span>
                          </div>
                          <p className="text-[11px] text-heritage-secondary leading-snug">{dim.feedback}</p>
                        </div>
                      ))}
                    </div>

                    {/* Missing points to include */}
                    {aiEvaluation.missingPoints?.length > 0 && (
                      <div className="p-3.5 bg-heritage-cream/80 rounded-xl border border-heritage-gold/30 text-xs mb-4">
                        <span className="font-bold text-heritage-burgundy block mb-1">Recommended Value Additions:</span>
                        <ul className="list-disc list-inside space-y-0.5 text-heritage-text text-[11px]">
                          {aiEvaluation.missingPoints.map((pt: string, idx: number) => (
                            <li key={idx}>{pt}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Official Examiner Guidance Disclaimer */}
                    <div className="p-3 bg-white rounded-xl border border-heritage-border text-[11px] text-heritage-secondary leading-relaxed flex items-start gap-2">
                      <ShieldCheck className="h-4 w-4 text-heritage-gold shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-heritage-text">Examiner Disclaimer: </span>
                        {language === "hi"
                          ? "प्रवाह एआई मूल्यांकन एक शैक्षणिक स्व-मूल्यांकन रूब्रिक है जो मानक यूपीएससी मापदंडों पर आधारित है। यह वास्तविक परीक्षक की व्यक्तिगत दृष्टि का विकल्प नहीं है और अंकों की कोई औपचारिक गारंटी नहीं देता।"
                          : "Pravaah AI evaluation is an algorithmic diagnostic tool calibrated against official UPSC CSE rubrics (Intro, Body Dimensions, Empirical Evidence, Conclusion) to aid self-reflection. It does not replace human examiner subjectivity or guarantee UPSC marks."}
                      </div>
                    </div>
                  </div>
                )}

                {/* Save & AI Evaluate Controls */}
                <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-xs">
                    {saveSuccess && (
                      <span className="text-emerald-700 font-bold flex items-center gap-1">
                        <CheckCircle className="h-4 w-4" /> Draft Saved Successfully!
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2.5">
                    <button
                      onClick={handleEvaluateWithAI}
                      disabled={evaluating || wordCount < 30}
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-heritage-burgundy to-heritage-wine hover:from-heritage-wine hover:to-heritage-burgundy text-white text-xs font-bold transition-all shadow-xs flex items-center gap-2 disabled:opacity-50"
                      title={wordCount < 30 ? "Write at least 30 words" : "Get instant AI grading and feedback"}
                    >
                      {evaluating ? (
                        <>
                          <RotateCw className="h-4 w-4 animate-spin text-heritage-gold" />
                          <span>Evaluating Draft...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4 text-heritage-gold" />
                          <span>Evaluate with AI</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={handleSaveDraft}
                      disabled={saving}
                      className="px-5 py-2.5 rounded-xl bg-heritage-wine hover:bg-heritage-burgundy text-white text-xs font-bold transition-all shadow-xs flex items-center gap-2 disabled:opacity-50"
                    >
                      <Save className="h-4 w-4" />
                      {saving ? "Saving..." : "Save Draft"}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-heritage-border p-12 text-center text-heritage-secondary font-serif">
                Select a question from the left drawer to begin writing.
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
