import { ClipboardList, RefreshCw } from 'lucide-react';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingState } from '@/components/feedback/LoadingState';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { ClientServiceOrderDetailModal } from '@/features/client/components/ClientServiceOrderDetailModal';
import { ClientServiceOrdersTable } from '@/features/client/components/ClientServiceOrdersTable';
import { useClientServiceOrders } from '@/features/client/hooks/useClientServiceOrders';

export function ClientServiceOrdersPage() {
  const serviceOrders = useClientServiceOrders();

  if (serviceOrders.isLoading) {
    return (
      <LoadingState
        title="Loading service orders"
        description="Getting the workshop service orders linked to your vehicles."
        className="min-h-[420px]"
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <DashboardHeader
          title="My Service Orders"
          subtitle="Track the workshop service orders linked to your vehicles."
        />
        <Button
          variant="secondary"
          leftIcon={<RefreshCw className="size-4" />}
          onClick={() => {
            void serviceOrders.retry();
          }}
          disabled={serviceOrders.detailLoading}
        >
          Refresh
        </Button>
      </div>

      {serviceOrders.error ? (
        <ErrorState
          title="Unable to load service orders"
          message={serviceOrders.error}
          onRetry={serviceOrders.retry}
        />
      ) : serviceOrders.serviceOrders.length === 0 ? (
        <EmptyState
          title="You do not have service orders yet."
          description="Service orders linked to your vehicles will appear here once the workshop starts one."
          icon={<ClipboardList className="size-6" />}
          className="rounded-lg border border-border bg-bg-surface"
        />
      ) : (
        <Card padding="none">
          <CardContent>
            <ClientServiceOrdersTable
              serviceOrders={serviceOrders.serviceOrders}
              onViewDetails={(serviceOrderId) => {
                void serviceOrders.openDetail(serviceOrderId);
              }}
            />
          </CardContent>
        </Card>
      )}

      <ClientServiceOrderDetailModal
        serviceOrderId={serviceOrders.selectedServiceOrderId}
        detail={serviceOrders.detail}
        isLoading={serviceOrders.detailLoading}
        error={serviceOrders.detailError}
        onRetry={serviceOrders.retryDetail}
        onClose={serviceOrders.closeDetail}
      />
    </div>
  );
}
