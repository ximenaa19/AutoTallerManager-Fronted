import { NavLink } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/cn';
import type { NavItemKind } from '@/routes/navigation';

export interface SidebarNavItemProps {
  to: string;
  label: string;
  icon: LucideIcon;
  collapsed?: boolean;
  kind?: NavItemKind;
  onNavigate?: () => void;
}

export function SidebarNavItem({
  to,
  label,
  icon: Icon,
  collapsed = false,
  kind = 'module',
  onNavigate,
}: SidebarNavItemProps) {
  const showBadge = kind === 'module' || kind === 'deferred';

  return (
    <NavLink
      to={to}
      end={kind === 'dashboard'}
      onClick={onNavigate}
      title={collapsed ? label : undefined}
      className={({ isActive }) =>
        cn(
          'group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-150',
          collapsed && 'justify-center px-2',
          isActive
            ? 'bg-accent-muted text-text-primary before:absolute before:inset-y-1 before:left-0 before:w-1 before:rounded-r before:bg-accent'
            : 'text-text-secondary hover:bg-bg-elevated/70 hover:text-text-primary',
        )
      }
    >
      <Icon className="size-5 shrink-0" aria-hidden />
      {!collapsed && (
        <>
          <span className="truncate">{label}</span>
          {showBadge && kind === 'deferred' && (
            <span className="ml-auto rounded-full bg-warning-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-warning">
              Deferred
            </span>
          )}
        </>
      )}
    </NavLink>
  );
}
