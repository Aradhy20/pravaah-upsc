import React from "react";
import { prisma } from "@/lib/prisma";
import { QuestionCard } from "@/components/QuestionCard";
import { ArrowLeft, Layers } from "lucide-react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface SubjectDetailPageProps {
  params: {
    subject: string;
  };
}

export default async function SubjectDetailPage({ params }: SubjectDetailPageProps) {
  const subjectSlug = params.subject.toLowerCase();

  const subject = await prisma.subject.findFirst({
    where: {
      OR: [{ slug: subjectSlug }, { name: { contains: params.subject } }],
    },
    include: {
      paper: true,
      topics: {
        include: {
          questions: {
            where: { question: { status: "PUBLISHED" } },
            include: {
              question: {
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
              },
            },
          },
        },
      },
    },
  });

  if (!subject) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-slate-800">Subject Not Found</h1>
        <p className="mt-2 text-sm text-slate-500">The requested subject could not be located.</p>
        <a href="/subjects" className="mt-4 inline-block text-xs font-bold text-blue-600 underline">
          Return to Subjects Index
        </a>
      </div>
    );
  }

  // Flatten questions
  const qMap = new Map();
  subject.topics.forEach((t) => {
    t.questions.forEach((qLink) => {
      const q = qLink.question;
      if (!qMap.has(q.id)) {
        qMap.set(q.id, {
          id: q.id,
          year: q.year,
          questionNumber: q.questionNumber,
          paperCode: q.paper.code,
          paperName: q.paper.name,
          questionText: q.questionText,
          difficulty: q.difficulty,
          subject: subject.name,
          topic: t.name,
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
        });
      }
    });
  });

  const questionsList = Array.from(qMap.values());

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <a
            href="/subjects"
            className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline mb-2"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Subjects
          </a>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 flex items-center gap-2">
            <Layers className="h-7 w-7 text-blue-700" />
            {subject.name}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {subject.paper.name} • {questionsList.length} Verified Previous Year Questions
          </p>
        </div>
      </div>

      {/* Topics Pills */}
      <div className="mb-8 rounded-xl border border-slate-200 bg-white p-4">
        <span className="text-xs font-bold uppercase text-slate-400 block mb-2">
          Included Topics:
        </span>
        <div className="flex flex-wrap gap-2">
          {subject.topics.map((t) => (
            <a
              key={t.id}
              href={`/pyqs?subject=${encodeURIComponent(subject.name)}&topic=${encodeURIComponent(t.name)}`}
              className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700 hover:border-blue-300 hover:bg-white hover:text-blue-700 transition"
            >
              {t.name}
            </a>
          ))}
        </div>
      </div>

      {questionsList.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500">
          No questions mapped yet for this subject.
        </div>
      ) : (
        <div className="space-y-6">
          {questionsList.map((q) => (
            <QuestionCard key={q.id} question={q} />
          ))}
        </div>
      )}
    </div>
  );
}
