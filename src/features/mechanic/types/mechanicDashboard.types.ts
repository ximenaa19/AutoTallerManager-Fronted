/** Preview row from `MechanicDashboardDto.activeOrdersPreview`. */
export interface MechanicDashboardActiveOrderDto {
  serviceOrderId: number;
  vehicleId: number;
  vehiclePlate?: string;
  orderStatusName?: string;
  entryDate: string;
  estimatedDeliveryDate?: string;
  assignedServicesCount: number;
  pendingWorkReportsCount: number;
}

export interface MechanicDashboardDto {
  assignedServices: number;
  activeOrders: number;
  pendingWorkReports: number;
  requestedPartsPendingApproval: number;
  activeServiceOrderIds: number[];
  activeOrdersPreview?: MechanicDashboardActiveOrderDto[];
}
