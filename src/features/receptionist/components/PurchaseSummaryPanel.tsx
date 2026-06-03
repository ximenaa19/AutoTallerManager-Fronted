import { AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { formatCurrency } from '@/utils/format';
import type { SupplierSearchResultDto } from '@/features/receptionist/types/receptionistPurchases.types';

export interface PurchaseSummaryPanelProps {
  selectedSupplier: SupplierSearchResultDto | null;
  lineCount: number;
  totalVisual: number;
}

export function PurchaseSummaryPanel({
  selectedSupplier,
  lineCount,
  totalVisual,
}: PurchaseSummaryPanelProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Purchase summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p className="text-text-secondary">
          <span className="font-medium text-text-primary">Supplier:</span>{' '}
          {selectedSupplier ? selectedSupplier.name : 'No supplier selected'}
        </p>
        <p className="text-text-secondary">
          <span className="font-medium text-text-primary">Lines:</span>{' '}
          {lineCount}
        </p>
        <p className="text-text-secondary">
          <span className="font-medium text-text-primary">Subtotal (visual):</span>{' '}
          {formatCurrency(totalVisual)}
        </p>

        <div className="mt-4 rounded-md border border-warning/20 bg-warning-muted/25 p-3 text-xs text-warning">
          <p className="flex items-start gap-2">
            <AlertTriangle className="mt-0.5 size-4 shrink-0" />
            Backend recalculates the total and updates stock. Use this value as a helper only.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
