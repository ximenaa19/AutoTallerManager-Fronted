import type { InvoiceDto } from '@/features/admin/billing/types/invoices.types';
import type { ServiceOrderSearchResultDto } from '@/features/admin/serviceOrders/types/serviceOrders.types';
import { formatCurrency, formatDateTime } from '@/utils/format';

/** Matches backend `InvoiceBusinessService` / `InvoiceService` max length. */
export const INVOICE_NUMBER_MAX_LENGTH = 50;

/** Matches backend `SearchService.ValidateSearchTerm` minimum length. */
export const SERVICE_ORDER_SEARCH_MIN_LENGTH = 2;

export const SERVICE_ORDER_SEARCH_PLACEHOLDER =
  'Search by order ID, vehicle ID, or description...';

export const SERVICE_ORDER_SEARCH_HINT =
  'Supported fields: order ID, vehicle ID, and description (minimum 2 characters).';

export const SERVICE_ORDER_SEARCH_TYPE_HELPER =
  'Type at least 2 characters. Search by order ID, vehicle ID, or description.';

export const SERVICE_ORDER_SEARCH_NO_RESULTS =
  'No matching service orders were found. Try searching by the supported fields shown above.';

export const GENERATE_INVOICE_SELECT_ORDER_HELPER =
  'Select a service order to generate an invoice.';

export const GENERATE_INVOICE_TAX_INVALID =
  'Tax must be greater than or equal to 0.';

export const GENERATE_INVOICE_NUMBER_INVALID =
  'Check the invoice number format.';

/**
 * Strip decorative prefixes users often type so the backend term matches ID/description fields.
 * Does not add client-side filtering; only normalizes input sent to GET /api/search/service-orders.
 */
export function normalizeServiceOrderSearchTerm(raw: string): string {
  let term = raw.trim();
  term = term.replace(/^#\s*/, '');
  term = term.replace(/^order\s*#?\s*/i, '');
  term = term.replace(/^vehicle\s*#?\s*/i, '');
  return term.trim();
}

export function isGenerateInvoiceTaxValid(taxInput: string): boolean {
  const trimmed = taxInput.trim();
  if (trimmed === '') {
    return false;
  }

  const value = Number(trimmed);
  return !Number.isNaN(value) && value >= 0;
}

export function isGenerateInvoiceNumberValid(invoiceNumberInput: string): boolean {
  const trimmed = invoiceNumberInput.trim();
  return trimmed === '' || trimmed.length <= INVOICE_NUMBER_MAX_LENGTH;
}

export interface GenerateInvoiceFormValidation {
  isTaxValid: boolean;
  isInvoiceNumberValid: boolean;
  canSubmit: boolean;
  blockingMessage: string | null;
}

export function getGenerateInvoiceFormValidation(params: {
  selectedOrder: ServiceOrderSearchResultDto | null;
  taxInput: string;
  invoiceNumberInput: string;
}): GenerateInvoiceFormValidation {
  const isTaxValid = isGenerateInvoiceTaxValid(params.taxInput);
  const isInvoiceNumberValid = isGenerateInvoiceNumberValid(params.invoiceNumberInput);
  const canSubmit =
    params.selectedOrder !== null && isTaxValid && isInvoiceNumberValid;

  let blockingMessage: string | null = null;
  if (!params.selectedOrder) {
    blockingMessage = GENERATE_INVOICE_SELECT_ORDER_HELPER;
  } else if (!isTaxValid) {
    blockingMessage = GENERATE_INVOICE_TAX_INVALID;
  } else if (!isInvoiceNumberValid) {
    blockingMessage = GENERATE_INVOICE_NUMBER_INVALID;
  }

  return {
    isTaxValid,
    isInvoiceNumberValid,
    canSubmit,
    blockingMessage,
  };
}

function normalizeForSearch(text: string): string {
  return text.toLowerCase().replace(/\s+/g, ' ').trim();
}

/** Match term against haystack; supports digit-only partial matches for amounts. */
export function termMatchesHaystack(haystack: string, term: string): boolean {
  const normalizedHaystack = normalizeForSearch(haystack);
  const normalizedTerm = normalizeForSearch(term);

  if (!normalizedTerm) {
    return true;
  }

  if (normalizedHaystack.includes(normalizedTerm)) {
    return true;
  }

  const termDigits = normalizedTerm.replace(/\D/g, '');
  if (termDigits.length >= 1) {
    const haystackDigits = normalizedHaystack.replace(/\D/g, '');
    if (haystackDigits.includes(termDigits)) {
      return true;
    }
  }

  return false;
}

export function buildInvoiceSearchHaystack(
  invoice: InvoiceDto,
  statusLabel: string,
): string {
  return [
    String(invoice.invoiceId),
    `#${invoice.invoiceId}`,
    invoice.invoiceNumber,
    String(invoice.serviceOrderId),
    `#${invoice.serviceOrderId}`,
    String(invoice.invoiceStatusId),
    statusLabel,
    invoice.invoiceDate,
    formatDateTime(invoice.invoiceDate),
    String(invoice.subtotal),
    String(invoice.tax),
    String(invoice.total),
    formatCurrency(invoice.subtotal),
    formatCurrency(invoice.tax),
    formatCurrency(invoice.total),
    invoice.observations,
  ]
    .filter(Boolean)
    .join(' ');
}

export function invoiceMatchesSearchTerm(
  invoice: InvoiceDto,
  term: string,
  statusLabel: string,
): boolean {
  return termMatchesHaystack(buildInvoiceSearchHaystack(invoice, statusLabel), term);
}

export function formatServiceOrderSearchPrimaryLabel(
  order: ServiceOrderSearchResultDto,
): string {
  return `Order #${order.serviceOrderId}`;
}

export function formatServiceOrderSearchSecondaryLabel(
  order: ServiceOrderSearchResultDto,
  orderStatusNameById: Map<number, string>,
): string {
  const statusLabel =
    orderStatusNameById.get(order.orderStatusId) ??
    `Status #${order.orderStatusId}`;
  const description = order.generalDescription?.trim() || 'No description';
  const entryDate = formatDateTime(order.entryDate);

  return `Vehicle #${order.vehicleId} · ${statusLabel} · ${entryDate} · ${description}`;
}
