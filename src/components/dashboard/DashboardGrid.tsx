import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

export interface DashboardGridProps {
  children: ReactNode;
  className?: string;
}

export function DashboardGrid({ children, className }: DashboardGridProps) {
  return (
    <div
      className={cn(
        'grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5',
        className,
      )}
    >
      {children}
    </div>
  );
}
