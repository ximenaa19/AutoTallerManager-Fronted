/** Types aligned with api-contract.md §8 Audits and AuditQueries. */

export interface AuditDto {
  auditId: number;
  userId: number;
  auditActionTypeId: number;
  affectedEntity: string;
  affectedRecordId: number;
  description?: string;
  createdAt: string;
}

/** Same shape as AuditDto; returned by admin audit query endpoints. */
export type AuditQueryDto = AuditDto;
