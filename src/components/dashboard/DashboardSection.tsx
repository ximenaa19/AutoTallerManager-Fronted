import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

export interface DashboardSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export function DashboardSection({
  title,
  description,
  children,
  className,
}: DashboardSectionProps) {
  return (
    <section className={cn('space-y-4', className)}>
      <div className="space-y-1">
        <h2 className="text-lg font-semibold text-text-primary">{title}</h2>
        {description && (
          <p className="text-sm text-text-secondary">{description}</p>
        )}
      </div>
      {children}
    </section>
  );
}
