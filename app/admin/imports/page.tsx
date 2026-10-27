"use client";

import React, { useState } from "react";
import { ArrowLeft, UploadCloud, CheckCircle, AlertCircle, FileCode } from "lucide-react";

export default function AdminImportsPage() {
  const [paperCode, setPaperCode] = useState("GS1");
  const [year, setYear] = useState(2024);
  const [jsonInput, setJsonInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  const sampleJSON = `[
  {
    "questionNumber": 7,
    "questionText": "With reference to the Indian economy, what is the purpose of 'Open Market Operations' conducted by the RBI?",
    "difficulty": "EASY",
    "options": [
      { "code": "A", "text": "Issuing foreign exchange to commercial banks", "isCorrect": false },
      { "code": "B", "text": "Purchase and sale of Government securities by the Central Bank", "isCorrect": true },
      { "code": "C", "text": "Auditing the balance sheets of Non-Banking Financial Companies", "isCorrect": false },
      { "code": "D", "text": "Regulating foreign institutional investors", "isCorrect": false }
    ],
    "explanation": {
      "summary": "Open Market Operations (OMO) refer to the sale and purchase of government securities by the RBI in the open market to adjust rupee liquidity conditions.",
      "detailed": "Under Section 17 of the RBI Act, OMO is a major quantitative monetary policy tool.",
      "source": "RBI Monetary Management Manual"
    }
  }
]`;

  const sampleCSV = `questionNumber,questionText,optionA,optionB,optionC,optionD,correctOption,explanationSummary,difficulty
8,"Which Constitutional Amendment substituted 'armed rebellion' for 'internal disturbance' in Article 352?","42nd Amendment","44th Amendment","43rd Amendment","52nd Amendment","B","The 44th Constitutional Amendment Act 1978 introduced 'armed rebellion' to prevent abuse.","MEDIUM"`;

  const handleLoadSample = (type: "JSON" | "CSV" = "JSON") => {
    setJsonInput(type === "JSON" ? sampleJSON : sampleCSV);
  };

  const handleImport = async () => {
    try {
      setIsProcessing(true);
      setError(null);
      setResult(null);

      const trimmed = jsonInput.trim();
      let payload: any = { paperCode, year };

      if (trimmed.startsWith("[") || trimmed.startsWith("{")) {
        try {
          payload.questions = JSON.parse(trimmed);
        } catch (e: any) {
          setError(`JSON Syntax Error: ${e.message}`);
          setIsProcessing(false);
          return;
        }
      } else {
        payload.csvData = trimmed;
      }

      const res = await fetch("/api/v1/admin/import/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (json.success) {
        setResult(json.data);
      } else {
        setError(json.error?.message || "Import failed");
      }
    } catch (e: any) {
      console.error(e);
      setError(e.message || "Failed to submit import batch");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <a
          href="/admin"
          className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline mb-2"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Admin Console
        </a>
        <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
          <UploadCloud className="h-7 w-7 text-blue-700" />
          Structured Question Batch Ingestion
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Ingest digitized question papers. Questions are imported with status{" "}
          <strong className="text-amber-700 font-bold">NEEDS_REVIEW</strong> and cannot be published without verification.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Form: Configuration */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Batch Metadata
          </h2>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Target Paper</label>
            <select
              value={paperCode}
              onChange={(e) => setPaperCode(e.target.value)}
              className="w-full rounded-lg border border-slate-300 p-2 text-xs font-semibold text-slate-800"
            >
              <option value="GS1">General Studies Paper I</option>
              <option value="GS2">GS Paper II (CSAT)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Examination Year</label>
            <input
              type="number"
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value))}
              className="w-full rounded-lg border border-slate-300 p-2 text-xs font-semibold text-slate-800"
            />
          </div>

          <div className="border-t border-slate-100 pt-3 space-y-2">
            <button
              onClick={() => handleLoadSample("JSON")}
              type="button"
              className="w-full rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-bold text-blue-700 hover:bg-blue-100 transition flex items-center justify-center gap-1.5"
            >
              <FileCode className="h-3.5 w-3.5" />
              <span>Load Sample JSON</span>
            </button>
            <button
              onClick={() => handleLoadSample("CSV")}
              type="button"
              className="w-full rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-800 hover:bg-emerald-100 transition flex items-center justify-center gap-1.5"
            >
              <FileCode className="h-3.5 w-3.5 text-emerald-600" />
              <span>Load Sample CSV</span>
            </button>
          </div>
        </div>

        {/* Right Editor: JSON Payload */}
        <div className="md:col-span-2 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                JSON Questions Array
              </label>
              <span className="text-[11px] text-slate-400">Format: Array of Question objects</span>
            </div>
            <textarea
              rows={12}
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              placeholder="Paste JSON question array here..."
              className="w-full rounded-xl border border-slate-300 font-mono text-xs p-3 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
            <span className="text-[11px] text-slate-500">
              Auto-deduplicates against existing year/question numbers
            </span>
            <button
              onClick={handleImport}
              disabled={isProcessing || !jsonInput.trim()}
              className="rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50 transition"
            >
              {isProcessing ? "Processing Batch..." : "Execute Import"}
            </button>
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="mt-6 rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-800 flex items-start gap-2">
          <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <strong className="font-bold">Import Error:</strong> {error}
          </div>
        </div>
      )}

      {/* Result Report */}
      {result && (
        <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50/50 p-6 shadow-sm">
          <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm mb-3">
            <CheckCircle className="h-5 w-5 text-emerald-600" />
            <span>Batch Ingestion Summary</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs mb-4">
            <div className="rounded-lg bg-white p-3 border border-emerald-200">
              <span className="text-slate-400 block uppercase text-[10px]">Total Processed</span>
              <strong className="text-slate-900 text-lg">{result.totalProcessed}</strong>
            </div>
            <div className="rounded-lg bg-white p-3 border border-emerald-200">
              <span className="text-emerald-700 block uppercase text-[10px]">Imported (Drafts)</span>
              <strong className="text-emerald-700 text-lg">{result.importedCount}</strong>
            </div>
            <div className="rounded-lg bg-white p-3 border border-emerald-200">
              <span className="text-amber-700 block uppercase text-[10px]">Duplicates Skipped</span>
              <strong className="text-amber-700 text-lg">{result.duplicateCount}</strong>
            </div>
            <div className="rounded-lg bg-white p-3 border border-emerald-200">
              <span className="text-rose-700 block uppercase text-[10px]">Rejected / Malformed</span>
              <strong className="text-rose-700 text-lg">{result.rejectedCount}</strong>
            </div>
          </div>

          <div className="flex justify-end">
            <a
              href="/admin/review"
              className="rounded-lg bg-emerald-700 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-800 transition"
            >
              Proceed to Verification Queue &rarr;
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
