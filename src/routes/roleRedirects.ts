import { getPrimaryRole, userNeedsRoleSelection } from '@/lib/roles';
import { ROUTES } from '@/routes/routePaths';
import type { AppRole } from '@/types/auth.types';

export const ROLE_HOME: Record<AppRole, string> = {
  Admin: ROUTES.ADMIN_DASHBOARD,
  Receptionist: ROUTES.RECEPTIONIST_DASHBOARD,
  Mechanic: ROUTES.MECHANIC_DASHBOARD,
  Client: ROUTES.CLIENT_DASHBOARD,
};

export function getHomeRouteForRole(role: AppRole): string {
  return ROLE_HOME[role];
}

export function resolvePostLoginRoute(
  roles: string[],
  selectedRole: AppRole | null,
): string {
  if (userNeedsRoleSelection(roles) && !selectedRole) {
    return ROUTES.SELECT_ROLE;
  }

  const activeRole = selectedRole ?? getPrimaryRole(roles);
  if (!activeRole) {
    return ROUTES.FORBIDDEN;
  }

  return getHomeRouteForRole(activeRole);
}
