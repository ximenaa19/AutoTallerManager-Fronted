import { reportsApi } from '@/features/admin/reports/api/reports.api';
import { ReportPanelShell } from '@/features/admin/reports/components/ReportPanelShell';
import { ReportSummaryCards } from '@/features/admin/reports/components/ReportSummaryCards';
import type { ReportDateRangeParams } from '@/features/admin/reports/types/reports.types';
import { useAsyncRequest } from '@/hooks/useAsyncRequest';
import { formatCurrency, formatNumber } from '@/utils/format';

export interface InventoryReportPanelProps {
  queryParams?: ReportDateRangeParams;
}

export function InventoryReportPanel({ queryParams }: InventoryReportPanelProps) {
  const { data, isLoading, error, retry } = useAsyncRequest(
    () => reportsApi.getInventory(queryParams),
    [queryParams?.from, queryParams?.to],
  );

  return (
    <ReportPanelShell
      title="Inventory"
      description="Parts stock snapshot. Purchase counts and amounts respect the date range when applied."
      isLoading={isLoading}
      error={error}
      onRetry={retry}
    >
      {data && (
        <ReportSummaryCards
          metrics={[
            {
              id: 'total-parts',
              title: 'Total parts',
              value: formatNumber(data.totalParts),
              footer: `${formatNumber(data.activeParts)} active`,
              tone: 'accent',
            },
            {
              id: 'stock-alerts',
              title: 'Low / out of stock',
              value: `${formatNumber(data.lowStockParts)} / ${formatNumber(data.outOfStockParts)}`,
              footer: 'Low stock · Out of stock',
              tone: 'warning',
            },
            {
              id: 'value',
              title: 'Estimated inventory value',
              value: formatCurrency(data.estimatedInventoryValue),
              tone: 'success',
            },
            {
              id: 'purchases',
              title: 'Purchases in range',
              value: formatNumber(data.purchasesCount),
              footer: formatCurrency(data.purchasesAmount),
              tone: 'teal',
            },
          ]}
        />
      )}
    </ReportPanelShell>
  );
}
