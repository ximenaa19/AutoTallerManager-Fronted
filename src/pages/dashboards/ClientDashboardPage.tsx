import {
  AlertTriangle,
  Car,
  ClipboardList,
  Receipt,
  UserCheck,
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

export function ClientDashboardPage() {
  const { data, isLoading, error, retry } = useAsyncRequest(
    () => dashboardApi.getClientDashboard(),
    [],
  );

  if (isLoading) {
    return (
      <LoadingState
        title="Loading dashboard"
        description="Fetching your workshop portal overview…"
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

  const recentOrderIds = data.recentServiceOrderIds ?? [];
  const hasPortalActivity =
    data.totalVehicles > 0 ||
    data.activeServiceOrders > 0 ||
    data.pendingApprovals > 0 ||
    recentOrderIds.length > 0;

  return (
    <div className="space-y-8">
      <DashboardHeader
        title="Client Dashboard"
        subtitle="Track your vehicles, service orders, pending approvals, and invoices."
      />

      {!hasPortalActivity && (
        <EmptyState
          title="Your portal is quiet"
          description="Your vehicles, service orders, approvals, and invoices will appear here as the workshop starts working with your vehicles."
        />
      )}

      <DashboardSection title="Your overview">
        <DashboardGrid className="2xl:grid-cols-2">
          <StatCard
            title="My Vehicles"
            value={formatNumber(data.totalVehicles)}
            icon={<Car className="size-5" />}
            tone="teal"
            footer="Registered vehicles"
          />
          <StatCard
            title="Active Service Orders"
            value={formatNumber(data.activeServiceOrders)}
            icon={<ClipboardList className="size-5" />}
            tone="info"
            footer="Orders in progress"
          />
          <StatCard
            title="Pending Approvals"
            value={formatNumber(data.pendingApprovals)}
            icon={<UserCheck className="size-5" />}
            tone="warning"
            footer={
              <Badge variant={data.pendingApprovals > 0 ? 'pending' : 'active'} dot>
                {data.pendingApprovals > 0 ? 'Action required' : 'Up to date'}
              </Badge>
            }
          />
          <StatCard
            title="Pending Invoices"
            value={formatNumber(data.pendingInvoices)}
            icon={<Receipt className="size-5" />}
            tone="accent"
            footer="Outstanding billing items"
          />
        </DashboardGrid>
      </DashboardSection>

      <DashboardSection
        title="Recent service orders"
        description="Your most recent service order references."
      >
        {recentOrderIds.length === 0 ? (
          <Card padding="md" className="border-dashed">
            <EmptyState
              title="No recent orders"
              description="Recent service order references will appear here when available."
            />
          </Card>
        ) : (
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {recentOrderIds.map((orderId) => (
                <Badge key={orderId} variant="completed">
                  Order #{orderId}
                </Badge>
              ))}
            </div>
            <p className="text-sm text-text-secondary">
              Open My Orders to review full service order details.
            </p>
          </div>
        )}
      </DashboardSection>

      <DashboardSection
        title="Quick actions"
        description="Client portal shortcuts."
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <QuickActionCard
            title="My Vehicles"
            description="View vehicles linked to your account."
            to={ROUTES.CLIENT_VEHICLES}
            icon={Car}
            badge={<Badge variant="active">Available</Badge>}
          />
          <QuickActionCard
            title="My Orders"
            description="Review service orders linked to your vehicles."
            to={ROUTES.CLIENT_SERVICE_ORDERS}
            icon={ClipboardList}
            badge={<Badge variant="active">Available</Badge>}
          />
          <QuickActionCard
            title="Pending Approvals"
            description="Review services and parts waiting for your approval."
            to={ROUTES.CLIENT_APPROVALS}
            icon={AlertTriangle}
            badge={
              <Badge variant={data.pendingApprovals > 0 ? 'pending' : 'active'}>
                {data.pendingApprovals > 0 ? 'Action required' : 'Up to date'}
              </Badge>
            }
          />
          <QuickActionCard
            title="My Invoices"
            description="Review your invoices and payment status."
            to={ROUTES.CLIENT_INVOICES}
            icon={Receipt}
            badge={<Badge variant="active">Available</Badge>}
          />
        </div>
      </DashboardSection>
    </div>
  );
}
