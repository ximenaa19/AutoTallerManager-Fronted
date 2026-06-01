import { AlertTriangle, Boxes, CircleDollarSign, Package } from 'lucide-react';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingState } from '@/components/feedback/LoadingState';
import { MetricCard } from '@/components/ui/Card';
import type { InventorySummaryDto } from '@/features/admin/inventory/types/inventory.types';
import { formatCurrency, formatNumber } from '@/utils/format';

export interface InventorySummaryCardsProps {
  summary: InventorySummaryDto | null;
  isLoading: boolean;
  error: string | null;
  onRetry?: () => void;
}

export function InventorySummaryCards({
  summary,
  isLoading,
  error,
  onRetry,
}: InventorySummaryCardsProps) {
  if (isLoading) {
    return (
      <LoadingState
        title="Loading inventory summary"
        description="Fetching KPIs from the server…"
        className="min-h-[140px] rounded-lg border border-border bg-bg-surface"
      />
    );
  }

  if (error) {
    return (
      <ErrorState
        title="Unable to load summary"
        message={error}
        onRetry={onRetry}
        className="rounded-lg border border-border bg-bg-surface"
      />
    );
  }

  if (!summary) {
    return null;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <MetricCard
        title="Total parts"
        value={formatNumber(summary.totalParts)}
        footer={`${formatNumber(summary.activeParts)} active in catalog`}
        icon={<Package className="size-5" aria-hidden />}
        iconTone="accent"
      />
      <MetricCard
        title="Low stock"
        value={formatNumber(summary.lowStockParts)}
        footer="At or below minimum stock"
        icon={<AlertTriangle className="size-5" aria-hidden />}
        iconTone="warning"
      />
      <MetricCard
        title="Out of stock"
        value={formatNumber(summary.outOfStockParts)}
        footer="Requires replenishment"
        icon={<Boxes className="size-5" aria-hidden />}
        iconTone="danger"
      />
      <MetricCard
        title="Estimated value"
        value={formatCurrency(summary.estimatedInventoryValue)}
        footer="Active parts at unit price"
        icon={<CircleDollarSign className="size-5" aria-hidden />}
        iconTone="teal"
      />
    </div>
  );
}
