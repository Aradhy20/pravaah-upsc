"use client";

import React, { useState, useEffect } from "react";
import Link from "next/navigation";
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
} from "lucide-react";

export function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentRole, setCurrentRole] = useState<"ASPIRANT" | "ADMIN">("ASPIRANT");
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [switching, setSwitching] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/v1/auth/me");
        const json = await res.json();
        if (json.success && json.data.authenticated) {
          setCurrentUser(json.data.user);
          setCurrentRole(json.data.user.role);
        }
      } catch (e) {
        console.error(e);
      }
    }
    checkAuth();
  }, []);

  const handleToggleRole = async () => {
    try {
      setSwitching(true);
      const nextRole = currentRole === "ASPIRANT" ? "ADMIN" : "ASPIRANT";
      const res = await fetch("/api/v1/auth/switch-role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: nextRole }),
      });
      if (res.ok) {
        setCurrentRole(nextRole);
        localStorage.setItem("pravaah_role", nextRole);
        window.location.reload();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSwitching(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/v1/auth/logout", { method: "POST" });
      window.location.href = "/login";
    } catch (e) {
      console.error(e);
    }
  };

  const navLinks = [
    { label: "Study Plan", href: "/study-planner", icon: BookOpen },
    { label: "Current Affairs", href: "/current-affairs", icon: Layers },
    { label: "Daily Quiz", href: "/daily-quiz", icon: CheckCircle },
    { label: "PYQ Explorer", href: "/pyqs", icon: Compass },
    { label: "Exams", href: "/exams", icon: ShieldCheck },
    { label: "Mains", href: "/mains", icon: BarChart2 },
    { label: "Mock Tests", href: "/mock-tests", icon: Clock },
    { label: "Revision", href: "/revision", icon: RotateCw },
    { label: "Pricing", href: "/pricing", icon: Bookmark },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Brand Logo */}
        <div className="flex items-center gap-6">
          <a href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-700 to-indigo-800 text-white shadow-sm ring-1 ring-blue-900/10 transition-transform group-hover:scale-105">
              <BookOpen className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-slate-900">
                Pravaah <span className="text-blue-700">UPSC</span>
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                CSE Learning Platform
              </span>
            </div>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href || pathname?.startsWith(`${link.href}/`);
              return (
                <a
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold transition ${
                    isActive
                      ? "bg-blue-50 text-blue-700"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{link.label}</span>
                </a>
              );
            })}
          </nav>
        </div>

        {/* Right Action Bar */}
        <div className="hidden sm:flex items-center gap-2.5">
          {/* Admin link badge */}
          {currentRole === "ADMIN" ? (
            <a
              href="/admin"
              className="flex items-center gap-1.5 rounded-lg bg-amber-50 border border-amber-200 px-3 py-1.5 text-xs font-bold text-amber-800 hover:bg-amber-100 transition"
            >
              <ShieldCheck className="h-4 w-4 text-amber-600" />
              <span>Admin Portal</span>
            </a>
          ) : (
            <a
              href="/admin"
              className="text-xs font-semibold text-slate-500 hover:text-slate-700 transition px-2"
            >
              Admin Access
            </a>
          )}

          {/* User Status / Auth Buttons */}
          {currentUser ? (
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-700 hidden md:inline">
                {currentUser.fullName}
              </span>
              <button
                onClick={handleLogout}
                className="text-xs font-bold text-slate-500 hover:text-red-600 transition"
                title="Sign out of current account"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <a
                href="/login"
                className="rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
              >
                Sign In
              </a>
              <a
                href="/register"
                className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-bold text-slate-800 hover:bg-slate-200 transition"
              >
                Register
              </a>
            </div>
          )}

          {/* Role Switcher Demo Button */}
          <button
            onClick={handleToggleRole}
            disabled={switching}
            className="flex items-center gap-1.5 rounded-full border border-slate-300 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition shadow-sm"
            title="Toggle between demo Aspirant and Admin roles"
          >
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
            <span>{currentRole}</span>
            <RotateCw className={`h-3 w-3 text-slate-400 ${switching ? "animate-spin" : ""}`} />
          </button>

          <a
            href="/pyqs"
            className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600"
          >
            <Search className="h-3.5 w-3.5" />
            <span>Practise</span>
          </a>
        </div>

        {/* Mobile menu button */}
        <div className="flex sm:hidden items-center gap-2">
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
          <div className="flex flex-col gap-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-base font-semibold ${
                    isActive ? "bg-blue-50 text-blue-700" : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <Icon className="h-5 w-5 text-slate-500" />
                  <span>{link.label}</span>
                </a>
              );
            })}
            <div className="my-2 border-t border-slate-200 pt-2 flex items-center justify-between">
              <a
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 text-sm font-semibold text-slate-600"
              >
                <ShieldCheck className="h-4 w-4 text-amber-600" />
                <span>Admin Portal</span>
              </a>
              <button
                onClick={handleToggleRole}
                className="text-xs font-bold text-blue-600 underline"
              >
                Switch Role ({currentRole})
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
