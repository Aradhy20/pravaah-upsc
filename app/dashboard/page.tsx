"use client";

import React, { useState, useEffect } from "react";
import {
  BarChart2,
  CheckCircle,
  XCircle,
  Clock,
  RotateCw,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Compass,
  Layers,
  Calendar,
  Award,
  Sparkles,
  Zap,
  Target,
  FileText,
  User,
  Settings,
  Shield,
  HelpCircle,
  CheckCircle2,
  ChevronRight,
  Flame,
  Check,
  RefreshCw,
} from "lucide-react";

export default function DashboardPage() {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("overview");

  const loadDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/v1/analytics/dashboard");
      const json = await res.json();
      if (res.ok && json.success) {
        setData(json.data);
      } else {
        setError(json.error?.message || "Failed to retrieve learning analytics.");
      }
    } catch (e: any) {
      console.error(e);
      setError("Network error while connecting to analytics service.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const summary = data?.summary || {
    totalAttempted: 48,
    correctCount: 36,
    incorrectCount: 12,
    overallAccuracy: 75.0,
    totalStudyHours: 14.5,
    revisionQueueCount: 6,
    studyStreak: 7,
    dailyTarget: 25,
    dailyCompleted: 17,
  };

  const subjectPerformance = data?.subjectPerformance?.length > 0 ? data.subjectPerformance : [
    { subject: "Polity & Governance", attempted: 22, correct: 18, accuracy: 81.8 },
    { subject: "Economy & Development", attempted: 12, correct: 9, accuracy: 75.0 },
    { subject: "Environment & Ecology", attempted: 8, correct: 5, accuracy: 62.5 },
    { subject: "Modern Indian History", attempted: 6, correct: 4, accuracy: 66.7 },
  ];

  const recentSessions = data?.recentSessions?.length > 0 ? data.recentSessions : [
    { id: "s1", date: "Today, 10:30 AM", paper: "Prelims 2024 GS1", questions: 15, accuracy: 80.0, score: "+24.0" },
    { id: "s2", date: "Yesterday, 04:15 PM", paper: "CSAT Paper II", questions: 10, accuracy: 70.0, score: "+17.5" },
    { id: "s3", date: "22 Nov, 08:00 PM", paper: "Polity Microtheme Drill", questions: 12, accuracy: 83.3, score: "+20.0" },
  ];

  const weeklyActivity = [
    { day: "Mon", questions: 22, height: "65%" },
    { day: "Tue", questions: 28, height: "82%" },
    { day: "Wed", questions: 18, height: "52%" },
    { day: "Thu", questions: 35, height: "100%" },
    { day: "Fri", questions: 25, height: "74%" },
    { day: "Sat", questions: 30, height: "88%" },
    { day: "Sun (Today)", questions: 17, height: "50%" },
  ];

  // Time-aware greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning, Aspirant";
    if (hour < 17) return "Good Afternoon, Aspirant";
    return "Good Evening, Aspirant";
  };

  const sidebarItems = [
    { id: "overview", label: "Overview", icon: <BarChart2 className="h-4 w-4" />, href: "/dashboard" },
    { id: "pyqs", label: "PYQ Library", icon: <BookOpen className="h-4 w-4" />, href: "/pyqs" },
    { id: "mocks", label: "Mock Tests", icon: <Clock className="h-4 w-4" />, href: "/mock-tests" },
    { id: "daily", label: "Daily Quiz", icon: <CheckCircle className="h-4 w-4" />, href: "/daily-quiz" },
    { id: "mains", label: "Mains Answer Studio", icon: <FileText className="h-4 w-4" />, href: "/mains" },
    { id: "revision", label: "Mistake Revision", icon: <RotateCw className="h-4 w-4" />, href: "/revision" },
    { id: "planner", label: "Study Planner", icon: <Calendar className="h-4 w-4" />, href: "/study-planner" },
    { id: "syllabus", label: "Syllabus Vault", icon: <Layers className="h-4 w-4" />, href: "/syllabus" },
    { id: "current-affairs", label: "Current Affairs", icon: <TrendingUp className="h-4 w-4" />, href: "/current-affairs" },
    { id: "settings", label: "Account Settings", icon: <Settings className="h-4 w-4" />, href: "/dashboard/billing" },
  ];

  return (
    <div className="min-h-screen bg-[#FBF7F0] text-[#261B1E]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* ========================================================= */}
          {/* LEFT SIDEBAR: Professional LMS Navigation                 */}
          {/* ========================================================= */}
          <aside className="lg:col-span-3">
            <div className="sticky top-24 rounded-2xl border border-[#E7DDD4] bg-white p-4 shadow-card">
              {/* User Profile Snippet */}
              <div className="flex items-center gap-3 pb-4 mb-4 border-b border-[#E7DDD4]">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#741A2B] text-white font-bold font-editorial text-base shadow-xs">
                  A
                </div>
                <div className="overflow-hidden">
                  <div className="text-sm font-bold font-editorial text-[#261B1E] truncate">
                    Aspirant Workspace
                  </div>
                  <div className="text-[11px] font-medium text-[#C69A4A] flex items-center gap-1">
                    <Sparkles className="h-3 w-3" />
                    <span>UPSC CSE 2025/2026</span>
                  </div>
                </div>
              </div>

              {/* Navigation Items List */}
              <nav className="space-y-1 text-xs font-semibold" aria-label="Dashboard Sidebar">
                {sidebarItems.map((item) => {
                  const isActive = activeTab === item.id;
                  return (
                    <a
                      key={item.id}
                      href={item.href}
                      onClick={(e) => {
                        if (item.href === "/dashboard") {
                          e.preventDefault();
                          setActiveTab(item.id);
                        }
                      }}
                      className={`flex items-center justify-between rounded-xl px-3.5 py-2.5 transition ${
                        isActive
                          ? "bg-[#FAF2E6] text-[#741A2B] font-bold border border-[#E5C88E] shadow-xs"
                          : "text-[#786B68] hover:text-[#261B1E] hover:bg-[#FBF7F0]"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className={isActive ? "text-[#741A2B]" : "text-[#786B68]"}>
                          {item.icon}
                        </span>
                        <span>{item.label}</span>
                      </div>
                      {item.id === "revision" && summary.revisionQueueCount > 0 && (
                        <span className="rounded-full bg-[#741A2B] text-white text-[10px] px-1.5 py-0.2">
                          {summary.revisionQueueCount}
                        </span>
                      )}
                    </a>
                  );
                })}
              </nav>

              {/* Membership Status Badge */}
              <div className="mt-6 p-3 rounded-xl bg-[#FAF2E6] border border-[#E5C88E] text-[11px]">
                <div className="flex items-center justify-between font-bold text-[#741A2B]">
                  <span>Membership: Free</span>
                  <a href="/pricing" className="text-[#C65A36] hover:underline">Upgrade</a>
                </div>
                <p className="mt-1 text-[#786B68]">
                  Core PYQs, Daily Quiz, and Syllabus Vault 100% active.
                </p>
              </div>
            </div>
          </aside>

          {/* ========================================================= */}
          {/* MAIN DASHBOARD CONTENT AREA                               */}
          {/* ========================================================= */}
          <main className="lg:col-span-9 space-y-8">
            
            {/* 1. Greeting & Daily Target Header Card */}
            <div className="rounded-3xl border border-[#E7DDD4] bg-white p-6 sm:p-8 shadow-card relative overflow-hidden">
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-[#FAF2E6] border border-[#E5C88E] px-3 py-0.5 text-[11px] font-bold text-[#8C6721] mb-2">
                    <Clock className="h-3 w-3" />
                    <span>Prelims Examination Countdown</span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold font-editorial text-[#261B1E] tracking-tight">
                    {getGreeting()}
                  </h1>
                  <p className="mt-1 text-xs sm:text-sm text-[#786B68]">
                    Daily Target: <strong>{summary.dailyCompleted || 17} / {summary.dailyTarget || 25} Questions</strong> completed. Keep steady momentum.
                  </p>

                  {/* Progress Bar */}
                  <div className="mt-4 max-w-md">
                    <div className="flex justify-between text-[11px] font-bold mb-1 text-[#786B68]">
                      <span>Today&apos;s Progress</span>
                      <span className="text-[#741A2B]">68%</span>
                    </div>
                    <div className="h-2.5 w-full rounded-full bg-[#F4EDE2] overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-[#C69A4A] to-[#741A2B]" style={{ width: "68%" }} />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
                  <a
                    href="/pyqs?paper=GS1"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#741A2B] hover:bg-[#5E1422] px-6 py-3 text-sm font-bold text-white shadow-card transition"
                  >
                    <span>Continue Learning</span>
                    <ArrowRight className="h-4 w-4 text-[#E2C38E]" />
                  </a>
                  <a
                    href="/daily-quiz"
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#E7DDD4] bg-[#FBF7F0] hover:bg-[#F4EDE2] px-4 py-3 text-sm font-bold text-[#261B1E] transition"
                  >
                    <span>Daily Quiz</span>
                  </a>
                </div>
              </div>
            </div>

            {/* 2. Four Master KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {/* KPI 1: Questions Solved */}
              <div className="p-5 rounded-2xl border border-[#E7DDD4] bg-white shadow-xs">
                <div className="flex items-center justify-between text-[#786B68]">
                  <span className="text-xs font-bold uppercase tracking-wider">Questions Solved</span>
                  <BookOpen className="h-4 w-4 text-[#741A2B]" />
                </div>
                <div className="mt-2 text-2xl sm:text-3xl font-extrabold font-editorial text-[#261B1E]">
                  {summary.totalAttempted || 48}
                </div>
                <div className="mt-1 text-[11px] text-[#1E7E55] flex items-center gap-1 font-semibold">
                  <TrendingUp className="h-3 w-3" />
                  <span>+17 questions today</span>
                </div>
              </div>

              {/* KPI 2: Accuracy Rate */}
              <div className="p-5 rounded-2xl border border-[#E7DDD4] bg-white shadow-xs">
                <div className="flex items-center justify-between text-[#786B68]">
                  <span className="text-xs font-bold uppercase tracking-wider">Accuracy Rate</span>
                  <Target className="h-4 w-4 text-[#C69A4A]" />
                </div>
                <div className="mt-2 text-2xl sm:text-3xl font-extrabold font-editorial text-[#741A2B]">
                  {summary.overallAccuracy ? `${summary.overallAccuracy.toFixed(1)}%` : "75.0%"}
                </div>
                <div className="mt-1 text-[11px] text-[#786B68]">
                  <span>{summary.correctCount || 36} correct of {summary.totalAttempted || 48}</span>
                </div>
              </div>

              {/* KPI 3: Study Streak */}
              <div className="p-5 rounded-2xl border border-[#E7DDD4] bg-white shadow-xs">
                <div className="flex items-center justify-between text-[#786B68]">
                  <span className="text-xs font-bold uppercase tracking-wider">Study Streak</span>
                  <Flame className="h-4 w-4 text-[#C65A36]" />
                </div>
                <div className="mt-2 text-2xl sm:text-3xl font-extrabold font-editorial text-[#C65A36]">
                  {summary.studyStreak || 7} Days
                </div>
                <div className="mt-1 text-[11px] text-[#786B68]">
                  <span>Consistency bonus active</span>
                </div>
              </div>

              {/* KPI 4: Revision Due */}
              <div className="p-5 rounded-2xl border border-[#E7DDD4] bg-white shadow-xs">
                <div className="flex items-center justify-between text-[#786B68]">
                  <span className="text-xs font-bold uppercase tracking-wider">Revision Due</span>
                  <RotateCw className="h-4 w-4 text-[#8C6721]" />
                </div>
                <div className="mt-2 text-2xl sm:text-3xl font-extrabold font-editorial text-[#261B1E]">
                  {summary.revisionQueueCount || 6} Items
                </div>
                <a href="/revision" className="mt-1 text-[11px] text-[#741A2B] font-bold hover:underline flex items-center gap-0.5">
                  <span>Review in SM-2 Queue &rarr;</span>
                </a>
              </div>
            </div>

            {/* 3. Visual Charts: Weekly Activity & Subject Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Weekly Activity Bar Chart */}
              <div className="lg:col-span-7 p-6 rounded-2xl border border-[#E7DDD4] bg-white shadow-card">
                <div className="flex items-center justify-between pb-4 border-b border-[#E7DDD4]">
                  <div>
                    <h3 className="text-base font-bold font-editorial text-[#261B1E]">
                      Weekly Study Activity
                    </h3>
                    <p className="text-xs text-[#786B68]">Total questions solved past 7 days</p>
                  </div>
                  <span className="text-xs font-bold text-[#741A2B] bg-[#FAF2E6] px-2.5 py-1 rounded-lg border border-[#E5C88E]">
                    175 Qs This Week
                  </span>
                </div>

                {/* SVG-Free Responsive Bar Chart */}
                <div className="mt-6 flex items-end justify-between h-44 pt-4 px-2">
                  {weeklyActivity.map((bar, idx) => (
                    <div key={idx} className="flex flex-col items-center gap-2 flex-1">
                      <span className="text-[10px] font-bold text-[#741A2B]">{bar.questions}</span>
                      <div className="w-8 sm:w-10 rounded-t-lg bg-[#F4EDE2] h-32 flex items-end overflow-hidden">
                        <div
                          className="w-full rounded-t-lg bg-gradient-to-t from-[#741A2B] to-[#C69A4A] transition-all duration-500"
                          style={{ height: bar.height }}
                        />
                      </div>
                      <span className="text-[10px] font-semibold text-[#786B68]">{bar.day}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Subject Accuracy Visualizer */}
              <div className="lg:col-span-5 p-6 rounded-2xl border border-[#E7DDD4] bg-white shadow-card">
                <div className="flex items-center justify-between pb-4 border-b border-[#E7DDD4]">
                  <div>
                    <h3 className="text-base font-bold font-editorial text-[#261B1E]">
                      Subject Accuracy
                    </h3>
                    <p className="text-xs text-[#786B68]">Accuracy rate by syllabus subject</p>
                  </div>
                  <a href="/analytics" className="text-xs font-bold text-[#741A2B] hover:underline">
                    View All
                  </a>
                </div>

                <div className="mt-4 space-y-4">
                  {subjectPerformance.map((sp: any, idx: number) => (
                    <div key={idx}>
                      <div className="flex justify-between text-xs font-semibold mb-1">
                        <span className="text-[#261B1E] truncate max-w-[180px]">{sp.subject}</span>
                        <span className="text-[#741A2B] font-bold">{sp.accuracy.toFixed(1)}%</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-[#F4EDE2] overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            sp.accuracy >= 75 ? "bg-[#1E7E55]" : sp.accuracy >= 65 ? "bg-[#C69A4A]" : "bg-[#C65A36]"
                          }`}
                          style={{ width: `${Math.min(100, sp.accuracy)}%` }}
                        />
                      </div>
                      <div className="text-[10px] text-[#786B68] mt-0.5">
                        {sp.correct} correct of {sp.attempted} attempted
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 4. Two-Column Lower Modules: Daily Schedule & Recent Test Sessions */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Daily Preparation Schedule */}
              <div className="lg:col-span-6 p-6 rounded-2xl border border-[#E7DDD4] bg-white shadow-card">
                <div className="flex items-center justify-between pb-3 border-b border-[#E7DDD4]">
                  <h3 className="text-base font-bold font-editorial text-[#261B1E]">
                    Today&apos;s Preparation Routine
                  </h3>
                  <a href="/study-planner" className="text-xs font-bold text-[#741A2B] hover:underline">
                    Full Schedule
                  </a>
                </div>

                <div className="mt-4 space-y-3">
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-[#FAF2E6] border border-[#E5C88E]">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#741A2B] text-white text-xs font-bold">
                      1
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#261B1E]">Polity: Fundamental Rights Revision</div>
                      <div className="text-[11px] text-[#786B68]">Solve 15 microtheme questions on Article 14, 19 & 21</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-xl bg-[#FBF7F0] border border-[#E7DDD4]">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#C69A4A] text-[#3A101A] text-xs font-bold">
                      2
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#261B1E]">Daily 5-Question Diagnostic Quiz</div>
                      <div className="text-[11px] text-[#786B68]">Timed 6-minute evaluation with negative marking</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-xl bg-[#FBF7F0] border border-[#E7DDD4]">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#786B68] text-white text-xs font-bold">
                      3
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#261B1E]">Review SM-2 Mistake Queue</div>
                      <div className="text-[11px] text-[#786B68]">6 spaced items due from Day 3 & Day 7 intervals</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Test Sessions */}
              <div className="lg:col-span-6 p-6 rounded-2xl border border-[#E7DDD4] bg-white shadow-card">
                <div className="flex items-center justify-between pb-3 border-b border-[#E7DDD4]">
                  <h3 className="text-base font-bold font-editorial text-[#261B1E]">
                    Recent Practice Sessions
                  </h3>
                  <a href="/pyqs" className="text-xs font-bold text-[#741A2B] hover:underline">
                    New Session
                  </a>
                </div>

                <div className="mt-4 space-y-3">
                  {recentSessions.map((sess: any) => (
                    <div
                      key={sess.id}
                      className="flex items-center justify-between p-3 rounded-xl border border-[#E7DDD4] bg-[#FBF7F0] text-xs"
                    >
                      <div>
                        <div className="font-bold text-[#261B1E]">{sess.paper}</div>
                        <div className="text-[11px] text-[#786B68]">{sess.date} • {sess.questions} Questions</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-[#1E7E55]">{sess.score} pts</div>
                        <div className="text-[11px] text-[#786B68]">{sess.accuracy}% accuracy</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </main>
        </div>
      </div>
    </div>
  );
}
