import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

export interface AppShellProps {
  children: ReactNode;
  /** Optional sidebar slot — full sidebar nav comes in Phase 3 */
  sidebar?: ReactNode;
  /** Optional top bar slot — full topbar comes in Phase 3 */
  topbar?: ReactNode;
  className?: string;
}

/**
 * Minimal application shell for Phase 1.
 * Sidebar and topbar navigation will be expanded in Phase 3.
 */
export function AppShell({
  children,
  sidebar,
  topbar,
  className,
}: AppShellProps) {
  return (
    <div className={cn('flex min-h-screen bg-bg-base', className)}>
      {sidebar && (
        <aside className="hidden w-64 shrink-0 border-r border-border bg-bg-sidebar lg:block">
          {sidebar}
        </aside>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        {topbar && (
          <header className="sticky top-0 z-40 border-b border-border bg-bg-surface/95 backdrop-blur-sm">
            {topbar}
          </header>
        )}

        <main className="flex-1">{children}</main>
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
    <div className={cn('mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8', className)}>
      {children}
    </div>
  );
}

export function AppShellBrand({
  className,
}: {
  className?: string;
}) {
  return (
    <div className={cn('flex items-center gap-3 px-5 py-5', className)}>
      <div className="flex size-9 items-center justify-center rounded-lg bg-accent-muted text-accent">
        <span className="text-lg font-bold" aria-hidden>
          AT
        </span>
      </div>
      <div className="flex flex-col">
        <span className="text-sm font-bold tracking-wide text-text-primary">
          AUTO TALLER
        </span>
        <span className="text-[10px] font-semibold uppercase tracking-wider text-accent">
          Professional Management
        </span>
      </div>
    </div>
  );
}
