import { useMemo } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import type {
  CatalogDefinition,
  CatalogFieldDefinition,
} from '@/features/admin/catalogs/config/catalogDefinitions';
import {
  getCatalogRecordId,
  getCatalogRecordLabel,
} from '@/features/admin/catalogs/config/catalogDefinitions';
import type { CatalogRecord } from '@/features/admin/catalogs/types/catalogs.types';
import { AdminDataTable } from '@/features/admin/components/AdminDataTable';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

export interface CatalogTableProps {
  definition: CatalogDefinition;
  records: CatalogRecord[];
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
  onCreate?: () => void;
  onEdit?: (record: CatalogRecord) => void;
  onDelete?: (record: CatalogRecord) => void;
  page: number;
  totalPages: number;
  totalCount: number;
  onPageChange: (page: number) => void;
}

function formatCellValue(value: unknown): string {
  if (value === null || value === undefined || value === '') return '—';
  return String(value);
}

function buildColumns(
  definition: CatalogDefinition,
  onEdit?: (record: CatalogRecord) => void,
  onDelete?: (record: CatalogRecord) => void,
) {
  const tableFields = definition.fields.filter((field) => field.showInTable);

  const dataColumns = tableFields.map((field: CatalogFieldDefinition) => ({
    id: field.key,
    header: field.label,
    cell: (record: CatalogRecord) => {
      const value = record[field.key];
      if (field.key === definition.idField) {
        return (
          <span className="font-medium text-text-primary">
            #{formatCellValue(value)}
          </span>
        );
      }
      return formatCellValue(value);
    },
  }));

  const hasActions = Boolean(onEdit || onDelete);

  if (!hasActions) {
    return dataColumns;
  }

  return [
    ...dataColumns,
    {
      id: 'actions',
      header: 'Actions',
      className: 'text-right',
      cell: (record: CatalogRecord) => (
        <div className="flex justify-end gap-1">
          {onEdit && (
            <Button
              variant="ghost"
              size="sm"
              aria-label={`Edit ${getCatalogRecordLabel(record, definition)}`}
              onClick={() => onEdit(record)}
            >
              <Pencil className="size-4" />
            </Button>
          )}
          {onDelete && (
            <Button
              variant="ghost"
              size="sm"
              aria-label={`Delete ${getCatalogRecordLabel(record, definition)}`}
              onClick={() => onDelete(record)}
            >
              <Trash2 className="size-4 text-danger" />
            </Button>
          )}
        </div>
      ),
    },
  ];
}

export function CatalogTable({
  definition,
  records,
  isLoading,
  error,
  onRetry,
  onCreate,
  onEdit,
  onDelete,
  page,
  totalPages,
  totalCount,
  onPageChange,
}: CatalogTableProps) {
  const columns = useMemo(
    () => buildColumns(definition, onEdit, onDelete),
    [definition, onEdit, onDelete],
  );

  const emptyAction =
    onCreate && definition.operations.create ? (
      <Button leftIcon={<Plus className="size-4" />} onClick={onCreate}>
        Create first record
      </Button>
    ) : undefined;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="default">{records.length} loaded</Badge>
          {definition.readOnlyReason && (
            <Badge variant="cancelled">Read-only</Badge>
          )}
        </div>
        {onCreate && definition.operations.create && (
          <Button leftIcon={<Plus className="size-4" />} onClick={onCreate}>
            Create record
          </Button>
        )}
      </div>

      <AdminDataTable
        columns={columns}
        data={records}
        rowKey={(record) => getCatalogRecordId(record, definition)}
        isLoading={isLoading}
        error={error}
        onRetry={onRetry}
        emptyTitle="No records found"
        emptyDescription={
          definition.operations.create
            ? 'Create a record or verify the catalog API is available.'
            : 'This catalog has no records or is read-only.'
        }
        emptyAction={emptyAction}
        page={page}
        totalPages={totalPages}
        totalCount={totalCount}
        onPageChange={onPageChange}
      />
    </div>
  );
}
