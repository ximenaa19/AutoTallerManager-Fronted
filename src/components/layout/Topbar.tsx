import { Bell, HelpCircle, Menu, Search } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { UserMenu } from '@/components/layout/UserMenu';
import { cn } from '@/lib/cn';

export interface TopbarProps {
  pageTitle: string;
  roleLabel?: string;
  onMenuClick: () => void;
  className?: string;
}

export function Topbar({
  pageTitle,
  roleLabel,
  onMenuClick,
  className,
}: TopbarProps) {
  return (
    <div
      className={cn(
        'relative flex min-h-14 flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6',
        className,
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(229,57,53,0.08),transparent_55%)] opacity-80"
      />

      <div className="relative flex min-w-0 flex-1 items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="inline-flex size-10 items-center justify-center rounded-lg border border-border text-text-secondary transition-colors hover:bg-bg-elevated hover:text-text-primary lg:hidden"
          aria-label="Open navigation menu"
        >
          <Menu className="size-5" />
        </button>

        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-text-primary sm:text-base">
            {pageTitle}
          </p>
          {roleLabel && (
            <p className="truncate text-xs text-text-secondary">{roleLabel}</p>
          )}
        </div>
      </div>

      <div className="relative hidden max-w-md flex-1 px-4 md:block">
        <label className="relative block">
          <span className="sr-only">Search</span>
          <Search
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-text-muted"
            aria-hidden
          />
          <input
            type="search"
            disabled
            placeholder="Search… (coming in a future phase)"
            className="w-full rounded-full border border-border bg-bg-input py-2 pr-4 pl-10 text-sm text-text-secondary placeholder:text-text-muted disabled:cursor-not-allowed disabled:opacity-70"
          />
        </label>
      </div>

      <div className="relative flex items-center gap-2 sm:gap-3">
        <button
          type="button"
          disabled
          aria-label="Notifications (not available yet)"
          title="Notifications are not available yet"
          className="relative inline-flex size-10 items-center justify-center rounded-lg border border-border text-text-secondary opacity-60"
        >
          <Bell className="size-5" />
          <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-accent" />
        </button>

        <button
          type="button"
          disabled
          aria-label="Help (coming soon)"
          title="Help center coming soon"
          className="hidden size-10 items-center justify-center rounded-lg border border-border text-text-secondary opacity-60 sm:inline-flex"
        >
          <HelpCircle className="size-5" />
        </button>

        {roleLabel && (
          <Badge variant="accent" className="hidden md:inline-flex">
            {roleLabel}
          </Badge>
        )}

        <UserMenu />
      </div>
    </div>
  );
}
