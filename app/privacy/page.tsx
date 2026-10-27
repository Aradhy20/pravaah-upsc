import React from "react";
import { Shield } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm space-y-6 text-sm text-slate-700 leading-relaxed">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
          <Shield className="h-6 w-6 text-blue-700" />
          <h1 className="text-2xl font-extrabold text-slate-900">Privacy Policy</h1>
        </div>

        <p>
          Last updated: October 2026. Pravaah UPSC is committed to protecting the privacy of civil services examination aspirants.
        </p>

        <div>
          <h2 className="text-base font-bold text-slate-900 mb-1">1. Information We Collect</h2>
          <p>
            We collect information provided directly by you when creating an account (such as name and email address), and telemetry regarding your question attempts, time spent per question, bookmarks, and private study notes.
          </p>
        </div>

        <div>
          <h2 className="text-base font-bold text-slate-900 mb-1">2. How We Use Your Data</h2>
          <p>
            Your practice data is used strictly to power your personalized Learning Analytics dashboard, schedule items in your Mistake Revision Queue, and preserve your bookmarks and notes. We never sell student data or personal identifiers to third-party marketing companies.
          </p>
        </div>

        <div>
          <h2 className="text-base font-bold text-slate-900 mb-1">3. Data Security & Storage</h2>
          <p>
            All user authentication data and private notes are secured with modern encryption and access controls. You retain the right to export or request deletion of your account and attempt logs at any time.
          </p>
        </div>
      </div>
    </div>
  );
}
