import type { ReactNode } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingState } from '@/components/feedback/LoadingState';
import { Button } from '@/components/ui/Button';
import {
  Table,
  TableBody,
  TableCell,
  TableEmpty,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table';
import { cn } from '@/lib/cn';

export interface AdminTableColumn<T> {
  id: string;
  header: string;
  className?: string;
  cell: (row: T) => ReactNode;
}

export interface AdminDataTableProps<T> {
  columns: AdminTableColumn<T>[];
  data: T[];
  rowKey: (row: T) => string | number;
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: ReactNode;
  page?: number;
  totalPages?: number;
  totalCount?: number;
  onPageChange?: (page: number) => void;
  className?: string;
}

export function AdminDataTable<T>({
  columns,
  data,
  rowKey,
  isLoading = false,
  error = null,
  onRetry,
  emptyTitle = 'No records found',
  emptyDescription,
  emptyAction,
  page,
  totalPages,
  totalCount,
  onPageChange,
  className,
}: AdminDataTableProps<T>) {
  const colSpan = columns.length;
  const showPagination =
    page !== undefined &&
    totalPages !== undefined &&
    totalCount !== undefined &&
    onPageChange !== undefined &&
    totalPages > 1;

  if (isLoading) {
    return (
      <LoadingState
        title="Loading records"
        description="Fetching data from the server…"
        className={cn('min-h-[280px] rounded-lg border border-border bg-bg-surface', className)}
      />
    );
  }

  if (error) {
    return (
      <ErrorState
        title="Unable to load records"
        message={error}
        onRetry={onRetry}
        className={className}
      />
    );
  }

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead key={column.id} className={column.className}>
                {column.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableEmpty colSpan={colSpan}>
              <EmptyState
                title={emptyTitle}
                description={emptyDescription}
                action={emptyAction}
                className="py-8"
              />
            </TableEmpty>
          ) : (
            data.map((row) => (
              <TableRow key={rowKey(row)}>
                {columns.map((column) => (
                  <TableCell key={column.id} className={column.className}>
                    {column.cell(row)}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {showPagination && (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-text-secondary">
            Showing page {page} of {totalPages} ({totalCount} total)
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
              leftIcon={<ChevronLeft className="size-4" />}
            >
              Previous
            </Button>
            <Button
              variant="secondary"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
              rightIcon={<ChevronRight className="size-4" />}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
