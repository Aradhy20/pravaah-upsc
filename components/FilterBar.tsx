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
    <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm space-y-4">
      {/* Search Input Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search keywords, articles, environmental treaties, topics..."
            className="w-full rounded-lg border border-slate-300 bg-slate-50/50 pl-10 pr-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-600"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Smart vs Exact Toggle */}
        <div className="flex items-center rounded-lg border border-slate-200 bg-slate-100 p-1 text-xs font-semibold">
          <button
            onClick={() => onSearchModeChange("smart")}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 transition ${
              searchMode === "smart"
                ? "bg-white text-blue-700 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Sparkles className="h-3.5 w-3.5 text-blue-600" />
            <span>Smart Concept</span>
          </button>
          <button
            onClick={() => onSearchModeChange("exact")}
            className={`rounded-md px-3 py-1.5 transition ${
              searchMode === "exact"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Exact Match
          </button>
        </div>
      </div>

      {/* Paper Toggle & Subject Select */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3">
        {/* Paper Toggle Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onPaperChange("GS1")}
            className={`rounded-lg border px-4 py-2 text-xs font-bold transition touch-target ${
              selectedPaper === "GS1"
                ? "border-blue-600 bg-blue-600 text-white shadow-sm"
                : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            General Studies Paper I
          </button>
          <button
            onClick={() => onPaperChange("GS2")}
            className={`rounded-lg border px-4 py-2 text-xs font-bold transition touch-target ${
              selectedPaper === "GS2"
                ? "border-teal-600 bg-teal-600 text-white shadow-sm"
                : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
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
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
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
      <div className="border-t border-slate-100 pt-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wide mr-1">
            Years:
          </span>

          <button
            onClick={() => handlePresetYears("ALL")}
            className={`rounded-md border px-2.5 py-1 text-xs font-bold transition touch-target ${
              isAllYears
                ? "bg-slate-800 text-white border-slate-800"
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
            }`}
          >
            All Years
          </button>
          <button
            onClick={() => handlePresetYears("LAST_5")}
            className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
          >
            Last 5 Yrs
          </button>
          <button
            onClick={() => handlePresetYears("LAST_10")}
            className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
          >
            Last 10 Yrs
          </button>

          <span className="text-slate-300 mx-1">|</span>

          {AVAILABLE_YEARS.slice(0, 6).map((year) => {
            const isSelected = selectedYears.includes(year);
            return (
              <button
                key={year}
                onClick={() => handleYearToggle(year)}
                className={`rounded-md border px-2.5 py-1 text-xs font-bold transition ${
                  isSelected
                    ? "border-blue-600 bg-blue-50 text-blue-700 ring-1 ring-blue-600/30"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
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
        <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
          <span>
            Showing <strong className="text-slate-900 font-bold">{totalFilteredCount}</strong>{" "}
            verified questions matching current filters
          </span>
          {searchMode === "smart" && searchQuery && (
            <span className="text-blue-600 font-medium">Ranked by conceptual relevance</span>
          )}
        </div>
      )}
    </div>
  );
}
