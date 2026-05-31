import { ShieldX } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { getHomeRouteForRole } from '@/routes/roleRedirects';
import { ROUTES } from '@/routes/routePaths';

export function ForbiddenPage() {
  const { activeRole, logout } = useAuth();

  const homeRoute = activeRole ? getHomeRouteForRole(activeRole) : ROUTES.LOGIN;

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-base px-4 py-8">
      <Card className="w-full max-w-lg text-center">
        <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-danger-muted text-danger">
          <ShieldX className="size-7" aria-hidden />
        </div>
        <h1 className="text-xl font-semibold text-text-primary">Access denied</h1>
        <p className="mt-2 text-sm text-text-secondary">
          You do not have permission to view this page with your current role.
        </p>
        <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
          <Link to={homeRoute}>
            <Button variant="primary">Go to my area</Button>
          </Link>
          <Button variant="ghost" onClick={() => void logout()}>
            Sign out
          </Button>
        </div>
      </Card>
    </div>
  );
}
