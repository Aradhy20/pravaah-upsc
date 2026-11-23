"use client";

import React, { useState, useEffect } from "react";
import { useLanguage } from "@/lib/i18n/context";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import {
  Award,
  BookOpen,
  Search,
  Calendar,
  Sparkles,
  FileText,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  X,
  ShieldCheck,
} from "lucide-react";

interface TopperCopy {
  id: string;
  topperName: string;
  rank: number;
  year: number;
  examType: string;
  paperCode: string;
  optionalSubject?: string | null;
  title: string;
  titleHi?: string | null;
  description?: string | null;
  pdfUrl?: string | null;
  sampleAnswerUrl?: string | null;
  keyTakeaways?: string | null;
  scoreMarks?: string | null;
}

export default function TopperCopiesPage() {
  const { language } = useLanguage();
  const [copies, setCopies] = useState<TopperCopy[]>([]);
  const [selectedPaper, setSelectedPaper] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [activeModalCopy, setActiveModalCopy] = useState<TopperCopy | null>(null);

  useEffect(() => {
    async function loadCopies() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (selectedPaper !== "ALL") params.set("paperCode", selectedPaper);
        if (searchQuery.trim()) params.set("q", searchQuery.trim());

        const res = await fetch(`/api/v1/topper-copies?${params.toString()}`);
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          setCopies(data.data);
        }
      } catch (err) {
        console.error("Error loading topper copies:", err);
      } finally {
        setLoading(false);
      }
    }
    loadCopies();
  }, [selectedPaper, searchQuery]);

  const papers = [
    { code: "ALL", label: language === "hi" ? "सभी प्रश्नपत्र" : "All Papers" },
    { code: "GS1", label: "GS 1 (Heritage & Society)" },
    { code: "GS2", label: "GS 2 (Governance & IR)" },
    { code: "GS3", label: "GS 3 (Economy & Tech)" },
    { code: "GS4", label: "GS 4 (Ethics & Cases)" },
    { code: "ESSAY", label: "Essay (निबंध)" },
  ];

  return (
    <div className="min-h-screen bg-heritage-ivory flex flex-col font-sans text-heritage-dark">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
        {/* Hero Banner */}
        <div className="bg-gradient-to-r from-heritage-wine via-heritage-burgundy to-heritage-wine rounded-3xl p-8 sm:p-10 text-white shadow-xl relative overflow-hidden border border-heritage-gold/30">
          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-heritage-gold/20 text-heritage-goldLight text-xs font-bold border border-heritage-gold/30">
              <Award className="w-3.5 h-3.5 text-heritage-gold" />
              <span>{language === "hi" ? "टॉपर्स उत्तर विश्लेषण" : "Topper Answer Intelligence"}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-serif font-black tracking-tight text-white">
              {language === "hi" ? "UPSC टॉपर्स उत्तर पुस्तिका ज्ञानकोष" : "UPSC Topper Answer Copy Archive"}
            </h1>
            <p className="text-white/80 text-sm sm:text-base leading-relaxed">
              {language === "hi"
                ? "अखिल भारतीय रैंक (AIR) 1, 2 एवं शीर्ष चयनित अभ्यर्थियों की वास्तविक उत्तर प्रतियों का विखंडन। जानें कि उच्च अंक प्राप्त करने हेतु आरेख, प्रवाह-चित्र और संवैधानिक अनुच्छेदों का संयोजन कैसे किया जाता है।"
                : "Deconstruct real answer scripts of All India Rank (AIR) 1, 2, and top rankers. Master how to frame subheadings, introduce flowcharts, and cite committee reports under strict exam constraints."}
            </p>
          </div>
          <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 bg-radial from-heritage-gold to-transparent pointer-events-none" />
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 border border-heritage-border shadow-xs flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            {papers.map((p) => (
              <button
                key={p.code}
                onClick={() => setSelectedPaper(p.code)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  selectedPaper === p.code
                    ? "bg-heritage-burgundy text-white shadow-xs ring-2 ring-heritage-burgundy/20"
                    : "bg-heritage-cream text-heritage-dark hover:bg-heritage-border"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-heritage-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={language === "hi" ? "टॉपर अथवा विषय खोजें..." : "Search topper or theme..."}
              className="w-full pl-10 pr-4 py-2 bg-heritage-ivory border border-heritage-border rounded-xl text-xs font-medium text-heritage-dark placeholder-heritage-muted focus:outline-none focus:ring-2 focus:ring-heritage-gold focus:bg-white transition"
            />
          </div>
        </div>

        {/* Topper Cards Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 bg-heritage-cream/60 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : copies.length === 0 ? (
          <div className="bg-white rounded-2xl border border-heritage-border p-12 text-center text-heritage-muted">
            <Award className="h-10 w-10 text-heritage-muted mx-auto mb-3" />
            <h3 className="text-base font-serif font-bold text-heritage-dark">No topper answer copies found</h3>
            <p className="text-xs text-heritage-muted mt-1">Try resetting the paper filter or search query.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {copies.map((copy) => (
              <div
                key={copy.id}
                className="bg-white rounded-2xl border border-heritage-border shadow-xs hover:shadow-md transition-all p-6 flex flex-col justify-between space-y-4 hover:border-heritage-gold group"
              >
                <div className="space-y-3">
                  {/* Top Badges */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-heritage-gold/20 text-heritage-wine border border-heritage-gold/40 text-xs font-bold font-serif">
                      <Award className="w-3.5 h-3.5 text-heritage-gold" />
                      <span>AIR {copy.rank} ({copy.year})</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded-md bg-heritage-cream text-heritage-burgundy text-[11px] font-bold uppercase border border-heritage-border">
                        {copy.paperCode}
                      </span>
                      {copy.scoreMarks && (
                        <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 text-[11px] font-bold border border-emerald-200">
                          {copy.scoreMarks}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Topper Name & Optional */}
                  <div>
                    <h3 className="text-lg font-serif font-black text-heritage-dark group-hover:text-heritage-burgundy transition">
                      {copy.topperName}
                    </h3>
                    {copy.optionalSubject && (
                      <p className="text-xs text-heritage-muted font-medium">
                        Optional: <span className="text-heritage-dark font-semibold">{copy.optionalSubject}</span>
                      </p>
                    )}
                  </div>

                  {/* Title & Description */}
                  <h4 className="text-xs font-serif font-bold text-heritage-dark line-clamp-1">
                    {language === "hi" && copy.titleHi ? copy.titleHi : copy.title}
                  </h4>
                  <p className="text-xs text-heritage-muted leading-relaxed line-clamp-2">
                    {copy.description}
                  </p>

                  {/* Key Takeaways Preview */}
                  {copy.keyTakeaways && (
                    <div className="bg-heritage-ivory rounded-xl p-3 border border-heritage-border text-[11px] text-heritage-dark space-y-1">
                      <div className="font-bold text-heritage-wine flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-heritage-gold" />
                        <span>{language === "hi" ? "प्रमुख संरचना तकनीक" : "Key Scoring Strategy"}</span>
                      </div>
                      <p className="line-clamp-2 text-heritage-muted">
                        {copy.keyTakeaways.split("\n")[0]}
                      </p>
                    </div>
                  )}
                </div>

                {/* Footer Action */}
                <div className="pt-3 border-t border-heritage-border flex items-center justify-between">
                  <button
                    onClick={() => setActiveModalCopy(copy)}
                    className="inline-flex items-center gap-1 text-xs font-bold text-heritage-burgundy hover:text-heritage-wine group-hover:underline"
                  >
                    <span>{language === "hi" ? "गहन विश्लेषण देखें" : "Deconstruct Strategy"}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>

                  <a
                    href="/mains"
                    className="text-[11px] font-bold text-heritage-gold hover:text-heritage-wine hover:underline flex items-center gap-1"
                  >
                    <span>{language === "hi" ? "उत्तर लिखें" : "Write Answer"}</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal for Deconstructed Answer Strategy */}
        {activeModalCopy && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
            <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-heritage-border max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="flex items-start justify-between border-b border-heritage-border pb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2.5 py-0.5 rounded-full bg-heritage-gold/20 text-heritage-wine text-xs font-bold border border-heritage-gold/30">
                      AIR {activeModalCopy.rank} ({activeModalCopy.year})
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-heritage-cream text-heritage-burgundy text-xs font-bold border border-heritage-border">
                      {activeModalCopy.paperCode}
                    </span>
                  </div>
                  <h3 className="text-xl font-serif font-black text-heritage-dark">{activeModalCopy.topperName}</h3>
                  <p className="text-xs text-heritage-muted">
                    {language === "hi" && activeModalCopy.titleHi ? activeModalCopy.titleHi : activeModalCopy.title}
                  </p>
                </div>
                <button
                  onClick={() => setActiveModalCopy(null)}
                  className="w-8 h-8 rounded-full bg-heritage-cream hover:bg-heritage-border flex items-center justify-center text-heritage-muted hover:text-heritage-dark transition font-bold"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Score & Paper Metadata */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3.5 bg-heritage-ivory rounded-xl border border-heritage-border">
                  <div className="text-[11px] font-bold text-heritage-burgundy uppercase tracking-wide">
                    {language === "hi" ? "प्राप्तांक" : "Marks Scored"}
                  </div>
                  <div className="text-lg font-serif font-black text-heritage-dark mt-0.5">
                    {activeModalCopy.scoreMarks || "120+ / 250"}
                  </div>
                </div>

                <div className="p-3.5 bg-heritage-ivory rounded-xl border border-heritage-border">
                  <div className="text-[11px] font-bold text-heritage-gold uppercase tracking-wide">
                    {language === "hi" ? "वैकल्पिक विषय" : "Optional Subject"}
                  </div>
                  <div className="text-lg font-serif font-black text-heritage-dark mt-0.5">
                    {activeModalCopy.optionalSubject || "General Studies"}
                  </div>
                </div>
              </div>

              {/* Annotated Strategy Breakdown */}
              <div className="space-y-3">
                <h4 className="text-sm font-serif font-bold text-heritage-dark flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  <span>{language === "hi" ? "विस्तृत संरचना एवं आरेख टिप्पणियां" : "Annotated Structuring & Diagram Strategy"}</span>
                </h4>
                <div className="bg-heritage-ivory rounded-2xl p-4 border border-heritage-border text-xs text-heritage-dark leading-relaxed whitespace-pre-line font-mono">
                  {activeModalCopy.keyTakeaways}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-heritage-border">
                <button
                  onClick={() => setActiveModalCopy(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-heritage-muted hover:text-heritage-dark hover:bg-heritage-cream transition"
                >
                  {language === "hi" ? "बंद करें" : "Close"}
                </button>

                <a
                  href="/mains"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-heritage-burgundy text-white hover:bg-heritage-wine transition shadow-xs flex items-center gap-1.5"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>{language === "hi" ? "इस प्रारूप में उत्तर लिखें" : "Practice This Format in Mains Studio"}</span>
                </a>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
