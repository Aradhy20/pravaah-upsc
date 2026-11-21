"use client";

import React, { useState, useEffect } from "react";
import { useLanguage } from "@/lib/i18n/context";
import {
  Video,
  Play,
  Clock,
  BookOpen,
  User,
  Search,
  Filter,
  ArrowRight,
  ExternalLink,
  Sparkles,
  CheckCircle2,
} from "lucide-react";

interface VideoLesson {
  id: string;
  title: string;
  titleHi?: string | null;
  description?: string | null;
  descriptionHi?: string | null;
  youtubeUrl: string;
  youtubeId: string;
  durationMinutes: number;
  paperCode: string;
  subject: string;
  topic: string;
  facultyName?: string | null;
  orderIndex: number;
  isFree: boolean;
}

export default function VideoAcademyPage() {
  const { language, t } = useLanguage();
  const [videos, setVideos] = useState<VideoLesson[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<VideoLesson | null>(null);
  const [selectedPaper, setSelectedPaper] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadVideos() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (selectedPaper !== "ALL") params.set("paperCode", selectedPaper);
        if (searchQuery.trim()) params.set("q", searchQuery.trim());

        const res = await fetch(`/api/v1/videos?${params.toString()}`);
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          setVideos(data.data);
          if (data.data.length > 0 && !selectedVideo) {
            setSelectedVideo(data.data[0]);
          }
        }
      } catch (err) {
        console.error("Error loading video lessons:", err);
      } finally {
        setLoading(false);
      }
    }
    loadVideos();
  }, [selectedPaper, searchQuery]);

  const papers = [
    { code: "ALL", label: language === "hi" ? "सभी विषय" : "All Papers" },
    { code: "GS1", label: "GS 1 (History/Geo/Society)" },
    { code: "GS2", label: "GS 2 (Polity/Governance/IR)" },
    { code: "GS3", label: "GS 3 (Economy/Sci-Tech/Env)" },
    { code: "GS4", label: "GS 4 (Ethics & Case Studies)" },
    { code: "CSAT", label: "CSAT Paper II" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Hero */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-8 sm:p-10 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-200 text-xs font-bold border border-blue-400/30">
              <Video className="w-3.5 h-3.5 text-blue-300" />
              <span>{language === "hi" ? "प्रामाणिक दृश्य अधिगम" : "Curated Video Academy"}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
              {language === "hi" ? "UPSC उच्च-संभाव्य वीडियो अकादमी" : "UPSC High-Yield Video Academy"}
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              {language === "hi"
                ? "अनुभवी शिक्षकों एवं पूर्व प्रशासनिक अधिकारियों द्वारा तैयार किए गए उच्च-संभाव्य सूक्ष्म व्याख्यान। अवधारणा समझें और तुरंत संबंधित विगत वर्ष प्रश्नों का अभ्यास करें।"
                : "Master critical civil services concepts with structured, high-yield lectures from senior faculties and retired civil servants. Learn the concept, then solve linked PYQs."}
            </p>
          </div>
          <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 bg-radial from-blue-400 to-transparent pointer-events-none" />
        </div>

        {/* Filters & Search Bar */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
          {/* Paper Tabs */}
          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            {papers.map((p) => (
              <button
                key={p.code}
                onClick={() => setSelectedPaper(p.code)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  selectedPaper === p.code
                    ? "bg-blue-700 text-white shadow-sm ring-2 ring-blue-700/20"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={language === "hi" ? "व्याख्यान खोजें..." : "Search lectures..."}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition"
            />
          </div>
        </div>

        {/* Video Player & Playlist Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Player Screen (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            {selectedVideo ? (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                {/* 16:9 YouTube Embed */}
                <div className="relative pb-[56.25%] h-0 bg-slate-900">
                  <iframe
                    className="absolute top-0 left-0 w-full h-full"
                    src={`https://www.youtube.com/embed/${selectedVideo.youtubeId}?autoplay=0&rel=0`}
                    title={selectedVideo.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>

                {/* Video Meta & Details */}
                <div className="p-6 space-y-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-1 rounded-md bg-blue-100 text-blue-800 text-xs font-black">
                      {selectedVideo.paperCode}
                    </span>
                    <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-bold">
                      {selectedVideo.subject}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs text-slate-500 font-medium ml-auto">
                      <Clock className="w-3.5 h-3.5" />
                      {selectedVideo.durationMinutes} mins
                    </span>
                  </div>

                  <h2 className="text-xl font-black text-slate-900">
                    {language === "hi" && selectedVideo.titleHi ? selectedVideo.titleHi : selectedVideo.title}
                  </h2>

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {language === "hi" && selectedVideo.descriptionHi
                      ? selectedVideo.descriptionHi
                      : selectedVideo.description}
                  </p>

                  <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                        <User className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900">{selectedVideo.facultyName}</div>
                        <div className="text-[11px] text-slate-400">
                          {selectedVideo.topic}
                        </div>
                      </div>
                    </div>

                    {/* Action: Practice Related PYQs */}
                    <a
                      href={`/pyqs?search=${encodeURIComponent(selectedVideo.topic)}`}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-700 text-white text-xs font-bold hover:bg-blue-800 transition shadow-xs"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>{language === "hi" ? "संबद्ध PYQs हल करें" : "Solve Related PYQs"}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500">
                <Video className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p>{language === "hi" ? "कोई व्याख्यान नहीं मिला।" : "No video lecture selected."}</p>
              </div>
            )}
          </div>

          {/* Playlist Sidebar (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                {language === "hi" ? "पाठ्यक्रम व्याख्यान सूची" : "Curriculum Playlist"} ({videos.length})
              </h3>
              <span className="text-xs text-blue-700 font-bold">
                {language === "hi" ? "निःशुल्क अधिगम" : "Free Access"}
              </span>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-20 bg-slate-200 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[640px] overflow-y-auto pr-1">
                {videos.map((vid) => {
                  const isCurrent = selectedVideo?.id === vid.id;
                  return (
                    <div
                      key={vid.id}
                      onClick={() => setSelectedVideo(vid)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer flex gap-3.5 items-start ${
                        isCurrent
                          ? "bg-blue-50/80 border-blue-400 ring-1 ring-blue-500/20 shadow-xs"
                          : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/60"
                      }`}
                    >
                      <div
                        className={`w-9 h-9 rounded-lg shrink-0 flex items-center justify-center ${
                          isCurrent ? "bg-blue-700 text-white" : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        <Play className="w-4 h-4 fill-current ml-0.5" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-200/80 text-slate-700">
                            {vid.paperCode}
                          </span>
                          <span className="text-[11px] text-slate-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {vid.durationMinutes}m
                          </span>
                        </div>
                        <h4
                          className={`text-xs font-bold leading-snug line-clamp-2 ${
                            isCurrent ? "text-blue-900" : "text-slate-800"
                          }`}
                        >
                          {language === "hi" && vid.titleHi ? vid.titleHi : vid.title}
                        </h4>
                        <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                          {vid.facultyName} • {vid.subject}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
