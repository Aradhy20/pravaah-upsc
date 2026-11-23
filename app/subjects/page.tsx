import React from "react";
import { prisma } from "@/lib/prisma";
import { Layers, ArrowRight, BookOpen, CheckCircle } from "lucide-react";
import { getFallbackSubjects } from "@/lib/data-fallback";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function SubjectsPage() {
  let subjects: any[] = [];

  try {
    const dbSubjects = await prisma.subject.findMany({
      include: {
        paper: true,
        topics: {
          include: {
            questions: {
              where: {
                question: { status: "PUBLISHED" },
              },
            },
          },
        },
      },
      orderBy: { name: "asc" },
    });

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
    <div className="min-h-screen bg-heritage-ivory flex flex-col font-sans text-heritage-dark">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="mb-8">
          <div className="flex items-center gap-2">
            <Layers className="h-6 w-6 text-heritage-burgundy" />
            <h1 className="text-2xl sm:text-3xl font-serif font-black text-heritage-dark">
              Subject & Topic Directory
            </h1>
          </div>
          <p className="mt-1 text-sm text-heritage-muted">
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
                className="rounded-2xl border border-heritage-border bg-white p-6 shadow-xs hover:border-heritage-gold hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span
                      className={`rounded px-2.5 py-0.5 text-[10px] font-bold ${
                        paperCode === "GS2"
                          ? "bg-heritage-cream text-heritage-burgundy border border-heritage-border"
                          : "bg-heritage-gold/20 text-heritage-wine border border-heritage-gold/30"
                      }`}
                    >
                      {paperCode === "GS2" ? "CSAT Paper II" : "GS Paper I"}
                    </span>
                    <span className="text-xs font-semibold text-heritage-muted font-mono">
                      {totalSubjectQs} PYQs
                    </span>
                  </div>

                  <h2 className="mt-3 text-lg font-serif font-bold text-heritage-dark">{s.name}</h2>

                  {/* Sub-Topics List */}
                  <div className="mt-4 space-y-1.5 border-t border-heritage-border pt-3">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-heritage-muted">
                      Syllabus Topics:
                    </span>
                    <ul className="space-y-1 text-xs text-heritage-muted">
                      {(s.topics || []).slice(0, 4).map((t: any) => (
                        <li key={t.id} className="flex items-center justify-between">
                          <a
                            href={`/prelims/pyqs?subject=${encodeURIComponent(s.name)}&topic=${encodeURIComponent(t.name)}`}
                            className="hover:text-heritage-burgundy transition truncate max-w-[200px]"
                          >
                            • {t.name}
                          </a>
                          <span className="text-heritage-muted text-[10px] font-mono">
                            {(t.questions || []).length} Qs
                          </span>
                        </li>
                      ))}
                      {(s.topics || []).length > 4 && (
                        <li className="text-[11px] text-heritage-muted italic">
                          +{s.topics.length - 4} more topics
                        </li>
                      )}
                    </ul>
                  </div>
                </div>

                <div className="mt-6 pt-3 border-t border-heritage-border">
                  <a
                    href={`/subjects/${s.slug}`}
                    className="flex items-center justify-between text-xs font-bold text-heritage-burgundy hover:text-heritage-wine transition"
                  >
                    <span>Explore Subject PYQs</span>
                    <ArrowRight className="h-4 w-4" />
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
