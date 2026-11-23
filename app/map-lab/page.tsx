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
    <div className="min-h-screen bg-heritage-ivory flex flex-col font-sans text-heritage-dark">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Hero Banner */}
        <div className="bg-gradient-to-r from-heritage-wine via-heritage-burgundy to-heritage-wine rounded-3xl p-6 sm:p-10 text-white shadow-xl mb-8 relative overflow-hidden border border-heritage-gold/30">
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-heritage-gold/20 text-heritage-goldLight text-xs font-semibold mb-4 border border-heritage-gold/30">
              <Globe className="h-3.5 w-3.5 text-heritage-gold" />
              {language === "hi" ? "मानचित्र आधारित भूगोल अधिगम प्रयोगशाला" : "UPSC Cartographic & Spatial Intelligence"}
            </div>
            <h1 className="text-2xl sm:text-4xl font-serif font-black tracking-tight text-white">
              {language === "hi" ? (
                <>मानचित्र आधारित भूगोल <span className="text-heritage-gold">अभ्यास केंद्र</span></>
              ) : (
                <>Map-Based Learning Lab & <span className="text-heritage-gold">Spatial Atlas</span></>
              )}
            </h1>
            <p className="mt-3 text-white/80 text-xs sm:text-sm leading-relaxed">
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
                  ? "bg-heritage-gold text-heritage-wine shadow-xs"
                  : "bg-white/10 hover:bg-white/20 text-white border border-white/20"
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
                  ? "bg-heritage-gold text-heritage-wine shadow-xs"
                  : "bg-white/10 hover:bg-white/20 text-white border border-white/20"
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" />
              {language === "hi" ? "मानचित्र प्रश्नोत्तरी मोड" : "Map Quiz Mode"}
            </button>
          </div>
        </div>

        {/* QUIZ MODE VIEW */}
        {quizMode && currentQuizFeature ? (
          <div className="bg-white rounded-3xl border border-heritage-border p-6 sm:p-10 shadow-sm max-w-3xl mx-auto mb-12">
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-heritage-border text-xs">
              <span className="font-bold text-heritage-burgundy bg-heritage-cream px-3 py-1 rounded-full border border-heritage-border">
                Question {currentQuizIndex + 1} of {features.length}
              </span>
              <span className="font-semibold text-heritage-muted">
                Score: <strong className="text-heritage-dark font-serif">{quizScore}</strong> correct
              </span>
            </div>

            <div className="mb-6">
              <span className="text-[11px] font-bold text-heritage-muted uppercase tracking-wider block mb-1">
                Category: {currentQuizFeature.category.replace(/_/g, " ")}
              </span>
              <h2 className="text-lg font-serif font-black text-heritage-dark mb-2">
                {language === "hi" && currentQuizFeature.nameHi
                  ? currentQuizFeature.nameHi
                  : currentQuizFeature.name}
              </h2>
              <div className="p-4 bg-heritage-ivory rounded-2xl border border-heritage-border text-xs text-heritage-dark leading-relaxed">
                <span className="font-bold text-heritage-wine block mb-1">Ecological & Geographic Clues:</span>
                <p>
                  {language === "hi" && currentQuizFeature.keyFactsHi
                    ? currentQuizFeature.keyFactsHi
                    : currentQuizFeature.keyFacts}
                </p>
              </div>
            </div>

            <p className="text-xs font-serif font-bold text-heritage-dark mb-3">
              Where is this geographical feature situated?
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              {quizOptions.map((opt) => {
                let btnStyle = "border-heritage-border bg-white hover:bg-heritage-ivory text-heritage-dark";
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
                    <span className="text-[10px] text-heritage-muted">
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
                <p className="text-heritage-dark leading-relaxed">
                  <strong className="text-heritage-burgundy">{currentQuizFeature.name}</strong> is situated in{" "}
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
                  className="px-6 py-2.5 rounded-xl bg-heritage-burgundy hover:bg-heritage-wine text-white text-xs font-bold transition shadow-xs"
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
                      ? "bg-heritage-burgundy text-white shadow-xs"
                      : "bg-white border border-heritage-border text-heritage-dark hover:bg-heritage-cream"
                  }`}
                >
                  {language === "hi" ? cat.labelHi : cat.labelEn} ({cat.count})
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="mb-6 relative">
              <Search className="h-4 w-4 text-heritage-muted absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search locations, rivers, waterfalls, or state/countries (e.g. Narmada, Loktak, Bab-el-Mandeb)..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-heritage-border text-xs text-heritage-dark bg-white focus:outline-none focus:ring-2 focus:ring-heritage-gold focus:border-transparent placeholder:text-heritage-muted"
              />
            </div>

            {/* Feature Cards Grid */}
            {loading ? (
              <div className="py-20 text-center text-xs text-heritage-muted">Loading spatial atlas...</div>
            ) : filteredFeatures.length === 0 ? (
              <div className="bg-white rounded-2xl border border-heritage-border p-12 text-center text-xs text-heritage-muted">
                No geographical features match the selected filter.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredFeatures.map((f) => (
                  <div
                    key={f.id}
                    className="bg-white rounded-2xl border border-heritage-border p-5 shadow-xs hover:border-heritage-gold hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div>
                      {/* Badge Row */}
                      <div className="flex items-center justify-between text-[11px] mb-2.5">
                        <span className="font-bold text-heritage-burgundy bg-heritage-cream px-2.5 py-0.5 rounded-md border border-heritage-border">
                          {f.category.replace(/_/g, " ")}
                        </span>
                        <span className="text-heritage-muted flex items-center gap-1 font-mono text-[10px]">
                          <Navigation className="h-3 w-3 text-heritage-gold" />
                          {f.latitude}° N, {f.longitude}° E
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="text-sm font-serif font-bold text-heritage-dark mb-0.5">
                        {f.name}
                      </h3>
                      {f.nameHi && (
                        <p className="text-xs text-heritage-muted mb-2 font-medium">
                          {f.nameHi}
                        </p>
                      )}

                      {/* State / Region */}
                      <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-heritage-muted bg-heritage-ivory px-2 py-0.5 rounded mb-3 border border-heritage-border/60">
                        <MapPin className="h-3 w-3 text-heritage-gold" />
                        <span>{f.stateOrCountry}</span>
                      </div>

                      {/* Key Facts */}
                      <p className="text-xs text-heritage-muted leading-relaxed mb-4">
                        {language === "hi" && f.keyFactsHi ? f.keyFactsHi : f.keyFacts}
                      </p>
                    </div>

                    {/* UPSC Provenance Footer */}
                    {f.upscReference && (
                      <div className="pt-3 border-t border-heritage-border text-[10px] font-bold text-heritage-wine flex items-center gap-1">
                        <ShieldCheck className="h-3.5 w-3.5 text-heritage-gold shrink-0" />
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
