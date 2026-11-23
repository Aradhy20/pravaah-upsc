import React from "react";
import { AlertCircle, HelpCircle, RefreshCw } from "lucide-react";
import { PrimaryButton, SecondaryButton } from "./Buttons";

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  actionText?: string;
  actionHref?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  title,
  description,
  icon,
  actionText,
  actionHref,
  onAction,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl border border-dashed border-[#E7DDD4] bg-white shadow-xs ${className}`}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FBF7F0] text-[#741A2B] border border-[#E7DDD4] mb-4">
        {icon || <HelpCircle className="h-6 w-6" />}
      </div>
      <h3 className="text-base font-bold font-editorial text-[#261B1E]">{title}</h3>
      <p className="mt-1.5 max-w-sm text-xs sm:text-sm text-[#786B68] leading-relaxed">
        {description}
      </p>
      {(actionText && (actionHref || onAction)) && (
        <div className="mt-6">
          {actionHref ? (
            <PrimaryButton href={actionHref} size="sm">
              {actionText}
            </PrimaryButton>
          ) : (
            <PrimaryButton onClick={onAction} size="sm">
              {actionText}
            </PrimaryButton>
          )}
        </div>
      )}
    </div>
  );
}

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = "Something went wrong",
  message,
  onRetry,
  className = "",
}: ErrorStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 text-center rounded-2xl border border-[#ECC4C4] bg-[#FAECEC]/60 ${className}`}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FAECEC] text-[#A32D2D] border border-[#ECC4C4] mb-3">
        <AlertCircle className="h-6 w-6" />
      </div>
      <h3 className="text-base font-bold font-editorial text-[#3A101A]">{title}</h3>
      <p className="mt-1 text-xs text-[#786B68] max-w-sm">{message}</p>
      {onRetry && (
        <SecondaryButton
          onClick={onRetry}
          size="sm"
          className="mt-4"
          icon={<RefreshCw className="h-3.5 w-3.5" />}
        >
          Try Again
        </SecondaryButton>
      )}
    </div>
  );
}

export function SkeletonLoader({
  count = 3,
  className = "",
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div className={`space-y-4 animate-pulse ${className}`}>
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="h-28 rounded-2xl bg-[#F4EDE2] border border-[#E7DDD4]"
        />
      ))}
    </div>
  );
}
