import { reportsApi } from '@/features/admin/reports/api/reports.api';
import { ReportPanelShell } from '@/features/admin/reports/components/ReportPanelShell';
import { ReportSummaryCards } from '@/features/admin/reports/components/ReportSummaryCards';
import type { ReportDateRangeParams } from '@/features/admin/reports/types/reports.types';
import { useAsyncRequest } from '@/hooks/useAsyncRequest';
import { formatNumber } from '@/utils/format';

export interface MechanicsReportPanelProps {
  queryParams?: ReportDateRangeParams;
}

export function MechanicsReportPanel({ queryParams }: MechanicsReportPanelProps) {
  const { data, isLoading, error, retry } = useAsyncRequest(
    () => reportsApi.getMechanics(queryParams),
    [queryParams?.from, queryParams?.to],
  );

  return (
    <ReportPanelShell
      title="Mechanics"
      description="Mechanic roster counts and assignment/work-report metrics for orders in the date range."
      isLoading={isLoading}
      error={error}
      onRetry={retry}
    >
      {data && (
        <ReportSummaryCards
          metrics={[
            {
              id: 'mechanics',
              title: 'Mechanics',
              value: formatNumber(data.totalMechanics),
              footer: `${formatNumber(data.activeMechanics)} active`,
              tone: 'accent',
            },
            {
              id: 'assignments',
              title: 'Assignments',
              value: formatNumber(data.totalAssignments),
              tone: 'info',
            },
            {
              id: 'work-done',
              title: 'With work performed',
              value: formatNumber(data.servicesWithWorkPerformed),
              tone: 'success',
            },
            {
              id: 'work-pending',
              title: 'Pending work report',
              value: formatNumber(data.servicesPendingWorkPerformed),
              tone: 'warning',
            },
          ]}
        />
      )}
    </ReportPanelShell>
  );
}
