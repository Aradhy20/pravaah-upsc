"use client";

import React, { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  Compass,
  Layers,
  Clock,
  RotateCw,
  ShieldCheck,
  Menu,
  X,
  User,
  CreditCard,
  LogOut,
  ChevronDown,
  Calendar,
  Bookmark,
  FileText,
  Sparkles,
} from "lucide-react";

export function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [userSubscription, setUserSubscription] = useState<any | null>(null);
  const [authLoaded, setAuthLoaded] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close profile dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/v1/auth/me");
        const json = await res.json();
        if (json.success && json.data.authenticated) {
          setCurrentUser(json.data.user);
          setUserSubscription(json.data.subscription);
        } else {
          setCurrentUser(null);
          setUserSubscription(null);
        }
      } catch (e) {
        console.error("Auth check failed:", e);
        setCurrentUser(null);
      } finally {
        setAuthLoaded(true);
      }
    }
    checkAuth();
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await fetch("/api/v1/auth/logout", { method: "POST" });
      setCurrentUser(null);
      setUserSubscription(null);
      window.location.href = "/login";
    } catch (e) {
      console.error("Logout failed:", e);
    }
  };

  const isAdmin = currentUser?.role === "ADMIN";
  const isAspirant = currentUser && !isAdmin;
  const isGuest = !currentUser;

  // Role-specific navigation links
  const guestLinks = [
    { label: "Explore Learning", href: "/pyqs", icon: Compass },
    { label: "Pricing", href: "/pricing", icon: CreditCard },
    { label: "About", href: "/about", icon: BookOpen },
  ];

  const aspirantLinks = [
    { label: "Dashboard", href: "/dashboard", icon: BookOpen },
    { label: "Learn / PYQs", href: "/pyqs", icon: Compass },
    { label: "Practice", href: "/mock-tests", icon: Clock },
    { label: "Current Affairs", href: "/current-affairs", icon: Layers },
    { label: "Revision", href: "/revision", icon: RotateCw },
    { label: "Pricing", href: "/pricing", icon: CreditCard },
  ];

  const adminLinks = [
    { label: "Admin Portal", href: "/admin", icon: ShieldCheck },
    { label: "Content Management", href: "/admin/questions", icon: FileText },
    { label: "Review Queue", href: "/admin/review", icon: RotateCw },
    { label: "Subscriptions", href: "/admin/subscriptions", icon: CreditCard },
    { label: "Coverage", href: "/admin/coverage", icon: Compass },
  ];

  const activeLinks = isAdmin ? adminLinks : isAspirant ? aspirantLinks : guestLinks;

  // Plan name display helper
  const planBadgeText = userSubscription?.planName
    ? userSubscription.planName.replace(" (Free)", "")
    : "Free";
  const isPaidPlan = userSubscription?.isPaid;

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Brand Logo */}
        <div className="flex items-center gap-6">
          <a
            href={isAdmin ? "/admin" : isAspirant ? "/dashboard" : "/"}
            className="flex items-center gap-2.5 group"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-700 to-indigo-800 text-white shadow-sm ring-1 ring-blue-900/10 transition-transform group-hover:scale-105">
              <BookOpen className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-slate-900">
                Pravaah <span className="text-blue-700">UPSC</span>
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                {isAdmin ? "Admin Console" : "CSE Learning Platform"}
              </span>
            </div>
          </a>

          {/* Desktop Navigation - Clean, uncrowded single-line */}
          <nav className="hidden lg:flex items-center gap-1">
            {activeLinks.map((link) => {
              const Icon = link.icon;
              const isActive =
                pathname === link.href ||
                (link.href !== "/admin" && link.href !== "/" && pathname?.startsWith(`${link.href}/`));
              return (
                <a
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold tracking-tight transition whitespace-nowrap ${
                    isActive
                      ? "bg-blue-50 text-blue-700"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{link.label}</span>
                </a>
              );
            })}
          </nav>
        </div>

        {/* Right Action Bar */}
        <div className="hidden sm:flex items-center gap-3">
          {/* Guest State: Sign In & Register */}
          {isGuest && authLoaded && (
            <div className="flex items-center gap-2">
              <a
                href="/login"
                className="rounded-lg px-3.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
              >
                Sign In
              </a>
              <a
                href="/register"
                className="rounded-lg bg-blue-700 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-800 transition"
              >
                Register Free
              </a>
            </div>
          )}

          {/* Admin State: Clear Admin Badge & Sign Out */}
          {isAdmin && (
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-800">
                <ShieldCheck className="h-3.5 w-3.5 text-amber-600" />
                <span>Administrator</span>
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:border-red-200 hover:bg-red-50 hover:text-red-600 transition"
                title="Sign out of Admin account"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          )}

          {/* Aspirant State: Plan Badge & Profile Dropdown */}
          {isAspirant && (
            <div className="flex items-center gap-3" ref={dropdownRef}>
              {/* Subscription Pill */}
              <a
                href="/dashboard/billing"
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold border transition ${
                  isPaidPlan
                    ? "border-blue-300 bg-blue-50 text-blue-800 hover:bg-blue-100"
                    : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                }`}
                title="Manage your subscription & billing"
              >
                <Sparkles className="h-3 w-3 text-blue-600" />
                <span>{planBadgeText}</span>
              </a>

              {/* Profile Dropdown Toggle */}
              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-1.5 text-xs font-semibold text-slate-800 hover:bg-slate-100 transition shadow-sm"
                  aria-expanded={profileDropdownOpen}
                >
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-700 text-[11px] font-bold text-white">
                    {currentUser.fullName ? currentUser.fullName.charAt(0).toUpperCase() : "A"}
                  </div>
                  <span className="hidden md:inline max-w-[120px] truncate">
                    {currentUser.fullName || "Aspirant"}
                  </span>
                  <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                </button>

                {/* Dropdown Menu */}
                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-slate-200 bg-white p-2 shadow-lg ring-1 ring-black/5 animate-in fade-in-50 slide-in-from-top-1">
                    <div className="border-b border-slate-100 px-3 py-2 text-left">
                      <p className="text-xs font-bold text-slate-900 truncate">
                        {currentUser.fullName}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate">{currentUser.email}</p>
                    </div>

                    <div className="py-1 text-xs">
                      <a
                        href="/dashboard"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-100 transition"
                      >
                        <BookOpen className="h-4 w-4 text-slate-400" />
                        <span>My Dashboard</span>
                      </a>
                      <a
                        href="/study-planner"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-100 transition"
                      >
                        <Calendar className="h-4 w-4 text-slate-400" />
                        <span>Study Planner</span>
                      </a>
                      <a
                        href="/bookmarks"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-100 transition"
                      >
                        <Bookmark className="h-4 w-4 text-slate-400" />
                        <span>Saved Bookmarks</span>
                      </a>
                      <a
                        href="/notes"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-100 transition"
                      >
                        <FileText className="h-4 w-4 text-slate-400" />
                        <span>Personal Notes</span>
                      </a>
                      <a
                        href="/dashboard/billing"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-100 transition"
                      >
                        <CreditCard className="h-4 w-4 text-slate-400" />
                        <span>Subscription & Billing</span>
                      </a>
                    </div>

                    <div className="border-t border-slate-100 pt-1">
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 transition text-left"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="flex sm:hidden items-center gap-2">
          {isPaidPlan && (
            <span className="rounded-full bg-blue-50 border border-blue-200 px-2 py-0.5 text-[10px] font-bold text-blue-700">
              {planBadgeText}
            </span>
          )}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 touch-target flex items-center justify-center"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="border-b border-slate-200 bg-white px-4 py-4 sm:hidden animate-in slide-in-from-top">
          <div className="flex flex-col gap-1.5">
            {activeLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-semibold ${
                    isActive ? "bg-blue-50 text-blue-700" : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <Icon className="h-4 w-4 text-slate-500" />
                  <span>{link.label}</span>
                </a>
              );
            })}

            {isAspirant && (
              <div className="my-2 border-t border-slate-200 pt-2 flex flex-col gap-1 text-xs">
                <a
                  href="/dashboard/billing"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-50"
                >
                  <CreditCard className="h-4 w-4 text-slate-400" />
                  <span>Subscription & Billing ({planBadgeText})</span>
                </a>
                <a
                  href="/bookmarks"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-50"
                >
                  <Bookmark className="h-4 w-4 text-slate-400" />
                  <span>Bookmarks</span>
                </a>
                <a
                  href="/notes"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-50"
                >
                  <FileText className="h-4 w-4 text-slate-400" />
                  <span>Notes</span>
                </a>
              </div>
            )}

            <div className="mt-3 border-t border-slate-200 pt-3">
              {currentUser ? (
                <div className="flex items-center justify-between px-1">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-800">{currentUser.fullName}</span>
                    <span className="text-[10px] text-slate-500">{currentUser.email}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="rounded-lg bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-100"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <a
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="rounded-lg border border-slate-300 py-2 text-center text-xs font-bold text-slate-700"
                  >
                    Sign In
                  </a>
                  <a
                    href="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="rounded-lg bg-blue-700 py-2 text-center text-xs font-bold text-white shadow-sm"
                  >
                    Register Free
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
