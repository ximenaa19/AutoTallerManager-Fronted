import { AlertTriangle, Boxes, CircleDollarSign, Package } from 'lucide-react';
import { DashboardGrid } from '@/components/dashboard/DashboardGrid';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingState } from '@/components/feedback/LoadingState';
import { StatCard } from '@/components/dashboard/StatCard';
import { formatCurrency, formatNumber } from '@/utils/format';
import type { InventorySummaryDto } from '@/features/receptionist/types/receptionistInventory.types';

export interface ReceptionistInventorySummaryCardsProps {
  summary: InventorySummaryDto | null;
  isLoading: boolean;
  error: string | null;
  onRetry?: () => void;
}

export function ReceptionistInventorySummaryCards({
  summary,
  isLoading,
  error,
  onRetry,
}: ReceptionistInventorySummaryCardsProps) {
  if (isLoading) {
    return (
      <LoadingState
        title="Loading inventory summary"
        description="Getting KPI values from the reception dashboard."
      />
    );
  }

  if (error) {
    return (
      <ErrorState
        title="Unable to load inventory summary"
        message={error}
        onRetry={onRetry}
      />
    );
  }

  if (!summary) {
    return (
      <ErrorState
        title="Inventory summary unavailable"
        message="The inventory summary response did not return expected values."
        onRetry={onRetry}
        retryLabel="Retry"
      />
    );
  }

  return (
    <DashboardGrid>
      <StatCard
        title="Total parts"
        value={formatNumber(summary.totalParts)}
        footer={`${formatNumber(summary.activeParts)} active`}
        tone="accent"
        icon={<Package className="size-5" aria-hidden />}
      />

      <StatCard
        title="Low stock"
        value={formatNumber(summary.lowStockParts)}
        footer="Below minimum stock"
        tone="warning"
        icon={<AlertTriangle className="size-5" aria-hidden />}
      />

      <StatCard
        title="Out of stock"
        value={formatNumber(summary.outOfStockParts)}
        footer="Require replenishment"
        tone="danger"
        icon={<Boxes className="size-5" aria-hidden />}
      />

      <StatCard
        title="Estimated stock value"
        value={formatCurrency(summary.estimatedInventoryValue)}
        footer="Active parts only"
        tone="teal"
        icon={<CircleDollarSign className="size-5" aria-hidden />}
      />
    </DashboardGrid>
  );
}
