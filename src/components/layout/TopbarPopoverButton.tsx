import { useEffect, useRef, useState, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

export interface TopbarPopoverButtonProps {
  icon: ReactNode;
  label: string;
  children: ReactNode;
  className?: string;
  panelClassName?: string;
}

export function TopbarPopoverButton({
  icon,
  label,
  children,
  className,
  panelClassName,
}: TopbarPopoverButtonProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

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

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className={cn(
          'inline-flex size-10 items-center justify-center rounded-lg border border-border text-text-secondary transition-colors hover:bg-bg-elevated hover:text-text-primary',
          open && 'bg-bg-elevated text-text-primary',
        )}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label={label}
      >
        {icon}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label={label}
          className={cn(
            'absolute right-0 z-50 mt-2 w-72 overflow-hidden rounded-lg border border-border bg-bg-surface p-4 shadow-lg',
            panelClassName,
          )}
        >
          {children}
        </div>
      )}
    </div>
  );
}
