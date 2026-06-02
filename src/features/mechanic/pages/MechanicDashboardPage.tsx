import { Link } from 'react-router-dom';
import { ArrowRight, ClipboardList, Wrench } from 'lucide-react';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { DashboardSection } from '@/components/dashboard/DashboardSection';
import { QuickActionCard } from '@/components/dashboard/QuickActionCard';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingState } from '@/components/feedback/LoadingState';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { MechanicDashboardCards } from '@/features/mechanic/components/MechanicDashboardCards';
import { MechanicEmptyState } from '@/features/mechanic/components/MechanicEmptyState';
import { useMechanicDashboard } from '@/features/mechanic/hooks/useMechanicDashboard';
import { ROUTES } from '@/routes/routePaths';

export function MechanicDashboardPage() {
  const { data, isLoading, error, retry } = useMechanicDashboard();

  if (isLoading) {
    return (
      <LoadingState
        title="Loading dashboard"
        description="Fetching assigned work overview…"
        className="min-h-[420px]"
      />
    );
  }

  if (error) {
    return (
      <ErrorState
        title="Unable to load dashboard"
        message={error}
        onRetry={retry}
      />
    );
  }

  if (!data) {
    return (
      <MechanicEmptyState
        title="No dashboard data"
        description="The dashboard response was empty. Try refreshing the page."
      />
    );
  }

  const orderIds = data.activeServiceOrderIds ?? [];
  const hasWork =
    data.assignedServices > 0 ||
    data.activeOrders > 0 ||
    orderIds.length > 0;

  return (
    <div className="space-y-8">
      <DashboardHeader
        title="Mechanic Dashboard"
        subtitle="Shift overview for assigned services and active workshop orders."
        actions={
          <Link to={ROUTES.MECHANIC_ASSIGNED_SERVICES}>
            <Button variant="secondary" rightIcon={<ArrowRight className="size-4" />}>
              View assigned work
            </Button>
          </Link>
        }
      />

      {!hasWork && (
        <MechanicEmptyState
          title="No assigned work yet"
          description="Assigned services and active orders will appear here when work is allocated to you."
          action={
            <Link to={ROUTES.MECHANIC_ASSIGNED_SERVICES}>
              <Button variant="secondary">Open assigned services</Button>
            </Link>
          }
        />
      )}

      <DashboardSection title="Work summary">
        <MechanicDashboardCards data={data} />
      </DashboardSection>

      <DashboardSection
        title="Active service orders"
        description="Order IDs currently associated with your active workload."
      >
        {orderIds.length === 0 ? (
          <Card padding="md" className="border-dashed">
            <EmptyState
              title="No active order IDs"
              description="The API did not return any active service order identifiers."
            />
          </Card>
        ) : (
          <div className="flex flex-wrap gap-2">
            {orderIds.map((orderId) => (
              <Badge key={orderId} variant="completed">
                Order #{orderId}
              </Badge>
            ))}
          </div>
        )}
      </DashboardSection>

      <DashboardSection
        title="Quick actions"
        description="Open your assigned work. Record work from a specific service on the Assigned Services page."
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          <QuickActionCard
            title="Assigned Services"
            description="Review every service currently assigned to you."
            to={ROUTES.MECHANIC_ASSIGNED_SERVICES}
            icon={Wrench}
          />
          <QuickActionCard
            title="Active Orders"
            description="View active orders linked to your assignments."
            to={ROUTES.MECHANIC_ACTIVE_ORDERS}
            icon={ClipboardList}
          />
          <QuickActionCard
            title="Record work from Assigned Services"
            description="Select an assigned service, then use Record work on that card to submit your report."
            to={ROUTES.MECHANIC_ASSIGNED_SERVICES}
            icon={Wrench}
          />
        </div>
      </DashboardSection>
    </div>
  );
}
