import { AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingState } from '@/components/feedback/LoadingState';
import { formatCurrency, formatNumber } from '@/utils/format';
import type { LowStockPartDto } from '@/features/receptionist/types/receptionistInventory.types';

function getStatusBadge(stock: number, minimumStock: number) {
  if (stock <= 0) {
    return (
      <Badge variant="low-stock" dot>
        Out of stock
      </Badge>
    );
  }

  if (stock <= minimumStock) {
    return (
      <Badge variant="pending" dot>
        Low stock
      </Badge>
    );
  }

  return null;
}

export interface ReceptionistLowStockPanelProps {
  parts: LowStockPartDto[] | null;
  isLoading: boolean;
  error: string | null;
  onRetry?: () => void;
}

export function ReceptionistLowStockPanel({
  parts,
  isLoading,
  error,
  onRetry,
}: ReceptionistLowStockPanelProps) {
  return (
    <Card padding="none" className="overflow-hidden">
      <CardHeader className="border-b border-border px-5 py-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="size-5 text-warning" aria-hidden />
          <CardTitle>Low stock alerts</CardTitle>
        </div>
        <CardDescription>
          Parts at or below minimum stock for quick replenishment checks.
        </CardDescription>
      </CardHeader>

      <div className="max-h-[360px] overflow-y-auto">
        {isLoading && (
          <LoadingState
            title="Loading low-stock parts"
            description="Reading current stock thresholds."
            className="min-h-[220px] border-0"
          />
        )}

        {!isLoading && error && (
          <ErrorState
            title="Unable to load low-stock parts"
            message={error}
            onRetry={onRetry}
            className="border-0"
          />
        )}

        {!isLoading && !error && parts?.length === 0 && (
          <EmptyState
            title="Stock levels are healthy"
            description="No parts are currently below minimum stock."
            className="min-h-[220px] border-0"
          />
        )}

        {!isLoading && !error && parts && parts.length > 0 && (
          <ul className="divide-y divide-border">
            {parts.map((part) => (
              <li
                key={part.partId}
                className="flex flex-col gap-2 px-5 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-text-primary">{part.code}</p>
                    {getStatusBadge(part.stock, part.minimumStock)}
                    {!part.isActive && <Badge variant="cancelled">Inactive</Badge>}
                  </div>
                  <p className="truncate text-sm text-text-secondary">{part.description}</p>
                  <p className="text-xs text-text-muted">
                    Category #{part.partCategoryId}
                    {' · '}
                    {part.partBrandId ? `Brand #${part.partBrandId}` : 'No brand'}
                  </p>
                </div>

                <div className="flex shrink-0 flex-wrap items-center gap-2 text-sm text-text-secondary">
                  <span>
                    Stock{' '}
                    <strong className="text-text-primary">{formatNumber(part.stock)}</strong>
                    {' / '}
                    min {formatNumber(part.minimumStock)}
                  </span>
                  <span>{formatCurrency(part.unitPrice)}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Card>
  );
}
