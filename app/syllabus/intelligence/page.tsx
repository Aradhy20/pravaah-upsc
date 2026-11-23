"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Compass,
  CheckCircle,
  BookOpen,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Search,
  Filter,
  Check,
  RotateCw,
  HelpCircle,
  Layers,
  ChevronDown,
  ChevronRight,
  Bookmark,
  ExternalLink,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/context";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export default function SyllabusIntelligencePage() {
  const { t, language } = useLanguage();
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPaper, setSelectedPaper] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [expandedTopicId, setExpandedTopicId] = useState<string | null>(null);
  const [updatingTopicId, setUpdatingTopicId] = useState<string | null>(null);

  const fetchTree = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/syllabus/intelligence");
      const json = await res.json();
      if (json.success) {
        setData(json.data);
      }
    } catch (err) {
      console.error("Failed to fetch syllabus intelligence tree:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTree();
  }, []);

  const handleUpdateStatus = async (topicId: string, status: string) => {
    setUpdatingTopicId(topicId);
    try {
      const res = await fetch("/api/v1/syllabus/intelligence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topicId, status }),
      });
      const json = await res.json();
      if (json.success) {
        // Optimistically update local data
        setData((prev: any) => {
          if (!prev) return prev;
          const newSubjects = prev.subjects.map((sub: any) => ({
            ...sub,
            topics: sub.topics.map((top: any) => {
              if (top.id === topicId) {
                return { ...top, userStatus: status };
              }
              return top;
            }),
          }));

          // Recalculate summary
          const allT = newSubjects.flatMap((s: any) => s.topics);
          const masteredCount = allT.filter((t: any) => t.userStatus === "MASTERED").length;
          return {
            ...prev,
            summary: {
              ...prev.summary,
              masteredCount,
              overallPercentage: Number(((masteredCount / Math.max(1, allT.length)) * 100).toFixed(1)),
            },
            subjects: newSubjects,
          };
        });
      }
    } catch (err) {
      console.error("Failed to update topic status:", err);
    } finally {
      setUpdatingTopicId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F9FC] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-[#2453E6]" />
          <p className="mt-3 text-sm font-semibold text-[#475467]">
            {language === "hi"
              ? "पाठ्यक्रम इंटेलिजेंस मानचित्र लोड हो रहा है..."
              : "Loading UPSC Syllabus Intelligence Tree..."}
          </p>
        </div>
      </div>
    );
  }

  const d = data || {};
  const summary = d.summary || {};
  const subjects = d.subjects || [];

  // Filter subjects and topics
  const filteredSubjects = subjects
    .filter((s: any) => selectedPaper === "ALL" || s.paperCode === selectedPaper)
    .map((s: any) => {
      const filteredTopics = s.topics.filter((t: any) => {
        const matchesSearch =
          t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus =
          selectedStatus === "ALL" ||
          (selectedStatus === "MASTERED" && t.userStatus === "MASTERED") ||
          (selectedStatus === "IN_PROGRESS" &&
            (t.userStatus === "LEARNING" || t.userStatus === "PRACTISED")) ||
          (selectedStatus === "NEEDS_REVISION" && t.userStatus === "NEEDS_REVISION") ||
          (selectedStatus === "NOT_STARTED" && t.userStatus === "NOT_STARTED");
        return matchesSearch && matchesStatus;
      });
      return { ...s, topics: filteredTopics };
    })
    .filter((s: any) => s.topics.length > 0);

  const learningSteps = [
    { name: "Read", icon: BookOpen, color: "text-blue-600 bg-blue-50" },
    { name: "Understand", icon: Sparkles, color: "text-purple-600 bg-purple-50" },
    { name: "Practice", icon: Compass, color: "text-indigo-600 bg-indigo-50" },
    { name: "Revise", icon: RotateCw, color: "text-amber-600 bg-amber-50" },
    { name: "Test", icon: ShieldCheck, color: "text-rose-600 bg-rose-50" },
    { name: "Master", icon: CheckCircle, color: "text-emerald-600 bg-emerald-50" },
  ];

  return (
    <div className="min-h-screen bg-[#F7F9FC] font-sans text-[#101828]">
      {/* Top Banner */}
      <div className="border-b border-[#E4E7EC] bg-white">
        <div className="mx-auto max-w-[1280px] px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-[11px] font-black uppercase text-[#2453E6]">
                  UPSC CSE Syllabus Intelligence
                </span>
                <span className="text-xs text-[#667085]">• 3-Tier Micro-Node Map</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-[#101828] mt-1 tracking-tight">
                {language === "hi"
                  ? "पाठ्यक्रम इंटेलिजेंस एवं दक्षता मानचित्र"
                  : "UPSC Syllabus Intelligence Map"}
              </h1>
              <p className="text-sm text-[#475467] mt-1 max-w-2xl">
                {language === "hi"
                  ? "परीक्षा चरण → प्रश्नपत्र → विषय → माइक्रो-टॉपिक → NCERT एवं प्रामाणिक संदर्भ। वास्तविक समझ को ट्रैक करें।"
                  : "Hierarchical roadmap connecting every micro-topic to official syllabus clauses, NCERT chapters, standard books, and verified past year questions."}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <LanguageSwitcher />
              <Link
                href="/mission-control"
                className="rounded-xl border border-[#E4E7EC] bg-white px-4 py-2 text-xs font-bold text-[#475467] hover:bg-[#F7F9FC] transition shadow-xs"
              >
                {language === "hi" ? "मिशन कंट्रोल →" : "Mission Control →"}
              </Link>
            </div>
          </div>

          {/* Visual Learning Path Banner */}
          <div className="mt-6 rounded-2xl bg-[#F7F9FC] border border-[#E4E7EC] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <span className="text-xs font-bold text-[#101828] shrink-0">
              {language === "hi" ? "सत्यापित सीखने का मार्ग:" : "The Proven Mastery Path:"}
            </span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {learningSteps.map((step, idx) => {
                const Icon = step.icon;
                return (
                  <React.Fragment key={idx}>
                    <div className="flex items-center gap-1 rounded-lg bg-white border border-[#E4E7EC] px-2.5 py-1 text-xs font-semibold text-[#101828] shadow-2xs">
                      <Icon className="h-3.5 w-3.5 text-[#2453E6]" />
                      <span>{step.name}</span>
                    </div>
                    {idx < learningSteps.length - 1 && (
                      <ChevronRight className="h-3 w-3 text-[#98A2B3] shrink-0" />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1280px] px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        {/* Overall Progress Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="rounded-2xl bg-white border border-[#E4E7EC] p-4 text-center shadow-xs">
            <p className="text-2xl font-black text-[#101828]">{summary.totalTopics || 0}</p>
            <p className="text-[11px] font-bold uppercase text-[#667085] mt-0.5">Total Micro-Topics</p>
          </div>
          <div className="rounded-2xl bg-white border border-emerald-200 p-4 text-center shadow-xs">
            <p className="text-2xl font-black text-emerald-700">{summary.masteredCount || 0}</p>
            <p className="text-[11px] font-bold uppercase text-emerald-800 mt-0.5">Mastered</p>
          </div>
          <div className="rounded-2xl bg-white border border-blue-200 p-4 text-center shadow-xs">
            <p className="text-2xl font-black text-[#2453E6]">{summary.learningCount || 0}</p>
            <p className="text-[11px] font-bold uppercase text-blue-800 mt-0.5">Learning</p>
          </div>
          <div className="rounded-2xl bg-white border border-amber-200 p-4 text-center shadow-xs">
            <p className="text-2xl font-black text-amber-700">{summary.needsRevisionCount || 0}</p>
            <p className="text-[11px] font-bold uppercase text-amber-800 mt-0.5">Needs Revision</p>
          </div>
          <div className="col-span-2 sm:col-span-1 rounded-2xl bg-white border border-[#E4E7EC] p-4 text-center shadow-xs">
            <p className="text-2xl font-black text-[#101828]">{summary.overallPercentage || 0}%</p>
            <p className="text-[11px] font-bold uppercase text-[#667085] mt-0.5">Syllabus Mastered</p>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white rounded-2xl border border-[#E4E7EC] p-3 shadow-xs">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#98A2B3]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={language === "hi" ? "टॉपिक या विषय खोजें..." : "Search topics, subjects, articles..."}
              className="w-full rounded-xl border border-[#E4E7EC] bg-[#F7F9FC] pl-9 pr-3 py-2 text-xs font-medium text-[#101828] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2453E6]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            {/* Paper Filter */}
            <div className="flex items-center gap-1 rounded-xl bg-[#F7F9FC] border border-[#E4E7EC] p-1 text-xs font-bold">
              {["ALL", "GS1", "GS2"].map((p) => (
                <button
                  key={p}
                  onClick={() => setSelectedPaper(p)}
                  className={`px-3 py-1 rounded-lg transition ${
                    selectedPaper === p
                      ? "bg-white text-[#2453E6] shadow-xs"
                      : "text-[#475467] hover:text-[#101828]"
                  }`}
                >
                  {p === "ALL" ? "All Papers" : p}
                </button>
              ))}
            </div>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="rounded-xl border border-[#E4E7EC] bg-[#F7F9FC] px-3 py-1.5 text-xs font-bold text-[#475467] focus:outline-none focus:ring-2 focus:ring-[#2453E6]"
            >
              <option value="ALL">All Statuses</option>
              <option value="MASTERED">Mastered</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="NEEDS_REVISION">Needs Revision</option>
              <option value="NOT_STARTED">Not Started</option>
            </select>
          </div>
        </div>

        {/* Subjects & Topics Tree */}
        <div className="space-y-6">
          {filteredSubjects.map((sub: any) => (
            <div key={sub.id} className="rounded-3xl border border-[#E4E7EC] bg-white p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E4E7EC] gap-2">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-[#2453E6] font-black text-xs">
                    {sub.paperCode}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#101828]">{sub.name}</h3>
                    <p className="text-[11px] text-[#667085]">
                      {sub.topics.length} micro-topics • {sub.masteredCount} mastered
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#667085]">
                    {Math.round((sub.masteredCount / Math.max(1, sub.topicsCount)) * 100)}% Mastered
                  </span>
                  <div className="w-24 bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-[#2453E6] h-full rounded-full"
                      style={{
                        width: `${Math.round((sub.masteredCount / Math.max(1, sub.topicsCount)) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Topics Grid */}
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                {sub.topics.map((topic: any) => {
                  const isExpanded = expandedTopicId === topic.id;
                  const res = topic.learningResources;

                  let statusBadge = "bg-slate-100 text-slate-700 border-slate-200";
                  if (topic.userStatus === "MASTERED") statusBadge = "bg-emerald-50 text-emerald-800 border-emerald-200";
                  else if (topic.userStatus === "LEARNING") statusBadge = "bg-blue-50 text-blue-800 border-blue-200";
                  else if (topic.userStatus === "PRACTISED") statusBadge = "bg-indigo-50 text-indigo-800 border-indigo-200";
                  else if (topic.userStatus === "NEEDS_REVISION") statusBadge = "bg-amber-50 text-amber-800 border-amber-200";

                  return (
                    <div
                      key={topic.id}
                      className="rounded-2xl border border-[#E4E7EC] bg-[#F7F9FC] p-4 flex flex-col justify-between hover:border-slate-300 transition"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-sm font-bold text-[#101828]">{topic.name}</h4>
                          <span className={`rounded-md border px-2 py-0.5 text-[10px] font-extrabold uppercase shrink-0 ${statusBadge}`}>
                            {topic.userStatus.replace("_", " ")}
                          </span>
                        </div>

                        {topic.subtopics.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {topic.subtopics.map((st: any) => (
                              <span key={st.id} className="rounded bg-white px-2 py-0.5 text-[10px] text-[#475467] border border-[#E4E7EC]">
                                {st.name}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Expandable Resource Details */}
                      {isExpanded && (
                        <div className="mt-4 pt-4 border-t border-[#E4E7EC] space-y-2 text-xs text-[#475467]">
                          <div>
                            <span className="font-bold text-[#101828]">NCERT Chapter:</span> {res.ncert}
                          </div>
                          <div>
                            <span className="font-bold text-[#101828]">Standard Text:</span> {res.standardBook}
                          </div>
                          <div>
                            <span className="font-bold text-[#101828]">Mains Dimension:</span> {res.mainsTheme}
                          </div>
                        </div>
                      )}

                      {/* Action Bar */}
                      <div className="mt-4 pt-3 border-t border-[#E4E7EC] flex flex-wrap items-center justify-between gap-2">
                        {/* Status Toggle Buttons */}
                        <div className="flex items-center gap-1">
                          <button
                            disabled={updatingTopicId === topic.id}
                            onClick={() => handleUpdateStatus(topic.id, "LEARNING")}
                            className={`rounded-lg px-2 py-1 text-[10px] font-bold border transition ${
                              topic.userStatus === "LEARNING"
                                ? "bg-blue-600 text-white border-blue-600"
                                : "bg-white text-[#475467] border-[#E4E7EC] hover:bg-slate-50"
                            }`}
                          >
                            Learning
                          </button>
                          <button
                            disabled={updatingTopicId === topic.id}
                            onClick={() => handleUpdateStatus(topic.id, "NEEDS_REVISION")}
                            className={`rounded-lg px-2 py-1 text-[10px] font-bold border transition ${
                              topic.userStatus === "NEEDS_REVISION"
                                ? "bg-amber-600 text-white border-amber-600"
                                : "bg-white text-[#475467] border-[#E4E7EC] hover:bg-slate-50"
                            }`}
                          >
                            Revision
                          </button>
                          <button
                            disabled={updatingTopicId === topic.id}
                            onClick={() => handleUpdateStatus(topic.id, "MASTERED")}
                            className={`rounded-lg px-2 py-1 text-[10px] font-bold border transition ${
                              topic.userStatus === "MASTERED"
                                ? "bg-emerald-600 text-white border-emerald-600"
                                : "bg-white text-[#475467] border-[#E4E7EC] hover:bg-slate-50"
                            }`}
                          >
                            Mastered
                          </button>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setExpandedTopicId(isExpanded ? null : topic.id)}
                            className="text-[11px] font-bold text-[#667085] hover:text-[#101828]"
                          >
                            {isExpanded ? "Hide Details" : "Resources"}
                          </button>
                          <Link
                            href={`/pyqs?q=${encodeURIComponent(topic.name)}`}
                            className="rounded-lg bg-white border border-[#E4E7EC] px-2.5 py-1 text-[11px] font-bold text-[#2453E6] hover:bg-blue-50 transition"
                          >
                            Practice PYQs ({topic.pyqCount})
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
