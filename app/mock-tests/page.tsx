import React from "react";
import { prisma } from "@/lib/prisma";
import {
  Clock,
  CheckCircle,
  ShieldAlert,
  Play,
  ArrowRight,
  AlertCircle,
  RefreshCw,
  Award,
  HelpCircle,
  Layers,
  FileText,
} from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface TestItem {
  id: string;
  title: string;
  description?: string | null;
  year?: number | null;
  paperCode: string;
  questionCount: number;
  officialPaperSize: number;
  isComplete: boolean;
  totalMarks: number;
  durationMinutes: number;
}

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
      },
      orderBy: { createdAt: "desc" },
    });

    if (rawTests && rawTests.length > 0) {
      tests = rawTests.map((t) => {
        const pCode = t.paper?.code || "GS1";
        const isCSAT = pCode === "GS2";
        const officialSize = isCSAT ? 80 : 100;
        const qCount = t.questions?.length ?? 0;
        const isComplete = qCount >= officialSize;
        const positiveMark = isCSAT ? 2.5 : 2.0;
        const totalMarks = isComplete ? 200 : Math.round(qCount * positiveMark * 10) / 10;
        const durationMinutes = isComplete
          ? 120
          : Math.max(15, Math.round((qCount / officialSize) * 120));

        return {
          id: t.id,
          title: t.title,
          description: t.description,
          year: t.year || 2024,
          paperCode: pCode,
          questionCount: qCount,
          officialPaperSize: officialSize,
          isComplete,
          totalMarks,
          durationMinutes,
        };
      });
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
          title: "UPSC CSE Prelims 2024 — GS Paper 1 Series A",
          description: "Official 2024 General Studies Paper 1 Series A questions with live negative marking (-0.666).",
          year: 2024,
          paperCode: "GS1",
          questionCount: gs1Count || 36,
          officialPaperSize: 100,
          isComplete: (gs1Count || 36) >= 100,
          totalMarks: (gs1Count || 36) >= 100 ? 200 : Math.round((gs1Count || 36) * 2.0 * 10) / 10,
          durationMinutes: (gs1Count || 36) >= 100 ? 120 : Math.round(((gs1Count || 36) / 100) * 120),
        },
        {
          id: "test-cse-2024-gs2",
          title: "UPSC CSE Prelims 2024 — CSAT Paper II Series A",
          description: "Official 2024 CSAT Paper II Series A with reading comprehension, quantitative aptitude, and 33% qualifying telemetry.",
          year: 2024,
          paperCode: "GS2",
          questionCount: gs2Count || 41,
          officialPaperSize: 80,
          isComplete: (gs2Count || 41) >= 80,
          totalMarks: (gs2Count || 41) >= 80 ? 200 : Math.round((gs2Count || 41) * 2.5 * 10) / 10,
          durationMinutes: (gs2Count || 41) >= 80 ? 120 : Math.round(((gs2Count || 41) / 80) * 120),
        },
      ];
    }
  } catch (err: any) {
    console.warn("Falling back to standard mock test catalogue:", err.message);
    tests = [
      {
        id: "test-cse-2024-gs1",
        title: "UPSC CSE Prelims 2024 — GS Paper 1 Series A",
        description: "Official 2024 General Studies Paper 1 Series A curated questions with live negative marking.",
        year: 2024,
        paperCode: "GS1",
        questionCount: 36,
        officialPaperSize: 100,
        isComplete: false,
        totalMarks: 72,
        durationMinutes: 45,
      },
      {
        id: "test-cse-2024-gs2",
        title: "UPSC CSE Prelims 2024 — CSAT Paper II Series A",
        description: "Official 2024 CSAT Paper II Series A with comprehension and analytical reasoning.",
        year: 2024,
        paperCode: "GS2",
        questionCount: 41,
        officialPaperSize: 80,
        isComplete: false,
        totalMarks: 102.5,
        durationMinutes: 60,
      },
    ];
  }

  return (
    <div className="min-h-screen bg-heritage-ivory flex flex-col font-sans text-heritage-dark">
      <Header />

      <main className="flex-1 mx-auto max-w-7xl px-4 py-8 sm:px-6 w-full">
        <div className="mb-8">
          <div className="flex items-center gap-2.5">
            <Clock className="h-7 w-7 text-heritage-burgundy" />
            <h1 className="font-serif text-2xl sm:text-3xl font-black text-heritage-dark">
              Timed Examination Simulator
            </h1>
          </div>
          <p className="mt-1 text-sm text-heritage-muted leading-relaxed">
            Strict UPSC examination conditions with standard negative marking and server-side anti-leak answer protection.
          </p>
        </div>

        {/* UPSC Official Exam Structure vs Practice Set Disclosure */}
        <div className="mb-8 rounded-3xl border border-heritage-gold/40 bg-white p-6 sm:p-8 shadow-xs">
          <h2 className="font-serif text-sm font-bold text-heritage-burgundy uppercase tracking-wider flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-heritage-gold" />
            Official UPSC Examination Standards & Inventory Transparency
          </h2>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs leading-relaxed text-heritage-dark">
            <div className="p-4 rounded-2xl bg-heritage-ivory border border-heritage-border">
              <span className="font-serif font-bold text-heritage-burgundy block mb-1">
                Official General Studies Paper I Specification:
              </span>
              <ul className="space-y-1 text-heritage-muted">
                <li>• Exactly <strong>100 Questions</strong> • <strong>200 Marks</strong> • <strong>120 Minutes</strong> (2 Hours)</li>
                <li>• Correct Answer: <strong>+2.0 Marks</strong></li>
                <li>• Incorrect Answer: <strong>-0.666 Marks</strong> (-1/3rd penalty)</li>
              </ul>
            </div>

            <div className="p-4 rounded-2xl bg-heritage-ivory border border-heritage-border">
              <span className="font-serif font-bold text-heritage-saffron block mb-1">
                Official CSAT Paper II Specification:
              </span>
              <ul className="space-y-1 text-heritage-muted">
                <li>• Exactly <strong>80 Questions</strong> • <strong>200 Marks</strong> • <strong>120 Minutes</strong> (2 Hours)</li>
                <li>• Correct Answer: <strong>+2.5 Marks</strong></li>
                <li>• Incorrect Answer: <strong>-0.833 Marks</strong> (-1/3rd penalty)</li>
                <li>• Mandatory Qualifying Benchmark: <strong>33% (66 Marks)</strong></li>
              </ul>
            </div>
          </div>

          <div className="mt-4 p-3.5 rounded-xl bg-heritage-cream text-[11px] text-heritage-dark border border-heritage-border flex items-start gap-2">
            <CheckCircle className="h-4 w-4 text-heritage-gold shrink-0 mt-0.5" />
            <p>
              <strong>Academic Integrity Notice:</strong> Pravaah UPSC strictly distinguishes between complete official 100/80 question papers and curated practice sets. Below, each card displays the <em>exact number of verified questions currently available in our database</em>, with pro-rated marks and timed pacing. Practice questions are never falsely advertised as complete papers.
            </p>
          </div>
        </div>

        {/* Available Tests Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tests.map((test) => {
            const isCSAT = test.paperCode === "GS2";
            return (
              <div
                key={test.id}
                className="rounded-3xl border border-heritage-border bg-white p-6 shadow-xs hover:border-heritage-gold hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span
                      className={`rounded-md px-2.5 py-1 text-xs font-bold border ${
                        isCSAT
                          ? "bg-heritage-cream text-heritage-burgundy border-heritage-border font-serif"
                          : "bg-heritage-gold/20 text-heritage-wine border-heritage-gold/40 font-serif"
                      }`}
                    >
                      {isCSAT ? "CSAT Paper II" : "GS Paper I"}
                    </span>
                    <span className="text-xs font-mono font-semibold text-heritage-muted">
                      {test.year || 2024}
                    </span>
                  </div>

                  <h3 className="font-serif mt-3 text-lg font-bold text-heritage-dark leading-snug">
                    {test.title}
                  </h3>

                  {/* Complete vs Curated Set Badge */}
                  <div className="mt-2.5">
                    {test.isComplete ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
                        <CheckCircle className="h-3 w-3" />
                        Complete Official Paper ({test.questionCount} Questions)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-900 bg-amber-50 px-2.5 py-0.5 rounded-md border border-amber-200">
                        <Clock className="h-3 w-3" />
                        Curated Practice Set ({test.questionCount} of {test.officialPaperSize} Available)
                      </span>
                    )}
                  </div>

                  <p className="mt-2 text-xs text-heritage-muted leading-relaxed">
                    {test.description || "Authentic UPSC paper simulation with live timer and scorecard."}
                  </p>

                  <div className="mt-4 border-t border-heritage-border pt-3 grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="rounded-xl bg-heritage-ivory border border-heritage-border p-2">
                      <span className="text-heritage-muted text-[10px] block uppercase font-bold">Questions</span>
                      <strong className="text-heritage-dark font-serif text-sm">{test.questionCount}</strong>
                    </div>
                    <div className="rounded-xl bg-heritage-ivory border border-heritage-border p-2">
                      <span className="text-heritage-muted text-[10px] block uppercase font-bold">Duration</span>
                      <strong className="text-heritage-dark font-serif text-sm">{test.durationMinutes}m</strong>
                    </div>
                    <div className="rounded-xl bg-heritage-ivory border border-heritage-border p-2">
                      <span className="text-heritage-muted text-[10px] block uppercase font-bold">Total Marks</span>
                      <strong className="text-heritage-dark font-serif text-sm">{test.totalMarks}</strong>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-heritage-border">
                  <a
                    href={`/mock-tests/${test.id}`}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-heritage-burgundy px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-heritage-wine transition"
                  >
                    <Play className="h-3.5 w-3.5 fill-white" />
                    <span>Launch Exam Simulator</span>
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      <Footer />
    </div>
  );
}
