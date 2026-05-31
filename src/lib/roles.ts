import type { AppRole } from '@/types/auth.types';

export const APP_ROLES: AppRole[] = [
  'Admin',
  'Receptionist',
  'Mechanic',
  'Client',
];

/** Priority fallback when no role is explicitly selected (open-questions.md) */
export const ROLE_PRIORITY: AppRole[] = [
  'Admin',
  'Receptionist',
  'Mechanic',
  'Client',
];

export function isAppRole(value: string): value is AppRole {
  return APP_ROLES.includes(value as AppRole);
}

export function getPrimaryRole(roles: string[]): AppRole | null {
  for (const role of ROLE_PRIORITY) {
    if (roles.includes(role)) {
      return role;
    }
  }
  return null;
}

export function resolveActiveRole(
  roles: string[],
  selectedRole: AppRole | null,
): AppRole | null {
  if (selectedRole && roles.includes(selectedRole)) {
    return selectedRole;
  }
  return getPrimaryRole(roles);
}

export function hasAnyRole(
  userRoles: string[],
  requiredRoles: AppRole[],
): boolean {
  return requiredRoles.some((role) => userRoles.includes(role));
}

export function hasRouteAccess(
  userRoles: string[],
  requiredRoles: AppRole[],
  activeRole: AppRole | null,
): boolean {
  if (!hasAnyRole(userRoles, requiredRoles)) {
    return false;
  }

  if (userRoles.length <= 1) {
    return true;
  }

  return activeRole !== null && requiredRoles.includes(activeRole);
}

export function getRoleLabel(role: AppRole): string {
  switch (role) {
    case 'Admin':
      return 'Administrator';
    case 'Receptionist':
      return 'Receptionist';
    case 'Mechanic':
      return 'Mechanic';
    case 'Client':
      return 'Client';
    default:
      return role;
  }
}

export function userNeedsRoleSelection(roles: string[]): boolean {
  const appRoles = roles.filter(isAppRole);
  return appRoles.length > 1;
}
