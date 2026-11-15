"use client";

import React, { useState, useEffect } from "react";
import {
  BookOpen,
  ExternalLink,
  Search,
  Sparkles,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Compass,
  ArrowRight,
  Filter,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

interface NCERTChapter {
  id: string;
  chapterNumber: number;
  chapterTitle: string;
  slug: string;
  officialPdfUrl: string;
  keyTopics: string;
  summary: string | null;
  _count: {
    questionLinks: number;
  };
}

interface NCERTBook {
  id: string;
  classNumber: number;
  subject: string;
  bookTitle: string;
  medium: string;
  officialPortalUrl: string;
  copyrightNotice: string;
  chapters: NCERTChapter[];
}

export default function NCERTKnowledgeCatalogPage() {
  const [books, setBooks] = useState<NCERTBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState<number | "ALL">("ALL");
  const [selectedSubject, setSelectedSubject] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [expandedChapters, setExpandedChapters] = useState<Record<string, boolean>>({});

  useEffect(() => {
    async function fetchCatalog() {
      try {
        setLoading(true);
        const res = await fetch("/api/v1/ncert");
        const json = await res.json();
        if (json.success) {
          setBooks(json.data);
          // Expand first book's chapters by default
          if (json.data.length > 0) {
            setExpandedChapters({ [json.data[0].id]: true });
          }
        }
      } catch (err) {
        console.error("Failed to load NCERT catalog", err);
      } finally {
        setLoading(false);
      }
    }
    fetchCatalog();
  }, []);

  const subjects = ["ALL", "Polity", "Economy", "Geography", "History", "Science"];
  const classes = ["ALL", 10, 11, 12];

  const filteredBooks = books.filter((book) => {
    const matchesClass = selectedClass === "ALL" || book.classNumber === selectedClass;
    const matchesSubject = selectedSubject === "ALL" || book.subject.toLowerCase() === selectedSubject.toLowerCase();
    const matchesSearch =
      searchQuery.trim() === "" ||
      book.bookTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.chapters.some(
        (c) =>
          c.chapterTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.keyTopics.toLowerCase().includes(searchQuery.toLowerCase())
      );
    return matchesClass && matchesSubject && matchesSearch;
  });

  const toggleBook = (bookId: string) => {
    setExpandedChapters((prev) => ({
      ...prev,
      [bookId]: !prev[bookId],
    }));
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-blue-100 selection:text-blue-900 pb-20">
      {/* Top Banner */}
      <section className="bg-gradient-to-b from-blue-900 via-indigo-950 to-slate-900 text-white pt-12 pb-16 px-4 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/20 border border-blue-400/30 px-3.5 py-1 text-xs font-bold text-blue-200 mb-4">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Official Curriculum & UPSC PYQ Relational Bridge</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            NCERT Knowledge Base & <span className="text-blue-400">Question Mapping</span>
          </h1>

          <p className="mt-4 text-sm sm:text-base text-slate-300 max-w-3xl leading-relaxed">
            The foundation of 60%+ UPSC Civil Services Prelims questions lies in NCERT textbooks. Explore officially mapped chapters, independent conceptual summaries, official textbook links, and direct connections to authentic UPSC PYQs.
          </p>

          {/* Search bar inside header */}
          <div className="mt-8 max-w-2xl">
            <div className="relative">
              <Search className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search chapters, concepts (e.g. Monsoons, Fundamental Rights, GDP, Biodiversity)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 pl-12 pr-4 py-3 text-sm sm:text-base text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Main Container */}
      <main className="mx-auto max-w-6xl px-4 sm:px-6 -mt-6">
        {/* Compliance & Copyright Banner */}
        <div className="rounded-2xl border border-amber-200 bg-amber-50/90 p-4 text-xs text-amber-900 shadow-sm flex items-start gap-3 mb-8">
          <ShieldCheck className="h-5 w-5 text-amber-700 shrink-0 mt-0.5" />
          <div>
            <div className="font-bold">Official Attribution & Copyright Notice</div>
            <p className="mt-0.5 text-amber-800 leading-relaxed">
              NCERT textbooks are published by the National Council of Educational Research and Training, New Delhi. Pravaah UPSC adheres to educational fair dealing: we do not host or sell raw textbook PDFs. All reading links direct seamlessly to the official portals at{" "}
              <a
                href="https://ncert.nic.in/textbook.php"
                target="_blank"
                rel="noreferrer"
                className="underline font-bold hover:text-amber-950"
              >
                ncert.nic.in
              </a>{" "}
              and{" "}
              <a
                href="https://epathshala.nic.in"
                target="_blank"
                rel="noreferrer"
                className="underline font-bold hover:text-amber-950"
              >
                epathshala.nic.in
              </a>
              .
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Class Filter */}
          <div className="flex items-center gap-2 overflow-x-auto">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider shrink-0 mr-1">
              Class:
            </span>
            {classes.map((cls) => (
              <button
                key={String(cls)}
                onClick={() => setSelectedClass(cls as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
                  selectedClass === cls
                    ? "bg-blue-700 text-white shadow-xs"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {cls === "ALL" ? "All Classes" : `Class ${cls}`}
              </button>
            ))}
          </div>

          {/* Subject Filter */}
          <div className="flex items-center gap-2 overflow-x-auto">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider shrink-0 mr-1">
              Subject:
            </span>
            {subjects.map((sub) => (
              <button
                key={sub}
                onClick={() => setSelectedSubject(sub)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
                  selectedSubject === sub
                    ? "bg-indigo-700 text-white shadow-xs"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {sub}
              </button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="py-20 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent align-[-0.125em]" />
            <p className="mt-3 text-sm font-semibold text-slate-500">Loading NCERT Knowledge Base...</p>
          </div>
        )}

        {/* Books List */}
        {!loading && (
          <div className="space-y-6">
            {filteredBooks.length === 0 ? (
              <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center">
                <AlertCircle className="mx-auto h-8 w-8 text-slate-400" />
                <h3 className="mt-3 text-base font-bold text-slate-800">No matching NCERT textbooks found</h3>
                <p className="mt-1 text-xs text-slate-500">Try adjusting your filters or search keywords.</p>
              </div>
            ) : (
              filteredBooks.map((book) => {
                const isExpanded = !!expandedChapters[book.id];
                const totalLinked = book.chapters.reduce(
                  (acc, c) => acc + (c._count?.questionLinks || 0),
                  0
                );

                return (
                  <div
                    key={book.id}
                    className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-sm hover:shadow-md transition"
                  >
                    {/* Book Header Card */}
                    <div className="p-6 sm:p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100">
                      <div>
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="rounded-full bg-blue-100 text-blue-800 px-2.5 py-0.5 text-[11px] font-black uppercase">
                            Class {book.classNumber}
                          </span>
                          <span className="rounded-full bg-slate-100 text-slate-700 px-2.5 py-0.5 text-[11px] font-bold">
                            {book.subject}
                          </span>
                          <span className="text-xs text-slate-400 font-medium">
                            {book.chapters.length} Chapters
                          </span>
                        </div>
                        <h2 className="text-xl sm:text-2xl font-black text-slate-900">{book.bookTitle}</h2>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Relational mapping:{" "}
                          <strong className="text-blue-700 font-bold">
                            {totalLinked} UPSC Prelims questions
                          </strong>{" "}
                          directly derived from this textbook.
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <a
                          href={book.officialPortalUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-slate-100 px-3.5 py-2 text-xs font-bold text-slate-700 transition flex items-center gap-1.5"
                        >
                          <span>Official Portal</span>
                          <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
                        </a>
                        <button
                          onClick={() => toggleBook(book.id)}
                          className="rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 px-4 py-2 text-xs font-bold transition flex items-center gap-1.5"
                        >
                          <span>{isExpanded ? "Hide Chapters" : "View Chapters"}</span>
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Chapters Accordion Content */}
                    {isExpanded && (
                      <div className="divide-y divide-slate-100 bg-slate-50/50">
                        {book.chapters.map((chap) => (
                          <div
                            key={chap.id}
                            className="p-5 sm:p-6 hover:bg-white transition flex flex-col md:flex-row md:items-start justify-between gap-4"
                          >
                            <div className="max-w-3xl">
                              <div className="flex items-center gap-2 text-xs font-extrabold text-blue-700 uppercase tracking-wider mb-1">
                                <span>Chapter {chap.chapterNumber}</span>
                                {chap._count.questionLinks > 0 && (
                                  <span className="rounded-full bg-emerald-100 text-emerald-800 px-2 py-0.5 text-[10px] font-black lowercase tracking-normal">
                                    {chap._count.questionLinks} UPSC PYQ{chap._count.questionLinks > 1 ? "s" : ""}
                                  </span>
                                )}
                              </div>
                              <h3 className="text-base font-bold text-slate-900">{chap.chapterTitle}</h3>
                              
                              {chap.summary && (
                                <p className="mt-1.5 text-xs sm:text-sm text-slate-600 leading-relaxed">
                                  {chap.summary}
                                </p>
                              )}

                              <div className="mt-2.5 flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500">
                                <span className="font-bold text-slate-400">Key UPSC Topics:</span>
                                {chap.keyTopics.split(",").map((topic, tIdx) => (
                                  <span
                                    key={tIdx}
                                    className="rounded-md bg-white border border-slate-200 px-2 py-0.5 text-slate-700 font-medium"
                                  >
                                    {topic.trim()}
                                  </span>
                                ))}
                              </div>
                            </div>

                            <div className="flex flex-row md:flex-col items-center md:items-end gap-2 shrink-0">
                              <a
                                href={chap.officialPdfUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 transition flex items-center gap-1"
                              >
                                <span>Read Chapter PDF</span>
                                <ExternalLink className="h-3 w-3 text-slate-400" />
                              </a>

                              {chap._count.questionLinks > 0 ? (
                                <a
                                  href={`/pyqs?q=${encodeURIComponent(chap.chapterTitle)}`}
                                  className="rounded-xl bg-blue-700 hover:bg-blue-800 text-white px-3 py-1.5 text-xs font-bold transition flex items-center gap-1 shadow-xs"
                                >
                                  <span>Practise PYQs</span>
                                  <ArrowRight className="h-3 w-3" />
                                </a>
                              ) : (
                                <a
                                  href={`/pyqs?q=${encodeURIComponent(chap.keyTopics.split(",")[0] || chap.chapterTitle)}`}
                                  className="rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 text-xs font-bold transition flex items-center gap-1"
                                >
                                  <span>Search Related</span>
                                  <ArrowRight className="h-3 w-3" />
                                </a>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}
      </main>
    </div>
  );
}
