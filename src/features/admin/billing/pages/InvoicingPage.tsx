import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, FilePlus2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { AdminDataTable } from '@/features/admin/components/AdminDataTable';
import { AdminPageHeader } from '@/features/admin/components/AdminPageHeader';
import { AdminToolbar } from '@/features/admin/components/AdminToolbar';
import { invoicesApi } from '@/features/admin/billing/api/invoices.api';
import { GenerateInvoiceModal } from '@/features/admin/billing/components/GenerateInvoiceModal';
import { InvoiceStatusBadge } from '@/features/admin/billing/components/InvoiceStatusBadge';
import { useBillingLookups } from '@/features/admin/billing/hooks/useBillingLookups';
import {
  filterBySearchTerm,
  useClientPagination,
} from '@/features/admin/hooks/useClientPagination';
import { useAsyncRequest } from '@/hooks/useAsyncRequest';
import { invoiceMatchesSearchTerm } from '@/features/admin/billing/utils/billingSearch';
import { adminInvoiceDetailPath } from '@/routes/routePaths';
import { formatCurrency, formatDateTime } from '@/utils/format';

export function InvoicingPage() {
  const navigate = useNavigate();
  const { lookups, isLoading: catalogsLoading, retry: retryLookups } =
    useBillingLookups();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [generateOpen, setGenerateOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const loadInvoices = useCallback(() => invoicesApi.getAll(), []);

  const {
    data: invoices,
    isLoading,
    error,
    retry,
  } = useAsyncRequest(loadInvoices, [refreshKey]);

  const refreshAll = () => {
    setRefreshKey((value) => value + 1);
    void retryLookups();
  };

  const filteredInvoices = useMemo(() => {
    let result = invoices ?? [];

    if (statusFilter) {
      const statusId = Number(statusFilter);
      result = result.filter((invoice) => invoice.invoiceStatusId === statusId);
    }

    return filterBySearchTerm(result, searchTerm, (invoice, term) =>
      invoiceMatchesSearchTerm(
        invoice,
        term,
        lookups.invoiceStatusNameById.get(invoice.invoiceStatusId) ??
          `Status #${invoice.invoiceStatusId}`,
      ),
    );
  }, [invoices, searchTerm, statusFilter, lookups.invoiceStatusNameById]);

  const pagination = useClientPagination(filteredInvoices);

  const statusFilterOptions = [
    { value: '', label: 'All statuses' },
    ...lookups.invoiceStatuses.map((status) => ({
      value: String(status.invoiceStatusId),
      label: status.name,
    })),
  ];

  return (
    <div className="flex flex-col gap-8">
      <AdminPageHeader
        title="Invoicing"
        description="Generate, issue, and manage customer invoices linked to service orders."
        actions={
          <>
            <Button
              variant="secondary"
              leftIcon={<RefreshCw className="size-4" />}
              onClick={refreshAll}
            >
              Refresh
            </Button>
            <Button
              leftIcon={<FilePlus2 className="size-4" />}
              onClick={() => setGenerateOpen(true)}
            >
              Generate invoice
            </Button>
          </>
        }
      />

      {successMessage && (
        <div
          className="rounded-lg border border-success/30 bg-success-muted px-4 py-3 text-sm text-success"
          role="status"
        >
          {successMessage}
        </div>
      )}

      <AdminToolbar
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search by invoice #, number, order ID, status, date, total…"
        summary={
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-xs text-text-muted">
              {filteredInvoices.length} invoice
              {filteredInvoices.length === 1 ? '' : 's'}
            </p>
            <Select
              name="invoice-status-filter"
              label="Status filter"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              options={statusFilterOptions}
              className="min-w-[160px]"
            />
          </div>
        }
      />

      <AdminDataTable
        columns={[
          {
            id: 'number',
            header: 'Invoice',
            cell: (row) => (
              <div>
                <p className="font-medium text-text-primary">{row.invoiceNumber}</p>
                <p className="text-xs text-text-muted">#{row.invoiceId}</p>
              </div>
            ),
          },
          {
            id: 'order',
            header: 'Service order',
            className: 'w-28',
            cell: (row) => `#${row.serviceOrderId}`,
          },
          {
            id: 'date',
            header: 'Date',
            cell: (row) => formatDateTime(row.invoiceDate),
          },
          {
            id: 'status',
            header: 'Status',
            cell: (row) => (
              <InvoiceStatusBadge
                invoiceStatusId={row.invoiceStatusId}
                catalogNameById={lookups.invoiceStatusNameById}
              />
            ),
          },
          {
            id: 'total',
            header: 'Total',
            cell: (row) => formatCurrency(row.total),
          },
          {
            id: 'actions',
            header: '',
            className: 'w-20 text-right',
            cell: (row) => (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(adminInvoiceDetailPath(row.invoiceId))}
                aria-label={`View invoice ${row.invoiceNumber}`}
              >
                <Eye className="size-4" />
              </Button>
            ),
          },
        ]}
        data={pagination.items}
        rowKey={(row) => row.invoiceId}
        isLoading={isLoading || catalogsLoading}
        error={error}
        onRetry={retry}
        emptyTitle="No invoices yet"
        emptyDescription="Generate an invoice from a completed service order with approved billable items."
        emptyAction={
          <Button
            variant="secondary"
            leftIcon={<FilePlus2 className="size-4" />}
            onClick={() => setGenerateOpen(true)}
          >
            Generate invoice
          </Button>
        }
        page={pagination.page}
        totalPages={pagination.totalPages}
        totalCount={pagination.totalCount}
        onPageChange={pagination.setPage}
      />

      <GenerateInvoiceModal
        open={generateOpen}
        lookups={lookups}
        onClose={() => setGenerateOpen(false)}
        onSuccess={(message) => {
          setSuccessMessage(message);
          refreshAll();
        }}
      />
    </div>
  );
}
