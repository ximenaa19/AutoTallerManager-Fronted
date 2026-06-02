import { useEffect, useState } from 'react';
import { getErrorMessage } from '@/api/apiError';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { invoicesApi } from '@/features/admin/billing/api/invoices.api';
import type { BillingLookups } from '@/features/admin/billing/hooks/useBillingLookups';
import type { GenerateInvoiceFromServiceOrderRequest } from '@/features/admin/billing/types/invoices.types';
import {
  formatServiceOrderSearchPrimaryLabel,
  formatServiceOrderSearchSecondaryLabel,
  getGenerateInvoiceFormValidation,
  normalizeServiceOrderSearchTerm,
  SERVICE_ORDER_SEARCH_HINT,
  SERVICE_ORDER_SEARCH_MIN_LENGTH,
  SERVICE_ORDER_SEARCH_NO_RESULTS,
  SERVICE_ORDER_SEARCH_PLACEHOLDER,
  SERVICE_ORDER_SEARCH_TYPE_HELPER,
  GENERATE_INVOICE_TAX_INVALID,
  GENERATE_INVOICE_NUMBER_INVALID,
} from '@/features/admin/billing/utils/billingSearch';
import { serviceOrderLookupsApi } from '@/features/admin/serviceOrders/api/serviceOrderLookups.api';
import { useWorkshopCatalogLookups } from '@/features/admin/serviceOrders/hooks/useWorkshopCatalogLookups';
import type { ServiceOrderSearchResultDto } from '@/features/admin/serviceOrders/types/serviceOrders.types';
import { formatCurrency, formatDateTime } from '@/utils/format';
import { cn } from '@/lib/cn';

export interface GenerateInvoiceModalProps {
  open: boolean;
  lookups: BillingLookups;
  onClose: () => void;
  onSuccess: (message: string) => void;
}

export function GenerateInvoiceModal({
  open,
  lookups,
  onClose,
  onSuccess,
}: GenerateInvoiceModalProps) {
  const { lookups: workshopLookups } = useWorkshopCatalogLookups();

  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<ServiceOrderSearchResultDto[]>(
    [],
  );
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedOrder, setSelectedOrder] =
    useState<ServiceOrderSearchResultDto | null>(null);
  const [tax, setTax] = useState('0');
  const [observations, setObservations] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const normalizedSearch = normalizeServiceOrderSearchTerm(searchTerm);
  const canSearch = normalizedSearch.length >= SERVICE_ORDER_SEARCH_MIN_LENGTH;

  const formValidation = getGenerateInvoiceFormValidation({
    selectedOrder,
    taxInput: tax,
    invoiceNumberInput: invoiceNumber,
  });

  const showSearchNoResults =
    canSearch &&
    !searchLoading &&
    !searchError &&
    hasSearched &&
    searchResults.length === 0;

  useEffect(() => {
    if (!open) {
      setSearchTerm('');
      setSearchResults([]);
      setSelectedOrder(null);
      setTax('0');
      setObservations('');
      setInvoiceNumber('');
      setSubmitError(null);
      setSearchError(null);
      setSearchLoading(false);
      setHasSearched(false);
    }
  }, [open]);

  useEffect(() => {
    setSelectedOrder(null);
  }, [searchTerm]);

  useEffect(() => {
    if (!open) {
      return;
    }

    if (!canSearch) {
      setSearchResults([]);
      setSearchError(null);
      setSearchLoading(false);
      setHasSearched(false);
      return;
    }

    const timer = window.setTimeout(async () => {
      setSearchLoading(true);
      setSearchError(null);
      setHasSearched(false);

      try {
        const response =
          await serviceOrderLookupsApi.searchServiceOrders(normalizedSearch);
        setSearchResults(response.data ?? []);
        setHasSearched(true);
      } catch (err) {
        setSearchError(getErrorMessage(err));
        setSearchResults([]);
        setHasSearched(true);
      } finally {
        setSearchLoading(false);
      }
    }, 350);

    return () => window.clearTimeout(timer);
  }, [open, normalizedSearch, canSearch]);

  const handleSubmit = async () => {
    if (!formValidation.canSubmit || !selectedOrder) {
      return;
    }

    const taxValue = Number(tax.trim());

    setSubmitting(true);
    setSubmitError(null);

    const body: GenerateInvoiceFromServiceOrderRequest = {
      tax: taxValue,
      observations: observations.trim() || undefined,
      invoiceNumber: invoiceNumber.trim() || undefined,
    };

    try {
      const response = await invoicesApi.generateFromServiceOrder(
        selectedOrder.serviceOrderId,
        body,
      );
      onSuccess(
        `Invoice ${response.data.invoiceNumber} generated for order #${selectedOrder.serviceOrderId}.`,
      );
      onClose();
    } catch (err) {
      setSubmitError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const selectedStatusLabel =
    selectedOrder &&
    (workshopLookups.orderStatusNameById.get(selectedOrder.orderStatusId) ??
      `Status #${selectedOrder.orderStatusId}`);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Generate invoice from service order"
      description="Select a service order with approved billable items. An invoice draft will be created automatically."
      size="lg"
      footer={
        <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 flex-col gap-1">
            {showSearchNoResults && (
              <p className="text-xs text-text-secondary">{SERVICE_ORDER_SEARCH_NO_RESULTS}</p>
            )}
            {formValidation.blockingMessage && (
              <p className="text-xs text-text-muted">{formValidation.blockingMessage}</p>
            )}
          </div>
          <div className="flex shrink-0 justify-end gap-2 sm:ml-auto">
            <Button variant="ghost" onClick={onClose} disabled={submitting}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              isLoading={submitting}
              disabled={!formValidation.canSubmit || submitting}
            >
              Generate invoice
            </Button>
          </div>
        </div>
      }
    >
      <div className="flex flex-col gap-5">
        <Input
          name="service-order-search"
          label="Search service order"
          placeholder={SERVICE_ORDER_SEARCH_PLACEHOLDER}
          hint={SERVICE_ORDER_SEARCH_HINT}
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
        />

        <div
          className="rounded-lg border border-border bg-bg-elevated px-4 py-3"
          role="status"
          aria-live="polite"
        >
          {!canSearch && (
            <p className="text-sm text-text-secondary">{SERVICE_ORDER_SEARCH_TYPE_HELPER}</p>
          )}

          {canSearch && searchLoading && (
            <p className="text-sm text-text-muted">Searching service orders…</p>
          )}

          {canSearch && searchError && (
            <p className="text-sm text-danger" role="alert">
              {searchError}
            </p>
          )}

          {showSearchNoResults && (
            <p className="text-sm text-text-secondary">{SERVICE_ORDER_SEARCH_NO_RESULTS}</p>
          )}

          {canSearch && !searchLoading && searchResults.length > 0 && (
            <div className="flex flex-col gap-2">
              <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
                {searchResults.length} result
                {searchResults.length === 1 ? '' : 's'} — select an order
              </p>
              <div className="max-h-48 overflow-y-auto rounded-lg border border-border bg-bg-surface">
                {searchResults.map((order) => (
                  <button
                    key={order.serviceOrderId}
                    type="button"
                    className={cn(
                      'flex w-full flex-col gap-1 border-b border-border px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-bg-elevated',
                      selectedOrder?.serviceOrderId === order.serviceOrderId &&
                        'bg-accent-muted',
                    )}
                    onClick={() => setSelectedOrder(order)}
                  >
                    <span className="text-sm font-medium text-text-primary">
                      {formatServiceOrderSearchPrimaryLabel(order)}
                    </span>
                    <span className="text-xs leading-relaxed text-text-secondary">
                      {formatServiceOrderSearchSecondaryLabel(
                        order,
                        workshopLookups.orderStatusNameById,
                      )}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {selectedOrder && (
          <div className="rounded-lg border border-accent/30 bg-accent-muted/40 px-4 py-3">
            <p className="text-sm font-semibold text-text-primary">
              Selected service order
            </p>
            <p className="mt-1 text-sm text-text-primary">
              {formatServiceOrderSearchPrimaryLabel(selectedOrder)}
            </p>
            <p className="mt-1 text-xs text-text-secondary">
              Vehicle #{selectedOrder.vehicleId} · {selectedStatusLabel} ·{' '}
              {formatDateTime(selectedOrder.entryDate)}
            </p>
            <p className="mt-1 text-xs text-text-secondary">
              {selectedOrder.generalDescription?.trim() || 'No description'}
            </p>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            name="invoice-number"
            label="Invoice number (optional)"
            placeholder="Auto-generated if empty"
            value={invoiceNumber}
            onChange={(event) => setInvoiceNumber(event.target.value)}
            error={
              invoiceNumber.trim() !== '' && !formValidation.isInvoiceNumberValid
                ? GENERATE_INVOICE_NUMBER_INVALID
                : undefined
            }
          />
          <Input
            name="tax"
            label="Tax"
            type="number"
            min={0}
            step="0.01"
            value={tax}
            onChange={(event) => setTax(event.target.value)}
            error={
              tax.trim() !== '' && !formValidation.isTaxValid
                ? GENERATE_INVOICE_TAX_INVALID
                : undefined
            }
          />
        </div>

        <Input
          name="observations"
          label="Observations (optional)"
          value={observations}
          onChange={(event) => setObservations(event.target.value)}
        />

        {selectedOrder && (
          <p className="text-xs text-text-muted">
            Default status:{' '}
            {lookups.invoiceStatusNameById.get(1) ?? 'Draft'}. Tax preview:{' '}
            {formatCurrency(Number(tax) || 0)}.
          </p>
        )}

        {submitError && (
          <p className="text-sm text-danger" role="alert">
            {submitError}
          </p>
        )}
      </div>
    </Modal>
  );
}
