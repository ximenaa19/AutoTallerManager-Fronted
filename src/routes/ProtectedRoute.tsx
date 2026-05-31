import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { LoadingState } from '@/components/feedback/LoadingState';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { ROUTES } from '@/routes/routePaths';

export function ProtectedRoute() {
  const { isAuthenticated, isBootstrapping } = useAuth();
  const location = useLocation();

  if (isBootstrapping) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg-base">
        <LoadingState title="Restoring session" description="Please wait..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}
