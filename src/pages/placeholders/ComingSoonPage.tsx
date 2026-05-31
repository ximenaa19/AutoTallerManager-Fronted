import { Link, useLocation } from 'react-router-dom';
import { Construction } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { getComingSoonNavItem } from '@/routes/navigation';
import { ROUTES } from '@/routes/routePaths';

export function ComingSoonPage() {
  const { activeRole } = useAuth();
  const { pathname } = useLocation();
  const navItem = getComingSoonNavItem(pathname, activeRole);
  const isDeferred = navItem?.kind === 'deferred';

  const title = navItem?.label ?? 'Module';
  const description =
    navItem?.description ??
    'This module will be implemented in a future phase. Navigation and layout are ready, but business functionality is not available yet.';

  const dashboardRoute =
    activeRole === 'Admin'
      ? ROUTES.ADMIN_DASHBOARD
      : activeRole === 'Receptionist'
        ? ROUTES.RECEPTIONIST_DASHBOARD
        : activeRole === 'Mechanic'
          ? ROUTES.MECHANIC_DASHBOARD
          : activeRole === 'Client'
            ? ROUTES.CLIENT_DASHBOARD
            : ROUTES.LOGIN;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        {isDeferred ? (
          <Badge variant="pending">Deferred</Badge>
        ) : (
          <Badge variant="default">Coming soon</Badge>
        )}
        <h1 className="text-2xl font-bold tracking-tight text-text-primary sm:text-3xl">
          {title}
        </h1>
        <p className="max-w-2xl text-sm text-text-secondary">{description}</p>
      </div>

      <Card className="border-dashed">
        <CardHeader>
          <div className="mb-2 flex size-11 items-center justify-center rounded-lg bg-warning-muted text-warning">
            <Construction className="size-5" aria-hidden />
          </div>
          <CardTitle>
            {isDeferred ? 'Pending backend confirmation' : 'Module not available yet'}
          </CardTitle>
          <CardDescription>
            {isDeferred
              ? 'This feature is documented as deferred. No API integration or fake data has been added.'
              : 'Full CRUD and workflow screens for this area will arrive in the next implementation phases.'}
          </CardDescription>
        </CardHeader>
        <div>
          <Link to={dashboardRoute}>
            <Button variant="secondary" size="sm">
              Back to dashboard
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
