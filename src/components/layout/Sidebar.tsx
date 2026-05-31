import { ChevronLeft, ChevronRight } from 'lucide-react';
import { AppShellBrand } from '@/components/layout/AppShell';
import { SidebarNavItem } from '@/components/layout/SidebarNavItem';
import { cn } from '@/lib/cn';
import type { NavItem } from '@/routes/navigation';

export interface SidebarProps {
  items: NavItem[];
  collapsed: boolean;
  onToggleCollapse: () => void;
  onNavigate?: () => void;
  className?: string;
}

export function Sidebar({
  items,
  collapsed,
  onToggleCollapse,
  onNavigate,
  className,
}: SidebarProps) {
  return (
    <div
      className={cn(
        'flex h-full min-h-screen flex-col',
        collapsed ? 'w-[72px]' : 'w-[260px]',
        className,
      )}
    >
      <AppShellBrand compact={collapsed} />

      <nav
        aria-label="Main navigation"
        className="flex-1 space-y-1 overflow-y-auto px-3 py-4"
      >
        {items.map((item) => (
          <SidebarNavItem
            key={item.id}
            to={item.path}
            label={item.label}
            icon={item.icon}
            collapsed={collapsed}
            kind={item.kind}
            onNavigate={onNavigate}
          />
        ))}
      </nav>

      <div className="border-t border-border p-3">
        <button
          type="button"
          onClick={onToggleCollapse}
          className={cn(
            'hidden w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-text-secondary transition-colors hover:bg-bg-elevated/70 hover:text-text-primary lg:flex',
            collapsed && 'justify-center px-2',
          )}
        >
          {collapsed ? (
            <ChevronRight className="size-5" aria-hidden />
          ) : (
            <>
              <ChevronLeft className="size-5" aria-hidden />
              <span>Collapse menu</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
