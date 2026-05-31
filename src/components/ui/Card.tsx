import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: 'none' | 'sm' | 'md' | 'lg';
  interactive?: boolean;
}

const paddingStyles = {
  none: '',
  sm: 'p-4',
  md: 'p-5',
  lg: 'p-6',
} as const;

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, padding = 'md', interactive = false, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'rounded-lg border border-border bg-bg-surface shadow-[var(--shadow-card)]',
          paddingStyles[padding],
          interactive &&
            'transition-colors duration-150 hover:border-border-strong hover:bg-bg-elevated/50',
          className,
        )}
        {...props}
      >
        {children}
      </div>
    );
  },
);

Card.displayName = 'Card';

export function CardHeader({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('mb-4 flex flex-col gap-1', className)}
      {...props}
    />
  );
}

export function CardTitle({
  className,
  ...props
}: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn('text-base font-semibold text-text-primary', className)}
      {...props}
    />
  );
}

export function CardDescription({
  className,
  ...props
}: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn('text-sm text-text-secondary', className)}
      {...props}
    />
  );
}

export function CardContent({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('', className)} {...props} />;
}

export function CardFooter({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'mt-4 flex items-center justify-end gap-2 border-t border-border pt-4',
        className,
      )}
      {...props}
    />
  );
}

/** Metric card layout for future dashboard KPI usage */
export interface MetricCardProps extends HTMLAttributes<HTMLDivElement> {
  title: string;
  value: string | number;
  footer?: ReactNode;
  icon?: ReactNode;
  iconTone?: 'accent' | 'success' | 'info' | 'warning' | 'danger' | 'purple' | 'teal';
}

const iconToneStyles = {
  accent: 'bg-accent-muted text-accent',
  success: 'bg-success-muted text-success',
  info: 'bg-info-muted text-info',
  warning: 'bg-warning-muted text-warning',
  danger: 'bg-danger-muted text-danger',
  purple: 'bg-purple-muted text-purple',
  teal: 'bg-teal-muted text-teal',
} as const;

export function MetricCard({
  title,
  value,
  footer,
  icon,
  iconTone = 'accent',
  className,
  ...props
}: MetricCardProps) {
  return (
    <Card
      className={cn('flex flex-col gap-4', className)}
      interactive
      {...props}
    >
      <div className="flex items-start justify-between gap-3">
        {icon && (
          <div
            className={cn(
              'flex size-10 shrink-0 items-center justify-center rounded-lg',
              iconToneStyles[iconTone],
            )}
          >
            {icon}
          </div>
        )}
      </div>
      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium text-text-secondary">{title}</p>
        <p className="text-3xl font-bold tracking-tight text-text-primary">
          {value}
        </p>
      </div>
      {footer && (
        <div className="text-xs text-text-secondary">{footer}</div>
      )}
    </Card>
  );
}
