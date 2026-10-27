import React from "react";
import { BookOpen, ExternalLink, Shield } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-20 border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:py-16">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand Info */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-700 text-white shadow-sm">
                <BookOpen className="h-4 w-4" />
              </div>
              <span className="text-lg font-bold tracking-tight text-slate-900">
                Pravaah <span className="text-blue-700">UPSC</span>
              </span>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-slate-500">
              High-fidelity UPSC Civil Services Examination preparation platform. Concept-driven Previous Year Question (PYQ) learning, diagnostic analytics, and spaced mistake revision.
            </p>
            <p className="mt-3 text-[11px] font-medium text-slate-400">
              Core Promise: <span className="italic text-slate-600">"Find the PYQ. Understand the concept. Learn from every mistake."</span>
            </p>
          </div>

          {/* Quick Learning Routes */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              PYQ Archives
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm text-slate-600">
              <li>
                <a href="/pyqs?paper=GS1" className="hover:text-blue-600 transition">
                  General Studies Paper I
                </a>
              </li>
              <li>
                <a href="/pyqs?paper=GS2" className="hover:text-blue-600 transition">
                  GS Paper II (CSAT)
                </a>
              </li>
              <li>
                <a href="/pyqs?years=2024" className="hover:text-blue-600 transition">
                  UPSC 2024 Solved Paper
                </a>
              </li>
              <li>
                <a href="/pyqs?years=2023" className="hover:text-blue-600 transition">
                  UPSC 2023 Solved Paper
                </a>
              </li>
              <li>
                <a href="/subjects" className="hover:text-blue-600 transition">
                  Subject-Wise Topic Silos
                </a>
              </li>
            </ul>
          </div>

          {/* Practice & Tools */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Practice & Analytics
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm text-slate-600">
              <li>
                <a href="/mock-tests" className="hover:text-blue-600 transition">
                  Timed Examination Mode
                </a>
              </li>
              <li>
                <a href="/revision" className="hover:text-blue-600 transition">
                  Mistake Revision Queue
                </a>
              </li>
              <li>
                <a href="/dashboard" className="hover:text-blue-600 transition">
                  Personal Study Dashboard
                </a>
              </li>
              <li>
                <a href="/bookmarks" className="hover:text-blue-600 transition">
                  Bookmarked Questions
                </a>
              </li>
              <li>
                <a href="/notes" className="hover:text-blue-600 transition">
                  Aspirant Notes Workspace
                </a>
              </li>
            </ul>
          </div>

          {/* Provenance & Official Source */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Content Provenance
            </h3>
            <p className="mt-4 text-xs leading-relaxed text-slate-500">
              Historical question texts and official answer keys are preserved from authoritative notifications published by the Union Public Service Commission.
            </p>
            <div className="mt-3">
              <a
                href="https://upsc.gov.in/examinations/previous-question-papers"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800"
              >
                <span>UPSC Official Question Papers</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
            <div className="mt-4 flex flex-wrap gap-3 text-xs text-slate-500">
              <a href="/about" className="hover:underline">About</a>
              <a href="/faq" className="hover:underline">FAQ</a>
              <a href="/privacy" className="hover:underline">Privacy</a>
              <a href="/terms" className="hover:underline">Terms</a>
            </div>
          </div>
        </div>

        {/* Bottom Banner */}
        <div className="mt-12 border-t border-slate-200 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>© 2026 Pravaah UPSC. Built for Civil Services Aspirants with academic rigor.</p>
          <div className="flex items-center gap-2 text-slate-500">
            <Shield className="h-4 w-4 text-emerald-600" />
            <span>Verified Official Answer Keys & Structured Pedagogical Solutions</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
