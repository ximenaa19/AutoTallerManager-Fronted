/** Types aligned with api-contract.md §10 Reports and ReportsController. */

export interface ReportDateRangeParams {
  from?: string;
  to?: string;
}

export interface SalesReportDto {
  from?: string;
  to?: string;
  invoiceCount: number;
  subtotalAmount: number;
  taxAmount: number;
  totalAmount: number;
  issuedInvoices: number;
  cancelledInvoices: number;
}

export interface InventoryReportDto {
  totalParts: number;
  activeParts: number;
  lowStockParts: number;
  outOfStockParts: number;
  estimatedInventoryValue: number;
  purchasesCount: number;
  purchasesAmount: number;
}

export interface MechanicsReportDto {
  totalMechanics: number;
  activeMechanics: number;
  totalAssignments: number;
  servicesWithWorkPerformed: number;
  servicesPendingWorkPerformed: number;
}

export interface ServiceOrdersReportDto {
  totalOrders: number;
  pendingOrders: number;
  inProgressOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  voidedOrders: number;
}

export interface PaymentsReportDto {
  totalPayments: number;
  totalAmount: number;
  completedAmount: number;
  refundedAmount: number;
  pendingOrOtherAmount: number;
}

export type ReportPanelKey =
  | 'sales'
  | 'inventory'
  | 'service-orders'
  | 'payments'
  | 'mechanics';
