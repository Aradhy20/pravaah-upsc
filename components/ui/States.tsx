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
      className={`flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl border border-dashed border-[#E4E7EC] bg-white ${className}`}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F7F9FC] text-[#667085] mb-4">
        {icon || <HelpCircle className="h-6 w-6" />}
      </div>
      <h3 className="text-base font-bold text-[#101828]">{title}</h3>
      <p className="mt-1.5 max-w-sm text-xs sm:text-sm text-[#475467] leading-relaxed">
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
      className={`flex flex-col items-center justify-center p-8 text-center rounded-2xl border border-rose-200 bg-rose-50/50 ${className}`}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 text-[#DC2626] mb-3">
        <AlertCircle className="h-6 w-6" />
      </div>
      <h3 className="text-sm font-bold text-[#101828]">{title}</h3>
      <p className="mt-1 max-w-sm text-xs text-[#DC2626]">{message}</p>
      {onRetry && (
        <div className="mt-4">
          <SecondaryButton onClick={onRetry} size="sm" icon={<RefreshCw className="h-3.5 w-3.5" />}>
            Retry
          </SecondaryButton>
        </div>
      )}
    </div>
  );
}

interface LoadingSkeletonProps {
  lines?: number;
  className?: string;
}

export function LoadingSkeleton({ lines = 3, className = "" }: LoadingSkeletonProps) {
  return (
    <div className={`space-y-3 animate-pulse ${className}`} aria-label="Loading content">
      <div className="h-5 w-2/5 rounded-lg bg-[#E4E7EC]" />
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-4 rounded-md bg-[#F2F4F7]"
          style={{ width: `${85 - i * 12}%` }}
        />
      ))}
    </div>
  );
}
