"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Languages,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  Save,
  RefreshCw,
  Search,
  Eye,
} from "lucide-react";

export default function AdminTranslationsPage() {
  const [source, setSource] = useState<"staging" | "published">("staging");
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [activeItem, setActiveItem] = useState<any | null>(null);
  const [translationHi, setTranslationHi] = useState("");
  const [optionsHi, setOptionsHi] = useState<{ [code: string]: string }>({
    A: "",
    B: "",
    C: "",
    D: "",
  });
  const [explanationHi, setExplanationHi] = useState("");
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const fetchRecords = async (src = source, p = page) => {
    setLoading(true);
    setStatusMessage(null);
    try {
      const res = await fetch(`/api/v1/admin/translations?source=${src}&page=${p}&limit=10`);
      const data = await res.json();
      if (res.ok && data.success) {
        setRecords(data.data || []);
        setTotal(data.total || 0);
        if (data.data?.length > 0) {
          selectItem(data.data[0]);
        } else {
          setActiveItem(null);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords(source, page);
  }, [source, page]);

  const selectItem = (item: any) => {
    setActiveItem(item);
    setTranslationHi(item.questionTextHi || "");
    setExplanationHi(item.explanationHi || item.explanation?.explanationHi || "");

    const opts: { [code: string]: string } = { A: "", B: "", C: "", D: "" };
    if (item.options && Array.isArray(item.options)) {
      for (const o of item.options) {
        opts[o.optionCode] = o.optionTextHi || "";
      }
    } else if (item.optionsJson) {
      try {
        const parsed = JSON.parse(item.optionsJson);
        for (const o of parsed) {
          opts[o.code] = o.textHi || "";
        }
      } catch {}
    }
    setOptionsHi(opts);
  };

  const handleSave = async () => {
    if (!activeItem) return;
    setSaving(true);
    setStatusMessage(null);
    try {
      const optionsArray = ["A", "B", "C", "D"].map((code) => ({
        code,
        textHi: optionsHi[code] || "",
      }));

      const res = await fetch("/api/v1/admin/translations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source,
          id: activeItem.id,
          questionTextHi: translationHi,
          optionsHi: optionsArray,
          explanationHi,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setStatusMessage("✅ Translation saved and marked as HUMAN_VERIFIED!");
        fetchRecords(source, page);
      } else {
        setStatusMessage(`❌ Error: ${data.error || "Save failed"}`);
      }
    } catch (err: any) {
      setStatusMessage(`❌ Network error: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const getOptionsList = (item: any) => {
    if (item.options && Array.isArray(item.options)) {
      return item.options.map((o: any) => ({ code: o.optionCode, text: o.optionText || o.optionTextEn }));
    }
    if (item.optionsJson) {
      try {
        const parsed = JSON.parse(item.optionsJson);
        return parsed.map((o: any) => ({ code: o.code, text: o.textEn }));
      } catch {}
    }
    return [];
  };

  return (
    <div className="min-h-screen bg-[#FBF7F0] p-6 lg:p-10 text-[#261B1E]">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Navigation */}
        <div className="flex items-center gap-2 text-xs text-[#786B68]">
          <Link href="/admin" className="hover:underline">Admin Console</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="font-semibold text-[#741A2B]">Hindi Translation Review Console</span>
        </div>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E7DDD4] shadow-sm">
          <div>
            <h1 className="text-2xl font-bold font-editorial text-[#261B1E] flex items-center gap-2.5">
              <Languages className="w-6 h-6 text-[#741A2B]" />
              Bilingual Translation Review Console
            </h1>
            <p className="text-sm text-[#786B68] mt-1">
              Review, edit, and certify authentic Devanagari Hindi translations for UPSC questions, options, and explanations.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setSource("staging"); setPage(1); }}
              className={`px-4 py-2 text-xs font-semibold rounded-xl border transition-colors ${
                source === "staging" ? "bg-[#741A2B] text-white border-[#741A2B]" : "bg-white text-[#786B68] border-[#E7DDD4]"
              }`}
            >
              Staging Queue (2,052)
            </button>
            <button
              onClick={() => { setSource("published"); setPage(1); }}
              className={`px-4 py-2 text-xs font-semibold rounded-xl border transition-colors ${
                source === "published" ? "bg-[#741A2B] text-white border-[#741A2B]" : "bg-white text-[#786B68] border-[#E7DDD4]"
              }`}
            >
              Published Bank (121)
            </button>
          </div>
        </div>

        {statusMessage && (
          <div className="p-4 rounded-xl text-sm border bg-white border-[#E7DDD4] shadow-sm">
            {statusMessage}
          </div>
        )}

        {/* Workspace Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Question List Sidebar */}
          <div className="lg:col-span-4 bg-white p-4 rounded-2xl border border-[#E7DDD4] shadow-sm space-y-3 max-h-[750px] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-[#F4EDE2] text-xs font-semibold text-[#786B68]">
              <span>Questions ({total})</span>
              <span>Page {page}</span>
            </div>
            {loading ? (
              <div className="p-6 text-center text-xs text-[#786B68]">Loading queue...</div>
            ) : (
              <div className="space-y-2">
                {records.map((r) => {
                  const isSelected = activeItem?.id === r.id;
                  const hasHindi = !!r.questionTextHi;
                  return (
                    <div
                      key={r.id}
                      onClick={() => selectItem(r)}
                      className={`p-3 rounded-xl border cursor-pointer text-xs transition-colors ${
                        isSelected
                          ? "bg-[#741A2B]/10 border-[#741A2B] text-[#741A2B]"
                          : "border-[#E7DDD4] hover:bg-[#F4EDE2]/50 text-[#261B1E]"
                      }`}
                    >
                      <div className="flex items-center justify-between font-bold">
                        <span>{r.year} · {r.paperCode || "GS1"} · Q{r.questionNumber}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded ${hasHindi ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>
                          {hasHindi ? "Hindi Added" : "Missing"}
                        </span>
                      </div>
                      <p className="line-clamp-2 text-[#786B68] mt-1">
                        {r.questionTextEn || r.questionText}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
            <div className="flex items-center justify-between pt-2 border-t border-[#F4EDE2] text-xs">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="px-3 py-1 border rounded disabled:opacity-40"
              >
                Prev
              </button>
              <button
                onClick={() => setPage(page + 1)}
                className="px-3 py-1 border rounded"
              >
                Next
              </button>
            </div>
          </div>

          {/* Translation Workstation (Side-by-Side) */}
          <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-[#E7DDD4] shadow-sm space-y-6">
            {activeItem ? (
              <>
                <div className="flex items-center justify-between pb-3 border-b border-[#F4EDE2]">
                  <div>
                    <span className="text-xs font-mono font-bold text-[#741A2B] bg-[#741A2B]/10 px-2 py-0.5 rounded">
                      {activeItem.year} · {activeItem.paperCode || "GS1"} · Question #{activeItem.questionNumber}
                    </span>
                    <span className="text-xs text-[#786B68] ml-2">
                      Answer Key: <strong>{activeItem.officialAnswer || "Verified"}</strong>
                    </span>
                  </div>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#741A2B] text-white rounded-xl text-xs font-semibold hover:bg-[#5C1422] transition-colors"
                  >
                    <Save className="w-3.5 h-3.5" />
                    {saving ? "Saving..." : "Save & Verify Translation"}
                  </button>
                </div>

                {/* Stems Comparison */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#786B68] uppercase tracking-wider">
                      English Question Stem
                    </label>
                    <div className="p-3 bg-[#FBF7F0] rounded-xl text-xs leading-relaxed border border-[#E7DDD4] min-h-[120px]">
                      {activeItem.questionTextEn || activeItem.questionText}
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#741A2B] uppercase tracking-wider">
                      Hindi Translation (हिंदी अनुवाद)
                    </label>
                    <textarea
                      rows={5}
                      value={translationHi}
                      onChange={(e) => setTranslationHi(e.target.value)}
                      placeholder="यहां प्रामाणिक हिंदी अनुवाद दर्ज करें..."
                      className="w-full p-3 border border-[#E7DDD4] rounded-xl text-xs font-serif leading-relaxed focus:border-[#741A2B] focus:outline-none min-h-[120px]"
                    />
                  </div>
                </div>

                {/* Options Comparison */}
                <div className="space-y-3 pt-2">
                  <label className="text-xs font-bold text-[#786B68] uppercase tracking-wider block">
                    Options Side-by-Side (विकल्प तुलना)
                  </label>
                  <div className="space-y-2">
                    {getOptionsList(activeItem).map((opt: any) => (
                      <div key={opt.code} className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                        <div className="flex items-center gap-2 p-2 bg-[#FBF7F0] rounded-lg text-xs border border-[#E7DDD4]">
                          <span className="font-bold text-[#741A2B] w-5">{opt.code}.</span>
                          <span className="text-[#261B1E]">{opt.text}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[#741A2B] w-5 text-xs">{opt.code}.</span>
                          <input
                            type="text"
                            value={optionsHi[opt.code] || ""}
                            onChange={(e) => setOptionsHi({ ...optionsHi, [opt.code]: e.target.value })}
                            placeholder={`हिंदी विकल्प (${opt.code})`}
                            className="flex-1 p-2 border border-[#E7DDD4] rounded-lg text-xs font-serif focus:border-[#741A2B] focus:outline-none"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Explanation Comparison */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#786B68] uppercase tracking-wider">
                      English Explanation
                    </label>
                    <div className="p-3 bg-[#FBF7F0] rounded-xl text-xs text-[#786B68] border border-[#E7DDD4] min-h-[80px]">
                      {activeItem.explanationEn || activeItem.explanation?.detailedExplanation || activeItem.explanation?.summary || "Pedagogical explanation."}
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#741A2B] uppercase tracking-wider">
                      Hindi Explanation (हिंदी व्याख्या)
                    </label>
                    <textarea
                      rows={3}
                      value={explanationHi}
                      onChange={(e) => setExplanationHi(e.target.value)}
                      placeholder="हिंदी में व्याख्या एवं निष्कासन तकनीक..."
                      className="w-full p-3 border border-[#E7DDD4] rounded-xl text-xs font-serif focus:border-[#741A2B] focus:outline-none min-h-[80px]"
                    />
                  </div>
                </div>
              </>
            ) : (
              <div className="p-12 text-center text-sm text-[#786B68]">
                Select a question from the queue on the left to review its translation.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
