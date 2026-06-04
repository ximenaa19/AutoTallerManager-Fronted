/** Confirmed fields from enriched `MechanicAssignedServiceDto` (backend). */
export interface MechanicAssignedServiceDto {
  mechanicAssignmentId: number;
  orderServiceId: number;
  serviceOrderId: number;
  vehicleId: number;
  serviceTypeId: number;
  orderStatusId: number;
  orderStatusName?: string;
  vehiclePlate?: string;
  vehicleVin?: string;
  vehicleYear?: number;
  vehicleColor?: string;
  serviceTypeName?: string;
  description?: string;
  workPerformed?: string;
  laborCost: number;
  customerApproved?: boolean;
  approvalDate?: string;
  specialtyId: number;
  specialtyName?: string;
  customerName?: string;
  customerDocumentNumber?: string;
}

export type MechanicWorkReportFilter = 'all' | 'needs-report' | 'reported';

export interface MechanicAssignmentFiltersState {
  searchTerm: string;
  serviceTypeId: number | null;
  specialtyId: number | null;
  workReportFilter: MechanicWorkReportFilter;
}
