"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ShieldCheck,
  Calendar,
  ExternalLink,
  ArrowLeft,
  GraduationCap,
  Users,
  Award,
  BookOpen,
  Layers,
  CheckCircle,
  AlertCircle,
  FileText,
} from "lucide-react";

export default function ExamDetailPage() {
  const params = useParams();
  const code = (params?.code as string)?.toUpperCase();
  const [exam, setExam] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchExam() {
      if (!code) return;
      try {
        const res = await fetch(`/api/v1/exams/${code}`);
        const data = await res.json();
        if (data.success) {
          setExam(data.exam);
        }
      } catch (e) {
        console.error("Failed to fetch exam:", e);
      } finally {
        setLoading(false);
      }
    }
    fetchExam();
  }, [code]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-sm text-slate-500">Loading examination profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        <div className="flex-1 max-w-2xl mx-auto px-4 py-16 text-center">
          <AlertCircle className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-slate-900">Exam Not Found</h1>
          <p className="text-sm text-slate-500 mt-2">
            The requested examination code does not exist in our directory.
          </p>
          <Link
            href="/exams"
            className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Exam Directory
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Back Link */}
        <Link
          href="/exams"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-700 transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to All UPSC Examinations
        </Link>

        {/* Hero Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm mb-8">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-md text-xs font-black bg-blue-100 text-blue-800">
                UPSC {exam.code}
              </span>
              <span className="px-3 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-700">
                {exam.category}
              </span>
            </div>
            {exam.officialNotificationUrl && (
              <a
                href={exam.officialNotificationUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 hover:underline"
              >
                Official UPSC Notice
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {exam.name}
          </h1>

          <p className="mt-3 text-sm text-slate-700 leading-relaxed">
            {exam.overview}
          </p>

          <div className="mt-6 pt-6 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="text-slate-400 block font-medium">Conducting Body</span>
              <span className="text-sm font-bold text-slate-800">{exam.conductingBody}</span>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="text-slate-400 block font-medium">Typical Vacancies</span>
              <span className="text-sm font-bold text-slate-800">{exam.totalVacanciesTypical || "Varies by requisition"}</span>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="text-slate-400 block font-medium">Exam Timeline</span>
              <span className="text-sm font-bold text-slate-800">{exam.examCycleDates || "Annual Cycle"}</span>
            </div>
          </div>
        </div>

        {/* Eligibility & Criteria Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Qualifications & Age */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-blue-600" />
              Eligibility & Age Criteria
            </h2>

            <div className="space-y-4 text-xs leading-relaxed">
              <div>
                <span className="font-bold text-slate-800 block mb-1">Educational Qualification:</span>
                <p className="text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
                  {exam.eligibilityQualifications}
                </p>
              </div>

              <div>
                <span className="font-bold text-slate-800 block mb-1">Age Limits & Relaxations:</span>
                <p className="text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
                  {exam.ageLimit}
                </p>
              </div>

              <div>
                <span className="font-bold text-slate-800 block mb-1">Permissible Attempts:</span>
                <p className="text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
                  {exam.attemptsAllowed}
                </p>
              </div>
            </div>
          </div>

          {/* Examination Stages & Scheme */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Layers className="h-5 w-5 text-indigo-600" />
              Stages & Marking Scheme
            </h2>

            <div className="space-y-4 text-xs leading-relaxed">
              <div>
                <span className="font-bold text-slate-800 block mb-1">Stage Progression:</span>
                <p className="text-slate-600 bg-indigo-50/50 p-3 rounded-lg border border-indigo-100/60 font-medium">
                  {exam.stagesDescription}
                </p>
              </div>

              <div>
                <span className="font-bold text-slate-800 block mb-1">Syllabus Overview:</span>
                <p className="text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
                  {exam.syllabusOverview}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Banner: Practice PYQs */}
        <div className="bg-gradient-to-r from-blue-700 to-indigo-800 rounded-2xl p-6 sm:p-8 text-white shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold">Practice Official Previous Year Papers</h3>
            <p className="text-xs text-blue-100 mt-1">
              Explore authentic UPSC questions, filter by subject, and learn with verified answer keys.
            </p>
          </div>
          <Link
            href="/pyqs"
            className="px-5 py-2.5 rounded-lg bg-white text-blue-800 text-xs font-bold hover:bg-blue-50 transition-colors shadow shrink-0"
          >
            Open PYQ Explorer
          </Link>
        </div>
      </main>
    </div>
  );
}
