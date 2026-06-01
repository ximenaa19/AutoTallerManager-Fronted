import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import type { InventoryLookups } from '@/features/admin/inventory/hooks/useInventoryLookups';
import type {
  PartPurchaseDto,
  UpdatePartPurchaseRequest,
} from '@/features/admin/inventory/types/purchases.types';

export interface PurchaseFormProps {
  purchase: PartPurchaseDto;
  lookups: InventoryLookups;
  isSubmitting?: boolean;
  onSubmit: (payload: UpdatePartPurchaseRequest) => Promise<void>;
  onCancel: () => void;
}

export function PurchaseForm({
  purchase,
  lookups,
  isSubmitting = false,
  onSubmit,
  onCancel,
}: PurchaseFormProps) {
  const [supplierId, setSupplierId] = useState(String(purchase.supplierId));
  const [purchaseDate, setPurchaseDate] = useState('');
  const [fieldError, setFieldError] = useState<string | null>(null);

  const supplierOptions = useMemo(
    () =>
      lookups.suppliers.map((supplier) => ({
        value: String(supplier.supplierId),
        label: supplier.isActive
          ? supplier.name
          : `${supplier.name} (inactive)`,
      })),
    [lookups.suppliers],
  );

  useEffect(() => {
    const date = new Date(purchase.purchaseDate);
    if (!Number.isNaN(date.getTime())) {
      setPurchaseDate(date.toISOString().slice(0, 16));
    }
    setSupplierId(String(purchase.supplierId));
  }, [purchase]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setFieldError(null);

    const parsedSupplierId = Number(supplierId);
    if (!Number.isFinite(parsedSupplierId) || parsedSupplierId <= 0) {
      setFieldError('Select a supplier');
      return;
    }

    if (!purchaseDate) {
      setFieldError('Purchase date is required');
      return;
    }

    await onSubmit({
      supplierId: parsedSupplierId,
      purchaseDate: new Date(purchaseDate).toISOString(),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <p className="rounded-md border border-border bg-bg-elevated/50 px-3 py-2 text-xs text-text-secondary">
        This updates purchase header fields only. Line items and stock are not
        changed here. Use Register purchase for new stock intake.
      </p>

      <Select
        label="Supplier"
        name="supplierId"
        value={supplierId}
        onChange={(event) => setSupplierId(event.target.value)}
        options={supplierOptions}
        placeholder="Select supplier"
        required
      />

      <Input
        label="Purchase date"
        name="purchaseDate"
        type="datetime-local"
        value={purchaseDate}
        onChange={(event) => setPurchaseDate(event.target.value)}
        required
      />

      {fieldError && (
        <p className="text-sm text-danger" role="alert">
          {fieldError}
        </p>
      )}

      <div className="flex justify-end gap-2 border-t border-border pt-4">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isSubmitting}>
          Save header
        </Button>
      </div>
    </form>
  );
}
