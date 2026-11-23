"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, ChevronRight, ChevronLeft } from "lucide-react";

interface TabItem {
  id: string;
  label: string;
  count?: number;
  icon?: React.ReactNode;
}

interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
}

export function Tabs({ tabs, activeTab, onChange, className = "" }: TabsProps) {
  return (
    <div
      role="tablist"
      className={`inline-flex items-center gap-1 rounded-xl bg-[#F7F9FC] border border-[#E4E7EC] p-1 ${className}`}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2453E6] ${
              isActive
                ? "bg-white text-[#2453E6] shadow-xs"
                : "text-[#475467] hover:text-[#101828] hover:bg-white/50"
            }`}
          >
            {tab.icon && <span>{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={`ml-1 rounded-md px-1.5 py-0.2 text-[10px] ${
                  isActive ? "bg-blue-100 text-[#2453E6]" : "bg-slate-200/80 text-[#667085]"
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumbs({ items, className = "" }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className={`flex items-center text-xs text-[#667085] ${className}`}>
      <ol className="flex items-center gap-1.5 flex-wrap">
        {items.map((item, idx) => {
          const isLast = idx === items.length - 1;
          return (
            <li key={idx} className="flex items-center gap-1.5">
              {idx > 0 && <ChevronRight className="h-3.5 w-3.5 text-[#98A2B3]" />}
              {item.href && !isLast ? (
                <a
                  href={item.href}
                  className="font-medium text-[#475467] hover:text-[#2453E6] transition"
                >
                  {item.label}
                </a>
              ) : (
                <span className="font-bold text-[#101828]" aria-current={isLast ? "page" : undefined}>
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className = "",
}: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className={`flex items-center justify-between border-t border-[#E4E7EC] pt-4 ${className}`}>
      <button
        disabled={currentPage <= 1}
        onClick={() => onPageChange(currentPage - 1)}
        className="inline-flex items-center gap-1 rounded-xl border border-[#E4E7EC] bg-white px-3 py-1.5 text-xs font-bold text-[#475467] hover:bg-[#F7F9FC] transition disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <ChevronLeft className="h-4 w-4" />
        <span>Previous</span>
      </button>

      <span className="text-xs font-semibold text-[#667085]">
        Page <span className="font-bold text-[#101828]">{currentPage}</span> of{" "}
        <span className="font-bold text-[#101828]">{totalPages}</span>
      </span>

      <button
        disabled={currentPage >= totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        className="inline-flex items-center gap-1 rounded-xl border border-[#E4E7EC] bg-white px-3 py-1.5 text-xs font-bold text-[#475467] hover:bg-[#F7F9FC] transition disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <span>Next</span>
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}

interface DropdownMenuProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  align?: "left" | "right";
  className?: string;
}

export function DropdownMenu({
  trigger,
  children,
  align = "left",
  className = "",
}: DropdownMenuProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block" ref={containerRef}>
      <div onClick={() => setOpen(!open)}>{trigger}</div>
      {open && (
        <div
          className={`absolute mt-2 z-50 rounded-2xl border border-[#E4E7EC] bg-white p-2 shadow-xl animate-in fade-in-50 zoom-in-95 ${
            align === "right" ? "right-0" : "left-0"
          } ${className}`}
        >
          {children}
        </div>
      )}
    </div>
  );
}
