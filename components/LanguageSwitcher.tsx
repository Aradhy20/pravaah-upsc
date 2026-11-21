"use client";

import React from "react";
import { useLanguage } from "@/lib/i18n/context";
import { Globe } from "lucide-react";

export function LanguageSwitcher({ className = "" }: { className?: string }) {
  const { language, toggleLanguage } = useLanguage();

  return (
    <button
      onClick={toggleLanguage}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold rounded-lg transition-all border ${
        language === "hi"
          ? "bg-amber-50 text-amber-900 border-amber-300 shadow-xs"
          : "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200"
      } ${className}`}
      title={language === "en" ? "हिंदी में बदलें (Switch to Hindi)" : "Switch to English"}
      aria-label="Toggle language between English and Hindi"
    >
      <Globe className="h-3.5 w-3.5 text-slate-500" />
      <span className="font-semibold">{language === "en" ? "EN" : "HI"}</span>
      <span className="text-[10px] uppercase tracking-wide opacity-80 border-l border-slate-300 pl-1">
        {language === "en" ? "हिंदी" : "English"}
      </span>
    </button>
  );
}
