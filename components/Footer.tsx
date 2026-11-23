import React from "react";
import Link from "next/link";
import {
  BookOpen,
  ExternalLink,
  Shield,
  Phone,
  MessageSquare,
  Mail,
  Sparkles,
  Compass,
  CheckCircle,
  Clock,
  Layers,
  BarChart2,
  Sliders,
  RotateCw,
} from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-20 border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:py-16">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Col 1: Brand Info & Mission */}
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-700 text-white shadow-sm">
                <BookOpen className="h-4 w-4" />
              </div>
              <span className="text-lg font-black tracking-tight text-slate-900">
                Pravaah <span className="text-blue-700">UPSC</span>
              </span>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-slate-500">
              High-fidelity UPSC Civil Services Examination preparation platform. Concept-driven Previous Year Question (PYQ) learning, diagnostic analytics, spaced mistake revision, and syllabus intelligence.
            </p>
            <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-100 text-[11px] text-slate-600">
              <span className="font-bold text-slate-800 block mb-0.5">Core Academic Commitment:</span>
              <span>Authentic UPSC PYQs • Official Series A Keys • Zero Synthetic Illusions</span>
            </div>
          </div>

          {/* Col 2: Learning Ecosystem */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Learning Ecosystem
            </h3>
            <ul className="mt-4 space-y-2.5 text-xs text-slate-600">
              <li>
                <Link href="/pyqs?paper=GS1" className="hover:text-blue-600 transition flex items-center gap-1.5">
                  <Compass className="h-3.5 w-3.5 text-blue-600" />
                  <span>Prelims GS Paper I Archive</span>
                </Link>
              </li>
              <li>
                <Link href="/csat-coach" className="hover:text-blue-600 transition flex items-center gap-1.5">
                  <BarChart2 className="h-3.5 w-3.5 text-purple-600" />
                  <span>Dedicated CSAT Survival Coach</span>
                </Link>
              </li>
              <li>
                <Link href="/syllabus/intelligence" className="hover:text-blue-600 transition flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
                  <span>Syllabus Intelligence Map</span>
                </Link>
              </li>
              <li>
                <Link href="/current-affairs" className="hover:text-blue-600 transition flex items-center gap-1.5">
                  <Layers className="h-3.5 w-3.5 text-teal-600" />
                  <span>Current Affairs to PYQs</span>
                </Link>
              </li>
              <li>
                <Link href="/daily-quiz" className="hover:text-blue-600 transition flex items-center gap-1.5">
                  <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Daily 5-MCQ Diagnostic Quiz</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Preparation & Intelligence Tools */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Preparation & Practice
            </h3>
            <ul className="mt-4 space-y-2.5 text-xs text-slate-600">
              <li>
                <Link href="/mission-control" className="hover:text-blue-600 transition flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-blue-600" />
                  <span>Pravaah Mission Control</span>
                </Link>
              </li>
              <li>
                <Link href="/mains" className="hover:text-blue-600 transition flex items-center gap-1.5">
                  <BookOpen className="h-3.5 w-3.5 text-rose-600" />
                  <span>Mains Answer Evaluation Lab</span>
                </Link>
              </li>
              <li>
                <Link href="/revision" className="hover:text-blue-600 transition flex items-center gap-1.5">
                  <RotateCw className="h-3.5 w-3.5 text-amber-600" />
                  <span>Mistake Intelligence & SM-2</span>
                </Link>
              </li>
              <li>
                <Link href="/mock-tests" className="hover:text-blue-600 transition flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-indigo-600" />
                  <span>Timed Mock Examination</span>
                </Link>
              </li>
              <li>
                <Link href="/study-planner" className="hover:text-blue-600 transition flex items-center gap-1.5">
                  <Sliders className="h-3.5 w-3.5 text-slate-600" />
                  <span>Personal Study Planner</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Support & Contact Details */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Support & Contact
            </h3>
            <p className="mt-4 text-xs text-slate-500 leading-relaxed">
              Direct academic, technical and translation assistance for Civil Services aspirants.
            </p>
            <div className="mt-3 space-y-2 text-xs">
              <a
                href="tel:+917351522153"
                className="flex items-center gap-2 font-semibold text-slate-700 hover:text-blue-700 transition"
              >
                <Phone className="h-3.5 w-3.5 text-blue-600" />
                <span>+91 7351522153</span>
              </a>

              <a
                href="https://wa.me/917351522153?text=Hi%20Pravaah%20UPSC%20Support%2C%20I%20am%20an%20aspirant%20and%20need%20assistance%20with%3A"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 font-semibold text-slate-700 hover:text-emerald-700 transition"
              >
                <MessageSquare className="h-3.5 w-3.5 text-emerald-600" />
                <span>WhatsApp: +91 7351522153</span>
              </a>

              <a
                href="mailto:jainaradhy123@gmail.com"
                className="flex items-center gap-2 font-semibold text-slate-700 hover:text-indigo-700 transition"
              >
                <Mail className="h-3.5 w-3.5 text-indigo-600" />
                <span>jainaradhy123@gmail.com</span>
              </a>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap gap-2.5 text-[11px] text-slate-500 font-medium">
              <Link href="/contact" className="text-blue-700 font-bold hover:underline">
                Contact Desk
              </Link>
              <span>•</span>
              <Link href="/about" className="hover:underline">About</Link>
              <span>•</span>
              <Link href="/faq" className="hover:underline">FAQ</Link>
              <span>•</span>
              <Link href="/privacy" className="hover:underline">Privacy</Link>
              <span>•</span>
              <Link href="/terms" className="hover:underline">Terms</Link>
            </div>
            <div className="mt-2 text-[10px] text-slate-400">
              Lead Architect: <span className="text-slate-600 font-semibold">Aradhy Jain</span>
            </div>
          </div>
        </div>

        {/* Bottom Banner */}
        <div className="mt-12 border-t border-slate-200 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>© 2026 Pravaah UPSC. Built with academic rigor for Civil Services Aspirants.</p>
          <div className="flex items-center gap-4 text-slate-500">
            <div className="flex items-center gap-1.5">
              <Shield className="h-4 w-4 text-emerald-600" />
              <span>Official Series A Answer Keys Verified</span>
            </div>
            <a
              href="https://upsc.gov.in/examinations/previous-question-papers"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-slate-500 hover:text-blue-700 hover:underline"
            >
              <span>UPSC.gov.in</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
