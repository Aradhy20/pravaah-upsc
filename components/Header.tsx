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
  Award,
  Video,
  MapPin,
  HelpCircle,
  TrendingUp,
} from "lucide-react";
import { AILearningAssistantModal } from "@/components/AILearningAssistantModal";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useLanguage } from "@/lib/i18n/context";

export function Header() {
  const pathname = usePathname();
  const { t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [practiceOpen, setPracticeOpen] = useState(false);
  const [prepOpen, setPrepOpen] = useState(false);
  const [mobilePracticeExpanded, setMobilePracticeExpanded] = useState(false);
  const [mobilePrepExpanded, setMobilePrepExpanded] = useState(false);
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

  // Keyboard accessibility and scroll locking for mobile drawer
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMobileMenuOpen(false);
        setPracticeOpen(false);
        setPrepOpen(false);
        setUserDropdownOpen(false);
      }
    }

    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [mobileMenuOpen]);

  const handleLogout = async () => {
    try {
      await fetch("/api/v1/auth/logout", { method: "POST" });
      window.location.href = "/login";
    } catch (e) {
      console.error(e);
    }
  };

  const isPracticeActive =
    pathname?.startsWith("/mock-tests") ||
    pathname?.startsWith("/exam-simulator") ||
    pathname?.startsWith("/daily-quiz") ||
    pathname?.startsWith("/revision");

  const isPrepActive =
    pathname?.startsWith("/syllabus") ||
    pathname?.startsWith("/study-planner") ||
    pathname?.startsWith("/mains") ||
    pathname?.startsWith("/notes") ||
    pathname?.startsWith("/video-academy") ||
    pathname?.startsWith("/topper-copies") ||
    pathname?.startsWith("/map-lab") ||
    pathname?.startsWith("/ncert") ||
    pathname?.startsWith("/interview") ||
    pathname?.startsWith("/csat-coach") ||
    pathname?.startsWith("/exams");

  const isCurrentAffairsActive = pathname?.startsWith("/current-affairs");
  const isPyqActive = pathname?.startsWith("/pyqs");
  const isPricingActive = pathname?.startsWith("/pricing");

  return (
    <>
      <header className="sticky top-0 z-50 h-[72px] border-b border-[#E7DDD4] bg-[#FBF7F0]/95 backdrop-blur-md">
        {/* Helper tokens: border-b border-[#E4E7EC] bg-white bg-[#2453E6] */}
        <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 flex-nowrap">
          {/* 1. Left: Indian Heritage Logo & Brand */}
          <div className="flex items-center gap-3 shrink-0">
            <a
              href="/"
              className="flex items-center gap-3 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C69A4A] rounded-xl p-1"
              aria-label="Pravaah UPSC Home"
            >
              <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-[#741A2B] text-white shadow-card border border-[#C69A4A]/50 transition-transform group-hover:scale-105 shrink-0">
                <BookOpen className="h-5 w-5 text-[#E2C38E]" />
                <div className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-[#C65A36] ring-2 ring-[#FBF7F0]" />
              </div>
              <div className="flex flex-col justify-center">
                <span className="text-xl sm:text-2xl font-black font-editorial tracking-tight text-[#261B1E] leading-tight">
                  Pravaah <span className="text-[#741A2B]">UPSC</span>
                </span>
                <span className="text-[9px] font-bold uppercase tracking-widest text-[#C69A4A] leading-none mt-0.5">
                  CSE AI Platform
                </span>
              </div>
            </a>
          </div>

          {/* 2. Center: Public Website Navigation (4 Core Groups) */}
          <nav
            aria-label="Main Navigation"
            className="hidden lg:flex items-center gap-1 xl:gap-2 shrink-0 flex-nowrap text-sm font-medium"
          >
            {/* 1. Practice Dropdown */}
            <div className="relative" ref={practiceRef}>
              <button
                onClick={() => {
                  setPracticeOpen(!practiceOpen);
                  setPrepOpen(false);
                }}
                aria-expanded={practiceOpen}
                aria-haspopup="true"
                className={`flex items-center gap-1.5 rounded-lg px-3 py-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#741A2B] ${
                  isPracticeActive || practiceOpen
                    ? "bg-[#FAF2E6] text-[#741A2B] font-bold shadow-xs border border-[#E7DDD4]"
                    : "text-[#786B68] hover:text-[#261B1E] hover:bg-[#F4EDE2]"
                }`}
              >
                <span>Practice</span>
                <ChevronDown
                  className={`h-3.5 w-3.5 transition-transform duration-200 ${
                    practiceOpen ? "rotate-180 text-[#741A2B]" : "text-[#786B68]"
                  }`}
                />
              </button>

              {practiceOpen && (
                <div
                  role="menu"
                  className="absolute left-0 mt-2 w-72 rounded-2xl border border-[#E7DDD4] bg-white p-2 shadow-hover animate-in fade-in-50 zoom-in-95 z-50"
                >
                  <a
                    href="/pyqs?paper=GS1"
                    onClick={() => setPracticeOpen(false)}
                    className="flex items-center gap-2.5 rounded-xl p-2.5 hover:bg-[#FBF7F0] transition group text-xs font-semibold text-[#261B1E]"
                  >
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#FAF2E6] text-[#741A2B] group-hover:bg-[#741A2B] group-hover:text-white transition">
                      <Compass className="h-4 w-4" />
                    </div>
                    <span>Prelims GS Paper I</span>
                  </a>

                  <a
                    href="/pyqs?paper=GS2"
                    onClick={() => setPracticeOpen(false)}
                    className="flex items-center gap-2.5 rounded-xl p-2.5 hover:bg-[#FBF7F0] transition group text-xs font-semibold text-[#261B1E]"
                  >
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#FAF2E6] text-[#741A2B] group-hover:bg-[#741A2B] group-hover:text-white transition">
                      <Clock className="h-4 w-4" />
                    </div>
                    <span>CSAT Paper II</span>
                  </a>

                  <a
                    href="/mock-tests"
                    onClick={() => setPracticeOpen(false)}
                    className="flex items-center gap-2.5 rounded-xl p-2.5 hover:bg-[#FBF7F0] transition group text-xs font-semibold text-[#261B1E]"
                  >
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#FAF2E6] text-[#741A2B] group-hover:bg-[#741A2B] group-hover:text-white transition">
                      <Clock className="h-4 w-4" />
                    </div>
                    <span>Mock Tests</span>
                  </a>

                  <a
                    href="/daily-quiz"
                    onClick={() => setPracticeOpen(false)}
                    className="flex items-center gap-2.5 rounded-xl p-2.5 hover:bg-[#FBF7F0] transition group text-xs font-semibold text-[#261B1E]"
                  >
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#FAF2E6] text-[#741A2B] group-hover:bg-[#741A2B] group-hover:text-white transition">
                      <Sparkles className="h-4 w-4" />
                    </div>
                    <span>Daily Quiz</span>
                  </a>

                  <a
                    href="/revision"
                    onClick={() => setPracticeOpen(false)}
                    className="flex items-center gap-2.5 rounded-xl p-2.5 hover:bg-[#FBF7F0] transition group text-xs font-semibold text-[#261B1E]"
                  >
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#FAF2E6] text-[#741A2B] group-hover:bg-[#741A2B] group-hover:text-white transition">
                      <RotateCw className="h-4 w-4" />
                    </div>
                    <span>Revision</span>
                  </a>
                </div>
              )}
            </div>

            {/* 2. Preparation Dropdown */}
            <div className="relative" ref={prepRef}>
              <button
                onClick={() => {
                  setPrepOpen(!prepOpen);
                  setPracticeOpen(false);
                }}
                aria-expanded={prepOpen}
                aria-haspopup="true"
                className={`flex items-center gap-1.5 rounded-lg px-3 py-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#741A2B] ${
                  isPrepActive || prepOpen
                    ? "bg-[#FAF2E6] text-[#741A2B] font-bold shadow-xs border border-[#E7DDD4]"
                    : "text-[#786B68] hover:text-[#261B1E] hover:bg-[#F4EDE2]"
                }`}
              >
                <span>Preparation</span>
                <ChevronDown
                  className={`h-3.5 w-3.5 transition-transform duration-200 ${
                    prepOpen ? "rotate-180 text-[#741A2B]" : "text-[#786B68]"
                  }`}
                />
              </button>

              {prepOpen && (
                <div
                  role="menu"
                  className="absolute left-0 mt-2 w-72 rounded-2xl border border-[#E7DDD4] bg-white p-2 shadow-hover animate-in fade-in-50 zoom-in-95 z-50"
                >
                  <a
                    href="/syllabus"
                    onClick={() => setPrepOpen(false)}
                    className="flex items-center gap-2.5 rounded-xl p-2.5 hover:bg-[#FBF7F0] transition group text-xs font-semibold text-[#261B1E]"
                  >
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#FAF2E6] text-[#741A2B] group-hover:bg-[#741A2B] group-hover:text-white transition">
                      <Layers className="h-4 w-4" />
                    </div>
                    <span>UPSC Syllabus</span>
                  </a>

                  <a
                    href="/study-planner"
                    onClick={() => setPrepOpen(false)}
                    className="flex items-center gap-2.5 rounded-xl p-2.5 hover:bg-[#FBF7F0] transition group text-xs font-semibold text-[#261B1E]"
                  >
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#FAF2E6] text-[#741A2B] group-hover:bg-[#741A2B] group-hover:text-white transition">
                      <Sliders className="h-4 w-4" />
                    </div>
                    <span>Study Planner</span>
                  </a>

                  <a
                    href="/mains"
                    onClick={() => setPrepOpen(false)}
                    className="flex items-center gap-2.5 rounded-xl p-2.5 hover:bg-[#FBF7F0] transition group text-xs font-semibold text-[#261B1E]"
                  >
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#FAF2E6] text-[#741A2B] group-hover:bg-[#741A2B] group-hover:text-white transition">
                      <FileText className="h-4 w-4" />
                    </div>
                    <span>Mains Answer Writing</span>
                  </a>

                  <a
                    href="/notes"
                    onClick={() => setPrepOpen(false)}
                    className="flex items-center gap-2.5 rounded-xl p-2.5 hover:bg-[#FBF7F0] transition group text-xs font-semibold text-[#261B1E]"
                  >
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#FAF2E6] text-[#741A2B] group-hover:bg-[#741A2B] group-hover:text-white transition">
                      <Bookmark className="h-4 w-4" />
                    </div>
                    <span>Notes and Bookmarks</span>
                  </a>

                  <a
                    href="/video-academy"
                    onClick={() => setPrepOpen(false)}
                    className="flex items-center gap-2.5 rounded-xl p-2.5 hover:bg-[#FBF7F0] transition group text-xs font-semibold text-[#261B1E]"
                  >
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#FAF2E6] text-[#741A2B] group-hover:bg-[#741A2B] group-hover:text-white transition">
                      <Video className="h-4 w-4" />
                    </div>
                    <span>Resource Library</span>
                  </a>
                </div>
              )}
            </div>

            {/* 3. Current Affairs Direct Link */}
            <a
              href="/current-affairs"
              className={`rounded-lg px-3 py-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#741A2B] ${
                isCurrentAffairsActive
                  ? "bg-[#FAF2E6] text-[#741A2B] font-bold shadow-xs border border-[#E7DDD4]"
                  : "text-[#786B68] hover:text-[#261B1E] hover:bg-[#F4EDE2]"
              }`}
            >
              Current Affairs
            </a>

            {/* 4. PYQ Bank Direct Link */}
            <a
              href="/pyqs"
              className={`rounded-lg px-3 py-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#741A2B] ${
                isPyqActive
                  ? "bg-[#FAF2E6] text-[#741A2B] font-bold shadow-xs border border-[#E7DDD4]"
                  : "text-[#786B68] hover:text-[#261B1E] hover:bg-[#F4EDE2]"
              }`}
            >
              PYQ Bank
            </a>
          </nav>

          {/* 3. Right: Utility Controls & Authentication */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Search Button */}
            <a
              href="/pyqs"
              aria-label="Search PYQs"
              title="Search PYQs"
              className="flex h-10 w-10 min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border border-[#E7DDD4] bg-white text-[#786B68] hover:text-[#741A2B] hover:bg-[#F4EDE2] transition"
            >
              <Search className="h-4 w-4" />
            </a>

            {/* Language Switcher */}
            <LanguageSwitcher />

            {/* Ask AI Button */}
            <button
              onClick={() => setIsAiAssistantOpen(true)}
              className="hidden sm:inline-flex min-h-[44px] items-center gap-1.5 rounded-xl border border-[#E5C88E] bg-[#FAF2E6] px-3.5 py-2 text-xs font-bold text-[#741A2B] hover:bg-[#C69A4A] hover:text-[#3A101A] transition shadow-xs"
              title="Pravaah AI Academic Mentor"
            >
              <Sparkles className="h-3.5 w-3.5 text-[#C69A4A]" />
              <span>Ask AI</span>
            </button>

            {/* Pricing Link */}
            <a
              href="/pricing"
              className={`hidden md:inline-block rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isPricingActive
                  ? "text-[#741A2B] font-bold"
                  : "text-[#786B68] hover:text-[#261B1E]"
              }`}
            >
              Pricing
            </a>

            {/* Auth State Button Group */}
            {currentUser ? (
              <div className="relative flex items-center gap-2" ref={userMenuRef}>
                <a
                  href="/dashboard"
                  className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl border border-[#E7DDD4] bg-white px-3.5 py-2 text-xs font-bold text-[#261B1E] hover:border-[#C69A4A] hover:bg-[#F4EDE2] transition shadow-xs"
                >
                  <BarChart2 className="h-3.5 w-3.5 text-[#741A2B]" />
                  <span>Dashboard</span>
                </a>

                {/* User Menu Trigger */}
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  aria-expanded={userDropdownOpen}
                  aria-haspopup="true"
                  className="flex h-10 w-10 min-h-[44px] min-w-[44px] items-center justify-center rounded-xl bg-[#741A2B] text-white font-bold text-xs shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C69A4A]"
                  title={currentUser.email}
                >
                  {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : "A"}
                </button>

                {userDropdownOpen && (
                  <div
                    role="menu"
                    className="absolute right-0 top-11 mt-2 w-56 rounded-2xl border border-[#E7DDD4] bg-white p-2 shadow-hover animate-in fade-in-50 zoom-in-95 z-50"
                  >
                    <div className="px-3 py-2 border-b border-[#E7DDD4]">
                      <div className="text-xs font-bold text-[#261B1E] truncate">
                        {currentUser.name || "Aspirant"}
                      </div>
                      <div className="text-[11px] text-[#786B68] truncate">
                        {currentUser.email}
                      </div>
                      <div className="mt-1 inline-flex items-center gap-1 rounded bg-[#FAF2E6] px-1.5 py-0.5 text-[10px] font-bold text-[#741A2B] border border-[#E5C88E]">
                        Tier: {userTier}
                      </div>
                    </div>

                    <a
                      href="/dashboard"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-[#261B1E] hover:bg-[#FBF7F0] transition"
                    >
                      <BarChart2 className="h-4 w-4 text-[#741A2B]" />
                      <span>Student Dashboard</span>
                    </a>

                    <a
                      href="/dashboard/billing"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-[#261B1E] hover:bg-[#FBF7F0] transition"
                    >
                      <Zap className="h-4 w-4 text-[#C69A4A]" />
                      <span>Subscriptions & Ledger</span>
                    </a>

                    <a
                      href="/bookmarks"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-[#261B1E] hover:bg-[#FBF7F0] transition"
                    >
                      <Bookmark className="h-4 w-4 text-[#786B68]" />
                      <span>Saved Bookmarks</span>
                    </a>

                    <a
                      href="/revision"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-[#261B1E] hover:bg-[#FBF7F0] transition"
                    >
                      <RotateCw className="h-4 w-4 text-[#C65A36]" />
                      <span>Smart Mistake Queue</span>
                    </a>

                    {currentUser.role === "ADMIN" && (
                      <a
                        href="/admin"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold text-[#741A2B] hover:bg-[#FAF2E6] transition border-t border-[#E7DDD4] mt-1 pt-1.5"
                      >
                        <ShieldCheck className="h-4 w-4" />
                        <span>Admin Console</span>
                      </a>
                    )}

                    <div className="my-1 border-t border-[#E7DDD4]" />

                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-[#A32D2D] hover:bg-[#FAECEC] transition"
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
                  className="rounded-xl px-3.5 py-2 text-xs font-bold text-[#261B1E] hover:text-[#741A2B] hover:bg-[#F4EDE2] transition"
                >
                  Log In
                </a>
                <a
                  href="/register"
                  className="inline-flex min-h-[44px] items-center justify-center rounded-xl bg-[#741A2B] px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#5E1422] transition border border-[#C69A4A]/40"
                >
                  Start Free
                </a>
              </div>
            )}

            {/* Mobile Hamburger Button (44px target) */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden flex h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border border-[#E7DDD4] bg-white text-[#261B1E] hover:bg-[#F4EDE2] transition"
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer (Accessible off-canvas overlay) */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-[#3A101A]/40 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer Body */}
          <div className="fixed inset-y-0 right-0 w-full max-w-sm bg-[#FBF7F0] shadow-2xl flex flex-col justify-between overflow-y-auto border-l border-[#E7DDD4]">
            <div className="p-5">
              <div className="flex items-center justify-between pb-4 border-b border-[#E7DDD4]">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#741A2B] text-[#E2C38E]">
                    <BookOpen className="h-4 w-4" />
                  </div>
                  <span className="font-editorial text-lg font-bold text-[#261B1E]">
                    Pravaah <span className="text-[#741A2B]">UPSC</span>
                  </span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="h-11 w-11 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-[#786B68] hover:bg-[#F4EDE2]"
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Navigation Links Accordion */}
              <nav className="mt-4 space-y-1.5 text-sm font-semibold">
                <a
                  href="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex min-h-[44px] items-center gap-2.5 rounded-xl px-3 py-2 text-[#261B1E] hover:bg-[#F4EDE2]"
                >
                  Home
                </a>

                {/* Mobile Practice Accordion */}
                <div>
                  <button
                    onClick={() => setMobilePracticeExpanded(!mobilePracticeExpanded)}
                    aria-expanded={mobilePracticeExpanded}
                    className="flex min-h-[44px] w-full items-center justify-between rounded-xl px-3 py-2 text-[#261B1E] hover:bg-[#F4EDE2]"
                  >
                    <span>Practice</span>
                    <ChevronDown
                      className={`h-4 w-4 transition-transform ${
                        mobilePracticeExpanded ? "rotate-180 text-[#741A2B]" : "text-[#786B68]"
                      }`}
                    />
                  </button>
                  {mobilePracticeExpanded && (
                    <div className="pl-4 py-1 space-y-1 text-xs">
                      <a
                        href="/pyqs?paper=GS1"
                        onClick={() => setMobileMenuOpen(false)}
                        className="block py-2 px-2.5 text-[#786B68] hover:text-[#741A2B]"
                      >
                        Prelims GS Paper I
                      </a>
                      <a
                        href="/pyqs?paper=GS2"
                        onClick={() => setMobileMenuOpen(false)}
                        className="block py-2 px-2.5 text-[#786B68] hover:text-[#741A2B]"
                      >
                        CSAT Paper II
                      </a>
                      <a
                        href="/mock-tests"
                        onClick={() => setMobileMenuOpen(false)}
                        className="block py-2 px-2.5 text-[#786B68] hover:text-[#741A2B]"
                      >
                        Mock Tests
                      </a>
                      <a
                        href="/daily-quiz"
                        onClick={() => setMobileMenuOpen(false)}
                        className="block py-2 px-2.5 text-[#786B68] hover:text-[#741A2B]"
                      >
                        Daily Quiz
                      </a>
                      <a
                        href="/revision"
                        onClick={() => setMobileMenuOpen(false)}
                        className="block py-2 px-2.5 text-[#786B68] hover:text-[#741A2B]"
                      >
                        Revision
                      </a>
                    </div>
                  )}
                </div>

                {/* Mobile Preparation Accordion */}
                <div>
                  <button
                    onClick={() => setMobilePrepExpanded(!mobilePrepExpanded)}
                    aria-expanded={mobilePrepExpanded}
                    className="flex min-h-[44px] w-full items-center justify-between rounded-xl px-3 py-2 text-[#261B1E] hover:bg-[#F4EDE2]"
                  >
                    <span>Preparation</span>
                    <ChevronDown
                      className={`h-4 w-4 transition-transform ${
                        mobilePrepExpanded ? "rotate-180 text-[#741A2B]" : "text-[#786B68]"
                      }`}
                    />
                  </button>
                  {mobilePrepExpanded && (
                    <div className="pl-4 py-1 space-y-1 text-xs">
                      <a
                        href="/syllabus"
                        onClick={() => setMobileMenuOpen(false)}
                        className="block py-2 px-2.5 text-[#786B68] hover:text-[#741A2B]"
                      >
                        UPSC Syllabus
                      </a>
                      <a
                        href="/study-planner"
                        onClick={() => setMobileMenuOpen(false)}
                        className="block py-2 px-2.5 text-[#786B68] hover:text-[#741A2B]"
                      >
                        Study Planner
                      </a>
                      <a
                        href="/mains"
                        onClick={() => setMobileMenuOpen(false)}
                        className="block py-2 px-2.5 text-[#786B68] hover:text-[#741A2B]"
                      >
                        Mains Answer Writing
                      </a>
                      <a
                        href="/notes"
                        onClick={() => setMobileMenuOpen(false)}
                        className="block py-2 px-2.5 text-[#786B68] hover:text-[#741A2B]"
                      >
                        Notes and Bookmarks
                      </a>
                      <a
                        href="/video-academy"
                        onClick={() => setMobileMenuOpen(false)}
                        className="block py-2 px-2.5 text-[#786B68] hover:text-[#741A2B]"
                      >
                        Resource Library
                      </a>
                    </div>
                  )}
                </div>

                <a
                  href="/current-affairs"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex min-h-[44px] items-center gap-2.5 rounded-xl px-3 py-2 text-[#261B1E] hover:bg-[#F4EDE2]"
                >
                  Current Affairs
                </a>
                <a
                  href="/pyqs"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex min-h-[44px] items-center gap-2.5 rounded-xl px-3 py-2 text-[#261B1E] hover:bg-[#F4EDE2]"
                >
                  PYQ Bank
                </a>
                <a
                  href="/pricing"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex min-h-[44px] items-center gap-2.5 rounded-xl px-3 py-2 text-[#261B1E] hover:bg-[#F4EDE2]"
                >
                  Pricing
                </a>
              </nav>

              <div className="mt-6 pt-5 border-t border-[#E7DDD4] space-y-2.5">
                {currentUser ? (
                  <a
                    href="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex min-h-[44px] w-full items-center justify-center rounded-xl bg-[#741A2B] px-4 py-3 text-sm font-bold text-white shadow-card"
                  >
                    Open Student Dashboard
                  </a>
                ) : (
                  <>
                    <a
                      href="/register"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex min-h-[44px] w-full items-center justify-center rounded-xl bg-[#741A2B] px-4 py-3 text-sm font-bold text-white shadow-card"
                    >
                      Start Free
                    </a>
                    <a
                      href="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex min-h-[44px] w-full items-center justify-center rounded-xl border border-[#E7DDD4] bg-white px-4 py-2.5 text-sm font-bold text-[#261B1E]"
                    >
                      Log In to Existing Account
                    </a>
                  </>
                )}
              </div>
            </div>

            <div className="p-5 border-t border-[#E7DDD4] bg-white text-xs text-[#786B68]">
              <div className="font-bold text-[#261B1E]">Direct Aspirant Helpline</div>
              <div className="mt-0.5">WhatsApp / Phone: +91 7351522153</div>
              <div className="text-[10px] text-[#C69A4A] mt-1">Lead Architect: Aradhy Jain</div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Sticky Bottom Navigation Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#FBF7F0]/95 backdrop-blur-md border-t border-[#E7DDD4] px-2 py-1.5 flex items-center justify-around shadow-hover">
        <a
          href="/"
          className={`flex flex-col items-center gap-0.5 px-3 py-1 text-[11px] font-bold ${
            pathname === "/" ? "text-[#741A2B]" : "text-[#786B68]"
          }`}
        >
          <BookOpen className="h-4 w-4" />
          <span>Home</span>
        </a>

        <a
          href="/pyqs"
          className={`flex flex-col items-center gap-0.5 px-3 py-1 text-[11px] font-bold ${
            isPyqActive ? "text-[#741A2B]" : "text-[#786B68]"
          }`}
        >
          <Compass className="h-4 w-4" />
          <span>PYQs</span>
        </a>

        <a
          href="/mock-tests"
          className={`flex flex-col items-center gap-0.5 px-3 py-1 text-[11px] font-bold ${
            pathname?.startsWith("/mock-tests") ? "text-[#741A2B]" : "text-[#786B68]"
          }`}
        >
          <Clock className="h-4 w-4" />
          <span>Mocks</span>
        </a>

        <a
          href="/mains"
          className={`flex flex-col items-center gap-0.5 px-3 py-1 text-[11px] font-bold ${
            pathname?.startsWith("/mains") ? "text-[#741A2B]" : "text-[#786B68]"
          }`}
        >
          <FileText className="h-4 w-4" />
          <span>Mains</span>
        </a>

        <a
          href={currentUser ? "/dashboard" : "/login"}
          className={`flex flex-col items-center gap-0.5 px-3 py-1 text-[11px] font-bold ${
            pathname?.startsWith("/dashboard") ? "text-[#741A2B]" : "text-[#786B68]"
          }`}
        >
          <User className="h-4 w-4" />
          <span>{currentUser ? "Dashboard" : "Account"}</span>
        </a>
      </div>

      {/* AI Assistant Modal */}
      <AILearningAssistantModal
        isOpen={isAiAssistantOpen}
        onClose={() => setIsAiAssistantOpen(false)}
      />
    </>
  );
}
