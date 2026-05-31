import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

const variantStyles = {
  active: 'bg-success-muted text-success border-success/20',
  pending: 'bg-warning-muted text-warning border-warning/20',
  completed: 'bg-info-muted text-info border-info/20',
  cancelled: 'bg-bg-elevated text-text-secondary border-border',
  voided: 'bg-bg-elevated text-text-muted border-border',
  'low-stock': 'bg-danger-muted text-danger border-danger/20',
  paid: 'bg-success-muted text-success border-success/20',
  unpaid: 'bg-warning-muted text-warning border-warning/20',
  default: 'bg-bg-elevated text-text-secondary border-border',
  accent: 'bg-accent-muted text-accent border-accent/20',
} as const;

export type BadgeVariant = keyof typeof variantStyles;

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  dot?: boolean;
}

export function Badge({
  className,
  variant = 'default',
  dot = false,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold',
        variantStyles[variant],
        className,
      )}
      {...props}
    >
      {dot && (
        <span
          className="size-1.5 shrink-0 rounded-full bg-current"
          aria-hidden
        />
      )}
      {children}
    </span>
  );
}
