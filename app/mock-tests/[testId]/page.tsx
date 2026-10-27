"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { ExamPlayer } from "@/components/ExamPlayer";
import { Loader2, AlertCircle } from "lucide-react";

export default function MockTestSessionPage() {
  const params = useParams();
  const testId = params?.testId as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sessionData, setSessionData] = useState<any | null>(null);

  useEffect(() => {
    async function startSession() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch("/api/v1/tests/session/start", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ testId }),
        });

        const json = await res.json();
        if (json.success) {
          setSessionData(json.data);
        } else {
          setError(json.error?.message || "Failed to initialize test session");
        }
      } catch (e: any) {
        console.error(e);
        setError("Network error while initializing examination session.");
      } finally {
        setLoading(false);
      }
    }

    if (testId) {
      startSession();
    }
  }, [testId]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center p-4 text-center">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600 mb-3" />
        <h2 className="text-base font-bold text-slate-800">
          Preparing UPSC Examination Environment...
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Enforcing anti-leak security, shuffling paper series, and initializing timer.
        </p>
      </div>
    );
  }

  if (error || !sessionData) {
    return (
      <div className="mx-auto max-w-md my-16 rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center text-rose-800">
        <AlertCircle className="mx-auto h-10 w-10 text-rose-500 mb-2" />
        <h2 className="text-base font-bold">Session Launch Failed</h2>
        <p className="mt-1 text-xs text-rose-700">{error || "Unknown session error"}</p>
        <a
          href="/mock-tests"
          className="mt-4 inline-block rounded-lg bg-rose-700 px-4 py-2 text-xs font-bold text-white hover:bg-rose-800"
        >
          Return to Mock Tests
        </a>
      </div>
    );
  }

  return (
    <ExamPlayer
      sessionId={sessionData.sessionId}
      testTitle={sessionData.testTitle}
      paperCode={sessionData.paperCode}
      durationMinutes={sessionData.durationMinutes}
      positiveMark={sessionData.positiveMark}
      negativeMark={sessionData.negativeMark}
      questions={sessionData.questions}
    />
  );
}
