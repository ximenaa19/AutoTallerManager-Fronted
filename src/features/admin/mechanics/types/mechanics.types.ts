export interface MechanicSearchResultDto {
  personId: number;
  documentNumber: string;
  fullName: string;
  specialtyIds: number[];
}

export interface MechanicAssignmentDto {
  mechanicAssignmentId: number;
  orderServiceId: number;
  mechanicPersonId: number;
  specialtyId: number;
}

export interface MechanicSpecialtyAssignmentDto {
  assignmentId: number;
  personId: number;
  specialtyId: number;
}

export type MechanicAccountStatus = 'active' | 'inactive' | 'none';

export interface MechanicRosterItem {
  personId: number;
  fullName: string;
  documentNumber: string;
  specialtyIds: number[];
  specialtyNames: string[];
  roleAssignmentActive: boolean;
  accountStatus: MechanicAccountStatus;
  userId: number | null;
  assignmentCount: number;
  assignments: MechanicAssignmentDto[];
}

export interface MechanicWorkloadRow {
  mechanicAssignmentId: number;
  orderServiceId: number;
  serviceOrderId: number | null;
  specialtyId: number;
  specialtyName: string;
}

export function mechanicRosterMatchesSearch(item: MechanicRosterItem, term: string): boolean {
  const normalized = term.trim().toLowerCase();
  if (!normalized) return true;

  return [
    item.fullName,
    item.documentNumber,
    String(item.personId),
    item.specialtyNames.join(' '),
    item.accountStatus,
    item.roleAssignmentActive ? 'active role' : 'inactive role',
    String(item.assignmentCount),
  ]
    .join(' ')
    .toLowerCase()
    .includes(normalized);
}
