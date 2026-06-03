export interface MechanicSearchResultDto {
  personId: number;
  documentNumber: string;
  fullName: string;
  specialtyIds: number[];
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
  email: string | null;
  assignedServicesCount: number;
  activeOrdersCount: number;
}

export function mechanicRosterMatchesSearch(item: MechanicRosterItem, term: string): boolean {
  const normalized = term.trim().toLowerCase();
  if (!normalized) return true;

  return [
    item.fullName,
    item.documentNumber,
    item.email,
    String(item.personId),
    item.specialtyNames.join(' '),
    item.accountStatus,
    item.roleAssignmentActive ? 'active role' : 'inactive role',
    String(item.assignedServicesCount),
    String(item.activeOrdersCount),
  ]
    .join(' ')
    .toLowerCase()
    .includes(normalized);
}
