/** Types aligned with api-contract.md §10 Service orders. */

export interface ServiceOrderDto {
  serviceOrderId: number;
  vehicleId: number;
  orderStatusId: number;
  entryDate: string;
  estimatedDeliveryDate?: string;
  generalDescription?: string;
  cancellationReason?: string;
  cancellationDate?: string;
  createdAt: string;
}

export interface ServiceOrderInventorySummaryDto {
  entryInventoryId: number;
  hasScratches: boolean;
  scratchesDescription?: string;
  hasToolbox: boolean;
  toolboxDescription?: string;
  ownershipCardDelivered: boolean;
  observations?: string;
  registeredAt: string;
}

export interface ServiceOrderMechanicSummaryDto {
  mechanicAssignmentId: number;
  mechanicPersonId: number;
  specialtyId: number;
}

export interface ServiceOrderPartSummaryDto {
  orderServicePartId: number;
  partId: number;
  quantity: number;
  appliedUnitPrice: number;
  subtotal: number;
  customerApproved?: boolean;
  approvalDate?: string;
}

export interface ServiceOrderServiceSummaryDto {
  orderServiceId: number;
  serviceTypeId: number;
  description?: string;
  workPerformed?: string;
  laborCost: number;
  customerApproved?: boolean;
  approvalDate?: string;
  mechanics: ServiceOrderMechanicSummaryDto[];
  parts: ServiceOrderPartSummaryDto[];
}

export interface ServiceOrderPaymentSummaryDto {
  paymentId: number;
  paymentMethodId: number;
  paymentStatusId: number;
  paymentDate: string;
  amount: number;
  reference?: string;
}

export interface ServiceOrderInvoiceSummaryDto {
  invoiceId: number;
  invoiceNumber: string;
  invoiceStatusId: number;
  invoiceDate: string;
  subtotal: number;
  tax: number;
  total: number;
  payments: ServiceOrderPaymentSummaryDto[];
}

export interface ServiceOrderFullDetailDto extends ServiceOrderDto {
  vehiclePlate: string;
  inventory?: ServiceOrderInventorySummaryDto;
  services: ServiceOrderServiceSummaryDto[];
  invoice?: ServiceOrderInvoiceSummaryDto;
}

export interface ServiceOrderWorkflowDto {
  serviceOrderId: number;
  previousOrderStatusId: number;
  newOrderStatusId: number;
  orderStatusHistoryId: number;
  cancellationReason?: string;
  cancellationDate?: string;
}

export interface ServiceOrderSearchResultDto {
  serviceOrderId: number;
  vehicleId: number;
  orderStatusId: number;
  entryDate: string;
  generalDescription?: string;
}

export interface ChangeServiceOrderStatusRequest {
  newOrderStatusId: number;
  observation?: string;
}

export interface CancelServiceOrderRequest {
  reason: string;
  observation?: string;
}

export interface VoidServiceOrderRequest {
  reason: string;
  observation?: string;
}

export interface UpdateServiceOrderRequest {
  vehicleId: number;
  orderStatusId: number;
  entryDate: string;
  estimatedDeliveryDate?: string;
  generalDescription?: string;
  cancellationReason?: string;
  cancellationDate?: string;
}

/** Seeded reference IDs from api-contract.md §7. */
export const ORDER_STATUS_IDS = {
  pending: 1,
  inProgress: 2,
  completed: 3,
  cancelled: 4,
  voided: 5,
} as const;

export const ORDER_STATUS_LABELS: Record<number, string> = {
  [ORDER_STATUS_IDS.pending]: 'Pending',
  [ORDER_STATUS_IDS.inProgress]: 'In progress',
  [ORDER_STATUS_IDS.completed]: 'Completed',
  [ORDER_STATUS_IDS.cancelled]: 'Cancelled',
  [ORDER_STATUS_IDS.voided]: 'Voided',
};

export function formatOrderStatusLabel(
  orderStatusId: number,
  catalogNameById?: Map<number, string>,
): string {
  return catalogNameById?.get(orderStatusId) ?? ORDER_STATUS_LABELS[orderStatusId] ?? `Status #${orderStatusId}`;
}

export function serviceOrderMatchesSearch(
  order: ServiceOrderDto,
  term: string,
  vehicleVin?: string,
  vehiclePlate?: string,
): boolean {
  const haystack = [
    String(order.serviceOrderId),
    String(order.vehicleId),
    order.generalDescription,
    vehicleVin,
    vehiclePlate,
    formatOrderStatusLabel(order.orderStatusId),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  return haystack.includes(term);
}
