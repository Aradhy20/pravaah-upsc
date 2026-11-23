import React from "react";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "brand" | "gold" | "saffron" | "success" | "warning" | "error" | "neutral" | "outline";
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
    brand: "bg-[#F7ECEE] text-[#741A2B] border border-[#E8C5CB]",
    gold: "bg-[#FBF4E6] text-[#8C6721] border border-[#E5C88E]",
    saffron: "bg-[#FDF0EB] text-[#C65A36] border border-[#F2C8B8]",
    success: "bg-[#EAF5EE] text-[#1E7E55] border border-[#BDE2CF]",
    warning: "bg-[#FDF5E8] text-[#B07418] border border-[#F0D59E]",
    error: "bg-[#FAECEC] text-[#A32D2D] border border-[#ECC4C4]",
    neutral: "bg-[#F4EDE2] text-[#5D514E] border border-[#E7DDD4]",
    outline: "bg-transparent text-[#786B68] border border-[#E7DDD4]",
  }[variant];

  return (
    <span
      className={`inline-flex items-center gap-1 font-bold rounded-lg leading-none ${sizeStyles} ${variantStyles} ${className}`}
    >
      {children}
    </span>
  );
}
