"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { ExamPlayer } from "@/components/ExamPlayer";
import { Loader2, AlertCircle, ShieldAlert } from "lucide-react";

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
    const isSubscriptionError = error?.toLowerCase().includes("requires") || error?.toLowerCase().includes("plan");
    return (
      <div className="mx-auto max-w-md my-16 rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        {isSubscriptionError ? (
          <>
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-700 border border-blue-200">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <h2 className="text-lg font-extrabold text-slate-900">Subscription Required</h2>
            <p className="mt-2 text-xs text-slate-600 leading-relaxed">{error}</p>
            <div className="mt-6 flex flex-col gap-2">
              <a
                href="/pricing"
                className="w-full rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow hover:bg-blue-700 transition"
              >
                View Plans & Upgrade
              </a>
              <a
                href="/mock-tests"
                className="text-xs font-semibold text-slate-500 hover:underline mt-1"
              >
                Return to Mock Tests Catalogue
              </a>
            </div>
          </>
        ) : (
          <>
            <AlertCircle className="mx-auto h-10 w-10 text-rose-500 mb-2" />
            <h2 className="text-base font-bold text-slate-900">Session Launch Failed</h2>
            <p className="mt-1 text-xs text-slate-600">{error || "Unknown session error"}</p>
            <a
              href="/mock-tests"
              className="mt-4 inline-block rounded-lg bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 transition"
            >
              Return to Mock Tests
            </a>
          </>
        )}
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
