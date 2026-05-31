import type { ReactNode } from 'react';
import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/cn';

export type StatCardTone =
  | 'accent'
  | 'success'
  | 'info'
  | 'warning'
  | 'danger'
  | 'purple'
  | 'teal';

const toneStyles: Record<StatCardTone, string> = {
  accent: 'bg-accent-muted text-accent',
  success: 'bg-success-muted text-success',
  info: 'bg-info-muted text-info',
  warning: 'bg-warning-muted text-warning',
  danger: 'bg-danger-muted text-danger',
  purple: 'bg-purple-muted text-purple',
  teal: 'bg-teal-muted text-teal',
};

export interface StatCardProps {
  title: string;
  value: string | number;
  footer?: ReactNode;
  icon?: ReactNode;
  tone?: StatCardTone;
  className?: string;
}

export function StatCard({
  title,
  value,
  footer,
  icon,
  tone = 'accent',
  className,
}: StatCardProps) {
  return (
    <Card className={cn('flex h-full flex-col gap-4', className)} padding="md">
      <div className="flex items-start justify-between gap-3">
        {icon && (
          <div
            className={cn(
              'flex size-10 shrink-0 items-center justify-center rounded-lg',
              toneStyles[tone],
            )}
          >
            {icon}
          </div>
        )}
      </div>

      <div className="space-y-1">
        <p className="text-sm font-medium text-text-secondary">{title}</p>
        <p className="text-3xl font-bold tracking-tight text-text-primary">
          {value}
        </p>
      </div>

      {footer && (
        <div className="mt-auto text-xs text-text-secondary">{footer}</div>
      )}
    </Card>
  );
}
