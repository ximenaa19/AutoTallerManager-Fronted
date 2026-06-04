import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

export interface ReceptionistPageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
}

export function ReceptionistPageHeader({
  title,
  description,
  actions,
  className,
}: ReceptionistPageHeaderProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-start sm:justify-between',
        className,
      )}
    >
      <div className="flex max-w-3xl flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">
          {title}
        </h1>
        {description && (
          <p className="text-sm leading-relaxed text-text-secondary">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
    </div>
  );
}
