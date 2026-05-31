export interface AdminDashboardDto {
  totalUsers: number;
  activeUsers: number;
  totalClients: number;
  totalMechanics: number;
  activeServiceOrders: number;
  pendingOrders: number;
  inProgressOrders: number;
  completedOrders: number;
  lowStockParts: number;
  totalInvoicedAmount: number;
  totalCompletedPaymentsAmount: number;
  pendingPaymentAmount: number;
}

export interface ReceptionistDashboardDto {
  pendingOrders: number;
  inProgressOrders: number;
  completedOrdersToday: number;
  vehiclesCurrentlyInWorkshop: number;
  pendingInvoices: number;
  lowStockParts: number;
}

export interface MechanicDashboardDto {
  assignedServices: number;
  activeOrders: number;
  pendingWorkReports: number;
  requestedPartsPendingApproval: number;
  activeServiceOrderIds: number[];
}

export interface ClientDashboardDto {
  activeServiceOrders: number;
  pendingApprovals: number;
  pendingInvoices: number;
  totalVehicles: number;
  recentServiceOrderIds: number[];
}
