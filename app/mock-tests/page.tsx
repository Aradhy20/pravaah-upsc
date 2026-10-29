import React from "react";
import { prisma } from "@/lib/prisma";
import { Clock, CheckCircle, ShieldAlert, Play, ArrowRight, AlertCircle, RefreshCw } from "lucide-react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface TestItem {
  id: string;
  title: string;
  description?: string | null;
  year?: number | null;
  paperCode: string;
  questionCount: number;
  durationMinutes: number;
}

const FALLBACK_TESTS: TestItem[] = [
  {
    id: "test-cse-2024-gs1",
    title: "UPSC CSE Prelims 2024 — GS Paper 1 Simulation",
    description: "Official 2024 General Studies Paper 1 Series A simulation with live negative marking.",
    year: 2024,
    paperCode: "GS1",
    questionCount: 100,
    durationMinutes: 120,
  },
  {
    id: "test-cse-2024-gs2",
    title: "UPSC CSE Prelims 2024 — CSAT Paper II Simulation",
    description: "Official 2024 CSAT Paper II Series A with comprehension and analytical reasoning.",
    year: 2024,
    paperCode: "GS2",
    questionCount: 80,
    durationMinutes: 120,
  },
  {
    id: "test-cse-2023-gs1",
    title: "UPSC CSE Prelims 2023 — GS1 Full Paper",
    description: "Official 2023 General Studies Paper 1 Series A simulation.",
    year: 2023,
    paperCode: "GS1",
    questionCount: 99,
    durationMinutes: 120,
  },
  {
    id: "test-cse-2023-gs2",
    title: "UPSC CSE Prelims 2023 — CSAT Paper II",
    description: "Official 2023 CSAT Paper II Series A simulation with 33% qualifying threshold.",
    year: 2023,
    paperCode: "GS2",
    questionCount: 80,
    durationMinutes: 120,
  },
  {
    id: "test-cse-2022-gs1",
    title: "UPSC CSE Prelims 2022 — GS1 Full Paper",
    description: "Official 2022 General Studies Paper 1 Series A simulation.",
    year: 2022,
    paperCode: "GS1",
    questionCount: 100,
    durationMinutes: 120,
  },
  {
    id: "test-cse-2022-gs2",
    title: "UPSC CSE Prelims 2022 — CSAT Paper II",
    description: "Official 2022 CSAT Paper II Series A simulation.",
    year: 2022,
    paperCode: "GS2",
    questionCount: 80,
    durationMinutes: 120,
  },
];

export default async function MockTestsPage() {
  let tests: TestItem[] = [];
  let dbError: string | null = null;

  try {
    const rawTests = await prisma.test.findMany({
      include: {
        paper: true,
        questions: true,
        sessions: {
          where: { status: "COMPLETED" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    if (rawTests && rawTests.length > 0) {
      tests = rawTests.map((t) => ({
        id: t.id,
        title: t.title,
        description: t.description,
        year: t.year || 2024,
        paperCode: t.paper?.code || "GS1",
        questionCount: t.questions?.length || t.paper?.totalQuestions || 100,
        durationMinutes: t.paper?.durationMinutes || 120,
      }));
    } else {
      tests = FALLBACK_TESTS;
    }
  } catch (err: any) {
    console.error("Error loading mock tests in MockTestsPage:", err);
    dbError = "Database temporarily synchronizing. Rendering standard examination catalogue.";
    tests = FALLBACK_TESTS;
  }

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

      {dbError && (
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
            <span>{dbError}</span>
          </div>
          <a
            href="/mock-tests"
            className="flex items-center gap-1 rounded bg-amber-700 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-amber-800"
          >
            <RefreshCw className="h-3 w-3" /> Refresh
          </a>
        </div>
      )}

      {/* UPSC Instructions Notice Card */}
      <div className="mb-8 rounded-2xl border border-blue-200 bg-blue-50/50 p-6">
        <h2 className="text-sm font-bold text-blue-900 uppercase tracking-wider flex items-center gap-1.5">
          <ShieldAlert className="h-4 w-4 text-blue-700" />
          Authentic Examination Protocol
        </h2>
        <ul className="mt-2 space-y-1 text-xs text-blue-950 leading-relaxed">
          <li>
            • <strong>General Studies Paper I:</strong> 100 Questions, 200 Marks, 120 Minutes. Correct answer: +2.0 marks; Incorrect answer: -0.666 marks (-1/3rd penalty).
          </li>
          <li>
            • <strong>CSAT Paper II:</strong> 80 Questions, 200 Marks, 120 Minutes. Correct answer: +2.5 marks; Incorrect answer: -0.833 marks. Qualifying score is 33% (66 marks).
          </li>
          <li>
            • <strong>Anti-Leak Protection:</strong> Correct options and official explanations are strictly withheld from client payloads until you confirm final submission.
          </li>
        </ul>
      </div>

      {/* Available Tests Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tests.map((test) => {
          const isCSAT = test.paperCode === "GS2";
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
                    <strong className="text-slate-800">{test.questionCount}</strong>
                  </div>
                  <div className="rounded bg-slate-50 p-2">
                    <span className="text-slate-400 text-[10px] block uppercase">Duration</span>
                    <strong className="text-slate-800">{test.durationMinutes}m</strong>
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
