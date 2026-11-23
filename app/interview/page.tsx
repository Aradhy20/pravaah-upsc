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

  const toggleFramework = (id: string) => {
    setExpandedFrameworks((prev) => ({ ...prev, [id]: !prev[id] }));
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
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 rounded-3xl p-6 sm:p-10 text-white shadow-sm mb-8 relative overflow-hidden">
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold mb-4 border border-indigo-400/20">
              <Users className="h-3.5 w-3.5" />
              {language === "hi" ? "UPSC व्यक्तित्व परीक्षण (साक्षात्कार) कार्यशाला" : "UPSC Personality Test & Interview Studio"}
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              {language === "hi" ? (
                <>साक्षात्कार तैयारी एवं <span className="text-blue-400">डीएएफ विश्लेषण</span></>
              ) : (
                <>Personality Test & <span className="text-blue-400">DAF Thematic Studio</span></>
              )}
            </h1>
            <p className="mt-3 text-slate-300 text-xs sm:text-sm leading-relaxed">
              {language === "hi"
                ? "प्रशासनिक स्थितिगत निर्णय, डीएएफ पृष्ठभूमि विषय, गृह राज्य समस्याएं एवं नैतिक दुविधाओं पर आधारित साक्षात्कार प्रश्नों का प्रामाणिक संग्रह। प्रत्येक प्रश्न में पारदर्शी स्रोत संदर्भ और उत्तर संरचना रणनीति शामिल है।"
                : "Candidate-reported interview experiences, DAF thematic drills, administrative situational judgements, and ethical governance prompts. Structured with transparent attribution, contextual background, and civil services response frameworks."}
            </p>
          </div>
        </div>

        {/* Mandatory Transparency & Accuracy Disclaimer Banner */}
        <div className="p-4 sm:p-5 bg-amber-50/90 rounded-2xl border border-amber-200 text-xs text-amber-950 mb-8 flex items-start gap-3 shadow-xs">
          <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold block uppercase tracking-wider text-[11px] text-amber-800">
              {language === "hi" ? "आधिकारिक सटीकता सूचना (स्रोतों का अलगाव)" : "Important Accuracy Notice (Source Separation)"}
            </span>
            <p className="leading-relaxed text-amber-900">
              {language === "hi"
                ? "संघ लोक सेवा आयोग (UPSC) साक्षात्कार के लिए कोई मानक लिखित प्रश्नपत्र जारी नहीं करता। यह संग्रह सफल अभ्यर्थियों द्वारा साझा किए गए साक्षात्कारों, डीएएफ विषयों और प्रशासनिक स्थितिगत अभ्यासों पर आधारित है। इसे कभी भी आधिकारिक लिखित PYQ के रूप में प्रस्तुत नहीं किया जाता।"
                : "The Union Public Service Commission does not publish an official written interview question paper. All items in this repository are candidate-reported interview experiences, DAF preparation themes, or situational administrative drills with transparent attribution. They are never labeled as official UPSC PYQs."}
            </p>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap gap-2 mb-6">
          {sourceTypes.map((st) => (
            <button
              key={st.id}
              onClick={() => setSelectedSourceType(st.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                selectedSourceType === st.id
                  ? "bg-slate-900 text-white shadow"
                  : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
              }`}
            >
              {language === "hi" ? st.labelHi : st.labelEn} ({st.count})
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="mb-6 relative">
          <Search className="h-4 w-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by topic, keyword, or DAF tag (e.g. Communal, Engineering, Water, Procurement, Ethics)..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent placeholder:text-slate-400"
          />
        </div>

        {/* Question Cards */}
        {loading ? (
          <div className="py-20 text-center text-xs text-slate-400">Loading interview records...</div>
        ) : filteredQuestions.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-xs text-slate-500">
            No interview questions match your filter.
          </div>
        ) : (
          <div className="space-y-6">
            {filteredQuestions.map((q) => {
              const isFrameworkOpen = Boolean(expandedFrameworks[q.id]);

              return (
                <div
                  key={q.id}
                  className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs hover:border-blue-300 transition-all"
                >
                  {/* Top Metadata Badges */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-4 border-b border-slate-100 text-xs">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-blue-800 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-100 text-[11px]">
                        {language === "hi" ? "प्रकार: " : "Type: "}
                        {q.sourceType === "CANDIDATE_REPORTED"
                          ? language === "hi" ? "अभ्यर्थी-अनुभव" : "Candidate-reported"
                          : q.sourceType === "SITUATIONAL"
                          ? language === "hi" ? "स्थितिगत निर्णय" : "Situational Judgement"
                          : language === "hi" ? "डीएएफ विषय" : "DAF Theme"}
                      </span>
                      <span className="font-semibold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded text-[11px]">
                        {language === "hi" ? "विषय: " : "Topic: "}
                        {q.topic}
                      </span>
                      {q.year && (
                        <span className="font-semibold text-slate-500 text-[11px]">
                          {language === "hi" ? "वर्ष: " : "Year: "}
                          {q.year}
                        </span>
                      )}
                    </div>

                    <div className="text-[11px] text-slate-400 italic">
                      {language === "hi" ? "स्रोत: " : "Source: "}
                      {q.sourceAttribution || "Attributed Experience"}
                    </div>
                  </div>

                  {/* Context Block (Context / संदर्भ) */}
                  {q.contextEn && (
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-600 mb-4 leading-relaxed">
                      <strong className="text-slate-800">
                        {language === "hi" ? "संदर्भ (Context): " : "Context: "}
                      </strong>
                      {language === "hi" && q.contextHi ? q.contextHi : q.contextEn}
                    </div>
                  )}

                  {/* Question Stem (Question / प्रश्न) */}
                  <div className="mb-4">
                    <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider block mb-1">
                      {language === "hi" ? "प्रश्न (Question Prompt)" : "Interview Question Prompt"}
                    </span>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-relaxed">
                      {language === "hi" && q.questionTextHi ? q.questionTextHi : q.questionTextEn}
                    </h3>
                  </div>

                  {/* Tags */}
                  {q.tags && q.tags.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 mb-4">
                      {q.tags.map((tag: string, idx: number) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-bold flex items-center gap-1"
                        >
                          <Tag className="h-2.5 w-2.5" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Accordion for Civil Services Response Framework */}
                  {(q.frameworkGuidance || q.frameworkGuidanceHi) && (
                    <div className="pt-2">
                      <button
                        onClick={() => toggleFramework(q.id)}
                        className="w-full flex items-center justify-between p-3 rounded-xl bg-indigo-50/60 hover:bg-indigo-100/60 text-xs font-bold text-indigo-950 transition border border-indigo-100/80"
                      >
                        <span className="flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-indigo-700" />
                          {language === "hi"
                            ? "प्रशासनिक उत्तर संरचना एवं मार्गदर्शन (Model Response Framework)"
                            : "Civil Services Response Strategy & Ethical Framework"}
                        </span>
                        <ChevronDown
                          className={`h-4 w-4 transition-transform ${
                            isFrameworkOpen ? "rotate-180" : ""
                          }`}
                        />
                      </button>

                      {isFrameworkOpen && (
                        <div className="p-4 bg-white rounded-xl border border-indigo-100 mt-2 text-xs text-slate-700 leading-relaxed whitespace-pre-line shadow-xs animate-in fade-in-50">
                          {language === "hi" && q.frameworkGuidanceHi
                            ? q.frameworkGuidanceHi
                            : q.frameworkGuidance}
                        </div>
                      )}
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
