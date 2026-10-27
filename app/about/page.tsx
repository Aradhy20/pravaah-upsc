import React from "react";
import { BookOpen, ShieldCheck, Compass, RotateCw } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <div className="text-center mb-10">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-700 text-white shadow-sm mb-4">
          <BookOpen className="h-6 w-6" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
          About Pravaah UPSC
        </h1>
        <p className="mt-2 text-base text-slate-600">
          Concept-driven learning, official UPSC answer-key provenance, and spaced mistake revision.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-6 text-sm text-slate-700 leading-relaxed">
        <div>
          <h2 className="text-lg font-bold text-slate-900 mb-2">Our Mission</h2>
          <p>
            The Union Public Service Commission Civil Services Examination demands more than rote memorization—it tests deep analytical reasoning, conceptual elimination, and constitutional literacy. Too often, aspirants waste valuable study hours cross-referencing contradictory answer keys across commercial coaching books. Pravaah was created to provide a unified, open, reliable learning platform where every single question is linked to its official UPSC source, accompanied by statement-by-statement evidence and textbook citations.
          </p>
        </div>

        <div className="border-t border-slate-100 pt-6">
          <h2 className="text-lg font-bold text-slate-900 mb-2">The Pravaah Triad</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
              <Compass className="h-5 w-5 text-blue-600 mb-2" />
              <strong className="block text-slate-900 text-sm mb-1">1. Discovery</strong>
              <p className="text-xs text-slate-500">
                Filter by Year, Paper, Subject, and Topic to isolate exact questions alongside your syllabus reading.
              </p>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
              <ShieldCheck className="h-5 w-5 text-emerald-600 mb-2" />
              <strong className="block text-slate-900 text-sm mb-1">2. Conceptual Rigor</strong>
              <p className="text-xs text-slate-500">
                Detailed breakdowns demonstrating not just why the right option is correct, but why wrong options fail.
              </p>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
              <RotateCw className="h-5 w-5 text-purple-600 mb-2" />
              <strong className="block text-slate-900 text-sm mb-1">3. Mistake Mastery</strong>
              <p className="text-xs text-slate-500">
                Missed questions are automatically captured in your Revision Queue for spaced re-testing.
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-6">
          <h2 className="text-lg font-bold text-slate-900 mb-2">Content Attribution Policy</h2>
          <p>
            All question texts, official question codes, and final answer keys remain the intellectual property of the Union Public Service Commission (UPSC). Pravaah provides pedagogical commentary, concept mapping, and educational software tools under fair dealing for educational research.
          </p>
        </div>
      </div>
    </div>
  );
}
