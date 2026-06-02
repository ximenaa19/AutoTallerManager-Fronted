/** Confirmed fields from `MechanicAssignedServiceDto` (backend). */
export interface MechanicAssignedServiceDto {
  orderServiceId: number;
  serviceOrderId: number;
  vehicleId: number;
  serviceTypeId: number;
  description?: string;
  workPerformed?: string;
  laborCost: number;
  customerApproved?: boolean;
  approvalDate?: string;
  specialtyId: number;
  /** Not returned by backend today; reserved for future DTO enrichment. */
  vehiclePlate?: string;
}

export type MechanicWorkReportFilter = 'all' | 'needs-report' | 'reported';

export interface MechanicAssignmentFiltersState {
  searchTerm: string;
  serviceTypeId: number | null;
  specialtyId: number | null;
  workReportFilter: MechanicWorkReportFilter;
}
