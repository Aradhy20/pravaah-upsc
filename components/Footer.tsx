import React from "react";
import { BookOpen, ExternalLink, Shield, Mail, ArrowUpRight } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-20 border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:py-16">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4 lg:grid-cols-5">
          {/* Brand Info */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
                <BookOpen className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900">
                Pravaah <span className="text-blue-600">UPSC</span>
              </span>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-slate-500 max-w-sm">
              The complete concept-driven preparation platform for UPSC Civil Services Examination. Authentic Previous Year Questions, statement-by-statement evidence, timed mock examination, and automated spaced revision.
            </p>
            <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
              <Mail className="h-4 w-4 text-slate-400" />
              <span>Academic Support: support@pravaah.in</span>
            </div>
          </div>

          {/* Quick Learning Routes */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              PYQ Archives
            </h3>
            <ul className="mt-4 space-y-2.5 text-xs text-slate-600">
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
                  UPSC 2024 Solved Papers
                </a>
              </li>
              <li>
                <a href="/pyqs?years=2023" className="hover:text-blue-600 transition">
                  UPSC 2023 Solved Papers
                </a>
              </li>
              <li>
                <a href="/subjects" className="hover:text-blue-600 transition">
                  Subject-Wise Topic Taxonomy
                </a>
              </li>
            </ul>
          </div>

          {/* Practice & Tools */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              SaaS Tools
            </h3>
            <ul className="mt-4 space-y-2.5 text-xs text-slate-600">
              <li>
                <a href="/mock-tests" className="hover:text-blue-600 transition">
                  Timed Exam Simulator
                </a>
              </li>
              <li>
                <a href="/study-planner" className="hover:text-blue-600 transition">
                  Daily Study Planner
                </a>
              </li>
              <li>
                <a href="/daily-quiz" className="hover:text-blue-600 transition">
                  Daily Prelims Quiz
                </a>
              </li>
              <li>
                <a href="/revision" className="hover:text-blue-600 transition">
                  Mistake Revision Queue
                </a>
              </li>
              <li>
                <a href="/mains" className="hover:text-blue-600 transition">
                  Mains & Essay Writing
                </a>
              </li>
              <li>
                <a href="/dashboard" className="hover:text-blue-600 transition">
                  Personal Analytics Dashboard
                </a>
              </li>
              <li>
                <a href="/pricing" className="hover:text-blue-600 transition">
                  Subscription Plans
                </a>
              </li>
            </ul>
          </div>

          {/* Legal & Provenance */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Platform & Legal
            </h3>
            <ul className="mt-4 space-y-2.5 text-xs text-slate-600">
              <li>
                <a href="/about" className="hover:text-blue-600 transition">
                  About Platform
                </a>
              </li>
              <li>
                <a href="/faq" className="hover:text-blue-600 transition">
                  Frequently Asked Questions
                </a>
              </li>
              <li>
                <a href="/privacy" className="hover:text-blue-600 transition">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="/terms" className="hover:text-blue-600 transition">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="/admin" className="text-slate-400 hover:text-slate-600 transition text-[11px]">
                  Staff & Admin Portal
                </a>
              </li>
            </ul>
            <div className="mt-4 pt-3 border-t border-slate-100">
              <a
                href="https://upsc.gov.in"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-400 hover:text-blue-600 transition"
              >
                <span>Union Public Service Commission</span>
                <ArrowUpRight className="h-3 w-3" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Banner */}
        <div className="mt-12 border-t border-slate-200 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>© 2026 Pravaah UPSC. Built with academic rigor for Civil Services Aspirants.</p>
          <div className="flex items-center gap-2 text-slate-500">
            <Shield className="h-4 w-4 text-emerald-600" />
            <span>1,100 Verified PYQs with Authentic Answer Keys</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
