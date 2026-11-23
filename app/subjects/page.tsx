import React from "react";
import { prisma } from "@/lib/prisma";
import { Layers, ArrowRight, BookOpen, CheckCircle } from "lucide-react";
import { getFallbackSubjects } from "@/lib/data-fallback";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function SubjectsPage() {
  let subjects: any[] = [];

  try {
    const dbSubjects = await prisma.orm.public.Subject
      .include("paper")
      .include("topics", (topics) =>
        topics.include("questions", (questions) =>
          questions.where((ql) => ql.question.status.eq("PUBLISHED")),
        ),
      )
      .orderBy((s) => s.name.asc())
      .all();

    if (dbSubjects && dbSubjects.length > 0) {
      subjects = dbSubjects;
    } else {
      subjects = getFallbackSubjects();
    }
  } catch (err) {
    console.warn("Using fallback subjects in /subjects:", err);
    subjects = getFallbackSubjects();
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-8">
        <div className="flex items-center gap-2">
          <Layers className="h-6 w-6 text-blue-700" />
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Subject & Topic Directory
          </h1>
        </div>
        <p className="mt-1 text-sm text-slate-500">
          UPSC syllabus organized into rigorous subject silos with verified PYQ question links
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {subjects.map((s) => {
          let totalSubjectQs = 0;
          (s.topics || []).forEach((t: any) => {
            totalSubjectQs += (t.questions || []).length;
          });

          const paperCode = s.paper?.code || "GS1";

          return (
            <div
              key={s.id}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span
                    className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                      paperCode === "GS2"
                        ? "bg-teal-100 text-teal-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {paperCode === "GS2" ? "CSAT Paper II" : "GS Paper I"}
                  </span>
                  <span className="text-xs font-semibold text-slate-400">
                    {totalSubjectQs} PYQs
                  </span>
                </div>

                <h2 className="mt-3 text-lg font-bold text-slate-900">{s.name}</h2>

                {/* Sub-Topics List */}
                <div className="mt-4 space-y-1.5 border-t border-slate-100 pt-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Syllabus Topics:
                  </span>
                  <ul className="space-y-1 text-xs text-slate-600">
                    {(s.topics || []).slice(0, 4).map((t: any) => (
                      <li key={t.id} className="flex items-center justify-between">
                        <a
                          href={`/prelims/pyqs?subject=${encodeURIComponent(s.name)}&topic=${encodeURIComponent(t.name)}`}
                          className="hover:text-blue-600 transition truncate max-w-[200px]"
                        >
                          • {t.name}
                        </a>
                        <span className="text-slate-400 text-[10px]">
                          {(t.questions || []).length} Qs
                        </span>
                      </li>
                    ))}
                    {(s.topics || []).length > 4 && (
                      <li className="text-[11px] text-slate-400 italic">
                        +{s.topics.length - 4} more topics
                      </li>
                    )}
                  </ul>
                </div>
              </div>

              <div className="mt-6 pt-3 border-t border-slate-100">
                <a
                  href={`/subjects/${s.slug}`}
                  className="flex items-center justify-between text-xs font-bold text-blue-600 hover:text-blue-800 transition"
                >
                  <span>Explore Subject PYQs</span>
                  <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
