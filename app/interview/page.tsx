"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  MessageSquare,
  BookOpen,
  Award,
  Sparkles,
  CheckCircle,
  HelpCircle,
  ShieldCheck,
  AlertTriangle,
  ChevronDown,
  Tag,
  Briefcase,
  Search,
  ExternalLink,
  Mic,
  Save,
  RotateCw,
} from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useLanguage } from "@/lib/i18n/context";

export default function InterviewPrepPage() {
  const { language } = useLanguage();
  const [questions, setQuestions] = useState<any[]>([]);
  const [sourceTypes, setSourceTypes] = useState<any[]>([]);
  const [selectedSourceType, setSelectedSourceType] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedFrameworks, setExpandedFrameworks] = useState<{ [id: string]: boolean }>({});
  const [practiceOpen, setPracticeOpen] = useState<{ [id: string]: boolean }>({});
  const [userResponses, setUserResponses] = useState<{ [id: string]: string }>({});
  const [evalResults, setEvalResults] = useState<{ [id: string]: any }>({});

  const fetchInterviewQuestions = async (type = "ALL") => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/v1/interview?sourceType=${type}`);
      const data = await res.json();
      if (res.ok && data.success) {
        setQuestions(data.data.questions || []);
        if (sourceTypes.length === 0) {
          setSourceTypes(data.data.sourceTypes || []);
        }
      } else {
        setError(data.error || "Failed to load interview records.");
      }
    } catch (e: any) {
      console.error("Interview fetch error:", e);
      setError("Network error connecting to interview archive.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInterviewQuestions(selectedSourceType);
  }, [selectedSourceType]);

  // Load saved drafts from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved: { [id: string]: string } = {};
      for (const q of questions) {
        const item = localStorage.getItem(`pravaah_interview_draft_${q.id}`);
        if (item) saved[q.id] = item;
      }
      setUserResponses(saved);
    }
  }, [questions]);

  const toggleFramework = (id: string) => {
    setExpandedFrameworks((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const togglePractice = (id: string) => {
    setPracticeOpen((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleResponseChange = (id: string, text: string) => {
    setUserResponses((prev) => ({ ...prev, [id]: text }));
    if (typeof window !== "undefined") {
      localStorage.setItem(`pravaah_interview_draft_${id}`, text);
    }
  };

  const analyzeResponse = (id: string, text: string) => {
    const words = text.trim().split(/\s+/).filter(Boolean);
    const count = words.length;
    const lower = text.toLowerCase();

    const hasConstitutional = /constitution|article|rule of law|statutory|mandate|secular|justice|fundamental|guidelines|supreme court/i.test(
      lower
    );
    const hasAdministrative = /procedure|coordination|stakeholder|dialogue|sops|protocol|preventive|surveillance|deputy|collector|dm|peace committee/i.test(
      lower
    );
    const hasBalanced = /however|on the other hand|while|balanced|nuanced|pragmatic|both|aspects/i.test(
      lower
    );

    let pace = "Optimal (~1 to 1.5 minutes speaking time)";
    if (count < 40) pace = "Too brief for a comprehensive interview answer";
    if (count > 220) pace = "May exceed typical board attention span (keep around 120-180 words)";

    setEvalResults((prev) => ({
      ...prev,
      [id]: {
        wordCount: count,
        paceEstimate: pace,
        hasConstitutional,
        hasAdministrative,
        hasBalanced,
        readinessScore: Math.min(
          9,
          Math.max(
            4,
            (hasConstitutional ? 2.5 : 1) +
              (hasAdministrative ? 2.5 : 1) +
              (hasBalanced ? 2.5 : 1) +
              (count >= 50 && count <= 200 ? 1.5 : 0.5)
          )
        ),
      },
    }));
  };

  const filteredQuestions = questions.filter((q) => {
    if (!searchQuery) return true;
    const s = searchQuery.toLowerCase();
    const textMatch =
      q.questionTextEn.toLowerCase().includes(s) ||
      (q.questionTextHi && q.questionTextHi.includes(s));
    const topicMatch = q.topic.toLowerCase().includes(s);
    const tagMatch = q.tags.some((t: string) => t.toLowerCase().includes(s));
    return textMatch || topicMatch || tagMatch;
  });

  return (
    <div className="min-h-screen bg-heritage-ivory flex flex-col font-sans">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-heritage-wine via-heritage-burgundy to-heritage-wine rounded-3xl p-6 sm:p-10 text-white shadow-gold border border-heritage-gold/30 mb-8 relative overflow-hidden">
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-heritage-cream/15 text-heritage-gold text-xs font-bold mb-4 border border-heritage-gold/30">
              <Users className="h-3.5 w-3.5" />
              {language === "hi"
                ? "UPSC व्यक्तित्व परीक्षण (साक्षात्कार) कार्यशाला"
                : "UPSC Personality Test & Interview Studio"}
            </div>
            <h1 className="font-serif text-2xl sm:text-4xl font-bold tracking-tight">
              {language === "hi" ? (
                <>
                  साक्षात्कार तैयारी एवं <span className="text-heritage-gold">डीएएफ विश्लेषण</span>
                </>
              ) : (
                <>
                  Personality Test & <span className="text-heritage-gold">DAF Thematic Studio</span>
                </>
              )}
            </h1>
            <p className="mt-3 text-heritage-cream/90 text-xs sm:text-sm leading-relaxed font-sans">
              {language === "hi"
                ? "प्रशासनिक स्थितिगत निर्णय, डीएएफ पृष्ठभूमि विषय, गृह राज्य समस्याएं एवं नैतिक दुविधाओं पर आधारित साक्षात्कार प्रश्नों का प्रामाणिक संग्रह। प्रत्येक प्रश्न में पारदर्शी स्रोत संदर्भ और उत्तर संरचना रणनीति शामिल है।"
                : "Candidate-reported interview experiences, DAF thematic drills, administrative situational judgements, and ethical governance prompts. Structured with transparent attribution, contextual background, and civil services response frameworks."}
            </p>
          </div>
        </div>

        {/* Mandatory Transparency & Accuracy Disclaimer Banner */}
        <div className="p-4 sm:p-5 bg-amber-50/90 rounded-2xl border border-amber-200 text-xs text-amber-950 mb-8 flex items-start gap-3 shadow-card">
          <AlertTriangle className="h-5 w-5 text-heritage-saffron shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold block uppercase tracking-wider text-[11px] text-amber-900 font-serif">
              {language === "hi"
                ? "आधिकारिक सटीकता सूचना (स्रोतों का अलगाव)"
                : "Important Accuracy Notice (Source Separation)"}
            </span>
            <p className="leading-relaxed text-amber-900">
              {language === "hi"
                ? "संघ लोक सेवा आयोग (UPSC) साक्षात्कार के लिए कोई मानक लिखित प्रश्नपत्र जारी नहीं करता। यह संग्रह सफल अभ्यर्थियों द्वारा साझा किए गए साक्षात्कारों, डीएएफ विषयों और प्रशासनिक स्थितिगत अभ्यासों पर आधारित है। इसे कभी भी आधिकारिक लिखित PYQ के रूप में प्रस्तुत नहीं किया जाता।"
                : "The Union Public Service Commission conducts an oral personality test and does NOT publish an official written interview question paper. All items in this repository are candidate-reported interview experiences, DAF preparation themes, or situational administrative drills with transparent attribution. They are never labeled as official written UPSC PYQs."}
            </p>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap gap-2 mb-6">
          {sourceTypes.map((st) => (
            <button
              key={st.id}
              onClick={() => setSelectedSourceType(st.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                selectedSourceType === st.id
                  ? "bg-heritage-burgundy text-white shadow-xs font-extrabold"
                  : "bg-white border border-heritage-border text-heritage-text hover:bg-heritage-cream"
              }`}
            >
              {language === "hi" ? st.labelHi : st.labelEn} ({st.count})
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="mb-6 relative">
          <Search className="h-4 w-4 text-heritage-secondary absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by topic, keyword, or DAF tag (e.g. Communal, Engineering, Water, Procurement, Ethics)..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-heritage-border text-xs text-heritage-text bg-white focus:outline-none focus:ring-2 focus:ring-heritage-burgundy focus:border-transparent placeholder:text-heritage-secondary/70 shadow-xs"
          />
        </div>

        {/* Question Cards */}
        {loading ? (
          <div className="py-20 text-center text-xs text-heritage-secondary flex items-center justify-center gap-2">
            <RotateCw className="h-4 w-4 animate-spin text-heritage-burgundy" />
            Loading interview records...
          </div>
        ) : filteredQuestions.length === 0 ? (
          <div className="bg-white rounded-2xl border border-heritage-border p-12 text-center text-xs text-heritage-secondary font-serif">
            No interview questions match your filter.
          </div>
        ) : (
          <div className="space-y-6">
            {filteredQuestions.map((q) => {
              const isFrameworkOpen = Boolean(expandedFrameworks[q.id]);
              const isPracticeOpen = Boolean(practiceOpen[q.id]);
              const userResp = userResponses[q.id] || "";
              const currentEval = evalResults[q.id];

              return (
                <div
                  key={q.id}
                  className="bg-white rounded-2xl border border-heritage-border p-6 sm:p-8 shadow-card hover:border-heritage-gold/50 transition-all"
                >
                  {/* Top Metadata Badges */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-4 border-b border-heritage-border/60 text-xs">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-heritage-burgundy bg-heritage-cream px-2.5 py-1 rounded-lg border border-heritage-gold/30 text-[11px]">
                        {language === "hi" ? "प्रकार: " : "Type: "}
                        {q.sourceType === "CANDIDATE_REPORTED"
                          ? language === "hi"
                            ? "अभ्यर्थी-अनुभव (Candidate-Reported)"
                            : "Candidate-Reported Experience"
                          : q.sourceType === "SITUATIONAL"
                          ? language === "hi"
                            ? "स्थितिगत निर्णय (Situational Drill)"
                            : "Situational Judgement Drill"
                          : language === "hi"
                          ? "डीएएफ विषय (DAF Thematic)"
                          : "DAF Thematic Drill"}
                      </span>
                      <span className="font-semibold text-heritage-text bg-heritage-ivory px-2.5 py-1 rounded-lg border border-heritage-border text-[11px]">
                        {language === "hi" ? "विषय: " : "Topic: "}
                        {q.topic}
                      </span>
                      {q.year && (
                        <span className="font-semibold text-heritage-secondary text-[11px]">
                          {language === "hi" ? "वर्ष: " : "Year: "}
                          {q.year}
                        </span>
                      )}
                    </div>

                    <div className="text-[11px] text-heritage-secondary italic">
                      {language === "hi" ? "स्रोत: " : "Source: "}
                      {q.sourceAttribution || "Attributed Experience (Non-Official)"}
                    </div>
                  </div>

                  {/* Context Block (Context / संदर्भ) */}
                  {q.contextEn && (
                    <div className="p-3.5 bg-heritage-cream/40 rounded-xl border border-heritage-gold/20 text-xs text-heritage-text mb-4 leading-relaxed font-sans">
                      <strong className="text-heritage-burgundy font-serif">
                        {language === "hi" ? "संदर्भ (Context): " : "Context: "}
                      </strong>
                      {language === "hi" && q.contextHi ? q.contextHi : q.contextEn}
                    </div>
                  )}

                  {/* Question Stem (Question / प्रश्न) */}
                  <div className="mb-4">
                    <span className="text-[10px] font-bold text-heritage-burgundy uppercase tracking-wider block mb-1">
                      {language === "hi" ? "साक्षात्कार प्रश्न (Interview Prompt)" : "Interview Question Prompt"}
                    </span>
                    <h3 className="font-serif text-base sm:text-lg font-bold text-heritage-text leading-relaxed">
                      {language === "hi" && q.questionTextHi ? q.questionTextHi : q.questionTextEn}
                    </h3>
                  </div>

                  {/* Tags */}
                  {q.tags && q.tags.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 mb-4">
                      {q.tags.map((tag: string, idx: number) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md bg-heritage-cream/80 text-heritage-wine text-[10px] font-bold flex items-center gap-1 border border-heritage-gold/20"
                        >
                          <Tag className="h-2.5 w-2.5 text-heritage-gold" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Interactive Practice Response Button */}
                  <div className="pt-2 flex flex-wrap items-center gap-3">
                    <button
                      onClick={() => togglePractice(q.id)}
                      className="px-4 py-2 rounded-xl bg-heritage-ivory hover:bg-heritage-cream text-heritage-burgundy border border-heritage-gold/40 text-xs font-bold transition-all shadow-xs flex items-center gap-2"
                    >
                      <Mic className="h-3.5 w-3.5 text-heritage-gold" />
                      {isPracticeOpen ? "Hide Response Practice" : "Practice Mock Response"}
                    </button>

                    {(q.frameworkGuidance || q.frameworkGuidanceHi) && (
                      <button
                        onClick={() => toggleFramework(q.id)}
                        className="px-4 py-2 rounded-xl bg-heritage-burgundy hover:bg-heritage-wine text-white text-xs font-bold transition-all shadow-xs flex items-center gap-2"
                      >
                        <Sparkles className="h-3.5 w-3.5 text-heritage-gold" />
                        {language === "hi"
                          ? "उत्तर संरचना एवं मार्गदर्शन"
                          : "Model Response Strategy"}
                        <ChevronDown
                          className={`h-3.5 w-3.5 transition-transform ${
                            isFrameworkOpen ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                    )}
                  </div>

                  {/* Interactive Practice Box Drawer */}
                  {isPracticeOpen && (
                    <div className="mt-4 p-4 sm:p-5 rounded-2xl bg-heritage-cream/30 border border-heritage-gold/40 animate-in fade-in-50">
                      <div className="flex items-center justify-between mb-2">
                        <label className="font-serif text-xs font-bold text-heritage-text flex items-center gap-1.5">
                          <MessageSquare className="h-4 w-4 text-heritage-burgundy" />
                          Your Spoken / Written Response:
                        </label>
                        <span className="text-[11px] font-medium text-heritage-secondary">
                          {userResp.trim().split(/\s+/).filter(Boolean).length} words
                        </span>
                      </div>

                      <textarea
                        value={userResp}
                        onChange={(e) => handleResponseChange(q.id, e.target.value)}
                        placeholder="Type the response you would articulate before the UPSC Interview Board. Maintain respectful composure, state your administrative rationale, and cite relevant constitutional/statutory provisions..."
                        className="w-full h-32 p-3.5 rounded-xl border border-heritage-border bg-white text-xs text-heritage-text focus:outline-none focus:ring-2 focus:ring-heritage-burgundy placeholder:text-heritage-secondary/70 leading-relaxed font-sans"
                      />

                      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                        <span className="text-[11px] text-heritage-secondary italic">
                          Draft is automatically preserved on this device.
                        </span>
                        <button
                          onClick={() => analyzeResponse(q.id, userResp)}
                          disabled={!userResp.trim()}
                          className="px-4 py-2 rounded-xl bg-heritage-wine hover:bg-heritage-burgundy text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 disabled:opacity-50"
                        >
                          <Sparkles className="h-3.5 w-3.5 text-heritage-gold" />
                          Self-Reflect & Analyze Tone
                        </button>
                      </div>

                      {/* Diagnostic Evaluation Card */}
                      {currentEval && (
                        <div className="mt-4 p-4 rounded-xl bg-white border border-heritage-border shadow-xs text-xs space-y-2.5">
                          <div className="flex items-center justify-between border-b border-heritage-border/60 pb-2">
                            <span className="font-serif font-bold text-heritage-text">
                              Oral Communication Diagnostic Checklist:
                            </span>
                            <span className="font-serif font-bold text-heritage-burgundy">
                              Poise Index: {currentEval.readinessScore} / 10
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
                            <div
                              className={`p-2.5 rounded-lg border ${
                                currentEval.hasConstitutional
                                  ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                                  : "bg-heritage-cream/40 border-heritage-border text-heritage-secondary"
                              }`}
                            >
                              <div className="font-bold flex items-center gap-1">
                                <CheckCircle className="h-3 w-3" /> Constitutional Ethos
                              </div>
                              <p className="mt-0.5 text-[10px]">
                                {currentEval.hasConstitutional
                                  ? "Incorporates constitutional/statutory anchor."
                                  : "Consider citing Art. 14/21, rule of law, or official protocols."}
                              </p>
                            </div>

                            <div
                              className={`p-2.5 rounded-lg border ${
                                currentEval.hasAdministrative
                                  ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                                  : "bg-heritage-cream/40 border-heritage-border text-heritage-secondary"
                              }`}
                            >
                              <div className="font-bold flex items-center gap-1">
                                <CheckCircle className="h-3 w-3" /> Administrative Process
                              </div>
                              <p className="mt-0.5 text-[10px]">
                                {currentEval.hasAdministrative
                                  ? "Demonstrates operational hierarchy & SOPs."
                                  : "Include stakeholder coordination and preventive measures."}
                              </p>
                            </div>

                            <div
                              className={`p-2.5 rounded-lg border ${
                                currentEval.hasBalanced
                                  ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                                  : "bg-heritage-cream/40 border-heritage-border text-heritage-secondary"
                              }`}
                            >
                              <div className="font-bold flex items-center gap-1">
                                <CheckCircle className="h-3 w-3" /> Balanced Nuance
                              </div>
                              <p className="mt-0.5 text-[10px]">
                                {currentEval.hasBalanced
                                  ? "Shows multi-perspective consideration."
                                  : "Avoid rigid extreme stances; acknowledge legitimate trade-offs."}
                              </p>
                            </div>
                          </div>

                          <div className="text-[11px] text-heritage-secondary pt-1 flex items-center justify-between">
                            <span>
                              Word count: <strong>{currentEval.wordCount} words</strong> ({currentEval.paceEstimate})
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Framework Accordion */}
                  {isFrameworkOpen && (q.frameworkGuidance || q.frameworkGuidanceHi) && (
                    <div className="p-4 sm:p-5 bg-heritage-cream/40 rounded-xl border border-heritage-gold/30 mt-4 text-xs text-heritage-text leading-relaxed whitespace-pre-line shadow-xs animate-in fade-in-50 font-sans">
                      <div className="font-serif font-bold text-heritage-burgundy mb-2 flex items-center gap-1.5">
                        <Sparkles className="h-4 w-4 text-heritage-gold" />
                        Recommended Civil Services Strategy & Ethical Considerations:
                      </div>
                      {language === "hi" && q.frameworkGuidanceHi
                        ? q.frameworkGuidanceHi
                        : q.frameworkGuidance}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
