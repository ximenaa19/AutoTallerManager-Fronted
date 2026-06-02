import { useMemo, useState } from 'react';
import { Shield } from 'lucide-react';
import { AdminPageHeader } from '@/features/admin/components/AdminPageHeader';
import { AuditDetailPanel } from '@/features/admin/reports/components/AuditDetailPanel';
import { AuditFilters, type AuditFiltersState } from '@/features/admin/reports/components/AuditFilters';
import { AuditTable } from '@/features/admin/reports/components/AuditTable';
import {
  useAuditData,
  type AuditListSource,
} from '@/features/admin/reports/hooks/useAuditData';
import type { AuditDto } from '@/features/admin/reports/types/audit.types';
import {
  filterBySearchTerm,
  useClientPagination,
} from '@/features/admin/hooks/useClientPagination';
import {
  formatAuditActionTypeLabel,
  formatAuditUserLabel,
} from '@/features/admin/reports/utils/auditLabels';

const defaultFilters: AuditFiltersState = {
  searchTerm: '',
  actionTypeId: '',
  listSource: 'all',
  userId: '',
  entity: '',
  recordId: '',
};

function auditMatchesSearch(
  audit: AuditDto,
  term: string,
  actionLabel: string,
): boolean {
  const haystack = [
    String(audit.auditId),
    `#${audit.auditId}`,
    formatAuditUserLabel(audit.userId),
    String(audit.userId),
    actionLabel,
    String(audit.auditActionTypeId),
    audit.affectedEntity,
    String(audit.affectedRecordId),
    audit.description,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  return haystack.includes(term);
}

export function AuditPage() {
  const {
    audits,
    actionTypes,
    isLoading,
    error,
    loadAudits,
    retry,
  } = useAuditData();

  const [filters, setFilters] = useState<AuditFiltersState>(defaultFilters);
  const [selectedAudit, setSelectedAudit] = useState<AuditDto | null>(null);

  const filteredAudits = useMemo(() => {
    const actionTypeId = filters.actionTypeId
      ? Number(filters.actionTypeId)
      : null;

    let rows = [...audits].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    if (actionTypeId && Number.isFinite(actionTypeId)) {
      rows = rows.filter((row) => row.auditActionTypeId === actionTypeId);
    }

    return filterBySearchTerm(rows, filters.searchTerm, (row, term) =>
      auditMatchesSearch(
        row,
        term,
        formatAuditActionTypeLabel(row.auditActionTypeId, actionTypes),
      ),
    );
  }, [audits, filters.actionTypeId, filters.searchTerm, actionTypes]);

  const pagination = useClientPagination(filteredAudits);

  const handleApplyServerFilters = () => {
    const source = filters.listSource as AuditListSource;
    void loadAudits({
      source,
      userId: filters.userId.trim() ? Number(filters.userId) : undefined,
      entity: filters.entity.trim() || undefined,
      recordId: filters.recordId.trim() ? Number(filters.recordId) : undefined,
    });
  };

  const handleReset = () => {
    setFilters(defaultFilters);
    void loadAudits({ source: 'all' });
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Audit"
        description="Review system audit trail entries. User display names are not returned by the API — entries show User #id. Export is not available on the backend."
        actions={
          <div className="flex items-center gap-2 rounded-lg border border-border bg-bg-muted/30 px-3 py-2 text-sm text-text-secondary">
            <Shield className="size-4 text-accent" aria-hidden />
            Read-only trail
          </div>
        }
      />

      <AuditFilters
        filters={filters}
        actionTypes={actionTypes}
        onChange={setFilters}
        onApplyServerFilters={handleApplyServerFilters}
        onReset={handleReset}
        isLoading={isLoading}
      />

      <p className="text-sm text-text-secondary">
        Showing {pagination.totalCount} record
        {pagination.totalCount === 1 ? '' : 's'}
        {filters.listSource === 'recent'
          ? ' (recent API limit: 50)'
          : null}
      </p>

      <AuditTable
        audits={pagination.items}
        actionTypes={actionTypes}
        isLoading={isLoading}
        error={error}
        onRetry={retry}
        page={pagination.page}
        totalPages={pagination.totalPages}
        totalCount={pagination.totalCount}
        onPageChange={pagination.setPage}
        onViewDetail={setSelectedAudit}
      />

      <AuditDetailPanel
        audit={selectedAudit}
        actionTypes={actionTypes}
        onClose={() => setSelectedAudit(null)}
      />
    </div>
  );
}
