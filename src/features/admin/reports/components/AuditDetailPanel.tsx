import { Modal } from '@/components/ui/Modal';
import type { AuditActionTypeDto } from '@/features/admin/catalogs/types/catalogs.types';
import type { AuditDto } from '@/features/admin/reports/types/audit.types';
import {
  formatAuditActionTypeLabel,
  formatAuditUserLabel,
} from '@/features/admin/reports/utils/auditLabels';
import { formatDateTime } from '@/utils/format';

export interface AuditDetailPanelProps {
  audit: AuditDto | null;
  actionTypes: AuditActionTypeDto[];
  onClose: () => void;
}

export function AuditDetailPanel({
  audit,
  actionTypes,
  onClose,
}: AuditDetailPanelProps) {
  return (
    <Modal
      open={audit !== null}
      onClose={onClose}
      title={audit ? `Audit #${audit.auditId}` : 'Audit detail'}
      description="Read-only audit record from the system trail."
      size="md"
    >
      {audit && (
        <dl className="grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-text-muted">
              Audit ID
            </dt>
            <dd className="mt-1 text-sm text-text-primary">#{audit.auditId}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-text-muted">
              Created
            </dt>
            <dd className="mt-1 text-sm text-text-primary">
              {formatDateTime(audit.createdAt)}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-text-muted">
              User
            </dt>
            <dd className="mt-1 text-sm text-text-primary">
              {formatAuditUserLabel(audit.userId)}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-text-muted">
              Action
            </dt>
            <dd className="mt-1 text-sm text-text-primary">
              {formatAuditActionTypeLabel(audit.auditActionTypeId, actionTypes)}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-text-muted">
              Affected entity
            </dt>
            <dd className="mt-1 text-sm text-text-primary">{audit.affectedEntity}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-text-muted">
              Record ID
            </dt>
            <dd className="mt-1 text-sm text-text-primary">#{audit.affectedRecordId}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-xs font-medium uppercase tracking-wide text-text-muted">
              Description
            </dt>
            <dd className="mt-1 whitespace-pre-wrap text-sm text-text-secondary">
              {audit.description?.trim() || '—'}
            </dd>
          </div>
        </dl>
      )}
    </Modal>
  );
}
