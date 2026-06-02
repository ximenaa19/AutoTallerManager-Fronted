import { reportsApi } from '@/features/admin/reports/api/reports.api';
import { ReportPanelShell } from '@/features/admin/reports/components/ReportPanelShell';
import { ReportSummaryCards } from '@/features/admin/reports/components/ReportSummaryCards';
import type { ReportDateRangeParams } from '@/features/admin/reports/types/reports.types';
import { useAsyncRequest } from '@/hooks/useAsyncRequest';
import { formatNumber } from '@/utils/format';

export interface ServiceOrdersReportPanelProps {
  queryParams?: ReportDateRangeParams;
}

export function ServiceOrdersReportPanel({
  queryParams,
}: ServiceOrdersReportPanelProps) {
  const { data, isLoading, error, retry } = useAsyncRequest(
    () => reportsApi.getServiceOrders(queryParams),
    [queryParams?.from, queryParams?.to],
  );

  return (
    <ReportPanelShell
      title="Service orders"
      description="Order volume and status breakdown filtered by entry date when a range is applied."
      isLoading={isLoading}
      error={error}
      onRetry={retry}
    >
      {data && (
        <ReportSummaryCards
          metrics={[
            {
              id: 'total',
              title: 'Total orders',
              value: formatNumber(data.totalOrders),
              tone: 'accent',
            },
            {
              id: 'pending',
              title: 'Pending',
              value: formatNumber(data.pendingOrders),
              tone: 'warning',
            },
            {
              id: 'in-progress',
              title: 'In progress',
              value: formatNumber(data.inProgressOrders),
              tone: 'info',
            },
            {
              id: 'completed',
              title: 'Completed',
              value: formatNumber(data.completedOrders),
              tone: 'success',
            },
            {
              id: 'cancelled',
              title: 'Cancelled',
              value: formatNumber(data.cancelledOrders),
              tone: 'danger',
            },
            {
              id: 'voided',
              title: 'Voided',
              value: formatNumber(data.voidedOrders),
              tone: 'purple',
            },
          ]}
        />
      )}
    </ReportPanelShell>
  );
}
