"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { en } from "./en";
import { hi } from "./hi";

export type Language = "en" | "hi";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string, defaultValue?: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  language: "en",
  setLanguage: () => {},
  toggleLanguage: () => {},
  t: (key: string, defaultValue?: string) => defaultValue || key,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");

  useEffect(() => {
    // Check cookie or localStorage on initial mount
    const savedLang = (localStorage.getItem("pravaah_lang") as Language) || getCookie("pravaah_lang");
    if (savedLang === "en" || savedLang === "hi") {
      setLanguageState(savedLang);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem("pravaah_lang", lang);
      document.cookie = `pravaah_lang=${lang}; path=/; max-age=31536000; SameSite=Lax`;
      // Update HTML lang attribute
      if (typeof document !== "undefined") {
        document.documentElement.lang = lang;
      }
    } catch (e) {
      console.warn("Could not save language preference:", e);
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "hi" : "en");
  };

  const t = (key: string, defaultValue?: string): string => {
    const dict = language === "hi" ? hi : en;
    return (dict as Record<string, string>)[key] || defaultValue || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? match[2] : null;
}
