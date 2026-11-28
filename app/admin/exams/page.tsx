"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  BookOpen,
  Plus,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  ExternalLink,
  ChevronRight,
  Shield,
  Layers,
  FileText,
} from "lucide-react";

export default function AdminExamsPage() {
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newExam, setNewExam] = useState({
    code: "",
    name: "",
    category: "Civil Services",
    overview: "",
    eligibilityQualifications: "",
    ageLimit: "",
    attemptsAllowed: "",
    stagesDescription: "",
    officialNotificationUrl: "https://www.upsc.gov.in",
    syllabusOverview: "",
  });

  const fetchExams = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/admin/exams");
      const data = await res.json();
      if (res.ok && data.success) {
        setExams(data.data || []);
      } else {
        setMessage({ type: "error", text: data.error || "Failed to load exams" });
      }
    } catch {
      setMessage({ type: "error", text: "Network error fetching exams" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  const handleSyncOfficialTaxonomy = async () => {
    setSyncing(true);
    setMessage(null);
    try {
      const res = await fetch("/api/v1/admin/exams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "SYNC_OFFICIAL_TAXONOMY" }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setMessage({ type: "success", text: data.message });
        fetchExams();
      } else {
        setMessage({ type: "error", text: data.error || "Taxonomy synchronization failed" });
      }
    } catch (e: any) {
      setMessage({ type: "error", text: e.message || "Failed to trigger sync" });
    } finally {
      setSyncing(false);
    }
  };

  const handleCreateCustomExam = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/v1/admin/exams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "CREATE_CUSTOM_EXAM",
          ...newExam,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setMessage({ type: "success", text: data.message });
        setShowAddModal(false);
        setNewExam({
          code: "",
          name: "",
          category: "Civil Services",
          overview: "",
          eligibilityQualifications: "",
          ageLimit: "",
          attemptsAllowed: "",
          stagesDescription: "",
          officialNotificationUrl: "https://www.upsc.gov.in",
          syllabusOverview: "",
        });
        fetchExams();
      } else {
        setMessage({ type: "error", text: data.error || "Failed to create exam" });
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Creation error" });
    }
  };

  return (
    <div className="min-h-screen bg-[#FBF7F0] p-6 lg:p-10 text-[#261B1E]">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Breadcrumb & Navigation */}
        <div className="flex items-center gap-2 text-xs text-[#786B68]">
          <Link href="/admin" className="hover:underline">Admin Console</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="font-semibold text-[#741A2B]">Examination Taxonomy Management</span>
        </div>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E7DDD4] shadow-sm">
          <div>
            <h1 className="text-2xl font-bold font-editorial text-[#261B1E] flex items-center gap-2.5">
              <BookOpen className="w-6 h-6 text-[#741A2B]" />
              Official Examination Taxonomy
            </h1>
            <p className="text-sm text-[#786B68] mt-1">
              Versioned UPSC examination tracks, paper marking schemes, eligibility rules, and syllabus architectures.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleSyncOfficialTaxonomy}
              disabled={syncing}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-[#F4EDE2] hover:bg-[#EAE0D2] text-[#741A2B] border border-[#E7DDD4] transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncing ? "animate-spin" : ""}`} />
              {syncing ? "Synchronizing..." : "Sync Official UPSC Tracks"}
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-[#741A2B] hover:bg-[#5C1422] text-white transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Custom Examination
            </button>
          </div>
        </div>

        {/* Status Message */}
        {message && (
          <div
            className={`p-4 rounded-xl text-sm border flex items-center gap-2.5 ${
              message.type === "success"
                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                : "bg-rose-50 text-rose-800 border-rose-200"
            }`}
          >
            {message.type === "success" ? (
              <CheckCircle className="w-4 h-4 text-emerald-600" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-600" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        {/* Examination Cards Grid */}
        {loading ? (
          <div className="p-12 text-center text-[#786B68]">Loading examination directory...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {exams.map((exam) => (
              <div
                key={exam.id}
                className="bg-white p-5 rounded-2xl border border-[#E7DDD4] shadow-sm flex flex-col justify-between hover:border-[#741A2B]/40 transition-colors"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#741A2B]/10 text-[#741A2B]">
                      {exam.category}
                    </span>
                    <span className="text-xs font-mono font-bold text-[#786B68]">
                      {exam.code}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-[#261B1E] leading-snug">
                      {exam.name}
                    </h3>
                    <p className="text-xs text-[#786B68] line-clamp-3 mt-1.5">
                      {exam.overview || "Official UPSC recruitment track."}
                    </p>
                  </div>
                  <div className="text-xs space-y-1 text-[#786B68] pt-2 border-t border-[#F4EDE2]">
                    <div><strong>Stages:</strong> {exam.stagesDescription || "Prelims -> Mains -> Interview"}</div>
                    <div><strong>Eligibility:</strong> {exam.eligibilityQualifications || "Graduation"}</div>
                    <div><strong>Published Questions:</strong> {exam.publishedQuestionsCount || 0}</div>
                  </div>
                </div>
                <div className="pt-4 flex items-center justify-between text-xs mt-3">
                  <a
                    href={exam.officialNotificationUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[#741A2B] hover:underline font-medium"
                  >
                    Official Portal <ExternalLink className="w-3 h-3" />
                  </a>
                  <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> Active
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white max-w-lg w-full rounded-2xl border border-[#E7DDD4] p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-lg text-[#261B1E]">Add Custom Examination Track</h3>
                <button onClick={() => setShowAddModal(false)} className="text-[#786B68] hover:text-black">✕</button>
              </div>
              <form onSubmit={handleCreateCustomExam} className="space-y-3 text-xs">
                <div>
                  <label className="font-semibold block mb-1">Exam Code (e.g. UPSC_STATE_PCS)</label>
                  <input
                    type="text"
                    required
                    value={newExam.code}
                    onChange={(e) => setNewExam({ ...newExam, code: e.target.value })}
                    className="w-full border rounded-lg p-2 font-mono uppercase"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Full Examination Name</label>
                  <input
                    type="text"
                    required
                    value={newExam.name}
                    onChange={(e) => setNewExam({ ...newExam, name: e.target.value })}
                    className="w-full border rounded-lg p-2"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Category</label>
                  <select
                    value={newExam.category}
                    onChange={(e) => setNewExam({ ...newExam, category: e.target.value })}
                    className="w-full border rounded-lg p-2"
                  >
                    <option value="Civil Services">Civil Services</option>
                    <option value="Defence Services">Defence Services</option>
                    <option value="Engineering Services">Engineering Services</option>
                    <option value="Medical Services">Medical Services</option>
                    <option value="Recruitment & Special">Recruitment & Special</option>
                    <option value="Historical Archive">Historical Archive</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold block mb-1">Overview Description</label>
                  <textarea
                    rows={2}
                    value={newExam.overview}
                    onChange={(e) => setNewExam({ ...newExam, overview: e.target.value })}
                    className="w-full border rounded-lg p-2"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 border rounded-lg text-[#786B68]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#741A2B] text-white rounded-lg font-semibold"
                  >
                    Save Examination Track
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
