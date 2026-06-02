import { Eye } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { AdminDataTable } from '@/features/admin/components/AdminDataTable';
import type { AuditActionTypeDto } from '@/features/admin/catalogs/types/catalogs.types';
import type { AuditDto } from '@/features/admin/reports/types/audit.types';
import {
  formatAuditActionTypeLabel,
  formatAuditUserLabel,
} from '@/features/admin/reports/utils/auditLabels';
import { formatDateTime } from '@/utils/format';

export interface AuditTableProps {
  audits: AuditDto[];
  actionTypes: AuditActionTypeDto[];
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  page: number;
  totalPages: number;
  totalCount: number;
  onPageChange: (page: number) => void;
  onViewDetail: (audit: AuditDto) => void;
}

export function AuditTable({
  audits,
  actionTypes,
  isLoading = false,
  error = null,
  onRetry,
  page,
  totalPages,
  totalCount,
  onPageChange,
  onViewDetail,
}: AuditTableProps) {
  return (
    <AdminDataTable
      columns={[
        {
          id: 'id',
          header: 'ID',
          cell: (row) => (
            <span className="font-medium text-text-primary">#{row.auditId}</span>
          ),
        },
        {
          id: 'created',
          header: 'When',
          cell: (row) => (
            <span className="text-text-secondary">{formatDateTime(row.createdAt)}</span>
          ),
        },
        {
          id: 'user',
          header: 'User',
          cell: (row) => formatAuditUserLabel(row.userId),
        },
        {
          id: 'action',
          header: 'Action',
          cell: (row) => (
            <Badge variant="pending">
              {formatAuditActionTypeLabel(row.auditActionTypeId, actionTypes)}
            </Badge>
          ),
        },
        {
          id: 'entity',
          header: 'Entity',
          cell: (row) => (
            <span className="text-text-secondary">
              {row.affectedEntity} #{row.affectedRecordId}
            </span>
          ),
        },
        {
          id: 'description',
          header: 'Description',
          className: 'max-w-xs',
          cell: (row) => (
            <span className="line-clamp-2 text-text-secondary">
              {row.description?.trim() || '—'}
            </span>
          ),
        },
        {
          id: 'actions',
          header: '',
          className: 'w-[1%] whitespace-nowrap text-right',
          cell: (row) => (
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<Eye className="size-4" />}
              onClick={() => onViewDetail(row)}
            >
              View
            </Button>
          ),
        },
      ]}
      data={audits}
      rowKey={(row) => row.auditId}
      isLoading={isLoading}
      error={error}
      onRetry={onRetry}
      emptyTitle="No audit records"
      emptyDescription="Try adjusting filters or loading a different data source."
      page={page}
      totalPages={totalPages}
      totalCount={totalCount}
      onPageChange={onPageChange}
    />
  );
}
