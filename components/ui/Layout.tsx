import React from "react";

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl" | "full";
}

export function PageContainer({
  children,
  className = "",
  size = "lg",
}: PageContainerProps) {
  const maxWidthClass = {
    sm: "max-w-3xl",
    md: "max-w-5xl",
    lg: "max-w-7xl",
    xl: "max-w-[1440px]",
    full: "max-w-full",
  }[size];

  return (
    <div className={`mx-auto w-full px-4 sm:px-6 lg:px-8 ${maxWidthClass} ${className}`}>
      {children}
    </div>
  );
}

interface SectionHeaderProps {
  badge?: string;
  title: string | React.ReactNode;
  description?: string;
  align?: "left" | "center" | "right";
  className?: string;
  action?: React.ReactNode;
}

export function SectionHeader({
  badge,
  title,
  description,
  align = "center",
  className = "",
  action,
}: SectionHeaderProps) {
  const alignmentClass = {
    left: "text-left items-start",
    center: "text-center items-center mx-auto",
    right: "text-right items-end ml-auto",
  }[align];

  return (
    <div className={`flex flex-col max-w-3xl mb-10 sm:mb-12 ${alignmentClass} ${className}`}>
      {badge && (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FAF2E6] px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-[#741A2B] border border-[#E5C88E] mb-3 shadow-xs">
          {badge}
        </span>
      )}
      <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-editorial tracking-tight text-[#261B1E] leading-tight">
        {title}
      </h2>
      {description && (
        <p className="mt-3 text-sm sm:text-base text-[#786B68] leading-relaxed">
          {description}
        </p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
