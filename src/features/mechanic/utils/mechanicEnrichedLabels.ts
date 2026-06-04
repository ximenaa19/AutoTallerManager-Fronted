import type { WorkshopCatalogLookups } from '@/features/admin/serviceOrders/hooks/useWorkshopCatalogLookups';

/** Prefer backend-enriched name; fall back to workshop catalog or technical ID. */
export function resolveServiceTypeName(
  serviceTypeId: number,
  serviceTypeName: string | null | undefined,
  lookups: WorkshopCatalogLookups,
): string {
  const fromBackend = serviceTypeName?.trim();
  if (fromBackend) {
    return fromBackend;
  }

  return (
    lookups.serviceTypeNameById.get(serviceTypeId) ?? `Service type #${serviceTypeId}`
  );
}

/** Prefer backend-enriched name; fall back to workshop catalog or technical ID. */
export function resolveSpecialtyName(
  specialtyId: number,
  specialtyName: string | null | undefined,
  lookups: WorkshopCatalogLookups,
): string {
  const fromBackend = specialtyName?.trim();
  if (fromBackend) {
    return fromBackend;
  }

  return lookups.specialtyNameById.get(specialtyId) ?? `Specialty #${specialtyId}`;
}

/** Prefer backend-enriched name; fall back to workshop catalog or technical ID. */
export function resolveOrderStatusName(
  orderStatusId: number,
  orderStatusName: string | null | undefined,
  lookups: WorkshopCatalogLookups,
): string {
  const fromBackend = orderStatusName?.trim();
  if (fromBackend) {
    return fromBackend;
  }

  return (
    lookups.orderStatusNameById.get(orderStatusId) ?? `Status #${orderStatusId}`
  );
}

/** Customer label when backend returns name and/or document. */
export function formatCustomerLabel(
  customerName?: string | null,
  customerDocumentNumber?: string | null,
): string | null {
  const name = customerName?.trim();
  const document = customerDocumentNumber?.trim();

  if (name && document) {
    return `${name} · ${document}`;
  }

  if (name) {
    return name;
  }

  if (document) {
    return document;
  }

  return null;
}

/** Approval label from nullable boolean returned by backend. */
export function formatApprovalStatus(customerApproved?: boolean | null): string {
  if (customerApproved === true) {
    return 'Approved';
  }

  if (customerApproved === false) {
    return 'Rejected';
  }

  return 'Pending';
}
