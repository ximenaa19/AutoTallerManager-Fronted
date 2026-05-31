import {
  ClipboardList,
  Package,
  Search,
  Wrench,
} from 'lucide-react';
import { dashboardApi } from '@/api/dashboard.api';
import { DashboardGrid } from '@/components/dashboard/DashboardGrid';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { DashboardSection } from '@/components/dashboard/DashboardSection';
import { QuickActionCard } from '@/components/dashboard/QuickActionCard';
import { StatCard } from '@/components/dashboard/StatCard';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingState } from '@/components/feedback/LoadingState';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { useAsyncRequest } from '@/hooks/useAsyncRequest';
import { ROUTES } from '@/routes/routePaths';
import { formatNumber } from '@/utils/format';

export function MechanicDashboardPage() {
  const { data, isLoading, error, retry } = useAsyncRequest(
    () => dashboardApi.getMechanicDashboard(),
    [],
  );

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
      <EmptyState
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
      />

      {!hasWork && (
        <EmptyState
          title="No assigned work yet"
          description="Assigned services and active orders will appear here when work is allocated to you."
        />
      )}

      <DashboardSection title="Work summary">
        <DashboardGrid className="2xl:grid-cols-2">
          <StatCard
            title="Assigned Services"
            value={formatNumber(data.assignedServices)}
            icon={<Wrench className="size-5" />}
            tone="purple"
            footer="Services assigned to you"
          />
          <StatCard
            title="Active Orders"
            value={formatNumber(data.activeOrders)}
            icon={<ClipboardList className="size-5" />}
            tone="info"
            footer="Orders currently in progress"
          />
          <StatCard
            title="Pending Work Reports"
            value={formatNumber(data.pendingWorkReports)}
            icon={<Wrench className="size-5" />}
            tone="warning"
            footer="Reports awaiting submission"
          />
          <StatCard
            title="Parts Pending Approval"
            value={formatNumber(data.requestedPartsPendingApproval)}
            icon={<Package className="size-5" />}
            tone="danger"
            footer={
              <Badge variant="pending" dot>
                Awaiting staff review
              </Badge>
            }
          />
        </DashboardGrid>
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
        description="Mechanic workflow modules arriving in Phase 6."
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          <QuickActionCard
            title="Assigned Services"
            description="Open your assigned service list."
            to={ROUTES.MECHANIC_ASSIGNED_SERVICES}
            icon={Wrench}
            badge={<Badge variant="default">Phase 6</Badge>}
          />
          <QuickActionCard
            title="Record Work"
            description="Submit work performed on an assigned service."
            to={ROUTES.MECHANIC_RECORD_WORK}
            icon={Wrench}
            badge={<Badge variant="default">Phase 6</Badge>}
          />
          <QuickActionCard
            title="Search Parts"
            description="Find spare parts available in inventory."
            to={ROUTES.MECHANIC_SEARCH_PARTS}
            icon={Search}
            badge={<Badge variant="default">Phase 6</Badge>}
          />
        </div>
      </DashboardSection>
    </div>
  );
}
