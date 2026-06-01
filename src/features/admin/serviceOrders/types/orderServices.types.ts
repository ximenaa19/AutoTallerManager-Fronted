/** Types aligned with api-contract.md §10 Order service execution. */

export interface ServiceExecutionResultDto {
  id: number;
  entity: string;
  action: string;
  success: boolean;
}

export interface AssignMechanicRequest {
  mechanicPersonId: number;
  specialtyId: number;
}

export interface UnassignMechanicRequest {
  mechanicAssignmentId: number;
}

export interface UpdateWorkReportRequest {
  workPerformed?: string;
  laborCost?: number;
}

export interface RequestPartRequest {
  partId: number;
  quantity: number;
  appliedUnitPrice: number;
}
