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
      className={`group flex flex-col justify-between rounded-2xl border border-[#E7DDD4] bg-white p-5 sm:p-6 transition shadow-xs hover:shadow-hover hover:border-[#C69A4A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#741A2B] ${className}`}
    >
      <div>
        <div className="flex items-center justify-between gap-2">
          {icon && (
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F7ECEE] text-[#741A2B] group-hover:bg-[#741A2B] group-hover:text-white transition shadow-xs">
              {icon}
            </div>
          )}
          <span className="rounded-full bg-[#FBF7F0] border border-[#E7DDD4] px-2.5 py-0.5 text-xs font-semibold text-[#786B68]">
            {tag}
          </span>
        </div>
        <h3 className="mt-4 text-lg font-bold font-editorial text-[#261B1E] group-hover:text-[#741A2B] transition leading-snug">
          {title}
        </h3>
        <p className="mt-2 text-xs sm:text-sm text-[#786B68] leading-relaxed">
          {description}
        </p>
      </div>

      <div className="mt-5 pt-3 border-t border-[#F4EDE2] flex items-center justify-between text-xs font-bold text-[#741A2B]">
        <span>{count !== undefined ? `${count} Questions` : "Explore PYQs"}</span>
        <ArrowRight className="h-4 w-4 text-[#C69A4A] transition-transform group-hover:translate-x-1" />
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
  variant?: "default" | "brand" | "gold" | "success" | "warning";
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
    default: "border-[#E7DDD4] bg-white text-[#261B1E]",
    brand: "border-[#E8C5CB] bg-[#FDF8F9] text-[#261B1E]",
    gold: "border-[#E5C88E] bg-[#FBF7F0] text-[#261B1E]",
    success: "border-[#BDE2CF] bg-[#F4FAF6] text-[#261B1E]",
    warning: "border-[#F0D59E] bg-[#FDF9F0] text-[#261B1E]",
  }[variant];

  return (
    <div
      className={`rounded-2xl border p-5 shadow-xs transition hover:shadow-card ${variantStyles} ${className}`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-bold uppercase tracking-wider text-[#786B68]">
          {label}
        </span>
        {icon && <div className="text-[#741A2B] shrink-0">{icon}</div>}
      </div>
      <div className="mt-2 text-2xl sm:text-3xl font-extrabold font-editorial text-[#261B1E] tracking-tight">
        {value}
      </div>
      {subtitle && (
        <p className="mt-1 text-xs text-[#786B68] leading-normal">{subtitle}</p>
      )}
    </div>
  );
}
