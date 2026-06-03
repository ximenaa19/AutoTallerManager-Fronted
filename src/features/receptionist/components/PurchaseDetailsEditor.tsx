import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { EmptyState } from '@/components/feedback/EmptyState';
import { formatCurrency } from '@/utils/format';
import type { PurchaseLine } from '@/features/receptionist/hooks/useReceptionistPurchaseForm';
import type { PartSearchResultDto } from '@/features/receptionist/types/receptionistPurchases.types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table';

export interface PurchaseDetailsEditorProps {
  selectedPart: PartSearchResultDto | null;
  draftQuantity: string;
  draftUnitPrice: string;
  draftLineError: string | null;
  onDraftQuantityChange: (value: string) => void;
  onDraftUnitPriceChange: (value: string) => void;
  onAddLine: () => void;
  lines: PurchaseLine[];
  onRemoveLine: (lineId: string) => void;
  isSubmitting: boolean;
}

export function PurchaseDetailsEditor({
  selectedPart,
  draftQuantity,
  draftUnitPrice,
  draftLineError,
  onDraftQuantityChange,
  onDraftUnitPriceChange,
  onAddLine,
  lines,
  onRemoveLine,
  isSubmitting,
}: PurchaseDetailsEditorProps) {
  const selectedSubtotal = selectedPart
    ? Number(draftQuantity) * Number(draftUnitPrice)
    : 0;

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold text-text-primary">Purchase lines</h2>

      <Card className="space-y-4 p-4">
        <h3 className="text-sm font-semibold text-text-primary">Add purchase line</h3>
        <p className="text-xs text-text-secondary">
          Select a part first, then define quantity and unit price.
        </p>

        {selectedPart ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              name="purchase-quantity"
              label="Quantity"
              type="number"
              min={1}
              step={1}
              value={draftQuantity}
              onChange={(event) => onDraftQuantityChange(event.target.value)}
              disabled={isSubmitting}
              required
            />
            <Input
              name="purchase-unit-price"
              label="Unit price"
              type="number"
              min={0}
              step="0.01"
              value={draftUnitPrice}
              onChange={(event) => onDraftUnitPriceChange(event.target.value)}
              disabled={isSubmitting}
              required
            />
            <div className="flex items-end sm:col-span-2">
              <Button
                type="button"
                leftIcon={<Plus className="size-4" />}
                onClick={onAddLine}
                disabled={isSubmitting}
              >
                Add line
              </Button>
            </div>
            <p className="sm:col-span-2 text-xs text-text-secondary">
              Subtotal preview: {formatCurrency(selectedSubtotal)}
            </p>
          </div>
        ) : (
          <p className="text-sm text-text-secondary">
            Pick a part from the search results to add lines.
          </p>
        )}

        {draftLineError && (
          <p className="text-sm text-danger" role="alert">
            {draftLineError}
          </p>
        )}
      </Card>

      <Card>
        {lines.length === 0 ? (
          <EmptyState
            title="No lines yet"
            description="Add parts with quantity and unit price to build the purchase."
          />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Part</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead>Unit price</TableHead>
                  <TableHead>Subtotal</TableHead>
                  <TableHead className="w-28 text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lines.map((line) => (
                  <TableRow key={line.id}>
                    <TableCell>{line.partDescription}</TableCell>
                    <TableCell className="font-medium text-text-primary">
                      {line.partCode}
                    </TableCell>
                    <TableCell>{line.quantity}</TableCell>
                    <TableCell>{formatCurrency(line.unitPrice)}</TableCell>
                    <TableCell>{formatCurrency(line.quantity * line.unitPrice)}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        leftIcon={<Trash2 className="size-4 text-danger" />}
                        onClick={() => onRemoveLine(line.id)}
                        disabled={isSubmitting}
                      >
                        Remove
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>
    </section>
  );
}
