import React from "react";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "brand" | "success" | "warning" | "error" | "neutral" | "outline";
  size?: "sm" | "md";
  className?: string;
}

export function Badge({
  children,
  variant = "neutral",
  size = "md",
  className = "",
}: BadgeProps) {
  const sizeStyles = {
    sm: "px-2 py-0.5 text-[10px]",
    md: "px-2.5 py-1 text-xs",
  }[size];

  const variantStyles = {
    brand: "bg-blue-50 text-[#2453E6] border border-blue-200/60",
    success: "bg-emerald-50 text-[#12A878] border border-emerald-200/60",
    warning: "bg-amber-50 text-[#F59E0B] border border-amber-200/60",
    error: "bg-rose-50 text-[#DC2626] border border-rose-200/60",
    neutral: "bg-[#F7F9FC] text-[#475467] border border-[#E4E7EC]",
    outline: "bg-transparent text-[#475467] border border-[#D0D5DD]",
  }[variant];

  return (
    <span
      className={`inline-flex items-center gap-1 font-bold rounded-md leading-none ${sizeStyles} ${variantStyles} ${className}`}
    >
      {children}
    </span>
  );
}
