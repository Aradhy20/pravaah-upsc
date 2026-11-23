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
  Video,
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
    pathname?.startsWith("/prelims/pyqs") ||
    pathname?.startsWith("/mock-tests") ||
    pathname?.startsWith("/daily-quiz") ||
    pathname?.startsWith("/revision");

  const isPrepActive =
    pathname?.startsWith("/current-affairs") ||
    pathname?.startsWith("/mains") ||
    pathname?.startsWith("/study-planner") ||
    pathname?.startsWith("/exams") ||
    pathname?.startsWith("/ncert") ||
    pathname?.startsWith("/syllabus") ||
    pathname?.startsWith("/video-academy") ||
    pathname?.startsWith("/topper-copies");

  return (
    <header className="sticky top-0 z-50 border-b border-[#E4E7EC] bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 flex-nowrap">
        {/* Left: Brand Logo & UPSC Brand Text */}
        <div className="flex items-center gap-3 shrink-0">
          <a
            href="/"
            className="flex items-center gap-2.5 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2453E6] rounded-xl p-1"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#2453E6] text-white shadow-xs transition-transform group-hover:scale-105">
              <BookOpen className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg sm:text-xl font-black tracking-tight text-[#101828] leading-none">
                Pravaah <span className="text-[#2453E6]">UPSC</span>
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#667085] mt-0.5">
                CSE Prep Platform
              </span>
            </div>
          </a>
        </div>

        {/* Center: Desktop Clean Single-Line Navigation */}
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
              className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs xl:text-sm font-bold whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2453E6] ${
                isPracticeActive || practiceOpen
                  ? "bg-blue-50 text-[#2453E6]"
                  : "text-[#475467] hover:bg-[#F7F9FC] hover:text-[#101828]"
              }`}
            >
              <Compass className="h-4 w-4" />
              <span>Practice</span>
              <ChevronDown
                className={`h-3.5 w-3.5 transition-transform duration-200 ${
                  practiceOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {practiceOpen && (
              <div
                role="menu"
                className="absolute left-0 mt-2 w-72 rounded-2xl border border-[#E4E7EC] bg-white p-2 shadow-xl animate-in fade-in-50 zoom-in-95 z-50"
              >
                <a
                  href="/pyqs"
                  onClick={() => setPracticeOpen(false)}
                  className="flex items-start gap-3 rounded-xl p-2.5 hover:bg-[#F7F9FC] transition"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-[#2453E6]">
                    <Compass className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#101828]">PYQ Explorer</div>
                    <div className="text-[11px] text-[#667085] leading-tight mt-0.5">
                      121 verified Prelims questions (1995–2024 Series A)
                    </div>
                  </div>
                </a>

                <a
                  href="/daily-quiz"
                  onClick={() => setPracticeOpen(false)}
                  className="flex items-start gap-3 rounded-xl p-2.5 hover:bg-[#F7F9FC] transition"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-[#12A878]">
                    <CheckCircle className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#101828]">Daily Prelims Diagnostic</div>
                    <div className="text-[11px] text-[#667085] leading-tight mt-0.5">
                      5 high-yield questions with daily archives
                    </div>
                  </div>
                </a>

                <a
                  href="/mock-tests"
                  onClick={() => setPracticeOpen(false)}
                  className="flex items-start gap-3 rounded-xl p-2.5 hover:bg-[#F7F9FC] transition"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-700">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#101828]">Timed Mock Exams</div>
                    <div className="text-[11px] text-[#667085] leading-tight mt-0.5">
                      Authentic exam player with live negative marking
                    </div>
                  </div>
                </a>

                <a
                  href="/revision"
                  onClick={() => setPracticeOpen(false)}
                  className="flex items-start gap-3 rounded-xl p-2.5 hover:bg-[#F7F9FC] transition"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-[#F59E0B]">
                    <RotateCw className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#101828]">Mistake Revision Notebook</div>
                    <div className="text-[11px] text-[#667085] leading-tight mt-0.5">
                      SuperMemo-2 spaced review queue
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
              className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs xl:text-sm font-bold whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2453E6] ${
                isPrepActive || prepOpen
                  ? "bg-blue-50 text-[#2453E6]"
                  : "text-[#475467] hover:bg-[#F7F9FC] hover:text-[#101828]"
              }`}
            >
              <BookOpen className="h-4 w-4" />
              <span>Preparation</span>
              <ChevronDown
                className={`h-3.5 w-3.5 transition-transform duration-200 ${
                  prepOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {prepOpen && (
              <div
                role="menu"
                className="absolute left-0 mt-2 w-72 rounded-2xl border border-[#E4E7EC] bg-white p-2 shadow-xl animate-in fade-in-50 zoom-in-95 z-50 max-h-[80vh] overflow-y-auto"
              >
                <a
                  href="/syllabus"
                  onClick={() => setPrepOpen(false)}
                  className="flex items-start gap-3 rounded-xl p-2.5 hover:bg-[#F7F9FC] transition"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-[#2453E6]">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#101828]">UPSC Crack Engine & Vault</div>
                    <div className="text-[11px] text-[#667085] leading-tight mt-0.5">
                      53 micro-topics, NCERT maps & static cheat sheets
                    </div>
                  </div>
                </a>

                <a
                  href="/ncert"
                  onClick={() => setPrepOpen(false)}
                  className="flex items-start gap-3 rounded-xl p-2.5 hover:bg-[#F7F9FC] transition"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-[#12A878]">
                    <BookOpen className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#101828]">NCERT Knowledge Base</div>
                    <div className="text-[11px] text-[#667085] leading-tight mt-0.5">
                      Classes 6–12 textbooks & linked PYQs
                    </div>
                  </div>
                </a>

                <a
                  href="/current-affairs"
                  onClick={() => setPrepOpen(false)}
                  className="flex items-start gap-3 rounded-xl p-2.5 hover:bg-[#F7F9FC] transition"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
                    <Layers className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#101828]">Current Affairs & PYQs</div>
                    <div className="text-[11px] text-[#667085] leading-tight mt-0.5">
                      PIB & Ministry verified briefs linked to syllabus
                    </div>
                  </div>
                </a>

                <a
                  href="/mains"
                  onClick={() => setPrepOpen(false)}
                  className="flex items-start gap-3 rounded-xl p-2.5 hover:bg-[#F7F9FC] transition"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-rose-50 text-rose-700">
                    <BarChart2 className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#101828]">Mains Answer Studio</div>
                    <div className="text-[11px] text-[#667085] leading-tight mt-0.5">
                      32 authentic questions across GS1–GS4 & Essay
                    </div>
                  </div>
                </a>

                <a
                  href="/video-academy"
                  onClick={() => setPrepOpen(false)}
                  className="flex items-start gap-3 rounded-xl p-2.5 hover:bg-[#F7F9FC] transition"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-700">
                    <Video className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#101828]">{t("nav.videoAcademy", "Video Academy")}</div>
                    <div className="text-[11px] text-[#667085] leading-tight mt-0.5">
                      {t("nav.videoAcademySub", "Curated topic-wise video lectures")}
                    </div>
                  </div>
                </a>

                <a
                  href="/topper-copies"
                  onClick={() => setPrepOpen(false)}
                  className="flex items-start gap-3 rounded-xl p-2.5 hover:bg-[#F7F9FC] transition"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-[#F59E0B]">
                    <Award className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#101828]">{t("nav.topperCopies", "Topper Answer Library")}</div>
                    <div className="text-[11px] text-[#667085] leading-tight mt-0.5">
                      {t("nav.topperCopiesSub", "Annotated answer copies from UPSC toppers")}
                    </div>
                  </div>
                </a>

                <a
                  href="/study-planner"
                  onClick={() => setPrepOpen(false)}
                  className="flex items-start gap-3 rounded-xl p-2.5 hover:bg-[#F7F9FC] transition"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-700">
                    <Sliders className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#101828]">Daily Study Planner</div>
                    <div className="text-[11px] text-[#667085] leading-tight mt-0.5">
                      Target exam dates & stage schedules
                    </div>
                  </div>
                </a>

                <a
                  href="/exams"
                  onClick={() => setPrepOpen(false)}
                  className="flex items-start gap-3 rounded-xl p-2.5 hover:bg-[#F7F9FC] transition"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#101828]">UPSC Exams Directory</div>
                    <div className="text-[11px] text-[#667085] leading-tight mt-0.5">
                      CSE, IFS, CDS, NDA, CAPF profiles
                    </div>
                  </div>
                </a>
              </div>
            )}
          </div>

          {/* 3. Aspirant Flow */}
          <a
            href="/system-flow"
            className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs xl:text-sm font-bold whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2453E6] ${
              pathname === "/system-flow"
                ? "bg-blue-50 text-[#2453E6]"
                : "text-[#475467] hover:bg-[#F7F9FC] hover:text-[#101828]"
            }`}
          >
            <Sparkles className="h-4 w-4 text-[#2453E6]" />
            <span>Aspirant Flow</span>
          </a>

          {/* 4. PYQ Bank */}
          <a
            href="/pyqs"
            className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs xl:text-sm font-bold whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2453E6] ${
              pathname === "/pyqs"
                ? "bg-blue-50 text-[#2453E6]"
                : "text-[#475467] hover:bg-[#F7F9FC] hover:text-[#101828]"
            }`}
          >
            <Search className="h-4 w-4" />
            <span>PYQ Bank</span>
          </a>
        </nav>

        {/* Right Section: Language, Ask AI, Pricing, Login / CTA */}
        <div className="hidden sm:flex items-center gap-2 xl:gap-3 shrink-0 flex-nowrap">
          {/* Language Selector */}
          <LanguageSwitcher />

          {/* Ask AI */}
          <button
            onClick={() => setIsAiAssistantOpen(true)}
            className="flex items-center gap-1.5 text-xs font-bold text-[#2453E6] bg-blue-50 border border-blue-200/80 px-2.5 py-1.5 rounded-lg hover:bg-blue-100 transition shadow-xs whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2453E6]"
          >
            <Sparkles className="h-3.5 w-3.5 text-[#2453E6]" />
            <span>Ask AI</span>
          </button>

          {/* Pricing */}
          <a
            href="/pricing"
            className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2453E6] ${
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
                className="flex items-center gap-2 rounded-full border border-[#E4E7EC] bg-[#F7F9FC] p-1 pl-3 text-xs font-bold text-[#101828] hover:bg-slate-100 transition shadow-xs"
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
                className="rounded-xl px-3 py-1.5 text-xs font-bold text-[#475467] hover:bg-[#F7F9FC] hover:text-[#101828] transition whitespace-nowrap"
              >
                Log In
              </a>
              <a
                href="/register"
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#2453E6] hover:bg-[#1d44c2] px-3.5 py-1.5 text-xs font-bold text-white shadow-xs transition whitespace-nowrap"
              >
                <span>Start Free</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </a>
            </div>
          )}
        </div>

        {/* Mobile menu hamburger button */}
        <div className="flex lg:hidden items-center gap-2">
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
          className="border-b border-[#E4E7EC] bg-white px-4 py-5 lg:hidden animate-in slide-in-from-top-2 max-h-[85vh] overflow-y-auto shadow-xl"
        >
          <div className="flex flex-col gap-4">
            {/* Mobile Language Switcher */}
            <div className="flex items-center justify-between pb-3 border-b border-[#E4E7EC]">
              <span className="text-xs font-bold text-[#667085]">Language / भाषा:</span>
              <LanguageSwitcher />
            </div>

            {/* Mobile Practice Hub */}
            <div>
              <p className="text-[11px] font-black uppercase tracking-wider text-[#667085] mb-2 px-2">
                Practice Hub
              </p>
              <div className="flex flex-col gap-1">
                <a
                  href="/pyqs"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-bold text-[#475467] hover:bg-[#F7F9FC] min-h-[44px]"
                >
                  <Compass className="h-4 w-4 text-[#2453E6]" />
                  <span>PYQ Explorer (121 Verified Qs)</span>
                </a>
                <a
                  href="/daily-quiz"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-bold text-[#475467] hover:bg-[#F7F9FC] min-h-[44px]"
                >
                  <CheckCircle className="h-4 w-4 text-[#12A878]" />
                  <span>Daily Prelims Diagnostic</span>
                </a>
                <a
                  href="/mock-tests"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-bold text-[#475467] hover:bg-[#F7F9FC] min-h-[44px]"
                >
                  <Clock className="h-4 w-4 text-indigo-600" />
                  <span>Timed Mock Exams</span>
                </a>
                <a
                  href="/revision"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-bold text-[#475467] hover:bg-[#F7F9FC] min-h-[44px]"
                >
                  <RotateCw className="h-4 w-4 text-[#F59E0B]" />
                  <span>Mistake Revision Queue</span>
                </a>
              </div>
            </div>

            {/* Mobile Preparation Hub */}
            <div className="border-t border-[#E4E7EC] pt-3">
              <p className="text-[11px] font-black uppercase tracking-wider text-[#667085] mb-2 px-2">
                Preparation
              </p>
              <div className="flex flex-col gap-1">
                <a
                  href="/syllabus"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-bold text-[#2453E6] bg-blue-50/50 hover:bg-blue-50 min-h-[44px]"
                >
                  <Sparkles className="h-4 w-4 text-[#2453E6]" />
                  <span>UPSC Crack Engine & Vault</span>
                </a>
                <a
                  href="/ncert"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-bold text-[#12A878] bg-emerald-50/50 hover:bg-emerald-50 min-h-[44px]"
                >
                  <BookOpen className="h-4 w-4 text-[#12A878]" />
                  <span>NCERT Knowledge Base</span>
                </a>
                <a
                  href="/current-affairs"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-bold text-[#475467] hover:bg-[#F7F9FC] min-h-[44px]"
                >
                  <Layers className="h-4 w-4 text-teal-600" />
                  <span>Current Affairs & Syllabus Links</span>
                </a>
                <a
                  href="/mains"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-bold text-[#475467] hover:bg-[#F7F9FC] min-h-[44px]"
                >
                  <BarChart2 className="h-4 w-4 text-rose-600" />
                  <span>Mains Answer Studio (32 Authentic Qs)</span>
                </a>
                <a
                  href="/video-academy"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-bold text-[#475467] hover:bg-[#F7F9FC] min-h-[44px]"
                >
                  <Video className="h-4 w-4 text-red-600" />
                  <span>{t("nav.videoAcademy", "Video Academy")}</span>
                </a>
                <a
                  href="/topper-copies"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-bold text-[#475467] hover:bg-[#F7F9FC] min-h-[44px]"
                >
                  <Award className="h-4 w-4 text-[#F59E0B]" />
                  <span>{t("nav.topperCopies", "Topper Answer Library")}</span>
                </a>
                <a
                  href="/study-planner"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-bold text-[#475467] hover:bg-[#F7F9FC] min-h-[44px]"
                >
                  <Sliders className="h-4 w-4 text-indigo-600" />
                  <span>Daily Study Planner</span>
                </a>
                <a
                  href="/exams"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-bold text-[#475467] hover:bg-[#F7F9FC] min-h-[44px]"
                >
                  <ShieldCheck className="h-4 w-4 text-slate-600" />
                  <span>UPSC Exams Directory</span>
                </a>
              </div>
            </div>

            {/* Mobile Actions */}
            <div className="border-t border-[#E4E7EC] pt-3 flex flex-col gap-1">
              <a
                href="/system-flow"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-bold text-[#2453E6] hover:bg-blue-50 min-h-[44px]"
              >
                <Sparkles className="h-4 w-4" />
                <span>Aspirant Operating Loop & Flow</span>
              </a>
              <a
                href="/pricing"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-bold text-[#475467] hover:bg-[#F7F9FC] min-h-[44px]"
              >
                <Bookmark className="h-4 w-4 text-[#F59E0B]" />
                <span>Subscription Plans (Save 42%)</span>
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
