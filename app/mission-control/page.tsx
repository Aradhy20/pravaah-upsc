"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Compass,
  CheckCircle,
  Clock,
  RotateCw,
  BookOpen,
  BarChart2,
  AlertTriangle,
  Award,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Flame,
  ShieldCheck,
  HelpCircle,
  FileText,
  Sliders,
  Layers,
  ChevronRight,
  Target,
  RefreshCw,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/context";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export default function MissionControlPage() {
  const { t, language } = useLanguage();
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeQuestionTab, setActiveQuestionTab] = useState<number>(0);
  const [completedTaskIds, setCompletedTaskIds] = useState<Record<string, boolean>>({});

  const fetchMissionControl = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/mission-control");
      const json = await res.json();
      if (json.success) {
        setData(json.data);
      }
    } catch (err) {
      console.error("Failed to load mission control telemetry:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMissionControl();
  }, []);

  const toggleTask = (id: string) => {
    setCompletedTaskIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F9FC] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-[#2453E6]" />
          <p className="mt-3 text-sm font-semibold text-[#475467]">
            {language === "hi"
              ? "मिशन कंट्रोल टेलीमेट्री लोड हो रही है..."
              : "Calibrating Mission Control Telemetry..."}
          </p>
        </div>
      </div>
    );
  }

  const d = data || {};
  const readiness = d.examReadiness || {};
  const streak = d.streak || { currentDays: 0, bestDays: 0 };
  const csat = d.csatReadiness || {};
  const fiveQs = d.theFiveQuestions || {};
  const todayPlan = d.todayPlan || { tasks: [] };
  const subjects = d.subjectPerformance || [];
  const weakTopics = d.weakTopics || [];
  const syllabus = d.syllabusProgress || {};
  const mains = d.mainsProgress || {};
  const user = d.user;

  const coreQuestionsList = [
    {
      qEn: "What should I study today?",
      qHi: "मुझे आज क्या पढ़ना चाहिए?",
      icon: Target,
      answer: fiveQs.whatShouldIStudyToday,
      actionText: language === "hi" ? "दैनिक योजना देखें" : "View Timetable",
      actionAnchor: "#today-plan",
    },
    {
      qEn: "Which subjects are my weaknesses?",
      qHi: "मेरे कौन से विषय कमजोर हैं?",
      icon: AlertTriangle,
      answer: fiveQs.whatAmIWeakAt,
      actionText: language === "hi" ? "कमजोर विषय देखें" : "View Weak Topics",
      actionAnchor: "#weak-areas",
    },
    {
      qEn: "What should I revise?",
      qHi: "मुझे क्या दोहराना चाहिए?",
      icon: RotateCw,
      answer: fiveQs.whatShouldIRevise,
      actionText: language === "hi" ? "रिवीज़न शुरू करें" : "Open Revision Queue",
      actionAnchor: "/revision",
    },
    {
      qEn: "How am I improving?",
      qHi: "मेरे प्रदर्शन में क्या सुधार है?",
      icon: TrendingUp,
      answer: fiveQs.amIImproving,
      actionText: language === "hi" ? "प्रदर्शन मेट्रिक्स" : "Performance Metrics",
      actionAnchor: "#subject-performance",
    },
    {
      qEn: "Am I prepared for the examination?",
      qHi: "क्या मैं परीक्षा के लिए तैयार हूँ?",
      icon: Award,
      answer: fiveQs.amIExamReady,
      actionText: language === "hi" ? "तैयारी सूचकांक" : "Readiness Breakdown",
      actionAnchor: "#readiness-index",
    },
  ];

  return (
    <div className="min-h-screen bg-[#F7F9FC] font-sans text-[#101828]">
      {/* Top Banner / Breadcrumb Bar */}
      <div className="border-b border-[#E4E7EC] bg-white">
        <div className="mx-auto max-w-[1280px] px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#2453E6] text-white shadow-sm">
                <Target className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-black text-[#101828] tracking-tight">
                    Pravaah <span className="text-[#2453E6]">Mission Control</span>
                  </h1>
                  <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-[11px] font-black uppercase text-[#2453E6]">
                    {d.profile?.targetExam || "UPSC CSE"} {d.profile?.targetYear || 2026}
                  </span>
                </div>
                <p className="text-xs text-[#667085] mt-0.5">
                  {language === "hi"
                    ? "व्यक्तिगत तैयारी कमांड सेंटर • वास्तविक अध्ययन डेटा और प्रदर्शन पर आधारित"
                    : "Personalized Preparation Command Center • Grounded in authentic database telemetry"}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Daily Streak Badge */}
              <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-1.5 shadow-2xs">
                <Flame className="h-4 w-4 text-amber-600 animate-pulse" />
                <span className="text-xs font-bold text-amber-900">
                  {streak.currentDays} {language === "hi" ? "दिन का स्ट्रीक" : "Day Streak"}
                </span>
                {streak.isActiveToday && (
                  <span className="rounded bg-emerald-500 px-1.5 py-0.2 text-[9px] font-black uppercase text-white">
                    Active
                  </span>
                )}
              </div>

              {/* Language Switcher */}
              <LanguageSwitcher />

              {/* Refresh Action */}
              <button
                onClick={fetchMissionControl}
                className="flex items-center gap-1.5 rounded-xl border border-[#E4E7EC] bg-white px-3 py-1.5 text-xs font-bold text-[#475467] hover:bg-[#F7F9FC] transition"
                title="Refresh Telemetry"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{language === "hi" ? "ताज़ा करें" : "Refresh"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1280px] px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        {/* ========================================================= */}
        {/* SECTION 1: THE 5 CORE ASPIRANT QUESTIONS (INTERACTIVE BANNER) */}
        {/* ========================================================= */}
        <div className="rounded-3xl border border-[#E4E7EC] bg-white p-6 sm:p-8 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-[#E4E7EC]">
            <div>
              <span className="text-[11px] font-black uppercase tracking-wider text-[#2453E6]">
                {language === "hi" ? "दैनिक रणनीतिक विश्लेषण" : "Daily Strategic Insight"}
              </span>
              <h2 className="text-lg sm:text-xl font-black text-[#101828] mt-0.5">
                {language === "hi"
                  ? "5 मुख्य प्रश्न: आपकी तैयारी की वास्तविक स्थिति"
                  : "The 5 Core Aspirant Questions: Real-Time Intelligence"}
              </h2>
            </div>
            <span className="rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-bold text-[#2453E6] hidden sm:block">
              {language === "hi" ? "डेटा-आधारित उत्तर" : "Data-Backed Answers"}
            </span>
          </div>

          {/* Question Tabs */}
          <div className="mt-4 flex gap-2 overflow-x-auto pb-2 scrollbar-none">
            {coreQuestionsList.map((item, idx) => {
              const Icon = item.icon;
              const isActive = activeQuestionTab === idx;
              return (
                <button
                  key={idx}
                  onClick={() => setActiveQuestionTab(idx)}
                  className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold whitespace-nowrap transition-all ${
                    isActive
                      ? "bg-[#2453E6] text-white shadow-xs"
                      : "bg-[#F7F9FC] text-[#475467] hover:bg-slate-100 hover:text-[#101828]"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{language === "hi" ? item.qHi : item.qEn}</span>
                </button>
              );
            })}
          </div>

          {/* Active Question Detail Card */}
          <div className="mt-4 rounded-2xl bg-blue-50/70 border border-blue-200/80 p-5 sm:p-6 transition-all">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1.5 max-w-3xl">
                <div className="flex items-center gap-2 text-xs font-bold text-[#2453E6] uppercase tracking-wide">
                  <Sparkles className="h-4 w-4" />
                  <span>{language === "hi" ? coreQuestionsList[activeQuestionTab].qHi : coreQuestionsList[activeQuestionTab].qEn}</span>
                </div>
                <p className="text-sm sm:text-base font-semibold text-[#101828] leading-relaxed">
                  {coreQuestionsList[activeQuestionTab].answer}
                </p>
              </div>

              {coreQuestionsList[activeQuestionTab].actionAnchor.startsWith("#") ? (
                <a
                  href={coreQuestionsList[activeQuestionTab].actionAnchor}
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#2453E6] px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#1d44c2] transition whitespace-nowrap self-start sm:self-center"
                >
                  <span>{coreQuestionsList[activeQuestionTab].actionText}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </a>
              ) : (
                <Link
                  href={coreQuestionsList[activeQuestionTab].actionAnchor}
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#2453E6] px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#1d44c2] transition whitespace-nowrap self-start sm:self-center"
                >
                  <span>{coreQuestionsList[activeQuestionTab].actionText}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* ROW 1: TODAY'S STUDY PLAN & EXAM READINESS INDEX */}
        {/* ========================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Today's Study Plan (7 Cols) */}
          <div id="today-plan" className="lg:col-span-7 rounded-3xl border border-[#E4E7EC] bg-white p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-[#E4E7EC]">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-700">
                    <Clock className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#101828]">
                      {language === "hi" ? "आज की अध्ययन योजना" : "Today's Study Plan & Timetable"}
                    </h3>
                    <p className="text-[11px] text-[#667085]">
                      {language === "hi" ? `लक्ष्य: दैनिक ${todayPlan.targetHours} घंटे` : `Target: ${todayPlan.targetHours} hours daily commitment`}
                    </p>
                  </div>
                </div>
                <Link
                  href="/study-planner"
                  className="text-xs font-bold text-[#2453E6] hover:underline"
                >
                  {language === "hi" ? "प्लानर खोलें →" : "Full Planner →"}
                </Link>
              </div>

              {/* Task Checklist */}
              <div className="mt-4 space-y-2.5">
                {todayPlan.tasks.map((task: any) => {
                  const isChecked = completedTaskIds[task.id] || task.isCompleted;
                  return (
                    <div
                      key={task.id}
                      className={`flex items-start justify-between gap-3 rounded-2xl border p-3.5 transition-all ${
                        isChecked
                          ? "bg-emerald-50/50 border-emerald-200"
                          : "bg-[#F7F9FC] border-[#E4E7EC] hover:bg-slate-100"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <button
                          onClick={() => toggleTask(task.id)}
                          className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition ${
                            isChecked
                              ? "bg-emerald-600 border-emerald-600 text-white"
                              : "border-[#D0D5DD] bg-white hover:border-[#2453E6]"
                          }`}
                          aria-label={`Toggle ${task.title}`}
                        >
                          {isChecked && <CheckCircle className="h-3.5 w-3.5" />}
                        </button>
                        <div>
                          <p
                            className={`text-xs font-bold ${
                              isChecked ? "line-through text-slate-500" : "text-[#101828]"
                            }`}
                          >
                            {task.title}
                          </p>
                          <div className="flex items-center gap-2 mt-1 text-[10px] font-bold text-[#667085]">
                            <span className="rounded bg-slate-200 px-1.5 py-0.2 uppercase">
                              {task.category}
                            </span>
                            <span>• {task.estimatedMinutes} mins</span>
                          </div>
                        </div>
                      </div>

                      <Link
                        href={task.actionUrl}
                        className="rounded-lg bg-white border border-[#E4E7EC] px-2.5 py-1 text-[11px] font-bold text-[#2453E6] hover:bg-blue-50 transition shrink-0"
                      >
                        {language === "hi" ? "शुरू करें" : "Start"}
                      </Link>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[#E4E7EC] flex items-center justify-between text-xs text-[#667085]">
              <span>{language === "hi" ? "पूर्ण किए गए कार्य:" : "Tasks Completed:"} <strong>{Object.values(completedTaskIds).filter(Boolean).length} / {todayPlan.tasks.length}</strong></span>
              <span>{language === "hi" ? "दैनिक प्रगति:" : "Progress:"} <strong>{Math.round((Object.values(completedTaskIds).filter(Boolean).length / Math.max(1, todayPlan.tasks.length)) * 100)}%</strong></span>
            </div>
          </div>

          {/* Exam Readiness Index (5 Cols) */}
          <div id="readiness-index" className="lg:col-span-5 rounded-3xl border border-[#E4E7EC] bg-white p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-[#E4E7EC]">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-[#2453E6]">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#101828]">
                      {language === "hi" ? "परीक्षा तैयारी सूचकांक" : "Exam Readiness Index"}
                    </h3>
                    <p className="text-[11px] text-[#667085]">
                      {language === "hi" ? "पारदर्शी वस्तुनिष्ठ गणना" : "Transparent Objective Metric"}
                    </p>
                  </div>
                </div>
                <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-[#2453E6]">
                  {readiness.status || "CALIBRATING"}
                </span>
              </div>

              {/* Gauge Score Display */}
              <div className="my-5 text-center">
                <div className="inline-flex flex-col items-center justify-center h-28 w-28 rounded-full border-4 border-[#2453E6] bg-blue-50/50 shadow-inner">
                  <span className="text-3xl font-black text-[#101828] leading-none">
                    {readiness.index || 0}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#667085] mt-1">
                    out of 100
                  </span>
                </div>
                <p className="mt-2 text-xs font-bold text-[#101828]">{readiness.label}</p>
              </div>

              {/* Four Factor Breakdown */}
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[#667085]">GS Paper 1 Accuracy (35% weight):</span>
                  <span className="font-bold text-[#101828]">{readiness.breakdown?.gsPaper1Accuracy || 0}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#667085]">CSAT Estimated Score (25% weight):</span>
                  <span className="font-bold text-[#101828]">
                    {readiness.breakdown?.csatQualifyingMargin || 0} / 66
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#667085]">Syllabus Coverage (20% weight):</span>
                  <span className="font-bold text-[#101828]">{readiness.breakdown?.syllabusCoveragePct || 0}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#667085]">Revision Consistency (20% weight):</span>
                  <span className="font-bold text-[#101828]">{readiness.breakdown?.revisionConsistencyPct || 0}%</span>
                </div>
              </div>
            </div>

            <div className="mt-5 rounded-xl bg-[#F7F9FC] p-3 text-[10px] text-[#667085] leading-relaxed border border-[#E4E7EC]">
              <strong>Methodology:</strong> {readiness.methodology}
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* ROW 2: CSAT SURVIVAL COACH & WEAK-TOPIC RADAR */}
        {/* ========================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* CSAT Survival Indicator (6 Cols) */}
          <div className="lg:col-span-6 rounded-3xl border border-[#E4E7EC] bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-[#E4E7EC]">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50 text-purple-700">
                  <BarChart2 className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#101828]">
                    {language === "hi" ? "CSAT क्वालिफाइंग स्थिति (पेपर II)" : "CSAT Survival & Qualifying Coach"}
                  </h3>
                  <p className="text-[11px] text-[#667085]">
                    {language === "hi" ? "33% न्यूनतम अंक (66/200 अनिवार्य)" : "Mandatory 33% Qualifying Benchmark (66 / 200)"}
                  </p>
                </div>
              </div>
              <Link
                href="/csat-coach"
                className="text-xs font-bold text-[#2453E6] hover:underline"
              >
                {language === "hi" ? "CSAT कोच →" : "Coach Hub →"}
              </Link>
            </div>

            {/* Warning if below threshold */}
            {csat.warningMessage && (
              <div className="mt-4 flex items-start gap-2.5 rounded-2xl bg-amber-50 border border-amber-200 p-3.5 text-xs text-amber-900">
                <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                <span>{csat.warningMessage}</span>
              </div>
            )}

            {/* Benchmark Bar */}
            <div className="mt-5">
              <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                <span className="text-[#667085]">Estimated Score:</span>
                <span className={`font-black ${csat.isQualifying ? "text-emerald-700" : "text-amber-700"}`}>
                  {csat.estimatedScore} / 200 Marks ({csat.isQualifying ? "Qualifying" : "Below Cutoff"})
                </span>
              </div>
              <div className="relative h-4 w-full rounded-full bg-slate-100 overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${
                    csat.isQualifying ? "bg-emerald-500" : "bg-amber-500"
                  }`}
                  style={{ width: `${Math.min(100, (csat.estimatedScore / 200) * 100)}%` }}
                />
                {/* 33% marker */}
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-red-600 z-10"
                  style={{ left: "33%" }}
                  title="33% (66 Marks) Cutoff Line"
                />
              </div>
              <div className="flex justify-between text-[10px] font-bold text-[#667085] mt-1">
                <span>0</span>
                <span className="text-red-700">66 Marks (33% Cutoff)</span>
                <span>200</span>
              </div>
            </div>

            {/* CSAT Sub-pillar breakdown */}
            <div className="mt-5 grid grid-cols-3 gap-2.5 text-center">
              <div className="rounded-xl bg-[#F7F9FC] border border-[#E4E7EC] p-2.5">
                <p className="text-[10px] font-bold text-[#667085] uppercase">Quant</p>
                <p className="text-sm font-black text-[#101828] mt-0.5">{csat.quantAccuracy}%</p>
              </div>
              <div className="rounded-xl bg-[#F7F9FC] border border-[#E4E7EC] p-2.5">
                <p className="text-[10px] font-bold text-[#667085] uppercase">Reasoning</p>
                <p className="text-sm font-black text-[#101828] mt-0.5">{csat.reasoningAccuracy}%</p>
              </div>
              <div className="rounded-xl bg-[#F7F9FC] border border-[#E4E7EC] p-2.5">
                <p className="text-[10px] font-bold text-[#667085] uppercase">Reading Comp</p>
                <p className="text-sm font-black text-[#101828] mt-0.5">{csat.readingComprehensionAccuracy}%</p>
              </div>
            </div>
          </div>

          {/* Weak-Topic Identification (6 Cols) */}
          <div id="weak-areas" className="lg:col-span-6 rounded-3xl border border-[#E4E7EC] bg-white p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-[#E4E7EC]">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 text-rose-700">
                    <AlertTriangle className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#101828]">
                      {language === "hi" ? "कमजोर विषय रडार" : "Data-Driven Weak Topics"}
                    </h3>
                    <p className="text-[11px] text-[#667085]">
                      {language === "hi" ? "वास्तविक गलत उत्तरों के आधार पर" : "Identified from actual question attempts"}
                    </p>
                  </div>
                </div>
                <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-700">
                  {weakTopics.length} {language === "hi" ? "कमजोर क्षेत्र" : "Friction Points"}
                </span>
              </div>

              {/* Weak Topics List */}
              <div className="mt-4 space-y-2.5">
                {weakTopics.length > 0 ? (
                  weakTopics.map((wt: any, idx: number) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between gap-3 rounded-2xl bg-[#F7F9FC] border border-[#E4E7EC] p-3 text-xs"
                    >
                      <div>
                        <p className="font-bold text-[#101828]">{wt.topic}</p>
                        <p className="text-[11px] text-[#667085]">{wt.subject} • {wt.attempted} attempts</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-black text-rose-600 bg-rose-50 px-2 py-0.5 rounded">
                          {wt.accuracy}% acc
                        </span>
                        <Link
                          href={`/pyqs?q=${encodeURIComponent(wt.topic)}`}
                          className="rounded-lg bg-white border border-[#E4E7EC] px-2.5 py-1 text-[11px] font-bold text-[#2453E6] hover:bg-blue-50 transition"
                        >
                          {language === "hi" ? "अभ्यास करें" : "Drill"}
                        </Link>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-xs text-[#667085]">
                    <CheckCircle className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
                    <p className="font-bold text-[#101828]">No Critical Weaknesses Detected</p>
                    <p className="mt-1">Maintain balanced practice across all subjects to keep accuracy consistent.</p>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#E4E7EC] text-right">
              <Link
                href="/revision"
                className="text-xs font-bold text-[#2453E6] hover:underline"
              >
                {language === "hi" ? "गलती नोटबुक और SM-2 रिवीज़न देखें →" : "Open Mistake Intelligence Lab →"}
              </Link>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* ROW 3: SUBJECT PERFORMANCE & SYLLABUS JOURNEY */}
        {/* ========================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Subject Performance Matrix (7 Cols) */}
          <div id="subject-performance" className="lg:col-span-7 rounded-3xl border border-[#E4E7EC] bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-[#E4E7EC]">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-[#2453E6]">
                  <Compass className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#101828]">
                    {language === "hi" ? "विषय-वार दक्षता मैट्रिक्स" : "Subject Mastery & Performance"}
                  </h3>
                  <p className="text-[11px] text-[#667085]">
                    {language === "hi" ? "सामान्य अध्ययन एवं सीसैट विश्लेषण" : "GS Papers & CSAT Pillars with Sample Thresholds"}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              {subjects.map((sub: any, idx: number) => {
                let badgeClass = "bg-slate-100 text-slate-700";
                if (sub.status === "STRONG") badgeClass = "bg-emerald-100 text-emerald-800";
                else if (sub.status === "IMPROVING") badgeClass = "bg-blue-100 text-blue-800";
                else if (sub.status === "NEEDS_REVISION") badgeClass = "bg-amber-100 text-amber-800";
                else if (sub.status === "WEAK") badgeClass = "bg-rose-100 text-rose-800";

                return (
                  <div
                    key={idx}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-2xl bg-[#F7F9FC] border border-[#E4E7EC] p-3 text-xs"
                  >
                    <div>
                      <p className="font-bold text-[#101828]">{sub.subject}</p>
                      <p className="text-[11px] text-[#667085]">
                        {sub.attempted} attempted • {sub.correct} correct
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-24 bg-slate-200 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-[#2453E6] h-full rounded-full"
                          style={{ width: `${sub.accuracy}%` }}
                        />
                      </div>
                      <span className="font-bold text-[#101828] w-12 text-right">{sub.accuracy}%</span>
                      <span className={`rounded-md px-2 py-0.5 text-[10px] font-extrabold uppercase ${badgeClass}`}>
                        {sub.status.replace("_", " ")}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Syllabus Intelligence & Mains Studio Velocity (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Syllabus Intelligence Card */}
            <div className="rounded-3xl border border-[#E4E7EC] bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-[#E4E7EC]">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-[#2453E6]" />
                  <h3 className="text-sm font-bold text-[#101828]">
                    {language === "hi" ? "पाठ्यक्रम इंटेलिजेंस मानचित्र" : "Syllabus Intelligence Map"}
                  </h3>
                </div>
                <Link
                  href="/syllabus/intelligence"
                  className="text-xs font-bold text-[#2453E6] hover:underline"
                >
                  {language === "hi" ? "मानचित्र खोलें →" : "Explore →"}
                </Link>
              </div>

              <div className="mt-4 flex items-center justify-between text-xs">
                <div>
                  <p className="text-2xl font-black text-[#101828]">{syllabus.overallPercentage || 0}%</p>
                  <p className="text-[11px] text-[#667085]">Overall Syllabus Mapped</p>
                </div>
                <div className="text-right text-[11px] space-y-1">
                  <p><strong className="text-emerald-700">{syllabus.masteredCount || 0}</strong> Mastered</p>
                  <p><strong className="text-blue-700">{syllabus.inProgressCount || 0}</strong> In Progress</p>
                  <p><strong className="text-slate-600">{syllabus.notStartedCount || 53}</strong> Not Started</p>
                </div>
              </div>
            </div>

            {/* Mains Answer Studio Velocity */}
            <div className="rounded-3xl border border-[#E4E7EC] bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-[#E4E7EC]">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-rose-700" />
                  <h3 className="text-sm font-bold text-[#101828]">
                    {language === "hi" ? "मेन्स उत्तर लेखन स्टूडियो" : "Mains Answer Writing Studio"}
                  </h3>
                </div>
                <Link
                  href="/mains"
                  className="text-xs font-bold text-[#2453E6] hover:underline"
                >
                  {language === "hi" ? "स्टूडियो →" : "Studio →"}
                </Link>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
                <div className="rounded-xl bg-[#F7F9FC] border border-[#E4E7EC] p-2.5">
                  <p className="text-lg font-black text-[#101828]">{mains.draftsCount || 0}</p>
                  <p className="text-[10px] text-[#667085] uppercase">Drafts</p>
                </div>
                <div className="rounded-xl bg-[#F7F9FC] border border-[#E4E7EC] p-2.5">
                  <p className="text-lg font-black text-[#101828]">{mains.submittedCount || 0}</p>
                  <p className="text-[10px] text-[#667085] uppercase">Submitted</p>
                </div>
                <div className="rounded-xl bg-[#F7F9FC] border border-[#E4E7EC] p-2.5">
                  <p className="text-lg font-black text-rose-700">{mains.totalWordsWritten || 0}</p>
                  <p className="text-[10px] text-[#667085] uppercase">Words</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* ROW 4: STRATEGIC RECOMMENDED NEXT ACTIONS */}
        {/* ========================================================= */}
        <div className="rounded-3xl border border-[#E4E7EC] bg-white p-6 sm:p-8 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-[#E4E7EC]">
            <div>
              <span className="text-[11px] font-black uppercase tracking-wider text-[#2453E6]">
                {language === "hi" ? "रणनीतिक कदम" : "Personalized Recommendation Engine"}
              </span>
              <h2 className="text-lg sm:text-xl font-black text-[#101828] mt-0.5">
                {language === "hi"
                  ? "अगली सर्वोत्तम तैयारी कार्रवाई"
                  : "Recommended Next High-Impact Actions"}
              </h2>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            {(d.recommendedActions || []).map((action: any) => (
              <div
                key={action.id}
                className="flex flex-col justify-between rounded-2xl bg-[#F7F9FC] border border-[#E4E7EC] p-5 hover:border-[#2453E6] hover:shadow-sm transition"
              >
                <div>
                  <span className="inline-block rounded-md bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-[#2453E6] uppercase">
                    {action.badge}
                  </span>
                  <h4 className="text-sm font-bold text-[#101828] mt-2">{action.title}</h4>
                  <p className="text-xs text-[#667085] mt-1 leading-relaxed">
                    {action.description}
                  </p>
                </div>
                <Link
                  href={action.actionUrl}
                  className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-[#2453E6] hover:underline"
                >
                  <span>{language === "hi" ? "आगे बढ़ें" : "Proceed to Action"}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
