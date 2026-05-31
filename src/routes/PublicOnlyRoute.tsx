import { Navigate, Outlet } from 'react-router-dom';
import { LoadingState } from '@/components/feedback/LoadingState';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { resolvePostLoginRoute } from '@/routes/roleRedirects';
import { getSelectedRole } from '@/lib/authToken';

export function PublicOnlyRoute() {
  const { isAuthenticated, isBootstrapping, user } = useAuth();

  if (isBootstrapping) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg-base">
        <LoadingState title="Loading" />
      </div>
    );
  }

  if (isAuthenticated && user) {
    const destination = resolvePostLoginRoute(user.roles, getSelectedRole());
    return <Navigate to={destination} replace />;
  }

  return <Outlet />;
}
