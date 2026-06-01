import { AdminDataTable } from '@/features/admin/components/AdminDataTable';
import {
  formatPartLabel,
  type InventoryLookups,
} from '@/features/admin/inventory/hooks/useInventoryLookups';
import type { PartPurchaseDetailDto } from '@/features/admin/inventory/types/purchases.types';
import { formatCurrency } from '@/utils/format';

export interface PurchaseDetailsPanelProps {
  details: PartPurchaseDetailDto[];
  lookups: InventoryLookups;
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

export function PurchaseDetailsPanel({
  details,
  lookups,
  isLoading,
  error,
  onRetry,
}: PurchaseDetailsPanelProps) {
  const total = details.reduce((sum, line) => sum + line.subtotal, 0);

  return (
    <div className="flex flex-col gap-3">
      <AdminDataTable
        columns={[
          {
            id: 'part',
            header: 'Part',
            cell: (row) => formatPartLabel(row.partId, lookups),
          },
          {
            id: 'quantity',
            header: 'Qty',
            className: 'w-20',
            cell: (row) => row.quantity,
          },
          {
            id: 'unitPrice',
            header: 'Unit price',
            cell: (row) => formatCurrency(row.unitPrice),
          },
          {
            id: 'subtotal',
            header: 'Subtotal',
            cell: (row) => formatCurrency(row.subtotal),
          },
        ]}
        data={details}
        rowKey={(row) => row.partPurchaseDetailId}
        isLoading={isLoading}
        error={error}
        onRetry={onRetry}
        emptyTitle="No line items"
        emptyDescription="This purchase has no detail lines recorded."
      />
      {details.length > 0 && (
        <div className="flex justify-end border-t border-border pt-3">
          <p className="text-sm text-text-secondary">
            Lines total:{' '}
            <strong className="text-text-primary">{formatCurrency(total)}</strong>
          </p>
        </div>
      )}
    </div>
  );
}
