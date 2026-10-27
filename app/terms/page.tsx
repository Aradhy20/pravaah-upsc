import React from "react";
import { FileText } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm space-y-6 text-sm text-slate-700 leading-relaxed">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
          <FileText className="h-6 w-6 text-blue-700" />
          <h1 className="text-2xl font-extrabold text-slate-900">Terms of Service</h1>
        </div>

        <p>
          Last updated: October 2026. Welcome to Pravaah UPSC. By accessing or using our platform, you agree to comply with these terms.
        </p>

        <div>
          <h2 className="text-base font-bold text-slate-900 mb-1">1. Educational Use & Attribution</h2>
          <p>
            Pravaah is an educational preparation platform designed to help students study Previous Year Questions from the UPSC Civil Services Examination. All historical question papers are public documents published by the Union Public Service Commission. Pravaah is an independent educational initiative and is not affiliated with, authorized, or endorsed by the Union Public Service Commission.
          </p>
        </div>

        <div>
          <h2 className="text-base font-bold text-slate-900 mb-1">2. Acceptable Conduct</h2>
          <p>
            Users agree not to exploit the platform for automated scraping, denial of service attacks, or unauthorized penetration attempts. The platform is intended for individual aspirants preparing for public competitive examinations.
          </p>
        </div>

        <div>
          <h2 className="text-base font-bold text-slate-900 mb-1">3. Disclaimers & Accuracy</h2>
          <p>
            While every effort is made to maintain 100% adherence to official UPSC notifications and answer keys, users are advised that official notices from the Union Public Service Commission constitute the final authoritative record in case of any discrepancy.
          </p>
        </div>
      </div>
    </div>
  );
}
