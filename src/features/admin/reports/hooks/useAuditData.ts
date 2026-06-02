import { useCallback, useEffect, useState } from 'react';
import { getErrorMessage } from '@/api/apiError';
import type { AuditActionTypeDto } from '@/features/admin/catalogs/types/catalogs.types';
import { auditApi } from '@/features/admin/reports/api/audit.api';
import type { AuditDto } from '@/features/admin/reports/types/audit.types';

export type AuditListSource = 'all' | 'recent' | 'by-user' | 'by-entity';

export interface AuditServerFilters {
  source: AuditListSource;
  userId?: number;
  entity?: string;
  recordId?: number;
}

export function useAuditData() {
  const [audits, setAudits] = useState<AuditDto[]>([]);
  const [actionTypes, setActionTypes] = useState<AuditActionTypeDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [serverFilters, setServerFilters] = useState<AuditServerFilters>({
    source: 'all',
  });

  const loadActionTypes = useCallback(async () => {
    const response = await auditApi.listActionTypes();
    setActionTypes(response.data);
  }, []);

  const loadAudits = useCallback(async (filters: AuditServerFilters) => {
    setIsLoading(true);
    setError(null);

    try {
      let rows: AuditDto[];

      switch (filters.source) {
        case 'recent': {
          const response = await auditApi.getRecent();
          rows = response.data;
          break;
        }
        case 'by-user': {
          if (!filters.userId || filters.userId <= 0) {
            throw new Error('Enter a valid user ID to filter by user.');
          }
          const response = await auditApi.getByUser(filters.userId);
          rows = response.data;
          break;
        }
        case 'by-entity': {
          const entity = filters.entity?.trim();
          if (!entity) {
            throw new Error('Entity name is required for entity lookup.');
          }
          if (!filters.recordId || filters.recordId <= 0) {
            throw new Error('Record ID must be greater than zero.');
          }
          const response = await auditApi.getByEntity(entity, filters.recordId);
          rows = response.data;
          break;
        }
        default: {
          const response = await auditApi.listAll();
          rows = response.data;
        }
      }

      setAudits(rows);
      setServerFilters(filters);
    } catch (err) {
      setAudits([]);
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void (async () => {
      try {
        await loadActionTypes();
      } catch {
        // Action type labels fall back to IDs if catalog load fails.
      }
      await loadAudits({ source: 'all' });
    })();
  }, [loadActionTypes, loadAudits]);

  const retry = useCallback(() => {
    void loadAudits(serverFilters);
  }, [loadAudits, serverFilters]);

  return {
    audits,
    actionTypes,
    isLoading,
    error,
    serverFilters,
    loadAudits,
    retry,
  };
}
