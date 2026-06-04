import { useState } from 'react';
import { Package } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import type { ServiceOrderPartSummaryDto } from '@/features/admin/serviceOrders/types/serviceOrders.types';
import { mechanicServiceOrderApi } from '@/features/mechanic/api/mechanicServiceOrder.api';
import { formatApprovalStatus } from '@/features/mechanic/utils/mechanicEnrichedLabels';
import { formatCurrency, formatDateTime } from '@/utils/format';
import { getErrorMessage } from '@/api/apiError';

export interface MechanicRequestedPartsSectionProps {
  parts: ServiceOrderPartSummaryDto[];
  isLoading: boolean;
  notice?: string | null;
  onPartsChanged?: () => void;
}

function PartQuantityEditor({
  part,
  onSaved,
}: {
  part: ServiceOrderPartSummaryDto;
  onSaved: () => void;
}) {
  const [quantity, setQuantity] = useState(String(part.quantity));
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    const parsed = Number(quantity);
    if (!Number.isFinite(parsed) || parsed <= 0 || !Number.isInteger(parsed)) {
      setError('Enter a whole number greater than zero.');
      return;
    }

    if (parsed === part.quantity) {
      setError(null);
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      await mechanicServiceOrderApi.changePartQuantity(part.orderServicePartId, {
        quantity: parsed,
      });
      onSaved();
    } catch (saveError) {
      setError(getErrorMessage(saveError));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="flex flex-wrap items-end gap-2">
      <label className="flex flex-col gap-1 text-xs text-text-muted">
        Quantity
        <input
          type="number"
          min={1}
          step={1}
          value={quantity}
          onChange={(event) => setQuantity(event.target.value)}
          className="h-9 w-24 rounded-md border border-border bg-bg-elevated px-2 text-sm text-text-primary"
        />
      </label>
      <Button type="button" size="sm" isLoading={isSaving} onClick={() => void handleSave()}>
        Update
      </Button>
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}

export function MechanicRequestedPartsSection({
  parts,
  isLoading,
  notice,
  onPartsChanged,
}: MechanicRequestedPartsSectionProps) {
  if (isLoading) {
    return (
      <Card padding="md" className="space-y-2">
        <h3 className="text-base font-semibold text-text-primary">Requested parts</h3>
        <p className="text-sm text-text-secondary">Loading requested parts…</p>
      </Card>
    );
  }

  if (notice && parts.length === 0) {
    return (
      <Card padding="md" className="space-y-2">
        <h3 className="text-base font-semibold text-text-primary">Requested parts</h3>
        <p className="text-sm text-text-secondary">{notice}</p>
      </Card>
    );
  }

  if (parts.length === 0) {
    return null;
  }

  return (
    <Card padding="md" className="space-y-4">
      <div className="flex items-start gap-2">
        <Package className="mt-0.5 size-4 text-accent" aria-hidden />
        <div>
          <h3 className="text-base font-semibold text-text-primary">Requested parts</h3>
          <p className="mt-1 text-sm text-text-secondary">
            Parts linked to this assignment from the service order. Approval status comes from
            the backend only.
          </p>
        </div>
      </div>

      {notice && (
        <p className="rounded-md border border-warning/30 bg-warning-muted/30 px-3 py-2 text-sm text-text-secondary">
          {notice}
        </p>
      )}

      <ul className="space-y-4">
        {parts.map((part) => (
          <li
            key={part.orderServicePartId}
            className="rounded-md border border-border bg-bg-elevated p-4"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-text-primary">
                  Part #{part.partId}
                </p>
                <p className="text-sm text-text-secondary">
                  Qty {part.quantity} · {formatCurrency(part.subtotal)} subtotal
                </p>
                <p className="text-xs text-text-muted">
                  Approval: {formatApprovalStatus(part.customerApproved)}
                  {part.approvalDate
                    ? ` · ${formatDateTime(part.approvalDate)}`
                    : ''}
                </p>
              </div>
              <PartQuantityEditor part={part} onSaved={() => onPartsChanged?.()} />
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}
