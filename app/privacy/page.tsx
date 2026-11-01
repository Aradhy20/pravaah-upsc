import React from "react";
import { Shield } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm space-y-6 text-sm text-slate-700 leading-relaxed">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
          <Shield className="h-6 w-6 text-blue-700" />
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">Privacy Policy</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Compliant with the Digital Personal Data Protection (DPDP) Act, 2023 | Effective Date: November 1, 2026
            </p>
          </div>
        </div>

        <p>
          Pravaah UPSC (&quot;Pravaah&quot;, &quot;we&quot;, &quot;our&quot;) is committed to protecting the privacy, confidentiality, and security of civil services examination aspirants. This Privacy Policy details our practices regarding the collection, processing, storage, and protection of your personal and educational data.
        </p>

        <div>
          <h2 className="text-base font-bold text-slate-900 mb-1">1. Data Fiduciary Notice</h2>
          <p>
            Under the provisions of the Digital Personal Data Protection (DPDP) Act, 2023, Pravaah operates as a <strong>Data Fiduciary</strong> in relation to the personal data provided by you as a Data Principal when using our learning platform.
          </p>
        </div>

        <div>
          <h2 className="text-base font-bold text-slate-900 mb-1">2. Information We Collect</h2>
          <ul className="list-disc pl-5 space-y-1 text-slate-600">
            <li><strong>Account Credentials:</strong> Full name, verified email address, and cryptographically hashed passwords (secured using salt-backed scrypt key derivation).</li>
            <li><strong>Academic & Telemetry Data:</strong> Question attempt histories, option selections, answer timings, cognitive error tags (e.g., concept confusion vs. elimination error), diagnostic scores, and spaced revision schedules.</li>
            <li><strong>Workspace Content:</strong> Private study notes, bookmark collections, subject-specific revision checklists, and daily target goals.</li>
            <li><strong>Billing Metadata:</strong> Subscription tier, plan duration, transaction identifiers, and invoice records. We never collect, process, or store raw credit/debit card numbers or bank CVVs; payment data is securely tokenized by compliant gateway partners.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-base font-bold text-slate-900 mb-1">3. Purpose Limitation & Processing Grounds</h2>
          <p>
            We process your personal data strictly for legitimate pedagogical and platform delivery purposes:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-slate-600 mt-1">
            <li>To compute your personalized Learning Analytics and subject mastery scores.</li>
            <li>To schedule items in your dynamic Mistake Revision Queue based on cognitive spaced repetition algorithms.</li>
            <li>To enforce tiered subscription quotas and secure account sessions.</li>
            <li><strong>We do NOT sell, rent, monetize, or trade student personal data or question attempt logs to third-party marketing firms.</strong></li>
          </ul>
        </div>

        <div>
          <h2 className="text-base font-bold text-slate-900 mb-1">4. Data Security & Storage Standards</h2>
          <p>
            All network communication is encrypted in transit via TLS 1.3. User passwords are encrypted with unique random cryptographic salts, and authenticated sessions are maintained using server-side hashed tokens with secure, HTTP-only cookies. Our PostgreSQL databases leverage encryption at rest and strict role-based access isolation.
          </p>
        </div>

        <div>
          <h2 className="text-base font-bold text-slate-900 mb-1">5. Your Rights as a Data Principal</h2>
          <p className="mb-2">
            In accordance with the DPDP Act 2023, you enjoy the following rights regarding your digital personal data:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-slate-600">
            <li><strong>Right to Access:</strong> You may view or export a summary of your personal data and question attempt history directly from your dashboard.</li>
            <li><strong>Right to Correction & Erasure:</strong> You may request the correction of inaccurate personal data or complete deletion of your account and associated study logs at any time.</li>
            <li><strong>Right of Grievance Redressal:</strong> You may lodge a complaint with our designated Grievance Officer regarding any data processing concern.</li>
            <li><strong>Right to Nominate:</strong> You have the right to nominate an individual who will exercise your data rights in the event of death or incapacity.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-base font-bold text-slate-900 mb-1">6. Data Retention Policy</h2>
          <p>
            We retain your study records, bookmarks, and analytics as long as your account remains active to provide continuous preparation tracking. If you choose to close your account, your personal identifiers and private study notes are permanently purged within 30 days of confirmed deletion.
          </p>
        </div>

        <div>
          <h2 className="text-base font-bold text-slate-900 mb-1">7. Designated Grievance Officer</h2>
          <p>
            If you have questions, feedback, or requests regarding this Privacy Policy or wish to exercise your rights under the DPDP Act 2023, please contact our designated Data Protection &amp; Grievance Officer:
          </p>
          <div className="mt-2 rounded-xl bg-slate-50 p-4 border border-slate-200 text-xs space-y-1">
            <p><strong>Grievance Officer:</strong> Pravaah Data Governance Team</p>
            <p><strong>Email:</strong> <a href="mailto:grievance@pravaah.in" className="text-blue-600 underline">grievance@pravaah.in</a></p>
            <p><strong>Response Time:</strong> Acknowledgment within 48 hours; resolution within 30 days.</p>
            <p><strong>Jurisdiction:</strong> New Delhi, India</p>
          </div>
        </div>
      </div>
    </div>
  );
}
