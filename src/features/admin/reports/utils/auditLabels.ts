import type { AuditActionTypeDto } from '@/features/admin/catalogs/types/catalogs.types';

export function formatAuditActionTypeLabel(
  auditActionTypeId: number,
  actionTypes: AuditActionTypeDto[],
): string {
  const match = actionTypes.find((type) => type.auditActionTypeId === auditActionTypeId);
  return match?.name ?? `Action #${auditActionTypeId}`;
}

export function formatAuditUserLabel(userId: number): string {
  return `User #${userId}`;
}
