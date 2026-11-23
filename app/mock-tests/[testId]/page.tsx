"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { ExamPlayer } from "@/components/ExamPlayer";
import { UpgradeModal } from "@/components/UpgradeModal";
import { Loader2, AlertCircle, ShieldAlert, Zap } from "lucide-react";

export default function MockTestSessionPage() {
  const params = useParams();
  const testId = params?.testId as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sessionData, setSessionData] = useState<any | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

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
          if (res.status === 403) {
            setShowUpgradeModal(true);
          }
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
        <Loader2 className="h-10 w-10 animate-spin text-heritage-burgundy mb-3" />
        <h2 className="font-serif text-base font-bold text-heritage-text">
          Preparing UPSC Examination Environment...
        </h2>
        <p className="mt-1 text-xs text-heritage-secondary">
          Enforcing anti-leak security, shuffling paper series, and initializing timer.
        </p>
      </div>
    );
  }

  if (error || !sessionData) {
    const isSubscriptionError = error?.toLowerCase().includes("requires") || error?.toLowerCase().includes("plan");
    return (
      <div className="mx-auto max-w-md my-16 rounded-3xl border border-heritage-border bg-white p-8 text-center shadow-card">
        {isSubscriptionError ? (
          <>
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-heritage-cream text-heritage-burgundy border border-heritage-gold/40 shadow-xs">
              <ShieldAlert className="h-7 w-7 text-heritage-gold" />
            </div>
            <h2 className="font-serif text-xl font-bold text-heritage-text">Aspirant Pro Required</h2>
            <p className="mt-2 text-xs text-heritage-secondary leading-relaxed font-normal">{error}</p>
            <div className="mt-6 flex flex-col gap-2.5">
              <button
                onClick={() => setShowUpgradeModal(true)}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-heritage-burgundy px-4 py-3 text-xs font-bold text-white shadow-xs hover:bg-heritage-wine transition"
              >
                <Zap className="h-4 w-4 text-heritage-gold" />
                <span>Unlock 2-Hour Exam Simulator Now</span>
              </button>
              <a
                href="/mock-tests"
                className="text-xs font-semibold text-heritage-secondary hover:underline mt-1"
              >
                Return to Mock Tests Catalogue
              </a>
            </div>

            <UpgradeModal
              isOpen={showUpgradeModal}
              onClose={() => setShowUpgradeModal(false)}
              featureTitle="Timed 2-Hour Examination Simulator"
              featureDescription="Experience authentic UPSC Prelims conditions with real-time negative marking (-0.66) and syllabus weakness analysis."
              recommendedPlanCode="ASPIRANT_PRO"
            />
          </>
        ) : (
          <>
            <AlertCircle className="mx-auto h-10 w-10 text-rose-500 mb-2" />
            <h2 className="font-serif text-base font-bold text-heritage-text">Session Launch Failed</h2>
            <p className="mt-1 text-xs text-heritage-secondary">{error || "Unknown session error"}</p>
            <a
              href="/mock-tests"
              className="mt-4 inline-block rounded-xl bg-heritage-burgundy px-4 py-2 text-xs font-bold text-white hover:bg-heritage-wine transition"
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
