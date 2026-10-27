import React from "react";
import { prisma } from "@/lib/prisma";
import { Clock, CheckCircle, ShieldAlert, Play, ArrowRight } from "lucide-react";

export default async function MockTestsPage() {
  const tests = await prisma.test.findMany({
    include: {
      paper: true,
      questions: true,
      sessions: {
        where: { status: "COMPLETED" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-8">
        <div className="flex items-center gap-2">
          <Clock className="h-6 w-6 text-blue-700" />
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Timed Examination Simulator
          </h1>
        </div>
        <p className="mt-1 text-sm text-slate-500">
          Strict UPSC examination conditions with standard negative marking and server-side answer key protection
        </p>
      </div>

      {/* UPSC Instructions Notice Card */}
      <div className="mb-8 rounded-2xl border border-blue-200 bg-blue-50/50 p-6">
        <h2 className="text-sm font-bold text-blue-900 uppercase tracking-wider flex items-center gap-1.5">
          <ShieldAlert className="h-4 w-4 text-blue-700" />
          Authentic Examination Protocol
        </h2>
        <ul className="mt-2 space-y-1 text-xs text-blue-950 leading-relaxed">
          <li>
            • <strong>General Studies Paper I:</strong> 100 Questions, 200 Marks, 120 Minutes. Correct answer: +2.0 marks; Incorrect answer: -0.666 marks.
          </li>
          <li>
            • <strong>CSAT Paper II:</strong> 80 Questions, 200 Marks, 120 Minutes. Correct answer: +2.5 marks; Incorrect answer: -0.833 marks. Qualifying score is 33% (66 marks).
          </li>
          <li>
            • <strong>Integrity Safeguard:</strong> Correct answers and explanations are strictly omitted from client payloads until you confirm final submission.
          </li>
        </ul>
      </div>

      {/* Available Tests Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tests.map((test) => {
          const isCSAT = test.paper.code === "GS2";
          return (
            <div
              key={test.id}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span
                    className={`rounded px-2.5 py-1 text-xs font-bold ${
                      isCSAT
                        ? "bg-teal-100 text-teal-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {isCSAT ? "CSAT Paper II" : "GS Paper I"}
                  </span>
                  <span className="text-xs font-semibold text-slate-400">
                    {test.year || 2024}
                  </span>
                </div>

                <h3 className="mt-3 text-lg font-bold text-slate-900 leading-snug">
                  {test.title}
                </h3>

                <p className="mt-2 text-xs text-slate-500 leading-relaxed">
                  {test.description || "Authentic UPSC paper simulation with live timer and scorecard."}
                </p>

                <div className="mt-4 border-t border-slate-100 pt-3 grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="rounded bg-slate-50 p-2">
                    <span className="text-slate-400 text-[10px] block uppercase">Questions</span>
                    <strong className="text-slate-800">{test.questions.length || test.paper.totalQuestions}</strong>
                  </div>
                  <div className="rounded bg-slate-50 p-2">
                    <span className="text-slate-400 text-[10px] block uppercase">Duration</span>
                    <strong className="text-slate-800">{test.paper.durationMinutes}m</strong>
                  </div>
                  <div className="rounded bg-slate-50 p-2">
                    <span className="text-slate-400 text-[10px] block uppercase">Marks</span>
                    <strong className="text-slate-800">200</strong>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100">
                <a
                  href={`/mock-tests/${test.id}`}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-blue-700 transition"
                >
                  <Play className="h-3.5 w-3.5 fill-white" />
                  <span>Start Examination</span>
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
