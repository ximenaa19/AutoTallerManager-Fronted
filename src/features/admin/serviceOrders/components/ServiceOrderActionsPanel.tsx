import { CheckCircle2, RefreshCw, Ban, ShieldOff } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import {
  ORDER_STATUS_IDS,
  type ServiceOrderFullDetailDto,
} from '@/features/admin/serviceOrders/types/serviceOrders.types';

export interface ServiceOrderActionsPanelProps {
  order: ServiceOrderFullDetailDto;
  onChangeStatus: () => void;
  onCancel: () => void;
  onVoid: () => void;
  onComplete: () => void;
  isLoading?: boolean;
}

function isTerminalStatus(orderStatusId: number): boolean {
  return (
    orderStatusId === ORDER_STATUS_IDS.completed ||
    orderStatusId === ORDER_STATUS_IDS.cancelled ||
    orderStatusId === ORDER_STATUS_IDS.voided
  );
}

export function ServiceOrderActionsPanel({
  order,
  onChangeStatus,
  onCancel,
  onVoid,
  onComplete,
  isLoading = false,
}: ServiceOrderActionsPanelProps) {
  const terminal = isTerminalStatus(order.orderStatusId);

  return (
    <section className="rounded-lg border border-border bg-bg-surface p-5">
      <h2 className="text-base font-semibold text-text-primary">Workflow actions</h2>
      <p className="mt-1 text-sm text-text-secondary">
        Operational controls for this service order. Destructive actions require confirmation.
      </p>

      <div className="mt-5 flex flex-wrap gap-2">
        <Button
          variant="secondary"
          leftIcon={<RefreshCw className="size-4" />}
          onClick={onChangeStatus}
          disabled={isLoading || terminal}
        >
          Change status
        </Button>
        <Button
          variant="secondary"
          leftIcon={<CheckCircle2 className="size-4" />}
          onClick={onComplete}
          disabled={
            isLoading ||
            order.orderStatusId === ORDER_STATUS_IDS.completed ||
            order.orderStatusId === ORDER_STATUS_IDS.cancelled ||
            order.orderStatusId === ORDER_STATUS_IDS.voided
          }
        >
          Complete order
        </Button>
        <Button
          variant="danger"
          leftIcon={<Ban className="size-4" />}
          onClick={onCancel}
          disabled={
            isLoading ||
            order.orderStatusId === ORDER_STATUS_IDS.cancelled ||
            order.orderStatusId === ORDER_STATUS_IDS.voided
          }
        >
          Cancel order
        </Button>
        <Button
          variant="danger"
          leftIcon={<ShieldOff className="size-4" />}
          onClick={onVoid}
          disabled={
            isLoading ||
            order.orderStatusId === ORDER_STATUS_IDS.voided ||
            order.orderStatusId === ORDER_STATUS_IDS.cancelled
          }
        >
          Void order
        </Button>
      </div>

      {terminal && (
        <p className="mt-4 text-xs text-text-muted">
          This order is in a terminal status. Some workflow actions are disabled.
        </p>
      )}
    </section>
  );
}
