import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { cn } from '@/lib/cn';
import {
  getQuickNavItems,
  searchQuickNavItems,
  type QuickNavItem,
} from '@/routes/navigation';
import type { AppRole } from '@/types/auth.types';

export interface TopbarQuickSearchProps {
  activeRole: AppRole | null;
  className?: string;
}

export function TopbarQuickSearch({ activeRole, className }: TopbarQuickSearchProps) {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const navItems = useMemo(
    () => getQuickNavItems(activeRole),
    [activeRole],
  );

  const results = useMemo(
    () => searchQuickNavItems(navItems, query),
    [navItems, query],
  );

  useEffect(() => {
    setActiveIndex(0);
  }, [query, results.length]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const navigateTo = (item: QuickNavItem) => {
    navigate(item.path);
    setQuery('');
    setOpen(false);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open && (event.key === 'ArrowDown' || event.key === 'Enter')) {
      setOpen(true);
      return;
    }

    if (!open || results.length === 0) {
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((index) => (index + 1) % results.length);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((index) => (index - 1 + results.length) % results.length);
    } else if (event.key === 'Enter') {
      event.preventDefault();
      const selected = results[activeIndex];
      if (selected) {
        navigateTo(selected);
      }
    }
  };

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <label className="relative block">
        <span className="sr-only">Quick navigation search</span>
        <Search
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-text-muted"
          aria-hidden
        />
        <input
          type="search"
          role="combobox"
          aria-expanded={open}
          aria-controls="topbar-quick-nav-results"
          aria-autocomplete="list"
          placeholder="Quick navigation…"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          className="w-full rounded-full border border-border bg-bg-input py-2 pr-4 pl-10 text-sm text-text-primary placeholder:text-text-muted focus-ring"
        />
      </label>

      {open && (
        <div
          id="topbar-quick-nav-results"
          role="listbox"
          className="absolute top-full right-0 left-0 z-50 mt-2 overflow-hidden rounded-lg border border-border bg-bg-surface shadow-lg"
        >
          {results.length === 0 ? (
            <p className="px-4 py-3 text-sm text-text-secondary">
              No matching modules for your current role.
            </p>
          ) : (
            <ul className="max-h-72 overflow-y-auto py-1">
              {results.map((item, index) => (
                <li key={item.id} role="option" aria-selected={index === activeIndex}>
                  <button
                    type="button"
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => navigateTo(item)}
                    className={cn(
                      'flex w-full items-center px-4 py-2.5 text-left text-sm transition-colors',
                      index === activeIndex
                        ? 'bg-bg-elevated text-text-primary'
                        : 'text-text-secondary hover:bg-bg-elevated hover:text-text-primary',
                    )}
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          )}
          <div className="border-t border-border px-4 py-2 text-xs text-text-muted">
            Search modules and account actions — no record lookup.
          </div>
        </div>
      )}
    </div>
  );
}
