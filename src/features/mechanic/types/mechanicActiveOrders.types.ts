export interface MechanicActiveOrderDto {
  serviceOrderId: number;
  vehicleId: number;
  orderStatusId: number;
  entryDate: string;
  estimatedDeliveryDate?: string;
  generalDescription?: string;
}

export interface MechanicActiveOrderFiltersState {
  searchTerm: string;
  orderStatusId: number | null;
}
