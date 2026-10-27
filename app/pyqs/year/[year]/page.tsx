import React from "react";
import { prisma } from "@/lib/prisma";
import { QuestionCard } from "@/components/QuestionCard";
import { Calendar, ArrowLeft } from "lucide-react";

interface YearPageProps {
  params: {
    year: string;
  };
}

export default async function PYQYearPage({ params }: YearPageProps) {
  const year = parseInt(params.year);

  const questions = await prisma.question.findMany({
    where: {
      year,
      status: "PUBLISHED",
    },
    orderBy: [{ paperId: "asc" }, { questionNumber: "asc" }],
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
            <Calendar className="h-7 w-7 text-blue-700" />
            UPSC Civil Services Prelims {year}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Complete question paper archive with official UPSC answer keys and explanations
          </p>
        </div>

        <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-800">
          {formatted.length} Questions
        </span>
      </div>

      {formatted.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500">
          No published questions currently loaded for {year}.
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
