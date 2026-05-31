import {
  AlertTriangle,
  CheckCircle2,
  ClipboardList,
  Clock,
  CreditCard,
  FileText,
  Package,
  Users,
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
import { useAsyncRequest } from '@/hooks/useAsyncRequest';
import { ROUTES } from '@/routes/routePaths';
import { formatCurrency, formatNumber } from '@/utils/format';

export function AdminDashboardPage() {
  const { data, isLoading, error, retry } = useAsyncRequest(
    () => dashboardApi.getAdminDashboard(),
    [],
  );

  if (isLoading) {
    return (
      <LoadingState
        title="Loading dashboard"
        description="Fetching workshop overview metrics…"
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
        action={
          <button
            type="button"
            onClick={retry}
            className="text-sm font-medium text-accent"
          >
            Refresh
          </button>
        }
      />
    );
  }

  const hasActivity =
    data.totalUsers > 0 ||
    data.totalClients > 0 ||
    data.activeServiceOrders > 0 ||
    data.totalInvoicedAmount > 0;

  return (
    <div className="space-y-8">
      <DashboardHeader
        title="Administrative Dashboard"
        subtitle="General summary of workshop operations."
      />

      {!hasActivity && (
        <EmptyState
          title="Workshop overview is empty"
          description="Metrics will appear here once users, customers, and service activity exist in the system."
        />
      )}

      <DashboardSection title="Operations overview">
        <DashboardGrid>
          <StatCard
            title="Total Users"
            value={formatNumber(data.totalUsers)}
            icon={<Users className="size-5" />}
            tone="accent"
            footer="All registered users"
          />
          <StatCard
            title="Active Users"
            value={formatNumber(data.activeUsers)}
            icon={<CheckCircle2 className="size-5" />}
            tone="success"
            footer={
              <span className="inline-flex items-center gap-1.5">
                <Badge variant="active" dot>
                  Active accounts
                </Badge>
              </span>
            }
          />
          <StatCard
            title="Total Customers"
            value={formatNumber(data.totalClients)}
            icon={<Users className="size-5" />}
            tone="info"
            footer="Registered customers"
          />
          <StatCard
            title="Total Mechanics"
            value={formatNumber(data.totalMechanics)}
            icon={<Wrench className="size-5" />}
            tone="purple"
            footer="Workshop mechanics"
          />
          <StatCard
            title="Active Orders"
            value={formatNumber(data.activeServiceOrders)}
            icon={<ClipboardList className="size-5" />}
            tone="warning"
            footer="Open service orders"
          />
          <StatCard
            title="Pending Orders"
            value={formatNumber(data.pendingOrders)}
            icon={<Clock className="size-5" />}
            tone="warning"
            footer={
              <Badge variant="pending" dot>
                Awaiting start
              </Badge>
            }
          />
          <StatCard
            title="Orders In Progress"
            value={formatNumber(data.inProgressOrders)}
            icon={<Wrench className="size-5" />}
            tone="info"
            footer={
              <Badge variant="completed" dot>
                In execution
              </Badge>
            }
          />
          <StatCard
            title="Completed Orders"
            value={formatNumber(data.completedOrders)}
            icon={<CheckCircle2 className="size-5" />}
            tone="success"
            footer="Completed aggregate"
          />
          <StatCard
            title="Low Stock Parts"
            value={formatNumber(data.lowStockParts)}
            icon={<AlertTriangle className="size-5" />}
            tone="danger"
            footer={
              <Badge variant="low-stock" dot>
                Requires attention
              </Badge>
            }
          />
        </DashboardGrid>
      </DashboardSection>

      <DashboardSection
        title="Financial summary"
        description="Invoicing and payment totals from the admin dashboard API."
      >
        <DashboardGrid className="2xl:grid-cols-3">
          <StatCard
            title="Total Invoiced"
            value={formatCurrency(data.totalInvoicedAmount)}
            icon={<FileText className="size-5" />}
            tone="info"
            footer="Invoiced amount aggregate"
          />
          <StatCard
            title="Completed Payments"
            value={formatCurrency(data.totalCompletedPaymentsAmount)}
            icon={<CreditCard className="size-5" />}
            tone="success"
            footer="Recorded payments"
          />
          <StatCard
            title="Pending Payments"
            value={formatCurrency(data.pendingPaymentAmount)}
            icon={<CreditCard className="size-5" />}
            tone="warning"
            footer="Outstanding balance"
          />
        </DashboardGrid>
      </DashboardSection>

      <DashboardSection
        title="Quick actions"
        description="Shortcuts to operational modules arriving in Phase 4."
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <QuickActionCard
            title="Service Orders"
            description="Review and manage the full service order lifecycle."
            to={ROUTES.ADMIN_SERVICE_ORDERS}
            icon={ClipboardList}
            badge={<Badge variant="default">Phase 4</Badge>}
          />
          <QuickActionCard
            title="Customers"
            description="Search and manage customer records."
            to={ROUTES.ADMIN_CLIENTS}
            icon={Users}
            badge={<Badge variant="default">Phase 4</Badge>}
          />
          <QuickActionCard
            title="Inventory"
            description="Monitor parts stock and low inventory alerts."
            to={ROUTES.ADMIN_INVENTORY}
            icon={Package}
            badge={<Badge variant="default">Phase 4</Badge>}
          />
          <QuickActionCard
            title="Reports"
            description="Open analytics and operational reports."
            to={ROUTES.ADMIN_REPORTS}
            icon={FileText}
            badge={<Badge variant="default">Phase 4</Badge>}
          />
        </div>
      </DashboardSection>
    </div>
  );
}
