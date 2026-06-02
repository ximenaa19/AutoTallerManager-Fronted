import { reportsApi } from '@/features/admin/reports/api/reports.api';
import { ReportPanelShell } from '@/features/admin/reports/components/ReportPanelShell';
import { ReportSummaryCards } from '@/features/admin/reports/components/ReportSummaryCards';
import type { ReportDateRangeParams } from '@/features/admin/reports/types/reports.types';
import { useAsyncRequest } from '@/hooks/useAsyncRequest';
import { formatCurrency, formatNumber } from '@/utils/format';

export interface PaymentsReportPanelProps {
  queryParams?: ReportDateRangeParams;
}

export function PaymentsReportPanel({ queryParams }: PaymentsReportPanelProps) {
  const { data, isLoading, error, retry } = useAsyncRequest(
    () => reportsApi.getPayments(queryParams),
    [queryParams?.from, queryParams?.to],
  );

  return (
    <ReportPanelShell
      title="Payments"
      description="Payment totals by status for the selected payment date range."
      isLoading={isLoading}
      error={error}
      onRetry={retry}
    >
      {data && (
        <ReportSummaryCards
          metrics={[
            {
              id: 'count',
              title: 'Payments',
              value: formatNumber(data.totalPayments),
              tone: 'accent',
            },
            {
              id: 'total',
              title: 'Total amount',
              value: formatCurrency(data.totalAmount),
              tone: 'info',
            },
            {
              id: 'completed',
              title: 'Completed',
              value: formatCurrency(data.completedAmount),
              tone: 'success',
            },
            {
              id: 'refunded',
              title: 'Refunded',
              value: formatCurrency(data.refundedAmount),
              tone: 'danger',
            },
            {
              id: 'pending',
              title: 'Pending / other',
              value: formatCurrency(data.pendingOrOtherAmount),
              tone: 'warning',
            },
          ]}
        />
      )}
    </ReportPanelShell>
  );
}
