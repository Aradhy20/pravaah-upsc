import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  icon?: React.ReactNode;
  variant?: "primary" | "secondary" | "outline" | "danger" | "ghost";
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
    sm: "px-3 py-1.5 text-xs rounded-lg gap-1.5 min-h-[36px]",
    md: "px-4 py-2 text-sm rounded-xl gap-2 min-h-[44px]",
    lg: "px-6 py-3 text-base rounded-2xl gap-2.5 min-h-[48px]",
  }[size];

  const baseStyles =
    "inline-flex items-center justify-center font-bold text-white bg-[#2453E6] hover:bg-[#1d44c2] active:bg-[#1839a8] transition shadow-xs hover:shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2453E6] focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#2453E6]";

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
    sm: "px-3 py-1.5 text-xs rounded-lg gap-1.5 min-h-[36px]",
    md: "px-4 py-2 text-sm rounded-xl gap-2 min-h-[44px]",
    lg: "px-6 py-3 text-base rounded-2xl gap-2.5 min-h-[48px]",
  }[size];

  const baseStyles =
    "inline-flex items-center justify-center font-bold text-[#101828] bg-white border border-[#E4E7EC] hover:bg-[#F7F9FC] hover:border-[#D0D5DD] active:bg-[#EEF2F6] transition shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2453E6] focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

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
    lg: "h-12 w-12 rounded-2xl",
  }[size];

  return (
    <button
      aria-label={label}
      title={label}
      className={`inline-flex items-center justify-center text-[#475467] hover:text-[#101828] hover:bg-[#F7F9FC] border border-transparent hover:border-[#E4E7EC] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2453E6] focus-visible:ring-offset-2 min-h-[36px] min-w-[36px] ${sizeStyles} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
