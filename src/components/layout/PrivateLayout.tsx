import { LogOut } from 'lucide-react';
import { Outlet } from 'react-router-dom';
import {
  AppShell,
  AppShellBrand,
  AppShellContent,
} from '@/components/layout/AppShell';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { getRoleLabel } from '@/lib/roles';

export function PrivateLayout() {
  const { user, activeRole, logout } = useAuth();

  return (
    <AppShell
      sidebar={
        <div>
          <AppShellBrand />
          <div className="border-t border-border px-5 py-4">
            <p className="text-xs leading-relaxed text-text-muted">
              Full navigation will be available in Phase 3.
            </p>
          </div>
        </div>
      }
      topbar={
        <div className="flex h-14 items-center justify-between gap-4 px-4 sm:px-6">
          <p className="truncate text-sm font-medium text-text-secondary">
            AutoTaller Manager
          </p>
          <div className="flex items-center gap-3">
            {activeRole && (
              <Badge variant="accent">{getRoleLabel(activeRole)}</Badge>
            )}
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium text-text-primary">
                {user?.email}
              </p>
              {activeRole && (
                <p className="text-xs text-text-secondary">
                  {getRoleLabel(activeRole)}
                </p>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => void logout()}
              leftIcon={<LogOut className="size-4" />}
            >
              <span className="hidden sm:inline">Sign out</span>
            </Button>
          </div>
        </div>
      }
    >
      <AppShellContent>
        <Outlet />
      </AppShellContent>
    </AppShell>
  );
}
