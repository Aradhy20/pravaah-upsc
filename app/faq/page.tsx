import React from "react";
import { HelpCircle } from "lucide-react";

export default function FAQPage() {
  const faqs = [
    {
      q: "Where do the answer keys come from?",
      a: "All answer keys displayed on Pravaah are mapped directly to official answer keys released by the Union Public Service Commission (UPSC) following the completion of each examination recruitment cycle. We explicitly distinguish verified official keys from provisional keys.",
    },
    {
      q: "How does the negative marking scheme work?",
      a: "In General Studies Paper I, each question carries 2 marks and has a negative deduction of 0.666 marks (1/3rd penalty). In CSAT (GS Paper II), each question carries 2.5 marks with a negative deduction of 0.833 marks (1/3rd penalty).",
    },
    {
      q: "What is the difference between Learn Mode and Exam Mode?",
      a: "Learn Mode gives you instant feedback and detailed pedagogical explanations as soon as you pick an option. Exam Mode simulates the actual UPSC timed paper: you have a strict 2-hour countdown timer, a question palette, and correct answers are hidden until you finalize submission.",
    },
    {
      q: "How does the Mistake Revision Queue work?",
      a: "Whenever you answer a question incorrectly in Learn Mode or during a timed mock test, that question is automatically scheduled in your Revision Queue. You can revisit it after 24 hours to re-attempt and confirm conceptual retention.",
    },
    {
      q: "Is Pravaah free to use?",
      a: "Yes. All verified question browsing, subject drills, timed papers, bookmarks, notes, and revision queues are completely open and accessible without forced paywalls.",
    },
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-extrabold text-slate-900">
          Frequently Asked Questions
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Everything you need to know about Pravaah UPSC and our learning methodologies
        </p>
      </div>

      <div className="space-y-4">
        {faqs.map((f, i) => (
          <div
            key={i}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span className="text-blue-600">Q.</span> {f.q}
            </h2>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed pl-5">
              {f.a}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
