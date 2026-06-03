import { CheckCircle2, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatCurrency } from '@/utils/format';
import type { ClientPendingPartApprovalDto } from '@/features/client/types/clientApprovals.types';

export interface ClientPendingPartApprovalItemProps {
  part: ClientPendingPartApprovalDto;
  isActionRunning: boolean;
  isApproving: boolean;
  isRejecting: boolean;
  onApprove: (orderServicePartId: number) => void;
  onReject: (orderServicePartId: number) => void;
}

export function ClientPendingPartApprovalItem({
  part,
  isActionRunning,
  isApproving,
  isRejecting,
  onApprove,
  onReject,
}: ClientPendingPartApprovalItemProps) {
  const partLabel = part.partName ?? `Part #${part.partId}`;

  return (
    <article className="rounded-lg border border-border bg-bg-elevated p-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="text-sm font-semibold text-text-primary">{partLabel}</h4>
            <Badge variant="accent" dot>
              Part
            </Badge>
          </div>
          <div className="grid gap-1 text-sm text-text-secondary sm:grid-cols-3">
            <p>Quantity: {part.quantity}</p>
            <p>Unit price: {formatCurrency(part.appliedUnitPrice)}</p>
            <p className="font-medium text-text-primary">
              Subtotal: {formatCurrency(part.subtotal)}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap gap-2">
          <Button
            size="sm"
            leftIcon={<CheckCircle2 className="size-4" />}
            isLoading={isApproving}
            disabled={isActionRunning}
            onClick={() => onApprove(part.orderServicePartId)}
          >
            Approve
          </Button>
          <Button
            size="sm"
            variant="danger"
            leftIcon={<XCircle className="size-4" />}
            isLoading={isRejecting}
            disabled={isActionRunning}
            onClick={() => onReject(part.orderServicePartId)}
          >
            Reject
          </Button>
        </div>
      </div>
    </article>
  );
}
