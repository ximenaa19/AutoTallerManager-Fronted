import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import {
  AppShell,
  AppShellContent,
} from '@/components/layout/AppShell';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { getRoleLabel } from '@/lib/roles';
import { getNavigationForRole, getPageTitle } from '@/routes/navigation';
import { ACCOUNT_ROUTE_LABELS } from '@/routes/routePaths';
import type { AppRole } from '@/types/auth.types';

function resolvePageTitle(pathname: string, activeRole: AppRole | null): string {
  if (ACCOUNT_ROUTE_LABELS[pathname]) {
    return ACCOUNT_ROUTE_LABELS[pathname];
  }

  return getPageTitle(pathname, activeRole);
}

export function PrivateLayout() {
  const { activeRole } = useAuth();
  const location = useLocation();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const navItems = getNavigationForRole(activeRole);
  const roleLabel = activeRole ? getRoleLabel(activeRole) : undefined;
  const pageTitle = resolvePageTitle(location.pathname, activeRole);

  return (
    <AppShell
      mobileSidebarOpen={mobileSidebarOpen}
      onMobileSidebarClose={() => setMobileSidebarOpen(false)}
      sidebar={
        <Sidebar
          items={navItems}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed((value) => !value)}
          onNavigate={() => setMobileSidebarOpen(false)}
        />
      }
      topbar={
        <Topbar
          pageTitle={pageTitle}
          roleLabel={roleLabel}
          activeRole={activeRole}
          onMenuClick={() => setMobileSidebarOpen(true)}
        />
      }
    >
      <AppShellContent>
        <Outlet />
      </AppShellContent>
    </AppShell>
  );
}
