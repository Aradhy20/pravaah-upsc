import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  icon?: React.ReactNode;
  variant?: "primary" | "secondary" | "gold" | "outline" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  href?: string;
  fullWidth?: boolean;
}

export function PrimaryButton({
  children,
  icon,
  size = "md",
  href,
  fullWidth = false,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  const sizeStyles = {
    sm: "px-3.5 py-1.5 text-xs rounded-lg gap-1.5 min-h-[36px]",
    md: "px-5 py-2.5 text-sm rounded-xl gap-2 min-h-[44px]",
    lg: "px-7 py-3.5 text-base rounded-xl gap-2.5 min-h-[48px]",
  }[size];

  const baseStyles =
    "inline-flex items-center justify-center font-bold text-white bg-[#741A2B] hover:bg-[#5E1422] active:bg-[#480E1A] transition shadow-xs hover:shadow-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C69A4A] focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#741A2B]";

  const widthStyle = fullWidth ? "w-full" : "";

  if (href && !disabled) {
    return (
      <a href={href} className={`${baseStyles} ${sizeStyles} ${widthStyle} ${className}`}>
        {icon && <span className="shrink-0">{icon}</span>}
        <span>{children}</span>
      </a>
    );
  }

  return (
    <button
      disabled={disabled}
      className={`${baseStyles} ${sizeStyles} ${widthStyle} ${className}`}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </button>
  );
}

export function SecondaryButton({
  children,
  icon,
  size = "md",
  href,
  fullWidth = false,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  const sizeStyles = {
    sm: "px-3.5 py-1.5 text-xs rounded-lg gap-1.5 min-h-[36px]",
    md: "px-5 py-2.5 text-sm rounded-xl gap-2 min-h-[44px]",
    lg: "px-7 py-3.5 text-base rounded-xl gap-2.5 min-h-[48px]",
  }[size];

  const baseStyles =
    "inline-flex items-center justify-center font-bold text-[#261B1E] bg-white border border-[#E7DDD4] hover:bg-[#F4EDE2] hover:border-[#C69A4A] active:bg-[#EFE6D8] transition shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#741A2B] focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

  const widthStyle = fullWidth ? "w-full" : "";

  if (href && !disabled) {
    return (
      <a href={href} className={`${baseStyles} ${sizeStyles} ${widthStyle} ${className}`}>
        {icon && <span className="shrink-0">{icon}</span>}
        <span>{children}</span>
      </a>
    );
  }

  return (
    <button
      disabled={disabled}
      className={`${baseStyles} ${sizeStyles} ${widthStyle} ${className}`}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </button>
  );
}

export function GoldButton({
  children,
  icon,
  size = "md",
  href,
  fullWidth = false,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  const sizeStyles = {
    sm: "px-3.5 py-1.5 text-xs rounded-lg gap-1.5 min-h-[36px]",
    md: "px-5 py-2.5 text-sm rounded-xl gap-2 min-h-[44px]",
    lg: "px-7 py-3.5 text-base rounded-xl gap-2.5 min-h-[48px]",
  }[size];

  const baseStyles =
    "inline-flex items-center justify-center font-bold text-[#3A101A] bg-[#C69A4A] hover:bg-[#B88B39] active:bg-[#A67B2A] transition shadow-xs hover:shadow-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#741A2B] focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

  const widthStyle = fullWidth ? "w-full" : "";

  if (href && !disabled) {
    return (
      <a href={href} className={`${baseStyles} ${sizeStyles} ${widthStyle} ${className}`}>
        {icon && <span className="shrink-0">{icon}</span>}
        <span>{children}</span>
      </a>
    );
  }

  return (
    <button
      disabled={disabled}
      className={`${baseStyles} ${sizeStyles} ${widthStyle} ${className}`}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </button>
  );
}

export function IconButton({
  children,
  size = "md",
  label,
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  children: React.ReactNode;
  label: string;
  size?: "sm" | "md" | "lg";
}) {
  const sizeStyles = {
    sm: "h-8 w-8 rounded-lg",
    md: "h-10 w-10 rounded-xl",
    lg: "h-12 w-12 rounded-xl",
  }[size];

  return (
    <button
      aria-label={label}
      title={label}
      className={`inline-flex items-center justify-center text-[#786B68] hover:text-[#741A2B] hover:bg-[#F4EDE2] border border-transparent hover:border-[#E7DDD4] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#741A2B] focus-visible:ring-offset-2 min-h-[36px] min-w-[36px] ${sizeStyles} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
