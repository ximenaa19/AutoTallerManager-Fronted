import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

export interface AppShellProps {
  children: ReactNode;
  sidebar?: ReactNode;
  topbar?: ReactNode;
  mobileSidebarOpen?: boolean;
  onMobileSidebarClose?: () => void;
  className?: string;
}

export function AppShell({
  children,
  sidebar,
  topbar,
  mobileSidebarOpen = false,
  onMobileSidebarClose,
  className,
}: AppShellProps) {
  return (
    <div className={cn('flex min-h-screen bg-bg-base', className)}>
      {sidebar && (
        <>
          <aside className="hidden shrink-0 border-r border-border bg-bg-sidebar lg:block">
            {sidebar}
          </aside>

          {mobileSidebarOpen && (
            <button
              type="button"
              aria-label="Close navigation menu"
              className="fixed inset-0 z-40 bg-black/60 lg:hidden"
              onClick={onMobileSidebarClose}
            />
          )}

          <aside
            className={cn(
              'fixed inset-y-0 left-0 z-50 w-[min(280px,85vw)] border-r border-border bg-bg-sidebar shadow-xl transition-transform duration-200 lg:hidden',
              mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full',
            )}
          >
            {sidebar}
          </aside>
        </>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        {topbar && (
          <header className="sticky top-0 z-30 border-b border-border bg-bg-surface/95 backdrop-blur-sm">
            {topbar}
          </header>
        )}

        <main className="relative flex-1">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[linear-gradient(180deg,rgba(229,57,53,0.06)_0%,transparent_100%)]"
          />
          {children}
        </main>
      </div>
    </div>
  );
}

export function AppShellContent({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        'relative mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8',
        className,
      )}
    >
      {children}
    </div>
  );
}

export function AppShellBrand({
  className,
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 border-b border-border px-4 py-4',
        compact && 'justify-center px-2',
        className,
      )}
    >
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent-muted text-accent">
        <span className="text-lg font-bold" aria-hidden>
          AT
        </span>
      </div>
      {!compact && (
        <div className="flex min-w-0 flex-col">
          <span className="truncate text-sm font-bold tracking-wide text-text-primary">
            AUTO TALLER
          </span>
          <span className="truncate text-[10px] font-semibold uppercase tracking-wider text-accent">
            Professional Management
          </span>
        </div>
      )}
    </div>
  );
}
