"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Calendar,
  ExternalLink,
  BookOpen,
  ArrowRight,
  GraduationCap,
  Users,
  Award,
  Layers,
  Search,
} from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function ExamsCataloguePage() {
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchExams = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/v1/exams");
      const data = await res.json();
      if (res.ok && data.success) {
        setExams(data.exams || []);
      } else {
        setError(data.error || "Failed to load examination profiles from database.");
      }
    } catch (e: any) {
      console.error("Failed to load exams:", e);
      setError("Network error while connecting to UPSC examination directory.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  const categories = ["ALL", "Civil Services", "Defence Services", "Engineering Services", "Medical Services", "Paramilitary & Police", "Recruitment Tests"];

  const filteredExams = exams.filter((ex) => {
    const matchesCategory = selectedCategory === "ALL" || ex.category === selectedCategory;
    const matchesSearch =
      !searchQuery ||
      ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ex.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ex.overview.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-heritage-ivory flex flex-col font-sans text-heritage-dark">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Hero */}
        <div className="bg-gradient-to-r from-heritage-wine via-heritage-burgundy to-heritage-wine rounded-3xl p-6 sm:p-10 text-white shadow-xl mb-8 border border-heritage-gold/30">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-heritage-gold/20 text-heritage-goldLight text-xs font-semibold mb-4 border border-heritage-gold/30">
              <ShieldCheck className="h-3.5 w-3.5 text-heritage-gold" />
              Unified UPSC Multi-Examination Directory
            </div>
            <h1 className="text-2xl sm:text-4xl font-serif font-black tracking-tight text-white">
              All UPSC Examinations <span className="text-heritage-gold">& Eligibility Matrix</span>
            </h1>
            <p className="mt-3 text-white/80 text-sm sm:text-base leading-relaxed">
              Explore official notifications, educational criteria, age limits, syllabus taxonomies, and previous papers beyond Civil Services (CSE)—including CDS, NDA, CAPF, Engineering (ESE), Combined Medical (CMS), and EPFO.
            </p>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white p-4 rounded-2xl border border-heritage-border shadow-xs mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedCategory === cat
                    ? "bg-heritage-burgundy text-white shadow-xs"
                    : "bg-heritage-cream text-heritage-dark hover:bg-heritage-border"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-heritage-muted" />
            <input
              type="text"
              placeholder="Search exam name or code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-heritage-border bg-heritage-ivory/50 focus:outline-none focus:ring-2 focus:ring-heritage-gold text-heritage-dark placeholder:text-heritage-muted"
            />
          </div>
        </div>

        {/* Exam Cards Grid */}
        {error ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-rose-200 shadow-sm max-w-xl mx-auto my-8">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 mb-3 border border-rose-100">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h3 className="text-base font-serif font-bold text-heritage-dark">Directory Temporarily Unavailable</h3>
            <p className="text-xs text-rose-700 mt-1 mb-4">{error}</p>
            <button
              onClick={() => fetchExams()}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-heritage-burgundy hover:bg-heritage-wine text-white text-xs font-bold transition shadow-xs"
            >
              Retry Loading Exams
            </button>
          </div>
        ) : loading ? (
          <div className="py-20 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-heritage-burgundy"></div>
            <p className="mt-2 text-sm text-heritage-muted font-medium">Loading UPSC examination directory...</p>
          </div>
        ) : filteredExams.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-heritage-border">
            <ShieldCheck className="h-10 w-10 text-heritage-muted mx-auto mb-3" />
            <h3 className="text-base font-serif font-bold text-heritage-dark">No examinations match your filter</h3>
            <p className="text-sm text-heritage-muted mt-1">Try resetting the category filter or search query.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredExams.map((exam) => (
              <div
                key={exam.code}
                className="bg-white rounded-2xl border border-heritage-border shadow-xs hover:border-heritage-gold hover:shadow-md transition flex flex-col justify-between overflow-hidden"
              >
                <div className="p-6">
                  {/* Category & Badge */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="px-2.5 py-1 rounded-md text-xs font-extrabold bg-heritage-gold/20 text-heritage-wine border border-heritage-gold/30 font-serif">
                      UPSC {exam.code}
                    </span>
                    <span className="text-xs font-semibold text-heritage-muted">
                      {exam.category}
                    </span>
                  </div>

                  {/* Title */}
                  <Link href={`/exams/${exam.code.toLowerCase()}`}>
                    <h2 className="text-lg font-serif font-bold text-heritage-dark hover:text-heritage-burgundy transition-colors leading-snug">
                      {exam.name}
                    </h2>
                  </Link>

                  <p className="mt-2 text-xs text-heritage-muted line-clamp-3 leading-relaxed">
                    {exam.overview}
                  </p>

                  {/* Details Matrix */}
                  <div className="mt-4 pt-4 border-t border-heritage-border space-y-2 text-xs">
                    <div className="flex items-start gap-2">
                      <GraduationCap className="h-4 w-4 text-heritage-gold shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-heritage-dark">Qualification: </span>
                        <span className="text-heritage-muted line-clamp-1">{exam.eligibilityQualifications}</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <Users className="h-4 w-4 text-heritage-gold shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-heritage-dark">Age Bracket: </span>
                        <span className="text-heritage-muted">{exam.ageLimit.split(".")[0]}</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <Calendar className="h-4 w-4 text-heritage-gold shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-heritage-dark">Cycle: </span>
                        <span className="text-heritage-muted">{exam.examCycleDates || "Annual Cycle"}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer action */}
                <div className="px-6 py-3.5 bg-heritage-ivory border-t border-heritage-border flex items-center justify-between">
                  <a
                    href={exam.officialNotificationUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-heritage-muted hover:text-heritage-burgundy font-medium"
                  >
                    Official Notice
                    <ExternalLink className="h-3 w-3" />
                  </a>
                  <Link
                    href={`/exams/${exam.code.toLowerCase()}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-heritage-burgundy hover:text-heritage-wine"
                  >
                    View Syllabus & Papers
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
