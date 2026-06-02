import { Bell, HelpCircle, Menu } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { TopbarPopoverButton } from '@/components/layout/TopbarPopoverButton';
import { TopbarQuickSearch } from '@/components/layout/TopbarQuickSearch';
import { UserMenu } from '@/components/layout/UserMenu';
import { cn } from '@/lib/cn';
import type { AppRole } from '@/types/auth.types';

export interface TopbarProps {
  pageTitle: string;
  roleLabel?: string;
  activeRole: AppRole | null;
  onMenuClick: () => void;
  className?: string;
}

export function Topbar({
  pageTitle,
  roleLabel,
  activeRole,
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
        <TopbarQuickSearch activeRole={activeRole} />
      </div>

      <div className="relative flex items-center gap-2 sm:gap-3">
        <TopbarPopoverButton
          icon={<Bell className="size-5" aria-hidden />}
          label="Notifications"
        >
          <p className="text-sm font-medium text-text-primary">Notifications</p>
          <p className="mt-2 text-sm text-text-secondary">
            Notifications are pending backend support.
          </p>
        </TopbarPopoverButton>

        <TopbarPopoverButton
          icon={<HelpCircle className="size-5" aria-hidden />}
          label="Help"
          className="hidden sm:block"
        >
          <p className="text-sm font-medium text-text-primary">Help</p>
          <dl className="mt-3 space-y-2 text-sm text-text-secondary">
            <div>
              <dt className="font-medium text-text-primary">Current role</dt>
              <dd>{roleLabel ?? 'Not selected'}</dd>
            </div>
            <div>
              <dt className="font-medium text-text-primary">Quick navigation</dt>
              <dd>
                Use the search field to jump to modules available for your role.
              </dd>
            </div>
            <div>
              <dt className="font-medium text-text-primary">Sidebar</dt>
              <dd>Use the sidebar to access modules and dashboards.</dd>
            </div>
            <div>
              <dt className="font-medium text-text-primary">Support</dt>
              <dd>Contact your system administrator for access or account issues.</dd>
            </div>
          </dl>
        </TopbarPopoverButton>

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
