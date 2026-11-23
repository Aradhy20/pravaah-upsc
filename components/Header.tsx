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
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [isAiAssistantOpen, setIsAiAssistantOpen] = useState(false);

  // Mobile accordion state for Practice and Preparation
  const [mobilePracticeExpanded, setMobilePracticeExpanded] = useState(true);
  const [mobilePrepExpanded, setMobilePrepExpanded] = useState(false);

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
    pathname?.startsWith("/pyqs") ||
    pathname?.startsWith("/mock-tests") ||
    pathname?.startsWith("/daily-quiz") ||
    pathname?.startsWith("/revision");

  const isPrepActive =
    pathname?.startsWith("/syllabus") ||
    pathname?.startsWith("/study-planner") ||
    pathname?.startsWith("/mains") ||
    pathname?.startsWith("/notes") ||
    pathname?.startsWith("/bookmarks") ||
    pathname?.startsWith("/ncert") ||
    pathname?.startsWith("/exams");

  const isCurrentAffairsActive = pathname?.startsWith("/current-affairs");
  const isPyqBankActive = pathname === "/pyqs";

  return (
    <header className="sticky top-0 z-50 h-[72px] border-b border-[#E4E7EC] bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-full max-w-[1280px] items-center justify-between px-4 sm:px-6 lg:px-8 flex-nowrap">
        {/* Left: Brand Logo & Title with Subtitle */}
        <div className="flex items-center gap-3 shrink-0">
          <a
            href="/"
            className="flex items-center gap-3 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2453E6] rounded-xl p-1"
            aria-label="Pravaah UPSC Home"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#2453E6] text-white shadow-xs transition-transform group-hover:scale-105 shrink-0">
              <BookOpen className="h-5 w-5" />
            </div>
            <div className="flex flex-col justify-center">
              <span className="text-lg sm:text-xl font-black tracking-tight text-[#101828] leading-tight">
                Pravaah <span className="text-[#2453E6]">UPSC</span>
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#667085] leading-none mt-0.5">
                CSE AI Platform
              </span>
            </div>
          </a>
        </div>

        {/* Center: Desktop Clean 4-Item Navigation */}
        <nav
          aria-label="Main Navigation"
          className="hidden lg:flex items-center gap-1 xl:gap-2 shrink-0 flex-nowrap"
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
              className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-[14px] font-medium whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2453E6] ${
                isPracticeActive || practiceOpen
                  ? "bg-blue-50 text-[#2453E6] font-semibold"
                  : "text-[#475467] hover:bg-[#F7F9FC] hover:text-[#101828]"
              }`}
            >
              <Compass className="h-4 w-4" />
              <span>Practice</span>
              <ChevronDown
                className={`h-3.5 w-3.5 transition-transform duration-200 ${
                  practiceOpen ? "rotate-180 text-[#2453E6]" : "text-[#98A2B3]"
                }`}
              />
            </button>

            {practiceOpen && (
              <div
                role="menu"
                className="absolute left-0 mt-2 w-72 rounded-2xl border border-[#E4E7EC] bg-white p-2 shadow-xl animate-in fade-in-50 zoom-in-95 z-50"
              >
                {/* 1.1 Prelims GS Paper I */}
                <a
                  href="/pyqs?paper=GS1"
                  onClick={() => setPracticeOpen(false)}
                  className="flex items-start gap-3 rounded-xl p-2.5 hover:bg-[#F7F9FC] transition group"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-[#2453E6] group-hover:bg-blue-100 transition">
                    <Compass className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#101828]">Prelims GS Paper I</div>
                    <div className="text-[11px] text-[#667085] leading-tight mt-0.5">
                      Subject-wise past paper questions
                    </div>
                  </div>
                </a>

                {/* 1.2 CSAT Paper II */}
                <a
                  href="/pyqs?paper=GS2"
                  onClick={() => setPracticeOpen(false)}
                  className="flex items-start gap-3 rounded-xl p-2.5 hover:bg-[#F7F9FC] transition group"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-purple-50 text-purple-700 group-hover:bg-purple-100 transition">
                    <BarChart2 className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#101828]">CSAT Paper II</div>
                    <div className="text-[11px] text-[#667085] leading-tight mt-0.5">
                      Comprehension & reasoning practice
                    </div>
                  </div>
                </a>

                {/* 1.3 Mock Tests */}
                <a
                  href="/mock-tests"
                  onClick={() => setPracticeOpen(false)}
                  className="flex items-start gap-3 rounded-xl p-2.5 hover:bg-[#F7F9FC] transition group"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-700 group-hover:bg-indigo-100 transition">
                    <Clock className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#101828]">Mock Tests</div>
                    <div className="text-[11px] text-[#667085] leading-tight mt-0.5">
                      Timed simulation with negative marking
                    </div>
                  </div>
                </a>

                {/* 1.4 Daily Quiz */}
                <a
                  href="/daily-quiz"
                  onClick={() => setPracticeOpen(false)}
                  className="flex items-start gap-3 rounded-xl p-2.5 hover:bg-[#F7F9FC] transition group"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-[#12A878] group-hover:bg-emerald-100 transition">
                    <CheckCircle className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#101828]">Daily Quiz</div>
                    <div className="text-[11px] text-[#667085] leading-tight mt-0.5">
                      5 high-yield daily diagnostic questions
                    </div>
                  </div>
                </a>

                {/* 1.5 Revision */}
                <a
                  href="/revision"
                  onClick={() => setPracticeOpen(false)}
                  className="flex items-start gap-3 rounded-xl p-2.5 hover:bg-[#F7F9FC] transition group"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-[#F59E0B] group-hover:bg-amber-100 transition">
                    <RotateCw className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#101828]">Revision</div>
                    <div className="text-[11px] text-[#667085] leading-tight mt-0.5">
                      Spaced repetition for flagged mistakes
                    </div>
                  </div>
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
              className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-[14px] font-medium whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2453E6] ${
                isPrepActive || prepOpen
                  ? "bg-blue-50 text-[#2453E6] font-semibold"
                  : "text-[#475467] hover:bg-[#F7F9FC] hover:text-[#101828]"
              }`}
            >
              <BookOpen className="h-4 w-4" />
              <span>Preparation</span>
              <ChevronDown
                className={`h-3.5 w-3.5 transition-transform duration-200 ${
                  prepOpen ? "rotate-180 text-[#2453E6]" : "text-[#98A2B3]"
                }`}
              />
            </button>

            {prepOpen && (
              <div
                role="menu"
                className="absolute left-0 mt-2 w-72 rounded-2xl border border-[#E4E7EC] bg-white p-2 shadow-xl animate-in fade-in-50 zoom-in-95 z-50"
              >
                {/* 2.1 UPSC Syllabus */}
                <a
                  href="/syllabus"
                  onClick={() => setPrepOpen(false)}
                  className="flex items-start gap-3 rounded-xl p-2.5 hover:bg-[#F7F9FC] transition group"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-[#2453E6] group-hover:bg-blue-100 transition">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#101828]">UPSC Syllabus</div>
                    <div className="text-[11px] text-[#667085] leading-tight mt-0.5">
                      3-tier micro-topics with syllabus mapping
                    </div>
                  </div>
                </a>

                {/* 2.2 Study Planner */}
                <a
                  href="/study-planner"
                  onClick={() => setPrepOpen(false)}
                  className="flex items-start gap-3 rounded-xl p-2.5 hover:bg-[#F7F9FC] transition group"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-700 group-hover:bg-indigo-100 transition">
                    <Sliders className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#101828]">Study Planner</div>
                    <div className="text-[11px] text-[#667085] leading-tight mt-0.5">
                      Personalized daily schedule & milestones
                    </div>
                  </div>
                </a>

                {/* 2.3 Mains Answer Writing */}
                <a
                  href="/mains"
                  onClick={() => setPrepOpen(false)}
                  className="flex items-start gap-3 rounded-xl p-2.5 hover:bg-[#F7F9FC] transition group"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-rose-50 text-rose-700 group-hover:bg-rose-100 transition">
                    <BarChart2 className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#101828]">Mains Answer Writing</div>
                    <div className="text-[11px] text-[#667085] leading-tight mt-0.5">
                      32 authentic questions across GS1–GS4
                    </div>
                  </div>
                </a>

                {/* 2.4 Notes and Bookmarks */}
                <a
                  href="/notes"
                  onClick={() => setPrepOpen(false)}
                  className="flex items-start gap-3 rounded-xl p-2.5 hover:bg-[#F7F9FC] transition group"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-[#12A878] group-hover:bg-emerald-100 transition">
                    <Bookmark className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#101828]">Notes and Bookmarks</div>
                    <div className="text-[11px] text-[#667085] leading-tight mt-0.5">
                      Saved questions & aspirant revisions
                    </div>
                  </div>
                </a>

                {/* 2.5 Resource Library */}
                <a
                  href="/syllabus"
                  onClick={() => setPrepOpen(false)}
                  className="flex items-start gap-3 rounded-xl p-2.5 hover:bg-[#F7F9FC] transition group"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-[#F59E0B] group-hover:bg-amber-100 transition">
                    <Award className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#101828]">Resource Library</div>
                    <div className="text-[11px] text-[#667085] leading-tight mt-0.5">
                      NCERT references & topper copy vaults
                    </div>
                  </div>
                </a>
              </div>
            )}
          </div>

          {/* 3. Current Affairs (Direct Link) */}
          <a
            href="/current-affairs"
            className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-[14px] font-medium whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2453E6] ${
              isCurrentAffairsActive
                ? "bg-blue-50 text-[#2453E6] font-semibold"
                : "text-[#475467] hover:bg-[#F7F9FC] hover:text-[#101828]"
            }`}
          >
            <Layers className="h-4 w-4 text-teal-600" />
            <span>Current Affairs</span>
          </a>

          {/* 4. PYQ Bank (Direct Link) */}
          <a
            href="/pyqs"
            className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-[14px] font-medium whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2453E6] ${
              isPyqBankActive
                ? "bg-blue-50 text-[#2453E6] font-semibold"
                : "text-[#475467] hover:bg-[#F7F9FC] hover:text-[#101828]"
            }`}
          >
            <Compass className="h-4 w-4 text-[#2453E6]" />
            <span>PYQ Bank</span>
          </a>
        </nav>

        {/* Right Section: Search, Language Switcher, Ask AI, Pricing, Auth */}
        <div className="hidden lg:flex items-center gap-2 xl:gap-2.5 shrink-0 flex-nowrap">
          {/* Search Icon Button */}
          <a
            href="/pyqs"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#E4E7EC] bg-white text-[#475467] hover:bg-[#F7F9FC] hover:text-[#101828] transition shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2453E6]"
            aria-label="Search PYQs"
            title="Search PYQs"
          >
            <Search className="h-4 w-4" />
          </a>

          {/* Compact Language Switcher */}
          <LanguageSwitcher className="h-9" />

          {/* Ask AI Button */}
          <button
            onClick={() => setIsAiAssistantOpen(true)}
            className="flex h-9 items-center gap-1.5 rounded-xl border border-blue-200/90 bg-blue-50 px-3 text-xs font-bold text-[#2453E6] hover:bg-blue-100 transition shadow-xs whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2453E6]"
            aria-label="Open AI Assistant"
          >
            <Sparkles className="h-3.5 w-3.5 text-[#2453E6]" />
            <span>Ask AI</span>
          </button>

          {/* Pricing Link */}
          <a
            href="/pricing"
            className={`flex h-9 items-center gap-1 rounded-xl px-2.5 text-xs font-bold transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2453E6] ${
              pathname === "/pricing"
                ? "bg-blue-50 text-[#2453E6]"
                : "text-[#475467] hover:bg-[#F7F9FC] hover:text-[#101828]"
            }`}
          >
            <Bookmark className="h-3.5 w-3.5" />
            <span>Pricing</span>
          </a>

          {/* User Profile or Login CTA */}
          {currentUser ? (
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                aria-expanded={userDropdownOpen}
                aria-haspopup="true"
                className="flex h-9 items-center gap-2 rounded-full border border-[#E4E7EC] bg-[#F7F9FC] p-1 pl-3 text-xs font-bold text-[#101828] hover:bg-slate-100 transition shadow-xs"
              >
                <span>{currentUser.fullName?.split(" ")[0]}</span>
                <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-black text-[#2453E6] uppercase">
                  {userTier}
                </span>
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#2453E6] text-white font-bold text-xs overflow-hidden">
                  {currentUser.avatarUrl ? (
                    <img
                      src={currentUser.avatarUrl}
                      alt={currentUser.fullName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    currentUser.fullName?.[0] || "A"
                  )}
                </div>
              </button>

              {userDropdownOpen && (
                <div
                  role="menu"
                  className="absolute right-0 mt-2 w-60 rounded-2xl border border-[#E4E7EC] bg-white p-2 shadow-xl animate-in fade-in-50 zoom-in-95 z-50"
                >
                  <div className="px-3 py-2 border-b border-[#E4E7EC] mb-1">
                    <p className="text-xs font-bold text-[#101828] truncate">{currentUser.fullName}</p>
                    <p className="text-[11px] text-[#667085] truncate">{currentUser.email}</p>
                    <div className="mt-1.5 inline-flex items-center gap-1 rounded bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-[#2453E6]">
                      Tier: {userTier}
                    </div>
                  </div>

                  <a
                    href="/dashboard"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold text-[#475467] hover:bg-[#F7F9FC] transition"
                  >
                    <BarChart2 className="h-4 w-4 text-[#667085]" />
                    <span>Aspirant Dashboard</span>
                  </a>

                  <a
                    href="/bookmarks"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold text-[#475467] hover:bg-[#F7F9FC] transition"
                  >
                    <Bookmark className="h-4 w-4 text-[#667085]" />
                    <span>My Bookmarks</span>
                  </a>

                  <a
                    href="/notes"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold text-[#475467] hover:bg-[#F7F9FC] transition"
                  >
                    <FileText className="h-4 w-4 text-[#667085]" />
                    <span>Study Notes</span>
                  </a>

                  <a
                    href="/pricing"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold text-[#475467] hover:bg-[#F7F9FC] transition"
                  >
                    <Zap className="h-4 w-4 text-[#F59E0B]" />
                    <span>Subscription Plans</span>
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

                  <div className="my-1 border-t border-[#E4E7EC]" />

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold text-[#DC2626] hover:bg-rose-50 transition text-left"
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
                className="flex h-9 items-center justify-center rounded-xl px-3.5 text-xs font-bold text-[#475467] hover:bg-[#F7F9FC] hover:text-[#101828] transition whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2453E6]"
              >
                Log In
              </a>
              <a
                href="/register"
                className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-[#2453E6] hover:bg-[#1d44c2] px-4 text-xs font-bold text-white shadow-xs transition whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2453E6]"
              >
                <span>Start Free</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </a>
            </div>
          )}
        </div>

        {/* Mobile & Tablet Bar: Language Switcher + Hamburger */}
        <div className="flex lg:hidden items-center gap-2">
          <LanguageSwitcher className="h-9 text-xs" />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-xl p-2 text-[#475467] hover:bg-[#F7F9FC] transition min-h-[44px] min-w-[44px] flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2453E6]"
            aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile & Tablet Responsive Navigation Drawer */}
      {mobileMenuOpen && (
        <div
          role="dialog"
          aria-label="Mobile Navigation"
          className="border-b border-[#E4E7EC] bg-white px-4 py-5 lg:hidden animate-in slide-in-from-top-2 max-h-[calc(100vh-72px)] overflow-y-auto shadow-xl"
        >
          <div className="flex flex-col gap-4">
            {/* Quick Actions: Ask AI & Search */}
            <div className="grid grid-cols-2 gap-2 pb-3 border-b border-[#E4E7EC]">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setIsAiAssistantOpen(true);
                }}
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-blue-50 border border-blue-200 text-xs font-bold text-[#2453E6] min-h-[44px]"
              >
                <Sparkles className="h-4 w-4" />
                <span>Ask AI Assistant</span>
              </button>
              <a
                href="/pyqs"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-[#F7F9FC] border border-[#E4E7EC] text-xs font-bold text-[#475467] min-h-[44px]"
              >
                <Search className="h-4 w-4" />
                <span>Search PYQs</span>
              </a>
            </div>

            {/* Mobile Practice Hub */}
            <div>
              <button
                onClick={() => setMobilePracticeExpanded(!mobilePracticeExpanded)}
                className="w-full flex items-center justify-between text-[11px] font-black uppercase tracking-wider text-[#667085] py-1 px-2"
                aria-expanded={mobilePracticeExpanded}
              >
                <span>Practice</span>
                <ChevronDown
                  className={`h-4 w-4 transition-transform duration-200 ${
                    mobilePracticeExpanded ? "rotate-180" : ""
                  }`}
                />
              </button>
              {mobilePracticeExpanded && (
                <div className="flex flex-col gap-1 mt-1">
                  <a
                    href="/pyqs?paper=GS1"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold text-[#475467] hover:bg-[#F7F9FC] min-h-[44px]"
                  >
                    <Compass className="h-4 w-4 text-[#2453E6]" />
                    <span>Prelims GS Paper I</span>
                  </a>
                  <a
                    href="/pyqs?paper=GS2"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold text-[#475467] hover:bg-[#F7F9FC] min-h-[44px]"
                  >
                    <BarChart2 className="h-4 w-4 text-purple-600" />
                    <span>CSAT Paper II</span>
                  </a>
                  <a
                    href="/mock-tests"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold text-[#475467] hover:bg-[#F7F9FC] min-h-[44px]"
                  >
                    <Clock className="h-4 w-4 text-indigo-600" />
                    <span>Mock Tests</span>
                  </a>
                  <a
                    href="/daily-quiz"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold text-[#475467] hover:bg-[#F7F9FC] min-h-[44px]"
                  >
                    <CheckCircle className="h-4 w-4 text-[#12A878]" />
                    <span>Daily Quiz</span>
                  </a>
                  <a
                    href="/revision"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold text-[#475467] hover:bg-[#F7F9FC] min-h-[44px]"
                  >
                    <RotateCw className="h-4 w-4 text-[#F59E0B]" />
                    <span>Revision</span>
                  </a>
                </div>
              )}
            </div>

            {/* Mobile Preparation Hub */}
            <div className="border-t border-[#E4E7EC] pt-3">
              <button
                onClick={() => setMobilePrepExpanded(!mobilePrepExpanded)}
                className="w-full flex items-center justify-between text-[11px] font-black uppercase tracking-wider text-[#667085] py-1 px-2"
                aria-expanded={mobilePrepExpanded}
              >
                <span>Preparation</span>
                <ChevronDown
                  className={`h-4 w-4 transition-transform duration-200 ${
                    mobilePrepExpanded ? "rotate-180" : ""
                  }`}
                />
              </button>
              {mobilePrepExpanded && (
                <div className="flex flex-col gap-1 mt-1">
                  <a
                    href="/syllabus"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold text-[#475467] hover:bg-[#F7F9FC] min-h-[44px]"
                  >
                    <Sparkles className="h-4 w-4 text-[#2453E6]" />
                    <span>UPSC Syllabus</span>
                  </a>
                  <a
                    href="/study-planner"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold text-[#475467] hover:bg-[#F7F9FC] min-h-[44px]"
                  >
                    <Sliders className="h-4 w-4 text-indigo-600" />
                    <span>Study Planner</span>
                  </a>
                  <a
                    href="/mains"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold text-[#475467] hover:bg-[#F7F9FC] min-h-[44px]"
                  >
                    <BarChart2 className="h-4 w-4 text-rose-600" />
                    <span>Mains Answer Writing</span>
                  </a>
                  <a
                    href="/notes"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold text-[#475467] hover:bg-[#F7F9FC] min-h-[44px]"
                  >
                    <Bookmark className="h-4 w-4 text-[#12A878]" />
                    <span>Notes and Bookmarks</span>
                  </a>
                  <a
                    href="/syllabus"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold text-[#475467] hover:bg-[#F7F9FC] min-h-[44px]"
                  >
                    <Award className="h-4 w-4 text-[#F59E0B]" />
                    <span>Resource Library</span>
                  </a>
                </div>
              )}
            </div>

            {/* Mobile Direct Links: Current Affairs & PYQ Bank & Pricing */}
            <div className="border-t border-[#E4E7EC] pt-3 flex flex-col gap-1">
              <a
                href="/current-affairs"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold text-[#475467] hover:bg-[#F7F9FC] min-h-[44px]"
              >
                <Layers className="h-4 w-4 text-teal-600" />
                <span>Current Affairs</span>
              </a>
              <a
                href="/pyqs"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold text-[#475467] hover:bg-[#F7F9FC] min-h-[44px]"
              >
                <Compass className="h-4 w-4 text-[#2453E6]" />
                <span>PYQ Bank</span>
              </a>
              <a
                href="/pricing"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold text-[#475467] hover:bg-[#F7F9FC] min-h-[44px]"
              >
                <Bookmark className="h-4 w-4 text-[#F59E0B]" />
                <span>Subscription Plans</span>
              </a>
            </div>

            {/* Mobile Auth Area */}
            <div className="border-t border-[#E4E7EC] pt-3">
              {currentUser ? (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between px-2 py-1">
                    <span className="text-xs font-bold text-[#101828]">{currentUser.fullName}</span>
                    <span className="text-[10px] font-black uppercase text-[#2453E6] bg-blue-50 px-2 py-0.5 rounded">
                      {userTier}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full text-center py-2.5 text-xs font-bold text-[#DC2626] bg-rose-50 rounded-xl min-h-[44px]"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <a
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center py-2.5 text-xs font-bold text-[#475467] bg-[#F7F9FC] border border-[#E4E7EC] rounded-xl min-h-[44px]"
                  >
                    Sign In
                  </a>
                  <a
                    href="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center py-2.5 text-xs font-bold text-white bg-[#2453E6] hover:bg-[#1d44c2] rounded-xl min-h-[44px]"
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
