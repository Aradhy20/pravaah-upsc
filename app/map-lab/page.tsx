"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  MapPin,
  Compass,
  Layers,
  Search,
  BookOpen,
  Award,
  Sparkles,
  CheckCircle,
  HelpCircle,
  RotateCw,
  Globe,
  Navigation,
  ChevronRight,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useLanguage } from "@/lib/i18n/context";

export default function MapLearningLabPage() {
  const { language } = useLanguage();
  const [features, setFeatures] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Quiz mode state
  const [quizMode, setQuizMode] = useState(false);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [selectedQuizOption, setSelectedQuizOption] = useState<string | null>(null);
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  const fetchFeatures = async (cat = "ALL") => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/v1/map-lab?category=${cat}`);
      const data = await res.json();
      if (res.ok && data.success) {
        setFeatures(data.data.features || []);
        if (categories.length === 0) {
          setCategories(data.data.categories || []);
        }
      } else {
        setError(data.error || "Failed to load map data.");
      }
    } catch (e: any) {
      console.error("Map Lab fetch error:", e);
      setError("Network error connecting to spatial catalog.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeatures(selectedCategory);
  }, [selectedCategory]);

  const filteredFeatures = features.filter((f) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const nameMatch = f.name.toLowerCase().includes(q) || (f.nameHi && f.nameHi.includes(q));
    const locMatch = f.stateOrCountry.toLowerCase().includes(q);
    const factsMatch = f.keyFacts.toLowerCase().includes(q);
    return nameMatch || locMatch || factsMatch;
  });

  // Quiz helper: generates 4 options (1 correct + 3 distractor states/names)
  const currentQuizFeature = features[currentQuizIndex];
  const distractorFeatures = features
    .filter((f) => f.id !== currentQuizFeature?.id)
    .slice(0, 3);
  const quizOptions = currentQuizFeature
    ? [currentQuizFeature, ...distractorFeatures].sort(() => 0.5 - Math.random())
    : [];

  const handleQuizAnswer = (featureId: string) => {
    setSelectedQuizOption(featureId);
    setIsAnswerRevealed(true);
    if (featureId === currentQuizFeature?.id) {
      setQuizScore((prev) => prev + 1);
    }
  };

  const nextQuizQuestion = () => {
    setSelectedQuizOption(null);
    setIsAnswerRevealed(false);
    if (currentQuizIndex + 1 < features.length) {
      setCurrentQuizIndex((prev) => prev + 1);
    } else {
      setCurrentQuizIndex(0);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Hero Banner */}
        <div className="bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-900 rounded-3xl p-6 sm:p-10 text-white shadow-sm mb-8 relative overflow-hidden">
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold mb-4 border border-emerald-400/20">
              <Globe className="h-3.5 w-3.5" />
              {language === "hi" ? "मानचित्र आधारित भूगोल अधिगम प्रयोगशाला" : "UPSC Cartographic & Spatial Intelligence"}
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              {language === "hi" ? (
                <>मानचित्र आधारित भूगोल <span className="text-emerald-400">अभ्यास केंद्र</span></>
              ) : (
                <>Map-Based Learning Lab & <span className="text-emerald-400">Spatial Atlas</span></>
              )}
            </h1>
            <p className="mt-3 text-slate-300 text-xs sm:text-sm leading-relaxed">
              {language === "hi"
                ? "राष्ट्रीय उद्यान, रामसर आर्द्रभूमियां, जलप्रपात, नदियाँ, पर्वतीय दर्रे एवं भू-राजनीतिक चोकपॉइंट्स का उच्च-सटीक भौगोलिक अध्ययन। यूपीएससी प्रारंभिक परीक्षा के विगत वर्षों के वास्तविक प्रश्नों के संदर्भों सहित।"
                : "High-yield spatial drills covering National Parks, Ramsar Wetlands, River Gorges, Mountain Passes, and Global Maritime Chokepoints. Master location-matching questions testing exact geographic coordinates and ecological significance."}
            </p>
          </div>

          {/* Mode Switcher */}
          <div className="mt-6 flex flex-wrap gap-2 relative z-10">
            <button
              onClick={() => setQuizMode(false)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                !quizMode
                  ? "bg-emerald-500 text-slate-950 shadow"
                  : "bg-white/10 hover:bg-white/20 text-white border border-white/10"
              }`}
            >
              {language === "hi" ? "भौगोलिक निर्देशिका" : "Spatial Atlas Explorer"}
            </button>
            <button
              onClick={() => {
                setQuizMode(true);
                setCurrentQuizIndex(0);
                setSelectedQuizOption(null);
                setIsAnswerRevealed(false);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                quizMode
                  ? "bg-emerald-500 text-slate-950 shadow"
                  : "bg-white/10 hover:bg-white/20 text-white border border-white/10"
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" />
              {language === "hi" ? "मानचित्र प्रश्नोत्तरी मोड" : "Map Quiz Mode"}
            </button>
          </div>
        </div>

        {/* QUIZ MODE VIEW */}
        {quizMode && currentQuizFeature ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-sm max-w-3xl mx-auto mb-12">
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100 text-xs">
              <span className="font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full">
                Question {currentQuizIndex + 1} of {features.length}
              </span>
              <span className="font-semibold text-slate-500">
                Score: <strong className="text-slate-900">{quizScore}</strong> correct
              </span>
            </div>

            <div className="mb-6">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Category: {currentQuizFeature.category.replace(/_/g, " ")}
              </span>
              <h2 className="text-lg font-bold text-slate-900 mb-2">
                {language === "hi" && currentQuizFeature.nameHi
                  ? currentQuizFeature.nameHi
                  : currentQuizFeature.name}
              </h2>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs text-slate-700 leading-relaxed">
                <span className="font-bold text-slate-900 block mb-1">Ecological & Geographic Clues:</span>
                <p>
                  {language === "hi" && currentQuizFeature.keyFactsHi
                    ? currentQuizFeature.keyFactsHi
                    : currentQuizFeature.keyFacts}
                </p>
              </div>
            </div>

            <p className="text-xs font-bold text-slate-800 mb-3">
              Where is this geographical feature situated?
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              {quizOptions.map((opt) => {
                let btnStyle = "border-slate-200 bg-white hover:bg-slate-50 text-slate-800";
                if (isAnswerRevealed) {
                  if (opt.id === currentQuizFeature.id) {
                    btnStyle = "border-emerald-500 bg-emerald-50 text-emerald-950 font-bold ring-2 ring-emerald-500/20";
                  } else if (selectedQuizOption === opt.id) {
                    btnStyle = "border-rose-400 bg-rose-50 text-rose-900";
                  }
                }

                return (
                  <button
                    key={opt.id}
                    disabled={isAnswerRevealed}
                    onClick={() => handleQuizAnswer(opt.id)}
                    className={`p-3.5 rounded-xl border text-xs text-left transition-all ${btnStyle}`}
                  >
                    <span className="font-semibold block">{opt.stateOrCountry}</span>
                    <span className="text-[10px] text-slate-400">
                      Coordinates: {opt.latitude}° N, {opt.longitude}° E
                    </span>
                  </button>
                );
              })}
            </div>

            {isAnswerRevealed && (
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs mb-6 space-y-2 animate-in fade-in-50">
                <div className="flex items-center gap-1.5 text-emerald-800 font-bold">
                  <CheckCircle className="h-4 w-4" />
                  Official Geography Solution
                </div>
                <p className="text-slate-700 leading-relaxed">
                  <strong className="text-slate-900">{currentQuizFeature.name}</strong> is situated in{" "}
                  <strong>{currentQuizFeature.stateOrCountry}</strong>.
                </p>
                {currentQuizFeature.upscReference && (
                  <p className="text-[11px] text-emerald-900 font-medium">
                    UPSC Exam Provenance: {currentQuizFeature.upscReference}
                  </p>
                )}
              </div>
            )}

            <div className="flex justify-end">
              {isAnswerRevealed ? (
                <button
                  onClick={nextQuizQuestion}
                  className="px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition shadow"
                >
                  {currentQuizIndex + 1 < features.length ? "Next Location →" : "Restart Quiz"}
                </button>
              ) : null}
            </div>
          </div>
        ) : (
          /* ATLAS CATALOG VIEW */
          <div>
            {/* Category Filter Pills */}
            <div className="flex flex-wrap gap-2 mb-6">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                    selectedCategory === cat.id
                      ? "bg-slate-900 text-white shadow"
                      : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {language === "hi" ? cat.labelHi : cat.labelEn} ({cat.count})
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="mb-6 relative">
              <Search className="h-4 w-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search locations, rivers, waterfalls, or state/countries (e.g. Narmada, Loktak, Bab-el-Mandeb)..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent placeholder:text-slate-400"
              />
            </div>

            {/* Feature Cards Grid */}
            {loading ? (
              <div className="py-20 text-center text-xs text-slate-400">Loading spatial atlas...</div>
            ) : filteredFeatures.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-xs text-slate-500">
                No geographical features match the selected filter.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredFeatures.map((f) => (
                  <div
                    key={f.id}
                    className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-emerald-300 hover:shadow-sm transition-all flex flex-col justify-between"
                  >
                    <div>
                      {/* Badge Row */}
                      <div className="flex items-center justify-between text-[11px] mb-2.5">
                        <span className="font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-100">
                          {f.category.replace(/_/g, " ")}
                        </span>
                        <span className="text-slate-400 flex items-center gap-1 font-mono text-[10px]">
                          <Navigation className="h-3 w-3" />
                          {f.latitude}° N, {f.longitude}° E
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="text-sm font-bold text-slate-900 mb-0.5">
                        {f.name}
                      </h3>
                      {f.nameHi && (
                        <p className="text-xs text-slate-500 mb-2 font-medium">
                          {f.nameHi}
                        </p>
                      )}

                      {/* State / Region */}
                      <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 bg-slate-50 px-2 py-0.5 rounded mb-3">
                        <MapPin className="h-3 w-3 text-emerald-600" />
                        <span>{f.stateOrCountry}</span>
                      </div>

                      {/* Key Facts */}
                      <p className="text-xs text-slate-600 leading-relaxed mb-4">
                        {language === "hi" && f.keyFactsHi ? f.keyFactsHi : f.keyFacts}
                      </p>
                    </div>

                    {/* UPSC Provenance Footer */}
                    {f.upscReference && (
                      <div className="pt-3 border-t border-slate-100 text-[10px] font-bold text-emerald-700 flex items-center gap-1">
                        <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
                        <span>{f.upscReference}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
