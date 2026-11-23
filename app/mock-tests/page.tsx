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
    description: "Official 2024 General Studies Paper 1 Series A questions with live negative marking.",
    year: 2024,
    paperCode: "GS1",
    questionCount: 36,
    durationMinutes: 60,
  },
  {
    id: "test-cse-2024-gs2",
    title: "UPSC CSE Prelims 2024 — CSAT Paper II Simulation",
    description: "Official 2024 CSAT Paper II Series A with comprehension and analytical reasoning.",
    year: 2024,
    paperCode: "GS2",
    questionCount: 41,
    durationMinutes: 60,
  },
  {
    id: "test-cse-2023-gs1",
    title: "UPSC CSE Prelims 2023 — GS1 Curated Test",
    description: "Official 2023 General Studies Paper 1 Series A curated questions.",
    year: 2023,
    paperCode: "GS1",
    questionCount: 5,
    durationMinutes: 15,
  },
];

export default async function MockTestsPage() {
  let tests: TestItem[] = [];

  try {
    const rawTests = await prisma.test.findMany({
      where: {
        questions: { some: {} },
      },
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
        questionCount: t.questions?.length ?? 0,
        durationMinutes: t.paper?.durationMinutes || 60,
      }));
    } else {
      const gs1Count = await prisma.question.count({
        where: { year: 2024, paper: { code: "GS1" }, status: "PUBLISHED" },
      });
      const gs2Count = await prisma.question.count({
        where: { year: 2024, paper: { code: "GS2" }, status: "PUBLISHED" },
      });

      tests = [
        {
          id: "test-cse-2024-gs1",
          title: "UPSC CSE Prelims 2024 — GS Paper 1 Simulation",
          description: "Official 2024 General Studies Paper 1 Series A questions with live negative marking.",
          year: 2024,
          paperCode: "GS1",
          questionCount: gs1Count || 36,
          durationMinutes: 60,
        },
        {
          id: "test-cse-2024-gs2",
          title: "UPSC CSE Prelims 2024 — CSAT Paper II Simulation",
          description: "Official 2024 CSAT Paper II Series A with comprehension and analytical reasoning.",
          year: 2024,
          paperCode: "GS2",
          questionCount: gs2Count || 41,
          durationMinutes: 60,
        },
      ];
    }
  } catch (err: any) {
    console.warn("Falling back to standard mock test catalogue:", err.message);
    tests = FALLBACK_TESTS;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-8">
        <div className="flex items-center gap-2.5">
          <Clock className="h-6 w-6 text-heritage-burgundy" />
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-heritage-text">
            Timed Examination Simulator
          </h1>
        </div>
        <p className="mt-1 text-sm text-heritage-secondary">
          Strict UPSC examination conditions with standard negative marking and server-side anti-leak answer protection
        </p>
      </div>

      {/* UPSC Instructions Notice Card */}
      <div className="mb-8 rounded-2xl border border-heritage-gold/40 bg-heritage-ivory p-6 shadow-card">
        <h2 className="font-serif text-sm font-bold text-heritage-burgundy uppercase tracking-wider flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 text-heritage-gold" />
          Authentic Examination Protocol
        </h2>
        <ul className="mt-2.5 space-y-1.5 text-xs text-heritage-text leading-relaxed">
          <li>
            • <strong className="text-heritage-burgundy">General Studies Paper I:</strong> 100 Questions, 200 Marks, 120 Minutes. Correct answer: +2.0 marks; Incorrect answer: -0.666 marks (-1/3rd penalty).
          </li>
          <li>
            • <strong className="text-heritage-saffron">CSAT Paper II:</strong> 80 Questions, 200 Marks, 120 Minutes. Correct answer: +2.5 marks; Incorrect answer: -0.833 marks. Qualifying score is 33% (66 marks).
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
              className="rounded-2xl border border-heritage-border bg-white p-6 shadow-card hover:shadow-hover transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span
                    className={`rounded-md px-2.5 py-1 text-xs font-bold border ${
                      isCSAT
                        ? "bg-heritage-saffron/10 text-heritage-saffron border-heritage-saffron/30"
                        : "bg-heritage-burgundy/10 text-heritage-burgundy border-heritage-burgundy/30"
                    }`}
                  >
                    {isCSAT ? "CSAT Paper II" : "GS Paper I"}
                  </span>
                  <span className="text-xs font-semibold text-heritage-secondary">
                    {test.year || 2024}
                  </span>
                </div>

                <h3 className="font-serif mt-3 text-lg font-bold text-heritage-text leading-snug">
                  {test.title}
                </h3>

                <p className="mt-2 text-xs text-heritage-secondary leading-relaxed">
                  {test.description || "Authentic UPSC paper simulation with live timer and scorecard."}
                </p>

                <div className="mt-4 border-t border-heritage-border/60 pt-3 grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="rounded-xl bg-heritage-ivory border border-heritage-border p-2">
                    <span className="text-heritage-secondary text-[10px] block uppercase font-bold">Questions</span>
                    <strong className="text-heritage-text font-serif text-sm">{test.questionCount}</strong>
                  </div>
                  <div className="rounded-xl bg-heritage-ivory border border-heritage-border p-2">
                    <span className="text-heritage-secondary text-[10px] block uppercase font-bold">Duration</span>
                    <strong className="text-heritage-text font-serif text-sm">{test.durationMinutes}m</strong>
                  </div>
                  <div className="rounded-xl bg-heritage-ivory border border-heritage-border p-2">
                    <span className="text-heritage-secondary text-[10px] block uppercase font-bold">Marks</span>
                    <strong className="text-heritage-text font-serif text-sm">200</strong>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-heritage-border/60">
                <a
                  href={`/mock-tests/${test.id}`}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-heritage-burgundy px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-heritage-wine transition"
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
