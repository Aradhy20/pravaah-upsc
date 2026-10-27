import React from "react";
import { prisma } from "@/lib/prisma";
import { QuestionCard } from "@/components/QuestionCard";
import { ArrowLeft, BookOpen } from "lucide-react";

interface DirectPaperPageProps {
  params: {
    year: string;
    paper: string;
  };
}

export default async function DirectPaperPage({ params }: DirectPaperPageProps) {
  const year = parseInt(params.year);
  const paperSlug = params.paper.toLowerCase();
  const paperCode = paperSlug.includes("2") || paperSlug.includes("csat") ? "GS2" : "GS1";

  const questions = await prisma.question.findMany({
    where: {
      year,
      paper: { code: paperCode },
      status: "PUBLISHED",
    },
    orderBy: { questionNumber: "asc" },
    include: {
      paper: true,
      options: { orderBy: { optionCode: "asc" } },
      explanation: true,
      topics: {
        include: {
          topic: { include: { subject: true } },
        },
      },
    },
  });

  const formatted = questions.map((q) => ({
    id: q.id,
    year: q.year,
    questionNumber: q.questionNumber,
    paperCode: q.paper.code,
    paperName: q.paper.name,
    questionText: q.questionText,
    difficulty: q.difficulty,
    subject: q.topics[0]?.topic?.subject?.name || "General Studies",
    topic: q.topics[0]?.topic?.name || "Concept",
    options: q.options.map((o) => ({
      code: o.optionCode,
      text: o.optionText,
      isCorrect: o.isCorrect,
    })),
    correctOption: q.options.find((o) => o.isCorrect)?.optionCode || "A",
    explanation: q.explanation
      ? {
          summary: q.explanation.summary,
          detailedExplanation: q.explanation.detailedExplanation,
          eliminationTechnique: q.explanation.eliminationTechnique,
          sourceCitation: q.explanation.sourceCitation,
          relatedConcept: q.explanation.relatedConcept,
        }
      : null,
  }));

  const paperTitle = paperCode === "GS2" ? "GS Paper II (CSAT)" : "GS Paper I";

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <a
            href="/pyqs"
            className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline mb-2"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Explorer
          </a>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 flex items-center gap-2">
            <BookOpen className="h-7 w-7 text-blue-700" />
            UPSC {year} — {paperTitle}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Official series question bank with solutions and topic breakdown
          </p>
        </div>

        <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-800">
          {formatted.length} Questions
        </span>
      </div>

      {formatted.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500">
          No questions found for {paperTitle} in {year}.
        </div>
      ) : (
        <div className="space-y-6">
          {formatted.map((q) => (
            <QuestionCard key={q.id} question={q} />
          ))}
        </div>
      )}
    </div>
  );
}
