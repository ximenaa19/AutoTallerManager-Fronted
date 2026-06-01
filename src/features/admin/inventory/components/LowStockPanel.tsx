import { AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingState } from '@/components/feedback/LoadingState';
import { EmptyState } from '@/components/feedback/EmptyState';
import {
  formatPartBrandLabel,
  formatPartCategoryLabel,
  type InventoryLookups,
} from '@/features/admin/inventory/hooks/useInventoryLookups';
import type { LowStockPartDto } from '@/features/admin/inventory/types/inventory.types';
import { getStockLevel } from '@/features/admin/inventory/types/inventory.types';
import { formatCurrency, formatNumber } from '@/utils/format';

export interface LowStockPanelProps {
  parts: LowStockPartDto[] | null;
  lookups: InventoryLookups;
  isLoading: boolean;
  error: string | null;
  onRetry?: () => void;
  onAdjust?: (part: LowStockPartDto) => void;
}

export function LowStockPanel({
  parts,
  lookups,
  isLoading,
  error,
  onRetry,
  onAdjust,
}: LowStockPanelProps) {
  return (
    <Card padding="none" className="overflow-hidden">
      <CardHeader className="border-b border-border px-5 py-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="size-5 text-warning" aria-hidden />
          <CardTitle>Low stock alerts</CardTitle>
        </div>
        <CardDescription>
          Parts at or below minimum stock. Adjust stock or register a purchase to replenish.
        </CardDescription>
      </CardHeader>

      <div className="max-h-[320px] overflow-y-auto">
        {isLoading && (
          <LoadingState
            title="Loading low stock"
            description="Checking inventory levels…"
            className="min-h-[200px] border-0"
          />
        )}

        {!isLoading && error && (
          <ErrorState
            title="Unable to load low stock"
            message={error}
            onRetry={onRetry}
            className="border-0"
          />
        )}

        {!isLoading && !error && parts?.length === 0 && (
          <EmptyState
            title="All stocked"
            description="No parts are currently below minimum stock."
            className="min-h-[200px] border-0"
          />
        )}

        {!isLoading && !error && parts && parts.length > 0 && (
          <ul className="divide-y divide-border">
            {parts.map((part) => {
              const level = getStockLevel(part.stock, part.minimumStock);
              return (
                <li
                  key={part.partId}
                  className="flex flex-col gap-2 px-5 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium text-text-primary">
                        {part.code}
                      </p>
                      <Badge
                        variant={level === 'out' ? 'low-stock' : 'pending'}
                        dot
                      >
                        {level === 'out' ? 'Out of stock' : 'Low stock'}
                      </Badge>
                      {!part.isActive && (
                        <Badge variant="cancelled">Inactive</Badge>
                      )}
                    </div>
                    <p className="truncate text-sm text-text-secondary">
                      {part.description}
                    </p>
                    <p className="text-xs text-text-muted">
                      {formatPartCategoryLabel(part.partCategoryId, lookups)}
                      {' · '}
                      {formatPartBrandLabel(part.partBrandId, lookups)}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-wrap items-center gap-4 text-sm">
                    <span className="text-text-secondary">
                      Stock{' '}
                      <strong className="text-text-primary">
                        {formatNumber(part.stock)}
                      </strong>
                      {' / '}
                      min {formatNumber(part.minimumStock)}
                    </span>
                    <span className="text-text-secondary">
                      {formatCurrency(part.unitPrice)}
                    </span>
                    {onAdjust && (
                      <button
                        type="button"
                        className="text-sm font-medium text-accent hover:text-accent-hover"
                        onClick={() => onAdjust(part)}
                      >
                        Adjust
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </Card>
  );
}
