import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, KeyRound, LogOut, UserCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { getRoleLabel } from '@/lib/roles';
import { cn } from '@/lib/cn';
import { ROUTES } from '@/routes/routePaths';

export function UserMenu() {
  const { user, activeRole, logout } = useAuth();
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

  const displayName = user?.email?.split('@')[0] ?? 'User';
  const roleLabel = activeRole ? getRoleLabel(activeRole) : 'User';

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className={cn(
          'flex items-center gap-3 rounded-lg border border-border px-2 py-1.5 transition-colors hover:bg-bg-elevated/70',
          open && 'bg-bg-elevated/70',
        )}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <div className="flex size-9 items-center justify-center rounded-full bg-accent-muted text-sm font-semibold text-accent">
          {displayName.charAt(0).toUpperCase()}
        </div>
        <div className="hidden text-left sm:block">
          <p className="max-w-[140px] truncate text-sm font-medium text-text-primary">
            {displayName}
          </p>
          <p className="text-xs text-text-secondary">{roleLabel}</p>
        </div>
        <ChevronDown
          className={cn(
            'hidden size-4 text-text-secondary transition-transform sm:block',
            open && 'rotate-180',
          )}
          aria-hidden
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-lg border border-border bg-bg-surface shadow-lg"
        >
          <div className="border-b border-border px-4 py-3">
            <p className="truncate text-sm font-medium text-text-primary">
              {user?.email}
            </p>
            <p className="text-xs text-text-secondary">{roleLabel}</p>
          </div>

          <div className="p-1">
            <Link
              to={ROUTES.ACCOUNT_PROFILE}
              role="menuitem"
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-bg-elevated hover:text-text-primary"
              onClick={() => setOpen(false)}
            >
              <UserCircle className="size-4" aria-hidden />
              My Profile
            </Link>
            <Link
              to={ROUTES.ACCOUNT_CHANGE_PASSWORD}
              role="menuitem"
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-bg-elevated hover:text-text-primary"
              onClick={() => setOpen(false)}
            >
              <KeyRound className="size-4" aria-hidden />
              Change Password
            </Link>
          </div>

          <div className="border-t border-border p-1">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start"
              leftIcon={<LogOut className="size-4" />}
              onClick={() => {
                setOpen(false);
                void logout();
              }}
            >
              Sign out
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
