import {
  AlertTriangle,
  Car,
  CheckCircle2,
  ClipboardList,
  Clock,
  Package,
  Receipt,
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
import { useAsyncRequest } from '@/hooks/useAsyncRequest';
import { ROUTES } from '@/routes/routePaths';
import { formatNumber } from '@/utils/format';

export function ReceptionistDashboardPage() {
  const { data, isLoading, error, retry } = useAsyncRequest(
    () => dashboardApi.getReceptionistDashboard(),
    [],
  );

  if (isLoading) {
    return (
      <LoadingState
        title="Loading dashboard"
        description="Fetching reception operations overview…"
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

  const hasActivity =
    data.pendingOrders > 0 ||
    data.inProgressOrders > 0 ||
    data.vehiclesCurrentlyInWorkshop > 0;

  return (
    <div className="space-y-8">
      <DashboardHeader
        title="Reception Dashboard"
        subtitle="Daily operational overview for front-desk workflow."
      />

      {!hasActivity && (
        <EmptyState
          title="No active workshop activity"
          description="Pending orders, vehicles in the workshop, and invoice alerts will appear here during daily operations."
        />
      )}

      <DashboardSection title="Today's operations">
        <DashboardGrid className="2xl:grid-cols-3">
          <StatCard
            title="Pending Orders"
            value={formatNumber(data.pendingOrders)}
            icon={<Clock className="size-5" />}
            tone="warning"
            footer={
              <Badge variant="pending" dot>
                Waiting to start
              </Badge>
            }
          />
          <StatCard
            title="Orders In Progress"
            value={formatNumber(data.inProgressOrders)}
            icon={<ClipboardList className="size-5" />}
            tone="info"
            footer="Currently being serviced"
          />
          <StatCard
            title="Completed Today"
            value={formatNumber(data.completedOrdersToday)}
            icon={<CheckCircle2 className="size-5" />}
            tone="success"
            footer="Finished today"
          />
          <StatCard
            title="Vehicles In Workshop"
            value={formatNumber(data.vehiclesCurrentlyInWorkshop)}
            icon={<Car className="size-5" />}
            tone="teal"
            footer="On-site vehicles"
          />
          <StatCard
            title="Pending Invoices"
            value={formatNumber(data.pendingInvoices)}
            icon={<Receipt className="size-5" />}
            tone="warning"
            footer="Awaiting billing action"
          />
          <StatCard
            title="Low Stock Parts"
            value={formatNumber(data.lowStockParts)}
            icon={<AlertTriangle className="size-5" />}
            tone="danger"
            footer={
              <Badge variant="low-stock" dot>
                Inventory alert
              </Badge>
            }
          />
        </DashboardGrid>
      </DashboardSection>

      <DashboardSection
        title="Quick actions"
        description="Operational shortcuts for reception workflows in upcoming phases."
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <QuickActionCard
            title="New Service Order"
            description="Start workshop intake for a customer vehicle."
            to={ROUTES.RECEPTIONIST_SERVICE_ORDERS_NEW}
            icon={ClipboardList}
            badge={<Badge variant="default">Phase 5</Badge>}
          />
          <QuickActionCard
            title="Active Orders"
            description="Review orders currently in the workshop pipeline."
            to={ROUTES.RECEPTIONIST_SERVICE_ORDERS}
            icon={ClipboardList}
            badge={<Badge variant="default">Phase 5</Badge>}
          />
          <QuickActionCard
            title="Invoicing"
            description="Issue and manage customer invoices."
            to={ROUTES.RECEPTIONIST_INVOICES}
            icon={Receipt}
            badge={<Badge variant="default">Phase 5</Badge>}
          />
          <QuickActionCard
            title="Inventory"
            description="Check stock levels and part availability."
            to={ROUTES.RECEPTIONIST_INVENTORY}
            icon={Package}
            badge={<Badge variant="default">Phase 5</Badge>}
          />
        </div>
      </DashboardSection>
    </div>
  );
}
