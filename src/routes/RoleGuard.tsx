import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { hasRouteAccess, userNeedsRoleSelection } from '@/lib/roles';
import { ROUTES } from '@/routes/routePaths';
import type { AppRole } from '@/types/auth.types';

interface RoleGuardProps {
  allowedRoles: AppRole[];
}

export function RoleGuard({ allowedRoles }: RoleGuardProps) {
  const { user, activeRole } = useAuth();

  if (!user) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  if (userNeedsRoleSelection(user.roles) && !activeRole) {
    return <Navigate to={ROUTES.SELECT_ROLE} replace />;
  }

  if (!hasRouteAccess(user.roles, allowedRoles, activeRole)) {
    return <Navigate to={ROUTES.FORBIDDEN} replace />;
  }

  return <Outlet />;
}
