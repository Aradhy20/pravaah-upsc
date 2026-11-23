import React from "react";
import { ArrowRight } from "lucide-react";

interface SubjectCardProps {
  title: string;
  description: string;
  tag: string;
  href: string;
  paperCode?: string;
  count?: number;
  icon?: React.ReactNode;
  className?: string;
}

export function SubjectCard({
  title,
  description,
  tag,
  href,
  paperCode,
  count,
  icon,
  className = "",
}: SubjectCardProps) {
  return (
    <a
      href={href}
      className={`group flex flex-col justify-between rounded-2xl border border-[#E4E7EC] bg-white p-5 sm:p-6 transition shadow-xs hover:shadow-md hover:border-[#2453E6]/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2453E6] ${className}`}
    >
      <div>
        <div className="flex items-center justify-between gap-2">
          {icon && (
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-[#2453E6] group-hover:bg-[#2453E6] group-hover:text-white transition">
              {icon}
            </div>
          )}
          <span className="rounded-full bg-[#F7F9FC] border border-[#E4E7EC] px-2.5 py-0.5 text-xs font-semibold text-[#475467]">
            {tag}
          </span>
        </div>
        <h3 className="mt-4 text-base font-bold text-[#101828] group-hover:text-[#2453E6] transition leading-snug">
          {title}
        </h3>
        <p className="mt-2 text-xs sm:text-sm text-[#475467] leading-relaxed">
          {description}
        </p>
      </div>

      <div className="mt-5 pt-3 border-t border-[#F7F9FC] flex items-center justify-between text-xs font-bold text-[#2453E6]">
        <span>{count !== undefined ? `${count} Questions` : "Explore PYQs"}</span>
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
      </div>
    </a>
  );
}

interface StatCardProps {
  value: string | number;
  label: string;
  subtitle?: string;
  trend?: string;
  icon?: React.ReactNode;
  variant?: "default" | "brand" | "success" | "warning";
  className?: string;
}

export function StatCard({
  value,
  label,
  subtitle,
  icon,
  variant = "default",
  className = "",
}: StatCardProps) {
  const variantStyles = {
    default: "border-[#E4E7EC] bg-white text-[#101828]",
    brand: "border-blue-200 bg-blue-50/50 text-[#101828]",
    success: "border-emerald-200 bg-emerald-50/50 text-[#101828]",
    warning: "border-amber-200 bg-amber-50/50 text-[#101828]",
  }[variant];

  return (
    <div
      className={`rounded-2xl border p-5 shadow-xs transition hover:shadow-sm ${variantStyles} ${className}`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-bold uppercase tracking-wider text-[#667085]">
          {label}
        </span>
        {icon && <div className="text-[#2453E6] shrink-0">{icon}</div>}
      </div>
      <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-[#101828] tracking-tight">
        {value}
      </div>
      {subtitle && (
        <p className="mt-1 text-xs text-[#475467] leading-normal">{subtitle}</p>
      )}
    </div>
  );
}
