import type { RegisterInventoryPurchaseDetailRequest } from '@/features/admin/inventory/types/inventory.types';

/** Confirmed `RegisterInventoryPurchaseRequest` detail line for API calls. */
export interface NormalizedPurchaseDetail {
  partId: number;
  quantity: number;
  unitPrice: number;
}

export function normalizePurchaseDate(
  localDateTime: string | undefined,
): string | undefined {
  if (!localDateTime?.trim()) {
    return undefined;
  }

  const parsed = new Date(localDateTime);
  if (Number.isNaN(parsed.getTime())) {
    return undefined;
  }

  return parsed.toISOString();
}

export function normalizePurchaseDetails(
  details: RegisterInventoryPurchaseDetailRequest[],
): NormalizedPurchaseDetail[] {
  return details.map((detail) => ({
    partId: detail.partId,
    quantity: Math.trunc(detail.quantity),
    unitPrice: roundUnitPrice(detail.unitPrice),
  }));
}

export function roundUnitPrice(value: number): number {
  return Math.round(value * 100) / 100;
}