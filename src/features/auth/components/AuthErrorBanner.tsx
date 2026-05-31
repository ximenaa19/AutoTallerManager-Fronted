import { cn } from '@/lib/cn';

interface AuthErrorBannerProps {
  message: string | null;
  className?: string;
}

export function AuthErrorBanner({ message, className }: AuthErrorBannerProps) {
  if (!message) return null;

  return (
    <div
      role="alert"
      className={cn(
        'rounded-lg border border-danger/30 bg-danger-muted/40 px-4 py-3 text-sm text-danger',
        className,
      )}
    >
      {message}
    </div>
  );
}
