import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { AppShellBrand } from '@/components/layout/AppShell';

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  className?: string;
}

export function AuthLayout({
  children,
  title,
  subtitle,
  className,
}: AuthLayoutProps) {
  return (
    <div className="relative min-h-screen bg-bg-base">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(229,57,53,0.08)_0%,_transparent_55%)]"
        aria-hidden
      />
      <div className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-8 sm:px-6 lg:flex-row lg:items-center lg:gap-12 lg:px-8">
        <section className="mb-8 flex flex-1 flex-col justify-center lg:mb-0 lg:max-w-md">
          <AppShellBrand className="px-0 py-0" />
          <div className="mt-8 space-y-3">
            <h1 className="text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">
              {title}
            </h1>
            {subtitle && (
              <p className="text-base leading-relaxed text-text-secondary">
                {subtitle}
              </p>
            )}
          </div>
          <div className="mt-8 hidden rounded-lg border border-border bg-bg-surface/60 p-5 lg:block">
            <p className="text-sm text-text-secondary">
              Professional automotive workshop management — clients, service
              orders, inventory, billing, and role-based operations in one
              platform.
            </p>
          </div>
        </section>

        <section className={cn('flex flex-1 justify-center lg:justify-end', className)}>
          <div className="w-full max-w-md">{children}</div>
        </section>
      </div>
    </div>
  );
}
