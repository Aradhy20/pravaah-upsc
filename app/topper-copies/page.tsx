"use client";

import React, { useState, useEffect } from "react";
import { useLanguage } from "@/lib/i18n/context";
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
  const { language, t } = useLanguage();
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
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Hero Banner */}
        <div className="bg-gradient-to-r from-amber-900 via-stone-900 to-slate-900 rounded-3xl p-8 sm:p-10 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-200 text-xs font-bold border border-amber-400/30">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span>{language === "hi" ? "टॉपर्स उत्तर विश्लेषण" : "Topper Answer Intelligence"}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
              {language === "hi" ? "UPSC टॉपर्स उत्तर पुस्तिका ज्ञानकोष" : "UPSC Topper Answer Copy Archive"}
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              {language === "hi"
                ? "अखिल भारतीय रैंक (AIR) 1, 2 एवं शीर्ष चयनित अभ्यर्थियों की वास्तविक उत्तर प्रतियों का विखंडन। जानें कि उच्च अंक प्राप्त करने हेतु आरेख, प्रवाह-चित्र और संवैधानिक अनुच्छेदों का संयोजन कैसे किया जाता है।"
                : "Deconstruct real answer scripts of All India Rank (AIR) 1, 2, and top rankers. Master how to frame subheadings, introduce flowcharts, and cite committee reports under strict exam constraints."}
            </p>
          </div>
          <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 bg-radial from-amber-400 to-transparent pointer-events-none" />
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            {papers.map((p) => (
              <button
                key={p.code}
                onClick={() => setSelectedPaper(p.code)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  selectedPaper === p.code
                    ? "bg-amber-700 text-white shadow-sm ring-2 ring-amber-700/20"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={language === "hi" ? "टॉपर अथवा विषय खोजें..." : "Search topper or theme..."}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-600 focus:bg-white transition"
            />
          </div>
        </div>

        {/* Topper Cards Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 bg-slate-200 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {copies.map((copy) => (
              <div
                key={copy.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all p-6 flex flex-col justify-between space-y-4 hover:border-amber-300 group"
              >
                <div className="space-y-3">
                  {/* Top Badges */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-black">
                      <Award className="w-3.5 h-3.5 text-amber-600" />
                      <span>AIR {copy.rank} ({copy.year})</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-800 text-[11px] font-black uppercase">
                        {copy.paperCode}
                      </span>
                      {copy.scoreMarks && (
                        <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 text-[11px] font-bold">
                          {copy.scoreMarks}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Topper Name & Optional */}
                  <div>
                    <h3 className="text-lg font-black text-slate-900 group-hover:text-amber-800 transition">
                      {copy.topperName}
                    </h3>
                    {copy.optionalSubject && (
                      <p className="text-xs text-slate-400 font-medium">
                        Optional: <span className="text-slate-600">{copy.optionalSubject}</span>
                      </p>
                    )}
                  </div>

                  {/* Title & Description */}
                  <h4 className="text-xs font-bold text-slate-800 line-clamp-1">
                    {language === "hi" && copy.titleHi ? copy.titleHi : copy.title}
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                    {copy.description}
                  </p>

                  {/* Key Takeaways Preview */}
                  {copy.keyTakeaways && (
                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 text-[11px] text-slate-700 space-y-1">
                      <div className="font-bold text-slate-900 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-amber-600" />
                        <span>{language === "hi" ? "प्रमुख संरचना तकनीक" : "Key Scoring Strategy"}</span>
                      </div>
                      <p className="line-clamp-2 text-slate-600">
                        {copy.keyTakeaways.split("\n")[0]}
                      </p>
                    </div>
                  )}
                </div>

                {/* Footer Action */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => setActiveModalCopy(copy)}
                    className="inline-flex items-center gap-1 text-xs font-bold text-amber-800 hover:text-amber-900 group-hover:underline"
                  >
                    <span>{language === "hi" ? "गहन विश्लेषण देखें" : "Deconstruct Strategy"}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>

                  <a
                    href="/mains"
                    className="text-[11px] font-bold text-blue-700 hover:underline flex items-center gap-1"
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
            <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-xs font-black">
                      AIR {activeModalCopy.rank} ({activeModalCopy.year})
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-900 text-xs font-black">
                      {activeModalCopy.paperCode}
                    </span>
                  </div>
                  <h3 className="text-xl font-black text-slate-900">{activeModalCopy.topperName}</h3>
                  <p className="text-xs text-slate-500">
                    {language === "hi" && activeModalCopy.titleHi ? activeModalCopy.titleHi : activeModalCopy.title}
                  </p>
                </div>
                <button
                  onClick={() => setActiveModalCopy(null)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 font-bold"
                >
                  ✕
                </button>
              </div>

              {/* Score & Paper Metadata */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3.5 bg-amber-50/60 rounded-xl border border-amber-200">
                  <div className="text-[11px] font-bold text-amber-800 uppercase tracking-wide">
                    {language === "hi" ? "प्राप्तांक" : "Marks Scored"}
                  </div>
                  <div className="text-lg font-black text-amber-950 mt-0.5">
                    {activeModalCopy.scoreMarks || "120+ / 250"}
                  </div>
                </div>

                <div className="p-3.5 bg-blue-50/60 rounded-xl border border-blue-200">
                  <div className="text-[11px] font-bold text-blue-800 uppercase tracking-wide">
                    {language === "hi" ? "वैकल्पिक विषय" : "Optional Subject"}
                  </div>
                  <div className="text-lg font-black text-blue-950 mt-0.5">
                    {activeModalCopy.optionalSubject || "General Studies"}
                  </div>
                </div>
              </div>

              {/* Annotated Strategy Breakdown */}
              <div className="space-y-3">
                <h4 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  <span>{language === "hi" ? "विस्तृत संरचना एवं आरेख टिप्पणियां" : "Annotated Structuring & Diagram Strategy"}</span>
                </h4>
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-xs text-slate-800 leading-relaxed whitespace-pre-line font-mono">
                  {activeModalCopy.keyTakeaways}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  onClick={() => setActiveModalCopy(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
                >
                  {language === "hi" ? "बंद करें" : "Close"}
                </button>

                <a
                  href="/mains"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-amber-700 text-white hover:bg-amber-800 transition shadow-xs flex items-center gap-1.5"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>{language === "hi" ? "इस प्रारूप में उत्तर लिखें" : "Practice This Format in Mains Studio"}</span>
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
