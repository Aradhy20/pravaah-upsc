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
  ChevronDown,
  CheckCircle,
  RotateCw,
  LogOut,
  User as UserIcon,
  Sparkles,
} from "lucide-react";

export function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [studyDropdownOpen, setStudyDropdownOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setStudyDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch actual authenticated user state
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/v1/auth/me");
        const json = await res.json();
        if (json.success && json.data.authenticated) {
          setCurrentUser(json.data.user);
        } else {
          setCurrentUser(null);
        }
      } catch (e) {
        console.error("Auth check failed:", e);
        setCurrentUser(null);
      } finally {
        setLoadingAuth(false);
      }
    }
    checkAuth();
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await fetch("/api/v1/auth/logout", { method: "POST" });
      setCurrentUser(null);
      window.location.href = "/login";
    } catch (e) {
      console.error("Logout failed:", e);
    }
  };

  const isStudyActive =
    pathname === "/study-planner" ||
    pathname === "/daily-quiz" ||
    pathname === "/revision";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Left: Brand Logo */}
        <div className="flex items-center gap-6">
          <a href="/" className="flex items-center gap-2.5 flex-shrink-0 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm ring-1 ring-blue-700/10 transition-transform group-hover:scale-105">
              <BookOpen className="h-5 w-5" />
            </div>
            <div className="flex flex-col whitespace-nowrap">
              <span className="text-lg font-bold tracking-tight text-slate-900 leading-none">
                Pravaah <span className="text-blue-600">UPSC</span>
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mt-0.5">
                CSE Learning Platform
              </span>
            </div>
          </a>

          {/* Desktop Navigation (Clean 6 items) */}
          <nav className="hidden lg:flex items-center gap-1">
            {/* Study Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setStudyDropdownOpen(!studyDropdownOpen)}
                className={`flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-semibold transition ${
                  isStudyActive
                    ? "bg-blue-50 text-blue-700"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
                aria-expanded={studyDropdownOpen}
              >
                <span>Study</span>
                <ChevronDown
                  className={`h-4 w-4 transition-transform duration-200 ${
                    studyDropdownOpen ? "rotate-180 text-blue-700" : "text-slate-400"
                  }`}
                />
              </button>

              {studyDropdownOpen && (
                <div className="absolute left-0 mt-2 w-56 rounded-xl border border-slate-200 bg-white p-2 shadow-lg ring-1 ring-black/5 animate-in fade-in-50 zoom-in-95">
                  <a
                    href="/study-planner"
                    onClick={() => setStudyDropdownOpen(false)}
                    className="flex items-start gap-2.5 rounded-lg p-2 hover:bg-slate-50 transition"
                  >
                    <BookOpen className="h-4 w-4 text-blue-600 mt-0.5" />
                    <div>
                      <div className="text-xs font-bold text-slate-900">Study Plan</div>
                      <div className="text-[11px] text-slate-500">Daily syllabus & PYQ roadmap</div>
                    </div>
                  </a>
                  <a
                    href="/daily-quiz"
                    onClick={() => setStudyDropdownOpen(false)}
                    className="flex items-start gap-2.5 rounded-lg p-2 hover:bg-slate-50 transition"
                  >
                    <CheckCircle className="h-4 w-4 text-emerald-600 mt-0.5" />
                    <div>
                      <div className="text-xs font-bold text-slate-900">Daily Quiz</div>
                      <div className="text-[11px] text-slate-500">5 curated Prelims questions</div>
                    </div>
                  </a>
                  <a
                    href="/revision"
                    onClick={() => setStudyDropdownOpen(false)}
                    className="flex items-start gap-2.5 rounded-lg p-2 hover:bg-slate-50 transition"
                  >
                    <RotateCw className="h-4 w-4 text-indigo-600 mt-0.5" />
                    <div>
                      <div className="text-xs font-bold text-slate-900">Revision Queue</div>
                      <div className="text-[11px] text-slate-500">Spaced repetition mistake bank</div>
                    </div>
                  </a>
                </div>
              )}
            </div>

            <a
              href="/current-affairs"
              className={`flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-semibold transition ${
                pathname === "/current-affairs" || pathname?.startsWith("/current-affairs/")
                  ? "bg-blue-50 text-blue-700"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <span>Current Affairs</span>
            </a>

            <a
              href="/pyqs"
              className={`flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-semibold transition ${
                pathname === "/pyqs" || pathname?.startsWith("/pyqs/")
                  ? "bg-blue-50 text-blue-700"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <span>PYQ Explorer</span>
            </a>

            <a
              href="/mock-tests"
              className={`flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-semibold transition ${
                pathname === "/mock-tests" || pathname?.startsWith("/mock-tests/")
                  ? "bg-blue-50 text-blue-700"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <span>Mock Tests</span>
            </a>

            <a
              href="/mains"
              className={`flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-semibold transition ${
                pathname === "/mains" || pathname?.startsWith("/mains/")
                  ? "bg-blue-50 text-blue-700"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <span>Mains</span>
            </a>

            <a
              href="/pricing"
              className={`flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-semibold transition ${
                pathname === "/pricing"
                  ? "bg-blue-50 text-blue-700"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <span>Pricing</span>
            </a>
          </nav>
        </div>

        {/* Right Action Bar (Desktop) */}
        <div className="hidden lg:flex items-center gap-3">
          {!loadingAuth && currentUser ? (
            <div className="flex items-center gap-3">
              {currentUser.role === "ADMIN" && (
                <a
                  href="/admin"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-amber-50 border border-amber-200 px-2.5 py-1.5 text-xs font-bold text-amber-800 hover:bg-amber-100 transition"
                >
                  <ShieldCheck className="h-3.5 w-3.5 text-amber-600" />
                  <span>Admin</span>
                </a>
              )}

              <a
                href="/dashboard"
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold transition ${
                  pathname === "/dashboard"
                    ? "bg-blue-50 text-blue-700"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <BarChart2 className="h-4 w-4 text-blue-600" />
                <span>Dashboard</span>
              </a>

              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                <div className="flex items-center gap-1.5 bg-slate-100 rounded-full py-1 px-2.5 text-xs font-medium text-slate-700">
                  <UserIcon className="h-3.5 w-3.5 text-slate-500" />
                  <span className="max-w-[120px] truncate">{currentUser.fullName}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="rounded-lg p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 transition"
                  title="Sign out"
                  aria-label="Sign out"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            </div>
          ) : !loadingAuth ? (
            <div className="flex items-center gap-2">
              <a
                href="/login"
                className="rounded-lg px-3.5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition"
              >
                Sign In
              </a>
              <a
                href="/register"
                className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition"
              >
                <span>Start Learning Free</span>
              </a>
            </div>
          ) : (
            <div className="h-9 w-24 bg-slate-100 animate-pulse rounded-lg" />
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex lg:hidden items-center gap-2">
          {currentUser && (
            <a
              href="/dashboard"
              className="rounded-lg p-2 text-blue-600 hover:bg-blue-50 transition"
              aria-label="Dashboard"
            >
              <BarChart2 className="h-5 w-5" />
            </a>
          )}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 transition touch-target flex items-center justify-center"
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer (Responsive Below lg Breakpoint) */}
      {mobileMenuOpen && (
        <div className="border-b border-slate-200 bg-white px-4 py-5 lg:hidden animate-in slide-in-from-top duration-200 max-h-[calc(100vh-4rem)] overflow-y-auto">
          {/* Mobile User Status */}
          {currentUser ? (
            <div className="mb-4 rounded-xl bg-slate-50 border border-slate-200 p-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-700 font-bold text-xs">
                  {currentUser.fullName?.[0]?.toUpperCase() || "A"}
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">{currentUser.fullName}</div>
                  <div className="text-[10px] text-slate-500">{currentUser.email}</div>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="text-xs font-bold text-red-600 hover:underline flex items-center gap-1"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          ) : (
            <div className="mb-4 grid grid-cols-2 gap-2">
              <a
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center rounded-xl border border-slate-300 bg-white py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 text-center"
              >
                Sign In
              </a>
              <a
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center rounded-xl bg-blue-600 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 text-center"
              >
                Get Started
              </a>
            </div>
          )}

          {/* Navigation Links */}
          <div className="space-y-1">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1">
              Core Platform
            </div>
            <a
              href="/pyqs"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold ${
                pathname === "/pyqs" ? "bg-blue-50 text-blue-700" : "text-slate-700 hover:bg-slate-50"
              }`}
            >
              <Compass className="h-4 w-4 text-blue-600" />
              <span>PYQ Explorer</span>
            </a>
            <a
              href="/mock-tests"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold ${
                pathname === "/mock-tests" ? "bg-blue-50 text-blue-700" : "text-slate-700 hover:bg-slate-50"
              }`}
            >
              <Clock className="h-4 w-4 text-blue-600" />
              <span>Mock Tests</span>
            </a>
            <a
              href="/mains"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold ${
                pathname === "/mains" ? "bg-blue-50 text-blue-700" : "text-slate-700 hover:bg-slate-50"
              }`}
            >
              <BarChart2 className="h-4 w-4 text-blue-600" />
              <span>Mains Writing</span>
            </a>
            <a
              href="/current-affairs"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold ${
                pathname === "/current-affairs" ? "bg-blue-50 text-blue-700" : "text-slate-700 hover:bg-slate-50"
              }`}
            >
              <Layers className="h-4 w-4 text-blue-600" />
              <span>Current Affairs</span>
            </a>
            <a
              href="/pricing"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold ${
                pathname === "/pricing" ? "bg-blue-50 text-blue-700" : "text-slate-700 hover:bg-slate-50"
              }`}
            >
              <Bookmark className="h-4 w-4 text-blue-600" />
              <span>Pricing & Plans</span>
            </a>

            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 pt-3 pb-1">
              Study Tools
            </div>
            <a
              href="/study-planner"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold ${
                pathname === "/study-planner" ? "bg-blue-50 text-blue-700" : "text-slate-700 hover:bg-slate-50"
              }`}
            >
              <BookOpen className="h-4 w-4 text-teal-600" />
              <span>Daily Study Plan</span>
            </a>
            <a
              href="/daily-quiz"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold ${
                pathname === "/daily-quiz" ? "bg-blue-50 text-blue-700" : "text-slate-700 hover:bg-slate-50"
              }`}
            >
              <CheckCircle className="h-4 w-4 text-emerald-600" />
              <span>Today's Daily Quiz</span>
            </a>
            <a
              href="/revision"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold ${
                pathname === "/revision" ? "bg-blue-50 text-blue-700" : "text-slate-700 hover:bg-slate-50"
              }`}
            >
              <RotateCw className="h-4 w-4 text-indigo-600" />
              <span>Spaced Revision Queue</span>
            </a>

            {currentUser && (
              <>
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 pt-3 pb-1">
                  Learner Dashboard
                </div>
                <a
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold ${
                    pathname === "/dashboard" ? "bg-blue-50 text-blue-700" : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <BarChart2 className="h-4 w-4 text-blue-600" />
                  <span>My Learning Analytics</span>
                </a>
              </>
            )}

            {currentUser?.role === "ADMIN" && (
              <div className="pt-2 border-t border-slate-200 mt-2">
                <a
                  href="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 text-xs font-bold text-amber-800"
                >
                  <ShieldCheck className="h-4 w-4 text-amber-600" />
                  <span>Admin Management Portal</span>
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
