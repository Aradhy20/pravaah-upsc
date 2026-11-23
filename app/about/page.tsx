import React from "react";
import { BookOpen, ShieldCheck, Compass, RotateCw } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-heritage-ivory flex flex-col font-sans text-heritage-dark">
      <Header />

      <main className="flex-1 mx-auto max-w-4xl px-4 py-12 sm:px-6 w-full">
        <div className="text-center mb-10">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-heritage-burgundy text-white shadow-sm mb-4 border border-heritage-gold/30">
            <BookOpen className="h-6 w-6 text-heritage-gold" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-black text-heritage-dark">
            About Pravaah UPSC
          </h1>
          <p className="mt-2 text-base text-heritage-muted">
            Concept-driven learning, official UPSC answer-key provenance, and spaced mistake revision.
          </p>
        </div>

        <div className="rounded-2xl border border-heritage-border bg-white p-6 sm:p-8 shadow-xs space-y-6 text-sm text-heritage-dark leading-relaxed">
          <div>
            <h2 className="text-lg font-serif font-bold text-heritage-wine mb-2">Our Mission</h2>
            <p className="text-heritage-muted leading-relaxed">
              The Union Public Service Commission Civil Services Examination demands more than rote memorization—it tests deep analytical reasoning, conceptual elimination, and constitutional literacy. Too often, aspirants waste valuable study hours cross-referencing contradictory answer keys across commercial coaching books. Pravaah was created to provide a unified, open, reliable learning platform where every single question is linked to its official UPSC source, accompanied by statement-by-statement evidence and textbook citations.
            </p>
          </div>

          <div className="border-t border-heritage-border pt-6">
            <h2 className="text-lg font-serif font-bold text-heritage-wine mb-2">The Pravaah Triad</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
              <div className="rounded-xl border border-heritage-border bg-heritage-ivory p-4">
                <Compass className="h-5 w-5 text-heritage-burgundy mb-2" />
                <strong className="block text-heritage-dark text-sm mb-1 font-serif">1. Discovery</strong>
                <p className="text-xs text-heritage-muted">
                  Filter by Year, Paper, Subject, and Topic to isolate exact questions alongside your syllabus reading.
                </p>
              </div>
              <div className="rounded-xl border border-heritage-border bg-heritage-ivory p-4">
                <ShieldCheck className="h-5 w-5 text-heritage-gold mb-2" />
                <strong className="block text-heritage-dark text-sm mb-1 font-serif">2. Conceptual Rigor</strong>
                <p className="text-xs text-heritage-muted">
                  Detailed breakdowns demonstrating not just why the right option is correct, but why wrong options fail.
                </p>
              </div>
              <div className="rounded-xl border border-heritage-border bg-heritage-ivory p-4">
                <RotateCw className="h-5 w-5 text-heritage-wine mb-2" />
                <strong className="block text-heritage-dark text-sm mb-1 font-serif">3. Mistake Mastery</strong>
                <p className="text-xs text-heritage-muted">
                  Missed questions are automatically captured in your Revision Queue for spaced re-testing.
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-heritage-border pt-6">
            <h2 className="text-lg font-serif font-bold text-heritage-wine mb-2">Content Attribution Policy</h2>
            <p className="text-heritage-muted leading-relaxed">
              All question texts, official question codes, and final answer keys remain the intellectual property of the Union Public Service Commission (UPSC). Pravaah provides pedagogical commentary, concept mapping, and educational software tools under fair dealing for educational research.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
