"use client";

import React from "react";
import { Search, X, Sparkles, Filter, Check } from "lucide-react";

interface FilterBarProps {
  selectedPaper: string;
  onPaperChange: (paper: string) => void;
  selectedYears: number[];
  onYearsChange: (years: number[]) => void;
  selectedSubject: string;
  onSubjectChange: (subject: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  searchMode: "smart" | "exact";
  onSearchModeChange: (mode: "smart" | "exact") => void;
  onClearAll: () => void;
  totalFilteredCount?: number;
}

const AVAILABLE_YEARS = [2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015];

const SUBJECTS_LIST = [
  "Polity & Governance",
  "Economy & Social Development",
  "Environment & Biodiversity",
  "History & Art & Culture",
  "Geography & Agriculture",
  "Science & Technology",
  "CSAT: Quantitative Aptitude",
  "CSAT: Logical & Analytical Reasoning",
  "CSAT: Reading Comprehension",
];

export function FilterBar({
  selectedPaper,
  onPaperChange,
  selectedYears,
  onYearsChange,
  selectedSubject,
  onSubjectChange,
  searchQuery,
  onSearchChange,
  searchMode,
  onSearchModeChange,
  onClearAll,
  totalFilteredCount,
}: FilterBarProps) {
  const isAllYears = selectedYears.length === 0;

  const handleYearToggle = (year: number) => {
    if (selectedYears.includes(year)) {
      onYearsChange(selectedYears.filter((y) => y !== year));
    } else {
      onYearsChange([...selectedYears, year]);
    }
  };

  const handlePresetYears = (type: "ALL" | "LAST_5" | "LAST_10") => {
    if (type === "ALL") onYearsChange([]);
    else if (type === "LAST_5") onYearsChange([2024, 2023, 2022, 2021, 2020]);
    else if (type === "LAST_10") onYearsChange(AVAILABLE_YEARS);
  };

  const hasActiveFilters =
    selectedPaper !== "GS1" ||
    selectedYears.length > 0 ||
    selectedSubject !== "" ||
    searchQuery.trim() !== "";

  return (
    <div className="rounded-2xl border border-heritage-border bg-white p-4 sm:p-5 shadow-card space-y-4">
      {/* Search Input Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-heritage-secondary" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search microthemes, constitutional articles, Ramsar sites, economic indices..."
            className="w-full rounded-xl border border-heritage-border bg-heritage-ivory/40 pl-10 pr-4 py-2.5 text-sm text-heritage-text placeholder:text-heritage-secondary/70 focus:border-heritage-gold focus:bg-white focus:outline-none focus:ring-2 focus:ring-heritage-gold/20 transition"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-heritage-secondary hover:bg-heritage-cream hover:text-heritage-text transition"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Smart vs Exact Toggle */}
        <div className="flex items-center rounded-xl border border-heritage-border bg-heritage-ivory p-1 text-xs font-semibold">
          <button
            onClick={() => onSearchModeChange("smart")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition ${
              searchMode === "smart"
                ? "bg-heritage-burgundy text-white shadow-xs font-bold"
                : "text-heritage-secondary hover:text-heritage-text"
            }`}
          >
            <Sparkles className="h-3.5 w-3.5 text-heritage-gold" />
            <span>Smart Concept</span>
          </button>
          <button
            onClick={() => onSearchModeChange("exact")}
            className={`rounded-lg px-3 py-1.5 transition ${
              searchMode === "exact"
                ? "bg-white text-heritage-text border border-heritage-border shadow-xs font-bold"
                : "text-heritage-secondary hover:text-heritage-text"
            }`}
          >
            Exact Match
          </button>
        </div>
      </div>

      {/* Paper Toggle & Subject Select */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-heritage-border/60 pt-3">
        {/* Paper Toggle Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onPaperChange("GS1")}
            className={`rounded-lg border px-4 py-2 text-xs font-bold transition ${
              selectedPaper === "GS1"
                ? "border-heritage-burgundy bg-heritage-burgundy text-white shadow-xs"
                : "border-heritage-border bg-white text-heritage-text hover:bg-heritage-ivory"
            }`}
          >
            General Studies Paper I
          </button>
          <button
            onClick={() => onPaperChange("GS2")}
            className={`rounded-lg border px-4 py-2 text-xs font-bold transition ${
              selectedPaper === "GS2"
                ? "border-heritage-saffron bg-heritage-saffron text-white shadow-xs"
                : "border-heritage-border bg-white text-heritage-text hover:bg-heritage-ivory"
            }`}
          >
            GS Paper II (CSAT)
          </button>
        </div>

        {/* Subject Dropdown */}
        <div className="flex items-center gap-2">
          <select
            value={selectedSubject}
            onChange={(e) => onSubjectChange(e.target.value)}
            className="rounded-lg border border-heritage-border bg-white px-3 py-2 text-xs font-semibold text-heritage-text focus:border-heritage-gold focus:outline-none focus:ring-1 focus:ring-heritage-gold"
          >
            <option value="">All Subjects</option>
            {SUBJECTS_LIST.map((subj) => (
              <option key={subj} value={subj}>
                {subj}
              </option>
            ))}
          </select>

          {hasActiveFilters && (
            <button
              onClick={onClearAll}
              className="flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-100 transition"
              title="Clear all filters"
            >
              <X className="h-3 w-3" />
              <span>Clear</span>
            </button>
          )}
        </div>
      </div>

      {/* Year Multi-Select Chips */}
      <div className="border-t border-heritage-border/60 pt-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-bold text-heritage-secondary uppercase tracking-wider mr-1">
            Years:
          </span>

          <button
            onClick={() => handlePresetYears("ALL")}
            className={`rounded-md border px-2.5 py-1 text-xs font-bold transition ${
              isAllYears
                ? "bg-heritage-wine text-white border-heritage-wine shadow-xs"
                : "bg-white text-heritage-secondary border-heritage-border hover:bg-heritage-ivory"
            }`}
          >
            All Years
          </button>
          <button
            onClick={() => handlePresetYears("LAST_5")}
            className="rounded-md border border-heritage-border bg-white px-2.5 py-1 text-xs font-medium text-heritage-secondary hover:bg-heritage-ivory transition"
          >
            Last 5 Yrs
          </button>
          <button
            onClick={() => handlePresetYears("LAST_10")}
            className="rounded-md border border-heritage-border bg-white px-2.5 py-1 text-xs font-medium text-heritage-secondary hover:bg-heritage-ivory transition"
          >
            Last 10 Yrs
          </button>

          <span className="text-heritage-border mx-1">|</span>

          {AVAILABLE_YEARS.slice(0, 6).map((year) => {
            const isSelected = selectedYears.includes(year);
            return (
              <button
                key={year}
                onClick={() => handleYearToggle(year)}
                className={`rounded-md border px-2.5 py-1 text-xs font-bold transition ${
                  isSelected
                    ? "border-heritage-burgundy bg-heritage-cream text-heritage-burgundy ring-1 ring-heritage-burgundy/30"
                    : "border-heritage-border bg-white text-heritage-secondary hover:border-heritage-gold hover:bg-heritage-ivory"
                }`}
              >
                {year}
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter Status Meta */}
      {totalFilteredCount !== undefined && (
        <div className="flex items-center justify-between text-xs text-heritage-secondary pt-1">
          <span>
            Showing <strong className="text-heritage-text font-bold">{totalFilteredCount}</strong>{" "}
            verified questions matching current filters
          </span>
          {searchMode === "smart" && searchQuery && (
            <span className="text-heritage-burgundy font-medium">Ranked by conceptual relevance</span>
          )}
        </div>
      )}
    </div>
  );
}
