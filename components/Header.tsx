"use client";

import React, { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  Compass,
  Layers,
  Clock,
  BarChart2,
  Bookmark,
  ShieldCheck,
  Menu,
  X,
  RotateCw,
  Search,
  CheckCircle,
  Sparkles,
  ChevronDown,
  User,
  LogOut,
  FileText,
  Zap,
  ArrowRight,
  Sliders,
} from "lucide-react";
import { AILearningAssistantModal } from "@/components/AILearningAssistantModal";

export function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [practiceOpen, setPracticeOpen] = useState(false);
  const [prepOpen, setPrepOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [isAiAssistantOpen, setIsAiAssistantOpen] = useState(false);

  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [userTier, setUserTier] = useState<string>("Free");

  const practiceRef = useRef<HTMLDivElement>(null);
  const prepRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function checkAuth() {
      try {
        const [meRes, subRes] = await Promise.all([
          fetch("/api/v1/auth/me"),
          fetch("/api/v1/user/subscription").catch(() => null),
        ]);

        const meJson = await meRes.json();
        if (meJson.success && meJson.data.authenticated) {
          setCurrentUser(meJson.data.user);
        }

        if (subRes && subRes.ok) {
          const subJson = await subRes.json();
          if (subJson.success && subJson.data?.planName) {
            setUserTier(subJson.data.planName.replace("Aspirant ", ""));
          }
        }
      } catch (e) {
        console.error("Auth check failed:", e);
      }
    }
    checkAuth();
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (practiceRef.current && !practiceRef.current.contains(event.target as Node)) {
        setPracticeOpen(false);
      }
      if (prepRef.current && !prepRef.current.contains(event.target as Node)) {
        setPrepOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/v1/auth/logout", { method: "POST" });
      window.location.href = "/login";
    } catch (e) {
      console.error(e);
    }
  };

  const isPracticeActive =
    pathname?.startsWith("/pyqs") ||
    pathname?.startsWith("/mock-tests") ||
    pathname?.startsWith("/daily-quiz") ||
    pathname?.startsWith("/revision");

  const isPrepActive =
    pathname?.startsWith("/current-affairs") ||
    pathname?.startsWith("/mains") ||
    pathname?.startsWith("/study-planner") ||
    pathname?.startsWith("/exams") ||
    pathname?.startsWith("/ncert") ||
    pathname?.startsWith("/syllabus");

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Brand Logo & Navigation Group */}
        <div className="flex items-center gap-8">
          <a href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-700 to-indigo-800 text-white shadow-sm ring-1 ring-blue-900/10 transition-transform group-hover:scale-105">
              <BookOpen className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-tight text-slate-900 leading-none">
                Pravaah <span className="text-blue-700">UPSC</span>
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-1">
                CSE AI Platform
              </span>
            </div>
          </a>

          {/* Desktop Categorized Navigation (Clean & Professional) */}
          <nav className="hidden lg:flex items-center gap-1.5">
            {/* 1. Practice Hub Dropdown */}
            <div className="relative" ref={practiceRef}>
              <button
                onClick={() => {
                  setPracticeOpen(!practiceOpen);
                  setPrepOpen(false);
                }}
                className={`flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-bold transition-colors ${
                  isPracticeActive || practiceOpen
                    ? "bg-blue-50 text-blue-700"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <Compass className="h-4 w-4" />
                <span>Practice</span>
                <ChevronDown className={`h-3.5 w-3.5 transition-transform ${practiceOpen ? "rotate-180" : ""}`} />
              </button>

              {practiceOpen && (
                <div className="absolute left-0 mt-2 w-72 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl animate-in fade-in-50 zoom-in-95">
                  <a
                    href="/pyqs"
                    onClick={() => setPracticeOpen(false)}
                    className="flex items-start gap-3 rounded-xl p-2.5 hover:bg-slate-50 transition"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
                      <Compass className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">PYQ Explorer</div>
                      <div className="text-[11px] text-slate-500 leading-tight mt-0.5">
                        1,079+ verified Prelims questions (2019–2024 Series A)
                      </div>
                    </div>
                  </a>

                  <a
                    href="/daily-quiz"
                    onClick={() => setPracticeOpen(false)}
                    className="flex items-start gap-3 rounded-xl p-2.5 hover:bg-slate-50 transition"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                      <CheckCircle className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">Daily Prelims Diagnostic</div>
                      <div className="text-[11px] text-slate-500 leading-tight mt-0.5">
                        5 high-yield questions with 38-day archive
                      </div>
                    </div>
                  </a>

                  <a
                    href="/mock-tests"
                    onClick={() => setPracticeOpen(false)}
                    className="flex items-start gap-3 rounded-xl p-2.5 hover:bg-slate-50 transition"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700">
                      <Clock className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">Timed 2-Hour Mocks</div>
                      <div className="text-[11px] text-slate-500 leading-tight mt-0.5">
                        Zero-leak authentic exam simulation with negative marking
                      </div>
                    </div>
                  </a>

                  <a
                    href="/revision"
                    onClick={() => setPracticeOpen(false)}
                    className="flex items-start gap-3 rounded-xl p-2.5 hover:bg-slate-50 transition"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
                      <RotateCw className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">Mistake Revision Notebook</div>
                      <div className="text-[11px] text-slate-500 leading-tight mt-0.5">
                        Automated SuperMemo-2 spaced repetition queue
                      </div>
                    </div>
                  </a>
                </div>
              )}
            </div>

            {/* 2. Prep & Study Hub Dropdown */}
            <div className="relative" ref={prepRef}>
              <button
                onClick={() => {
                  setPrepOpen(!prepOpen);
                  setPracticeOpen(false);
                }}
                className={`flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-bold transition-colors ${
                  isPrepActive || prepOpen
                    ? "bg-blue-50 text-blue-700"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <BookOpen className="h-4 w-4" />
                <span>Preparation</span>
                <ChevronDown className={`h-3.5 w-3.5 transition-transform ${prepOpen ? "rotate-180" : ""}`} />
              </button>

              {prepOpen && (
                <div className="absolute left-0 mt-2 w-72 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl animate-in fade-in-50 zoom-in-95">
                  <a
                    href="/syllabus"
                    onClick={() => setPrepOpen(false)}
                    className="flex items-start gap-3 rounded-xl p-2.5 hover:bg-slate-50 transition"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
                      <Sparkles className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">UPSC Crack Engine & Vault</div>
                      <div className="text-[11px] text-slate-500 leading-tight mt-0.5">
                        Detailed micro-syllabus, booklist, static cheat sheets
                      </div>
                    </div>
                  </a>

                  <a
                    href="/ncert"
                    onClick={() => setPrepOpen(false)}
                    className="flex items-start gap-3 rounded-xl p-2.5 hover:bg-slate-50 transition"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                      <BookOpen className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">NCERT Knowledge Base</div>
                      <div className="text-[11px] text-slate-500 leading-tight mt-0.5">
                        Classes 6–12 textbooks, chapters & linked PYQs
                      </div>
                    </div>
                  </a>

                  <a
                    href="/current-affairs"
                    onClick={() => setPrepOpen(false)}
                    className="flex items-start gap-3 rounded-xl p-2.5 hover:bg-slate-50 transition"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-teal-100 text-teal-700">
                      <Layers className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">Current Affairs & PYQs</div>
                      <div className="text-[11px] text-slate-500 leading-tight mt-0.5">
                        PIB & Ministry verified stories linked to syllabus
                      </div>
                    </div>
                  </a>

                  <a
                    href="/mains"
                    onClick={() => setPrepOpen(false)}
                    className="flex items-start gap-3 rounded-xl p-2.5 hover:bg-slate-50 transition"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-rose-100 text-rose-700">
                      <BarChart2 className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">Mains Answer Studio</div>
                      <div className="text-[11px] text-slate-500 leading-tight mt-0.5">
                        80 authentic questions across GS1–GS4 & Essay
                      </div>
                    </div>
                  </a>

                  <a
                    href="/study-planner"
                    onClick={() => setPrepOpen(false)}
                    className="flex items-start gap-3 rounded-xl p-2.5 hover:bg-slate-50 transition"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700">
                      <Sliders className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">Daily Study Planner</div>
                      <div className="text-[11px] text-slate-500 leading-tight mt-0.5">
                        Target exam dates, stage allocation & custom schedules
                      </div>
                    </div>
                  </a>

                  <a
                    href="/exams"
                    onClick={() => setPrepOpen(false)}
                    className="flex items-start gap-3 rounded-xl p-2.5 hover:bg-slate-50 transition"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">UPSC Exams Directory</div>
                      <div className="text-[11px] text-slate-500 leading-tight mt-0.5">
                        CSE, IFS, CDS, NDA, CAPF, ESE, EPFO profiles
                      </div>
                    </div>
                  </a>

                  <a
                    href="/coverage"
                    onClick={() => setPrepOpen(false)}
                    className="flex items-start gap-3 rounded-xl p-2.5 hover:bg-slate-50 transition border-t border-slate-100 mt-1 pt-2"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700">
                      <Layers className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">Coverage & Harvest Matrix</div>
                      <div className="text-[11px] text-slate-500 leading-tight mt-0.5">
                        14 exams, 1995–2026 archives & completeness
                      </div>
                    </div>
                  </a>
                </div>
              )}
            </div>

            {/* 3. Methodology & System Flow */}
            <a
              href="/system-flow"
              className={`flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-bold transition-colors ${
                pathname === "/system-flow"
                  ? "bg-blue-50 text-blue-700"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <Sparkles className="h-4 w-4 text-indigo-600" />
              <span>Aspirant Flow</span>
            </a>

            {/* 4. Pricing */}
            <a
              href="/pricing"
              className={`flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-bold transition-colors ${
                pathname === "/pricing"
                  ? "bg-blue-50 text-blue-700"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <Bookmark className="h-4 w-4" />
              <span>Pricing</span>
              <span className="ml-1 rounded-md bg-amber-100 px-1.5 py-0.5 text-[10px] font-black text-amber-800">
                PRO
              </span>
            </a>
          </nav>
        </div>

        {/* Right Section: Search & Auth Actions */}
        <div className="hidden sm:flex items-center gap-2.5">
          {/* Ask AI Grounded Assistant */}
          <button
            onClick={() => setIsAiAssistantOpen(true)}
            className="flex items-center gap-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200/80 px-2.5 py-1.5 rounded-lg hover:bg-indigo-100 transition shadow-xs"
          >
            <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
            <span>Ask AI</span>
          </button>

          {/* Quick Practise Link */}
          <a
            href="/pyqs"
            className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-blue-700 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 transition"
          >
            <Search className="h-3.5 w-3.5" />
            <span>Search Bank</span>
          </a>

          {/* User Profile or Login CTA */}
          {currentUser ? (
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2.5 rounded-full border border-slate-200 bg-slate-50 p-1 pl-3 text-xs font-bold text-slate-800 hover:bg-slate-100 transition shadow-sm"
              >
                <span>{currentUser.fullName?.split(" ")[0]}</span>
                <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-black text-blue-800 uppercase">
                  {userTier}
                </span>
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-700 text-white font-bold text-xs">
                  {currentUser.fullName?.[0] || "A"}
                </div>
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-60 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl animate-in fade-in-50 zoom-in-95">
                  <div className="px-3 py-2 border-b border-slate-100 mb-1">
                    <p className="text-xs font-bold text-slate-900 truncate">{currentUser.fullName}</p>
                    <p className="text-[11px] text-slate-500 truncate">{currentUser.email}</p>
                    <div className="mt-1.5 inline-flex items-center gap-1 rounded bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700">
                      Tier: {userTier}
                    </div>
                  </div>

                  <a
                    href="/dashboard"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
                  >
                    <BarChart2 className="h-4 w-4 text-slate-500" />
                    <span>Aspirant Dashboard</span>
                  </a>

                  <a
                    href="/bookmarks"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
                  >
                    <Bookmark className="h-4 w-4 text-slate-500" />
                    <span>My Bookmarks</span>
                  </a>

                  <a
                    href="/notes"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
                  >
                    <FileText className="h-4 w-4 text-slate-500" />
                    <span>Study Notes</span>
                  </a>

                  <a
                    href="/pricing"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
                  >
                    <Zap className="h-4 w-4 text-amber-500" />
                    <span>Upgrade Plan</span>
                  </a>

                  {currentUser.role === "ADMIN" && (
                    <a
                      href="/admin"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 text-xs font-bold text-amber-900 hover:bg-amber-100 transition my-1"
                    >
                      <ShieldCheck className="h-4 w-4 text-amber-700" />
                      <span>Admin Control Center</span>
                    </a>
                  )}

                  <div className="my-1 border-t border-slate-100" />

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 transition text-left"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <a
                href="/login"
                className="rounded-xl px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
              >
                Log In
              </a>
              <a
                href="/register"
                className="inline-flex items-center gap-1.5 rounded-xl bg-blue-700 hover:bg-blue-800 px-4 py-2 text-xs font-bold text-white shadow-sm transition"
              >
                <span>Start Free</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </a>
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="flex lg:hidden items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-xl p-2 text-slate-600 hover:bg-slate-100 transition"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="border-b border-slate-200 bg-white px-4 py-5 lg:hidden animate-in slide-in-from-top-2 max-h-[85vh] overflow-y-auto">
          <div className="flex flex-col gap-4">
            <div>
              <p className="text-[11px] font-black uppercase tracking-wider text-slate-400 mb-2 px-2">
                Practice Hub
              </p>
              <div className="flex flex-col gap-1">
                <a
                  href="/pyqs"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50"
                >
                  <Compass className="h-4 w-4 text-blue-600" />
                  <span>PYQ Explorer (2019–2024)</span>
                </a>
                <a
                  href="/daily-quiz"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50"
                >
                  <CheckCircle className="h-4 w-4 text-emerald-600" />
                  <span>Daily Prelims Diagnostic</span>
                </a>
                <a
                  href="/mock-tests"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50"
                >
                  <Clock className="h-4 w-4 text-indigo-600" />
                  <span>Timed Mock Exams</span>
                </a>
                <a
                  href="/revision"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50"
                >
                  <RotateCw className="h-4 w-4 text-amber-600" />
                  <span>Mistake Revision Queue</span>
                </a>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-3">
              <p className="text-[11px] font-black uppercase tracking-wider text-slate-400 mb-2 px-2">
                Preparation
              </p>
              <div className="flex flex-col gap-1">
                <a
                  href="/syllabus"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-bold text-blue-700 bg-blue-50/50 hover:bg-blue-50"
                >
                  <Sparkles className="h-4 w-4 text-blue-600" />
                  <span>UPSC Crack Engine & Vault</span>
                </a>
                <a
                  href="/ncert"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-bold text-emerald-700 bg-emerald-50/50 hover:bg-emerald-50"
                >
                  <BookOpen className="h-4 w-4 text-emerald-600" />
                  <span>NCERT Knowledge Base</span>
                </a>
                <a
                  href="/current-affairs"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50"
                >
                  <Layers className="h-4 w-4 text-teal-600" />
                  <span>Current Affairs & Syllabus Links</span>
                </a>
                <a
                  href="/mains"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50"
                >
                  <BarChart2 className="h-4 w-4 text-rose-600" />
                  <span>Mains Answer Studio (80 Qs)</span>
                </a>
                <a
                  href="/study-planner"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50"
                >
                  <Sliders className="h-4 w-4 text-indigo-600" />
                  <span>Daily Study Planner</span>
                </a>
                <a
                  href="/exams"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50"
                >
                  <ShieldCheck className="h-4 w-4 text-slate-600" />
                  <span>UPSC Exams Directory</span>
                </a>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-3 flex flex-col gap-1">
              <a
                href="/system-flow"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-bold text-indigo-700 hover:bg-indigo-50"
              >
                <Sparkles className="h-4 w-4" />
                <span>Aspirant Operating Loop & Flow</span>
              </a>
              <a
                href="/pricing"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50"
              >
                <Bookmark className="h-4 w-4 text-amber-600" />
                <span>Pricing Plans (Save 42%)</span>
              </a>
            </div>

            <div className="border-t border-slate-100 pt-3">
              {currentUser ? (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between px-2">
                    <span className="text-xs font-bold text-slate-800">{currentUser.fullName}</span>
                    <span className="text-[10px] font-black uppercase text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                      {userTier}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full text-center py-2 text-xs font-bold text-rose-600 bg-rose-50 rounded-xl"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <a
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-center py-2.5 text-xs font-bold text-slate-700 bg-slate-100 rounded-xl"
                  >
                    Sign In
                  </a>
                  <a
                    href="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-center py-2.5 text-xs font-bold text-white bg-blue-700 rounded-xl"
                  >
                    Start Free
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <AILearningAssistantModal
        isOpen={isAiAssistantOpen}
        onClose={() => setIsAiAssistantOpen(false)}
      />
    </header>
  );
}
