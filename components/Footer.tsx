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
  FileText,
  Video,
  MapPin,
  Award,
} from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-20 border-t border-[#E7DDD4] bg-[#F4EDE2]/80 text-[#261B1E]">
      {/* Top Heritage Accent Bar */}
      <div className="h-1 w-full bg-gradient-to-r from-[#741A2B] via-[#C69A4A] to-[#741A2B]" />

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:py-16">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-5">
          {/* Col 1 & 2: Brand Heritage & Mission */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#741A2B] text-white shadow-card border border-[#C69A4A]/50">
                <BookOpen className="h-5 w-5 text-[#E2C38E]" />
              </div>
              <span className="text-xl font-bold font-editorial tracking-tight text-[#261B1E]">
                Pravaah <span className="text-[#741A2B]">UPSC</span>
              </span>
            </div>
            <p className="mt-3.5 text-xs sm:text-sm leading-relaxed text-[#786B68] max-w-md">
              High-fidelity UPSC Civil Services Examination preparation platform. Built with Indian academic rigor: authentic past-year questions, concept-driven explanations, timed examination simulation, diagnostic telemetry, and spaced mistake revision.
            </p>

            <div className="mt-5 p-3.5 bg-white rounded-2xl border border-[#E7DDD4] text-[11px] text-[#786B68] max-w-md shadow-xs">
              <div className="flex items-center gap-2 font-bold text-[#741A2B] mb-1">
                <Shield className="h-3.5 w-3.5 text-[#C69A4A]" />
                <span>Academic Integrity Guarantee</span>
              </div>
              <p className="leading-normal">
                Authentic UPSC Question Papers • Official Series A Keys • Strict Data Separation: Practice Questions are never mixed into official PYQ tallies.
              </p>
            </div>
          </div>

          {/* Col 3: Core Study Engines */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#C69A4A]">
              Study Engines
            </h4>
            <ul className="mt-4 space-y-2 text-xs font-medium">
              <li>
                <Link href="/pyqs" className="text-[#786B68] hover:text-[#741A2B] transition">
                  Prelims PYQ Library
                </Link>
              </li>
              <li>
                <Link href="/csat-coach" className="text-[#786B68] hover:text-[#741A2B] transition">
                  CSAT Survival Coach
                </Link>
              </li>
              <li>
                <Link href="/mock-tests" className="text-[#786B68] hover:text-[#741A2B] transition">
                  Timed Mock Simulator
                </Link>
              </li>
              <li>
                <Link href="/mains" className="text-[#786B68] hover:text-[#741A2B] transition">
                  Mains Answer Studio
                </Link>
              </li>
              <li>
                <Link href="/daily-quiz" className="text-[#786B68] hover:text-[#741A2B] transition">
                  5-Question Daily Quiz
                </Link>
              </li>
              <li>
                <Link href="/revision" className="text-[#786B68] hover:text-[#741A2B] transition">
                  Smart Mistake Queue (SM-2)
                </Link>
              </li>
              <li>
                <Link href="/study-planner" className="text-[#786B68] hover:text-[#741A2B] transition">
                  Daily Study Planner
                </Link>
              </li>
              <li>
                <Link href="/mission-control" className="text-[#786B68] hover:text-[#741A2B] transition">
                  Mission Control
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Knowledge Vault */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#C69A4A]">
              Knowledge Vault
            </h4>
            <ul className="mt-4 space-y-2 text-xs font-medium">
              <li>
                <Link href="/syllabus" className="text-[#786B68] hover:text-[#741A2B] transition">
                  Syllabus Matrix
                </Link>
              </li>
              <li>
                <Link href="/syllabus/intelligence" className="text-[#786B68] hover:text-[#741A2B] transition">
                  Syllabus Intelligence
                </Link>
              </li>
              <li>
                <Link href="/current-affairs" className="text-[#786B68] hover:text-[#741A2B] transition">
                  Daily Current Affairs & PYQs
                </Link>
              </li>
              <li>
                <Link href="/video-academy" className="text-[#786B68] hover:text-[#741A2B] transition">
                  Video Academy
                </Link>
              </li>
              <li>
                <Link href="/topper-copies" className="text-[#786B68] hover:text-[#741A2B] transition">
                  Topper Answer Copies
                </Link>
              </li>
              <li>
                <Link href="/map-lab" className="text-[#786B68] hover:text-[#741A2B] transition">
                  Map Learning Lab
                </Link>
              </li>
              <li>
                <Link href="/ncert" className="text-[#786B68] hover:text-[#741A2B] transition">
                  NCERT Chapter Mapping
                </Link>
              </li>
              <li>
                <Link href="/interview" className="text-[#786B68] hover:text-[#741A2B] transition">
                  Personality Test & DAF
                </Link>
              </li>
              <li>
                <Link href="/exams" className="text-[#786B68] hover:text-[#741A2B] transition">
                  UPSC 241-Exam Corpus
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 5: Direct Support & Contact */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#C69A4A]">
              Aspirant Support
            </h4>
            <div className="mt-4 space-y-2.5 text-xs text-[#786B68]">
              <div className="p-3 bg-white rounded-xl border border-[#E7DDD4] shadow-xs">
                <span className="font-bold text-[#261B1E] block mb-1">Direct Help Desk:</span>
                <a
                  href="tel:+917351522153"
                  className="flex items-center gap-1.5 font-bold text-[#741A2B] hover:underline"
                >
                  <Phone className="h-3.5 w-3.5 text-[#C69A4A]" />
                  <span>+91 7351522153</span>
                </a>
                <a
                  href="https://wa.me/917351522153"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 mt-1 font-semibold text-[#1E7E55] hover:underline"
                >
                  <MessageSquare className="h-3.5 w-3.5" />
                  <span>WhatsApp Support</span>
                </a>
                <a
                  href="mailto:jainaradhy123@gmail.com"
                  className="flex items-center gap-1.5 mt-1 font-semibold text-[#786B68] hover:text-[#741A2B]"
                >
                  <Mail className="h-3.5 w-3.5" />
                  <span className="truncate">jainaradhy123@gmail.com</span>
                </a>

                <a
                  href="mailto:jainaradhy123@gmail.com?subject=UPSC%20Academic%20Errata%20Report"
                  className="flex items-center gap-1.5 mt-2.5 font-bold text-[#741A2B] bg-[#FAF2E6] px-2.5 py-1.5 rounded-lg border border-[#E5C88E] hover:bg-[#F4EDE2] transition text-[11px]"
                >
                  <Shield className="h-3.5 w-3.5 text-[#C69A4A]" />
                  <span>Report Academic Errata</span>
                </a>
              </div>

              <div className="pt-2 text-[11px] space-y-1">
                <div>Lead Architect: <span className="font-bold text-[#261B1E]">Aradhy Jain</span></div>
                <div>Operational Hours: 08:00 – 22:00 IST</div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Legal */}
        <div className="mt-12 border-t border-[#E7DDD4] pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-[#786B68] gap-4">
          <p>© 2026 Pravaah UPSC. Built with academic rigor for Civil Services Aspirants across India.</p>

          <div className="flex flex-wrap items-center gap-4 text-xs">
            <Link href="/about" className="hover:text-[#741A2B]">About Us</Link>
            <span>•</span>
            <Link href="/contact" className="hover:text-[#741A2B]">Contact</Link>
            <span>•</span>
            <Link href="/faq" className="hover:text-[#741A2B]">FAQ</Link>
            <span>•</span>
            <Link href="/pricing" className="hover:text-[#741A2B]">Membership</Link>
            <span>•</span>
            <Link href="/privacy" className="hover:text-[#741A2B]">Privacy Policy</Link>
            <span>•</span>
            <Link href="/terms" className="hover:text-[#741A2B]">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
