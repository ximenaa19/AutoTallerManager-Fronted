import { ORDER_STATUS_IDS } from '@/features/admin/serviceOrders/types/serviceOrders.types';
import type { WorkshopCatalogLookups } from '@/features/admin/serviceOrders/hooks/useWorkshopCatalogLookups';
import type { MechanicActiveOrderDto } from '@/features/mechanic/types/mechanicActiveOrders.types';

/** Statuses excluded by GET /api/mechanic/my-active-orders (server-side). */
const TERMINAL_ORDER_STATUS_IDS = new Set<number>([
  ORDER_STATUS_IDS.completed,
  ORDER_STATUS_IDS.cancelled,
  ORDER_STATUS_IDS.voided,
]);

export function isTerminalOrderStatus(orderStatusId: number): boolean {
  return TERMINAL_ORDER_STATUS_IDS.has(orderStatusId);
}

export interface SelectOption {
  value: string;
  label: string;
}

/**
 * Status filter options for mechanic active orders.
 * Uses statuses present in loaded data when available; otherwise non-terminal catalog entries.
 */
export function getMechanicActiveOrderStatusFilterOptions(
  orders: MechanicActiveOrderDto[],
  lookups: WorkshopCatalogLookups,
): SelectOption[] {
  const statusIdsFromOrders = [
    ...new Set(orders.map((order) => order.orderStatusId)),
  ].filter((id) => !isTerminalOrderStatus(id));

  const candidateIds =
    statusIdsFromOrders.length > 0
      ? statusIdsFromOrders
      : lookups.orderStatuses
          .map((item) => item.id)
          .filter((id) => !isTerminalOrderStatus(id));

  const sortedIds = [...new Set(candidateIds)].sort((a, b) => a - b);

  return [
    { value: '', label: 'All active statuses' },
    ...sortedIds.map((id) => ({
      value: String(id),
      label: lookups.orderStatusNameById.get(id) ?? `Status #${id}`,
    })),
  ];
}
