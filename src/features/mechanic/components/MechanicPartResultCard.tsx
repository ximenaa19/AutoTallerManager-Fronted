import { Package } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { getPartDisplayLines } from '@/features/admin/inventory/utils/partDisplay';
import type { PartSearchResultDto } from '@/features/mechanic/types/mechanicParts.types';
import { formatCurrency, formatNumber } from '@/utils/format';

export interface MechanicPartResultCardProps {
  part: PartSearchResultDto;
  onSelect?: (part: PartSearchResultDto) => void;
  selectLabel?: string;
}

export function MechanicPartResultCard({
  part,
  onSelect,
  selectLabel = 'Use for request',
}: MechanicPartResultCardProps) {
  const { primary, secondary } = getPartDisplayLines(part);
  const isLowStock = part.stock <= part.minimumStock;

  return (
    <Card padding="md" className="flex h-full flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2">
          <Package className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden />
          <div>
            <h3 className="text-base font-semibold text-text-primary">{primary}</h3>
            <p className="mt-0.5 text-sm text-text-secondary">{secondary}</p>
          </div>
        </div>
        {!part.isActive && (
          <Badge variant="default">Inactive</Badge>
        )}
      </div>

      <dl className="grid gap-2 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-text-muted">
            Part ID
          </dt>
          <dd className="text-text-primary">#{formatNumber(part.partId)}</dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-text-muted">
            Code
          </dt>
          <dd className="text-text-primary">{part.code || '—'}</dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-text-muted">
            Stock
          </dt>
          <dd className={isLowStock ? 'text-warning' : 'text-text-primary'}>
            {formatNumber(part.stock)}
            {isLowStock && (
              <span className="ml-1 text-xs text-text-secondary">
                (min {formatNumber(part.minimumStock)})
              </span>
            )}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-text-muted">
            Unit price
          </dt>
          <dd className="text-text-primary">{formatCurrency(part.unitPrice)}</dd>
        </div>
      </dl>

      {onSelect && part.isActive && (
        <div className="mt-auto border-t border-border pt-3">
          <button
            type="button"
            onClick={() => onSelect(part)}
            className="text-sm font-medium text-accent hover:underline focus-ring rounded"
          >
            {selectLabel}
          </button>
        </div>
      )}

      {onSelect && !part.isActive && (
        <p className="mt-auto border-t border-border pt-3 text-xs text-text-secondary">
          Inactive parts cannot be requested.
        </p>
      )}
    </Card>
  );
}
