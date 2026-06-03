import type { LucideIcon } from 'lucide-react';
import {
  AlertTriangle,
  BarChart3,
  BookOpen,
  Car,
  ClipboardList,
  CreditCard,
  FileText,
  FolderOpen,
  History,
  LayoutDashboard,
  Package,
  Receipt,
  Search,
  Settings,
  Shield,
  ShoppingCart,
  UserCircle,
  Users,
  UserSquare2,
  Wrench,
} from 'lucide-react';
import { ROUTES } from '@/routes/routePaths';
import type { AppRole } from '@/types/auth.types';

export type NavItemKind = 'dashboard' | 'module' | 'deferred';

export interface NavItem {
  id: string;
  label: string;
  path: string;
  icon: LucideIcon;
  kind: NavItemKind;
  description?: string;
}

const ADMIN_NAV: NavItem[] = [
  {
    id: 'admin-dashboard',
    label: 'Dashboard',
    path: ROUTES.ADMIN_DASHBOARD,
    icon: LayoutDashboard,
    kind: 'dashboard',
  },
  {
    id: 'admin-users',
    label: 'Users',
    path: ROUTES.ADMIN_USERS,
    icon: Users,
    kind: 'module',
  },
  {
    id: 'admin-staff',
    label: 'Staff',
    path: ROUTES.ADMIN_STAFF,
    icon: UserSquare2,
    kind: 'module',
  },
  {
    id: 'admin-roles',
    label: 'Roles & Permissions',
    path: ROUTES.ADMIN_ROLES,
    icon: Shield,
    kind: 'module',
  },
  {
    id: 'admin-catalogs',
    label: 'Catalogs',
    path: ROUTES.ADMIN_CATALOGS,
    icon: FolderOpen,
    kind: 'module',
  },
  {
    id: 'admin-clients',
    label: 'Customers',
    path: ROUTES.ADMIN_CLIENTS,
    icon: Users,
    kind: 'module',
  },
  {
    id: 'admin-vehicles',
    label: 'Vehicles',
    path: ROUTES.ADMIN_VEHICLES,
    icon: Car,
    kind: 'module',
  },
  {
    id: 'admin-service-orders',
    label: 'Service Orders',
    path: ROUTES.ADMIN_SERVICE_ORDERS,
    icon: ClipboardList,
    kind: 'module',
  },
  {
    id: 'admin-mechanics',
    label: 'Mechanics',
    path: ROUTES.ADMIN_MECHANICS,
    icon: Wrench,
    kind: 'module',
  },
  {
    id: 'admin-inventory',
    label: 'Inventory',
    path: ROUTES.ADMIN_INVENTORY,
    icon: Package,
    kind: 'module',
  },
  {
    id: 'admin-purchases',
    label: 'Purchases',
    path: ROUTES.ADMIN_PURCHASES,
    icon: ShoppingCart,
    kind: 'module',
  },
  {
    id: 'admin-invoices',
    label: 'Invoicing',
    path: ROUTES.ADMIN_INVOICES,
    icon: FileText,
    kind: 'module',
  },
  {
    id: 'admin-payments',
    label: 'Payments',
    path: ROUTES.ADMIN_PAYMENTS,
    icon: CreditCard,
    kind: 'module',
  },
  {
    id: 'admin-reports',
    label: 'Reports',
    path: ROUTES.ADMIN_REPORTS,
    icon: BarChart3,
    kind: 'module',
  },
  {
    id: 'admin-audit',
    label: 'Audit',
    path: ROUTES.ADMIN_AUDIT,
    icon: BookOpen,
    kind: 'module',
  },
  {
    id: 'admin-settings',
    label: 'Settings',
    path: ROUTES.ADMIN_SETTINGS,
    icon: Settings,
    kind: 'deferred',
    description: 'Admin settings are deferred pending backend confirmation.',
  },
];

const RECEPTIONIST_NAV: NavItem[] = [
  {
    id: 'receptionist-dashboard',
    label: 'Dashboard',
    path: ROUTES.RECEPTIONIST_DASHBOARD,
    icon: LayoutDashboard,
    kind: 'dashboard',
  },
  {
    id: 'receptionist-clients',
    label: 'Customers',
    path: ROUTES.RECEPTIONIST_CLIENTS,
    icon: Users,
    kind: 'module',
  },
  {
    id: 'receptionist-vehicles',
    label: 'Vehicles',
    path: ROUTES.RECEPTIONIST_VEHICLES,
    icon: Car,
    kind: 'module',
  },
  {
    id: 'receptionist-new-order',
    label: 'New Service Order',
    path: ROUTES.RECEPTIONIST_SERVICE_ORDERS_NEW,
    icon: ClipboardList,
    kind: 'module',
  },
  {
    id: 'receptionist-active-orders',
    label: 'Active Orders',
    path: ROUTES.RECEPTIONIST_SERVICE_ORDERS,
    icon: ClipboardList,
    kind: 'module',
  },
  {
    id: 'receptionist-inventory',
    label: 'Inventory',
    path: ROUTES.RECEPTIONIST_INVENTORY,
    icon: Package,
    kind: 'module',
  },
  {
    id: 'receptionist-purchases',
    label: 'Purchases',
    path: ROUTES.RECEPTIONIST_PURCHASES,
    icon: ShoppingCart,
    kind: 'module',
  },
  {
    id: 'receptionist-invoices',
    label: 'Invoicing',
    path: ROUTES.RECEPTIONIST_INVOICES,
    icon: Receipt,
    kind: 'module',
  },
  {
    id: 'receptionist-payments',
    label: 'Payments',
    path: ROUTES.RECEPTIONIST_PAYMENTS,
    icon: CreditCard,
    kind: 'module',
  },
  {
    id: 'receptionist-search',
    label: 'Global Search',
    path: ROUTES.RECEPTIONIST_SEARCH,
    icon: Search,
    kind: 'deferred',
    description: 'Global search is deferred pending backend and UX confirmation.',
  },
];

const RECEPTIONIST_HIDDEN_DEFERRED_NAV: NavItem[] = [
  {
    id: 'receptionist-assign-mechanic',
    label: 'Assign Mechanic',
    path: ROUTES.RECEPTIONIST_ASSIGN_MECHANIC,
    icon: Wrench,
    kind: 'deferred',
    description: 'Assign mechanic is deferred for Receptionist and is not available in navigation.',
  },
];

const MECHANIC_NAV: NavItem[] = [
  {
    id: 'mechanic-dashboard',
    label: 'Dashboard',
    path: ROUTES.MECHANIC_DASHBOARD,
    icon: LayoutDashboard,
    kind: 'dashboard',
  },
  {
    id: 'mechanic-assigned-services',
    label: 'Assigned Services',
    path: ROUTES.MECHANIC_ASSIGNED_SERVICES,
    icon: Wrench,
    kind: 'module',
  },
  {
    id: 'mechanic-active-orders',
    label: 'Active Orders',
    path: ROUTES.MECHANIC_ACTIVE_ORDERS,
    icon: ClipboardList,
    kind: 'module',
  },
  {
    id: 'mechanic-order-detail',
    label: 'Service Detail',
    path: ROUTES.MECHANIC_SERVICE_DETAIL,
    icon: FileText,
    kind: 'module',
  },
  {
    id: 'mechanic-record-work',
    label: 'Record Work',
    path: ROUTES.MECHANIC_RECORD_WORK,
    icon: BookOpen,
    kind: 'module',
  },
  {
    id: 'mechanic-request-parts',
    label: 'Request Parts',
    path: ROUTES.MECHANIC_REQUEST_PARTS,
    icon: Package,
    kind: 'module',
  },
  {
    id: 'mechanic-search-parts',
    label: 'Search Parts',
    path: ROUTES.MECHANIC_SEARCH_PARTS,
    icon: Search,
    kind: 'module',
  },
  {
    id: 'mechanic-history',
    label: 'Work History',
    path: ROUTES.MECHANIC_HISTORY,
    icon: History,
    kind: 'deferred',
    description: 'Work history is deferred pending backend confirmation.',
  },
];

const CLIENT_NAV: NavItem[] = [
  {
    id: 'client-dashboard',
    label: 'Dashboard',
    path: ROUTES.CLIENT_DASHBOARD,
    icon: LayoutDashboard,
    kind: 'dashboard',
  },
  {
    id: 'client-vehicles',
    label: 'My Vehicles',
    path: ROUTES.CLIENT_VEHICLES,
    icon: Car,
    kind: 'module',
  },
  {
    id: 'client-orders',
    label: 'My Orders',
    path: ROUTES.CLIENT_SERVICE_ORDERS,
    icon: ClipboardList,
    kind: 'module',
  },
  {
    id: 'client-approvals',
    label: 'Pending Approvals',
    path: ROUTES.CLIENT_APPROVALS,
    icon: AlertTriangle,
    kind: 'module',
  },
  {
    id: 'client-invoices',
    label: 'My Invoices',
    path: ROUTES.CLIENT_INVOICES,
    icon: Receipt,
    kind: 'module',
  },
  {
    id: 'client-profile',
    label: 'Profile',
    path: ROUTES.ACCOUNT_PROFILE,
    icon: UserCircle,
    kind: 'module',
  },
];

const NAV_BY_ROLE: Record<AppRole, NavItem[]> = {
  Admin: ADMIN_NAV,
  Receptionist: RECEPTIONIST_NAV,
  Mechanic: MECHANIC_NAV,
  Client: CLIENT_NAV,
};

const NAV_LOOKUP_BY_ROLE: Record<AppRole, NavItem[]> = {
  Admin: ADMIN_NAV,
  Receptionist: [...RECEPTIONIST_NAV, ...RECEPTIONIST_HIDDEN_DEFERRED_NAV],
  Mechanic: MECHANIC_NAV,
  Client: CLIENT_NAV,
};

export function getNavigationForRole(role: AppRole | null): NavItem[] {
  if (!role) {
    return [];
  }
  return NAV_BY_ROLE[role];
}

export function findNavItemByPath(
  pathname: string,
  role: AppRole | null,
): NavItem | undefined {
  const items = getNavigationLookupForRole(role);
  return items.find((item) => isNavPathActive(item.path, pathname));
}

function normalizePath(path: string): string {
  if (path.endsWith('/0')) {
    return path.replace(/\/0$/, '');
  }
  return path;
}

export function isNavPathActive(itemPath: string, pathname: string): boolean {
  const normalizedItem = normalizePath(itemPath);
  const normalizedPath = pathname.replace(/\/$/, '') || '/';

  if (normalizedItem === normalizedPath) {
    return true;
  }

  if (normalizedItem.endsWith('/0')) {
    return false;
  }

  if (
    normalizedItem !== ROUTES.ADMIN_DASHBOARD &&
    normalizedItem !== ROUTES.RECEPTIONIST_DASHBOARD &&
    normalizedItem !== ROUTES.MECHANIC_DASHBOARD &&
    normalizedItem !== ROUTES.CLIENT_DASHBOARD &&
    normalizedPath.startsWith(`${normalizedItem}/`)
  ) {
    return true;
  }

  return false;
}

export function getPageTitle(pathname: string, role: AppRole | null): string {
  const navItem = findNavItemByPath(pathname, role);
  if (navItem) {
    return navItem.label;
  }

  return 'AutoTaller Manager';
}

export function getComingSoonNavItem(
  pathname: string,
  role: AppRole | null,
): NavItem | undefined {
  const items = getNavigationLookupForRole(role);
  return items.find((item) => {
    if (item.kind === 'dashboard') {
      return false;
    }
    return isNavPathActive(item.path, pathname);
  });
}

function getNavigationLookupForRole(role: AppRole | null): NavItem[] {
  if (!role) {
    return [];
  }
  return NAV_LOOKUP_BY_ROLE[role];
}

export interface QuickNavItem {
  id: string;
  label: string;
  path: string;
  keywords?: string[];
}

const ACCOUNT_QUICK_NAV: QuickNavItem[] = [
  {
    id: 'account-profile',
    label: 'My Profile',
    path: ROUTES.ACCOUNT_PROFILE,
    keywords: ['account', 'profile', 'me'],
  },
  {
    id: 'account-change-password',
    label: 'Change Password',
    path: ROUTES.ACCOUNT_CHANGE_PASSWORD,
    keywords: ['password', 'security', 'credentials'],
  },
];

export function getQuickNavItems(role: AppRole | null): QuickNavItem[] {
  const roleItems: QuickNavItem[] = getNavigationForRole(role).map((item) => ({
    id: item.id,
    label: item.label,
    path: item.path,
    keywords: item.description ? [item.description] : undefined,
  }));

  const accountItems = ACCOUNT_QUICK_NAV.filter(
    (item) => !roleItems.some((roleItem) => roleItem.path === item.path),
  );

  return [...roleItems, ...accountItems];
}

export function searchQuickNavItems(
  items: QuickNavItem[],
  query: string,
  limit = 8,
): QuickNavItem[] {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return items.slice(0, limit);
  }

  const terms = normalizedQuery.split(/\s+/).filter(Boolean);

  return items
    .filter((item) => {
      const haystack = [item.label, ...(item.keywords ?? [])]
        .join(' ')
        .toLowerCase();
      return terms.every((term) => haystack.includes(term));
    })
    .slice(0, limit);
}

export { ADMIN_NAV, RECEPTIONIST_NAV, MECHANIC_NAV, CLIENT_NAV };
