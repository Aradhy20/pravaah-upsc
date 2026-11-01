import React from "react";
import { FileText } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm space-y-6 text-sm text-slate-700 leading-relaxed">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
          <FileText className="h-6 w-6 text-blue-700" />
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">Terms of Service</h1>
            <p className="text-xs text-slate-500 mt-0.5">Last updated: November 2026 | Effective Date: November 1, 2026</p>
          </div>
        </div>

        <p>
          Welcome to Pravaah UPSC (&quot;Pravaah&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;). These Terms of Service (&quot;Terms&quot;) govern your access to and use of the website located at{" "}
          <a href="https://pravaah-upsc.vercel.app" className="text-blue-600 underline">
            https://pravaah-upsc.vercel.app
          </a>
          , our web applications, diagnostic tools, study planners, mock-test simulators, and SaaS subscription services.
        </p>

        <div>
          <h2 className="text-base font-bold text-slate-900 mb-1">1. Educational Purpose & Independent Status</h2>
          <p>
            Pravaah is an independent educational SaaS platform designed to assist aspirants in mastering Previous Year Questions (PYQs) for the Union Public Service Commission (UPSC) Civil Services Examination (CSE). Pravaah is a private educational initiative and is <strong>not affiliated with, authorized, sponsored, or endorsed by the Union Public Service Commission or the Government of India</strong>. All past question papers are public documents, and official notices from the Union Public Service Commission constitute the final authoritative record in case of any evaluation discrepancy.
          </p>
        </div>

        <div>
          <h2 className="text-base font-bold text-slate-900 mb-1">2. User Accounts & Session Security</h2>
          <p>
            To access certain features (such as personalized Learning Analytics, Mistake Revision Queue, Bookmarks, and Notes), you must register for an account. You agree to provide accurate registration information and keep your credentials confidential. Pravaah employs cryptographically secure, server-side session management. You are solely responsible for all activities occurring under your account and must notify us immediately of any unauthorized access.
          </p>
        </div>

        <div>
          <h2 className="text-base font-bold text-slate-900 mb-1">3. SaaS Subscriptions, Billing & Cancellation</h2>
          <p className="mb-2">
            Pravaah offers four distinct subscription tiers: <strong>Free (Foundation)</strong>, <strong>Beginner (Syllabus Sprint)</strong>, <strong>Achiever (Prelims Pro)</strong>, and <strong>Scholar (All-Access Pass)</strong>, available on monthly and annual billing cycles.
          </p>
          <ul className="list-disc pl-5 space-y-1 text-slate-600">
            <li><strong>Upgrades:</strong> Plan upgrades take effect immediately upon successful authorization.</li>
            <li><strong>Cancellations:</strong> You may cancel your subscription at any time via your account dashboard. Upon cancellation, your premium feature entitlements remain active through the end of your current paid billing period. We do not issue partial-month refunds.</li>
            <li><strong>Sandbox Mode Notice:</strong> During technical testing and beta preview phases, payment processing operates in sandbox/mock mode (indicated in checkout disclosures). No actual financial charges are incurred on your payment instruments during simulated sandbox transactions.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-base font-bold text-slate-900 mb-1">4. Acceptable Conduct & Fair Use</h2>
          <p>
            You agree not to: (a) reverse-engineer, decompile, or scrape question datasets, explanations, or solution logic using automated bots or scrapers; (b) share account credentials or bypass tiered feature limits; (c) interfere with simulator autosave mechanisms or security boundaries; or (d) submit malicious payloads through discrepancy reporting or note-taking fields. Violations may result in immediate account termination.
          </p>
        </div>

        <div>
          <h2 className="text-base font-bold text-slate-900 mb-1">5. Intellectual Property & Pedagogical Content</h2>
          <p>
            While historical UPSC question prompts are public records, Pravaah&apos;s proprietary pedagogical explanations, distractor analyses, mistake taxonomy frameworks, UI components, code, and analytics algorithms are protected under copyright, trademark, and intellectual property laws of India.
          </p>
        </div>

        <div>
          <h2 className="text-base font-bold text-slate-900 mb-1">6. Limitation of Liability</h2>
          <p>
            Pravaah is provided on an &quot;as is&quot; and &quot;as available&quot; basis for educational self-study. We do not warrant that examination performance or civil service ranks will result from use of the platform. In no event shall Pravaah, its founders, or contributors be liable for indirect, incidental, or consequential damages.
          </p>
        </div>

        <div>
          <h2 className="text-base font-bold text-slate-900 mb-1">7. Grievance Redressal & Governing Law</h2>
          <p>
            These Terms are governed by and construed in accordance with the laws of the Republic of India. In accordance with the Information Technology Act, 2000 and rules made thereunder, any disputes or grievances regarding terms or services may be directed to our Grievance Officer at{" "}
            <a href="mailto:grievance@pravaah.in" className="text-blue-600 underline font-medium">
              grievance@pravaah.in
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
