"use client";

import React, { useState } from "react";
import {
  Sparkles,
  X,
  Send,
  Loader2,
  BookOpen,
  CheckCircle,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  Compass,
} from "lucide-react";

interface AILearningAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AILearningAssistantModal({ isOpen, onClose }: AILearningAssistantModalProps) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSearch = async (textToSearch?: string) => {
    const q = textToSearch || query;
    if (!q.trim() || loading) return;

    try {
      setLoading(true);
      setError(null);
      setResponse(null);

      const res = await fetch("/api/v1/ai/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q }),
      });

      const json = await res.json();
      if (json.success) {
        setResponse(json.data);
      } else {
        setError(json.error?.message || "Failed to process concept query.");
      }
    } catch (e: any) {
      setError(e.message || "Network error while contacting RAG engine.");
    } finally {
      setLoading(false);
    }
  };

  const samplePrompts = [
    "Attorney General powers and parliamentary rights",
    "Biosphere Reserves in UNESCO WNBR list",
    "Monetary Policy Committee constitution and mandate",
    "Fundamental Rights under Article 21",
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-blue-900 to-indigo-900 px-6 py-4 text-white">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-white backdrop-blur-md">
              <Sparkles className="h-5 w-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold tracking-tight">Pravaah UPSC Grounded AI Engine</h2>
                <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300 border border-emerald-400/30">
                  Zero Hallucination
                </span>
              </div>
              <p className="text-xs text-blue-200">
                Grounded strictly in verified UPSC PYQs (1995–2024) & NCERT curriculum
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-blue-200 hover:bg-white/10 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Quick Prompts */}
          {!response && !loading && (
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Suggested High-Yield Concepts:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {samplePrompts.map((p, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setQuery(p);
                      handleSearch(p);
                    }}
                    className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/70 p-3 text-left text-xs font-semibold text-slate-700 hover:border-blue-300 hover:bg-blue-50/50 hover:text-blue-900 transition"
                  >
                    <Compass className="h-4 w-4 shrink-0 text-blue-600" />
                    <span className="truncate">{p}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Loading Indicator */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-12 text-center text-slate-500">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-3" />
              <p className="text-sm font-bold text-slate-800">Retrieving Grounded UPSC Records...</p>
              <p className="text-xs text-slate-400 mt-1">Cross-referencing 1,123 questions, official master keys, and NCERT textbooks</p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-800 flex items-start gap-2.5">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
              <div>
                <span className="font-bold">Error:</span> {error}
              </div>
            </div>
          )}

          {/* RAG Response Result */}
          {response && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Grounding Confidence Pill */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 border border-blue-200">
                  <ShieldCheck className="h-3.5 w-3.5 text-blue-600" />
                  Grounding Confidence: {Math.round(response.groundingConfidence * 100)}%
                </span>
                <span className="text-xs text-slate-400">
                  {response.retrievalCount} verified records retrieved
                </span>
              </div>

              {/* Formatted Markdown Body */}
              <div className="prose prose-sm max-w-none text-slate-800 leading-relaxed whitespace-pre-line bg-slate-50/60 p-4 rounded-xl border border-slate-200">
                {response.answer}
              </div>

              {/* Citations Footer */}
              {response.citations && response.citations.length > 0 && (
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-3.5 text-xs text-slate-600 space-y-1.5">
                  <span className="font-bold text-slate-800 flex items-center gap-1">
                    <ExternalLink className="h-3.5 w-3.5 text-blue-600" />
                    Official Primary Citations:
                  </span>
                  <ul className="list-disc pl-5 space-y-1 text-[11px]">
                    {response.citations.map((c: any, i: number) => (
                      <li key={i}>
                        <a
                          href={c.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-700 hover:underline font-semibold"
                        >
                          {c.sourceName}
                        </a>
                        {" "}&mdash; {c.referenceDetail}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Input Footer */}
        <div className="border-t border-slate-100 bg-slate-50/50 p-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask any UPSC concept, syllabus node, or PYQ topic..."
              className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs"
            />
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="inline-flex items-center gap-1.5 rounded-xl bg-blue-700 hover:bg-blue-800 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition disabled:opacity-50"
            >
              <Send className="h-3.5 w-3.5" />
              <span>Search</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
