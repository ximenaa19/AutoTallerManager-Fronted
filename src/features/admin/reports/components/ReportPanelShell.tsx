import type { ReactNode } from 'react';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingState } from '@/components/feedback/LoadingState';

export interface ReportPanelShellProps {
  title: string;
  description: string;
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
  children: ReactNode;
}

export function ReportPanelShell({
  title,
  description,
  isLoading,
  error,
  onRetry,
  children,
}: ReportPanelShellProps) {
  return (
    <section className="rounded-lg border border-border bg-bg-surface p-5">
      <header className="mb-5 border-b border-border pb-4">
        <h2 className="text-base font-semibold text-text-primary">{title}</h2>
        <p className="mt-1 text-sm text-text-secondary">{description}</p>
      </header>

      {isLoading && (
        <LoadingState
          title="Loading report"
          description="Fetching metrics from the server…"
          className="min-h-[200px]"
        />
      )}

      {!isLoading && error && (
        <ErrorState
          title="Unable to load report"
          message={error}
          onRetry={onRetry}
        />
      )}

      {!isLoading && !error && children}
    </section>
  );
}
