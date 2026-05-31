import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/cn';

export interface LoadingStateProps {
  title?: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  fullPage?: boolean;
}

const sizeStyles = {
  sm: 'size-5',
  md: 'size-8',
  lg: 'size-10',
} as const;

export function LoadingState({
  title = 'Loading',
  description,
  size = 'md',
  className,
  fullPage = false,
}: LoadingStateProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className={cn(
        'flex flex-col items-center justify-center gap-3 text-center',
        fullPage && 'min-h-[320px]',
        className,
      )}
    >
      <Loader2
        className={cn('animate-spin text-accent', sizeStyles[size])}
        aria-hidden
      />
      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium text-text-primary">{title}</p>
        {description && (
          <p className="max-w-sm text-xs text-text-secondary">{description}</p>
        )}
      </div>
      <span className="sr-only">{title}</span>
    </div>
  );
}
