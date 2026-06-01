import type { ReactNode } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { cn } from '@/lib/cn';

export interface AdminToolbarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  actions?: ReactNode;
  summary?: ReactNode;
  className?: string;
}

export function AdminToolbar({
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Search…',
  actions,
  summary,
  className,
}: AdminToolbarProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-3 rounded-lg border border-border bg-bg-surface p-4 sm:flex-row sm:items-end sm:justify-between',
        className,
      )}
    >
      <div className="flex w-full flex-col gap-3 sm:max-w-md">
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3 top-[2.125rem] size-4 text-text-muted"
            aria-hidden
          />
          <Input
            name="admin-search"
            label="Search"
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(event) => onSearchChange(event.target.value)}
            className="pl-9"
          />
        </div>
        {summary}
      </div>
      {actions && (
        <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>
      )}
    </div>
  );
}
