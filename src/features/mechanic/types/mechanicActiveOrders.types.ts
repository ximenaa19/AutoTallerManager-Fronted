export interface MechanicActiveOrderDto {
  serviceOrderId: number;
  vehicleId: number;
  orderStatusId: number;
  orderStatusName?: string;
  vehiclePlate?: string;
  vehicleVin?: string;
  vehicleYear?: number;
  vehicleColor?: string;
  assignedServicesCount: number;
  pendingWorkReportsCount: number;
  customerName?: string;
  customerDocumentNumber?: string;
  entryDate: string;
  estimatedDeliveryDate?: string;
  generalDescription?: string;
}

export interface MechanicActiveOrderFiltersState {
  searchTerm: string;
  orderStatusId: number | null;
}
