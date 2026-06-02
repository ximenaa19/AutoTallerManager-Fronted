import { FileText } from 'lucide-react';
import { reportsApi } from '@/features/admin/reports/api/reports.api';
import { ReportPanelShell } from '@/features/admin/reports/components/ReportPanelShell';
import { ReportSummaryCards } from '@/features/admin/reports/components/ReportSummaryCards';
import type { ReportDateRangeParams } from '@/features/admin/reports/types/reports.types';
import { useAsyncRequest } from '@/hooks/useAsyncRequest';
import { formatCurrency, formatNumber } from '@/utils/format';

export interface SalesReportPanelProps {
  queryParams?: ReportDateRangeParams;
}

export function SalesReportPanel({ queryParams }: SalesReportPanelProps) {
  const { data, isLoading, error, retry } = useAsyncRequest(
    () => reportsApi.getSales(queryParams),
    [queryParams?.from, queryParams?.to],
  );

  return (
    <ReportPanelShell
      title="Sales & invoicing"
      description="Invoice totals and status counts for the selected period."
      isLoading={isLoading}
      error={error}
      onRetry={retry}
    >
      {data && (
        <ReportSummaryCards
          metrics={[
            {
              id: 'invoices',
              title: 'Invoices',
              value: formatNumber(data.invoiceCount),
              footer: `${formatNumber(data.issuedInvoices)} issued · ${formatNumber(data.cancelledInvoices)} cancelled`,
              tone: 'accent',
            },
            {
              id: 'total',
              title: 'Total billed',
              value: formatCurrency(data.totalAmount),
              footer: `Subtotal ${formatCurrency(data.subtotalAmount)} · Tax ${formatCurrency(data.taxAmount)}`,
              tone: 'success',
            },
            {
              id: 'issued',
              title: 'Issued invoices',
              value: formatNumber(data.issuedInvoices),
              tone: 'info',
            },
            {
              id: 'cancelled',
              title: 'Cancelled invoices',
              value: formatNumber(data.cancelledInvoices),
              tone: 'danger',
            },
          ]}
        />
      )}
      {data && (data.from || data.to) && (
        <p className="mt-4 flex items-center gap-2 text-xs text-text-muted">
          <FileText className="size-3.5" aria-hidden />
          Report period returned by API:{' '}
          {data.from ? new Date(data.from).toLocaleDateString() : '—'} →{' '}
          {data.to ? new Date(data.to).toLocaleDateString() : '—'}
        </p>
      )}
    </ReportPanelShell>
  );
}
