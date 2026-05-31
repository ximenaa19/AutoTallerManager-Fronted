import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

export interface DashboardHeaderProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  className?: string;
}

export function DashboardHeader({
  title,
  subtitle,
  actions,
  className,
}: DashboardHeaderProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between',
        className,
      )}
    >
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-text-primary uppercase sm:text-3xl">
          {title}
        </h1>
        {subtitle && (
          <p className="max-w-3xl text-sm text-text-secondary">{subtitle}</p>
        )}
      </div>
      {actions}
    </div>
  );
}
