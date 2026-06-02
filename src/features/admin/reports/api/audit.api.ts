import { httpClient } from '@/api/httpClient';
import type { AuditActionTypeDto } from '@/features/admin/catalogs/types/catalogs.types';
import type { AuditDto, AuditQueryDto } from '@/features/admin/reports/types/audit.types';

export const auditApi = {
  listAll() {
    return httpClient.get<AuditDto[]>('/api/audits');
  },

  getById(id: number) {
    return httpClient.get<AuditDto>(`/api/audits/${id}`);
  },

  getRecent() {
    return httpClient.get<AuditQueryDto[]>('/api/admin/audits/recent');
  },

  getByEntity(entity: string, recordId: number) {
    return httpClient.get<AuditQueryDto[]>('/api/admin/audits/by-entity', {
      params: { entity, recordId },
    });
  },

  getByUser(userId: number) {
    return httpClient.get<AuditQueryDto[]>(`/api/admin/audits/by-user/${userId}`);
  },

  listActionTypes() {
    return httpClient.get<AuditActionTypeDto[]>('/api/audit-action-types');
  },
};
