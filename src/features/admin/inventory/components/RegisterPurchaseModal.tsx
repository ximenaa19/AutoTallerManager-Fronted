import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { getErrorMessage } from '@/api/apiError';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';
import { inventoryApi } from '@/features/admin/inventory/api/inventory.api';
import {
  normalizePurchaseDate,
  normalizePurchaseDetails,
} from '@/features/admin/inventory/api/registerPurchase';
import { partsApi } from '@/features/admin/inventory/api/parts.api';
import type { InventoryLookups } from '@/features/admin/inventory/hooks/useInventoryLookups';
import type { PartSearchResultDto } from '@/features/admin/inventory/types/parts.types';
import {
  getPartDisplayLines,
  partMatchesSearchTerm,
} from '@/features/admin/inventory/utils/partDisplay';
import { formatCurrency } from '@/utils/format';

interface PurchaseLineDraft {
  key: string;
  partId: number;
  primaryLabel: string;
  secondaryLabel: string;
  quantity: string;
  unitPrice: string;
}

export interface RegisterPurchaseModalProps {
  open: boolean;
  lookups: InventoryLookups;
  onClose: () => void;
  onSuccess: (message: string) => void;
}

function newLineKey(): string {
  return `line-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function RegisterPurchaseModal({
  open,
  lookups,
  onClose,
  onSuccess,
}: RegisterPurchaseModalProps) {
  const [supplierId, setSupplierId] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [lines, setLines] = useState<PurchaseLineDraft[]>([]);
  const [partSearchTerm, setPartSearchTerm] = useState('');
  const [partResults, setPartResults] = useState<PartSearchResultDto[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const activeSuppliers = useMemo(
    () => lookups.suppliers.filter((supplier) => supplier.isActive),
    [lookups.suppliers],
  );

  const supplierOptions = useMemo(
    () =>
      activeSuppliers.map((supplier) => ({
        value: String(supplier.supplierId),
        label: supplier.name,
      })),
    [activeSuppliers],
  );

  useEffect(() => {
    if (!open) return;

    const defaultSupplier = activeSuppliers[0];
    setSupplierId(defaultSupplier ? String(defaultSupplier.supplierId) : '');
    setPurchaseDate(new Date().toISOString().slice(0, 16));
    setLines([]);
    setPartSearchTerm('');
    setPartResults([]);
    setFieldError(null);
    setApiError(null);
  }, [open, activeSuppliers]);

  useEffect(() => {
    const normalized = partSearchTerm.trim();
    if (normalized.length < 2) {
      setPartResults([]);
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setIsSearching(true);
      partsApi
        .search(normalized)
        .then((response) =>
          setPartResults(
            response.data.filter(
              (part) =>
                part.isActive && partMatchesSearchTerm(part, normalized),
            ),
          ),
        )
        .catch(() => setPartResults([]))
        .finally(() => setIsSearching(false));
    }, 350);

    return () => window.clearTimeout(timeoutId);
  }, [partSearchTerm]);

  const estimatedTotal = useMemo(() => {
    return lines.reduce((sum, line) => {
      const qty = Number(line.quantity);
      const price = Number(line.unitPrice);
      if (!Number.isFinite(qty) || !Number.isFinite(price)) return sum;
      return sum + qty * price;
    }, 0);
  }, [lines]);

  const addPartLine = (part: PartSearchResultDto) => {
    if (lines.some((line) => line.partId === part.partId)) {
      setFieldError('This part is already in the purchase');
      return;
    }

    const display = getPartDisplayLines(part);

    setLines((current) => [
      ...current,
      {
        key: newLineKey(),
        partId: part.partId,
        primaryLabel: display.primary,
        secondaryLabel: display.secondary,
        quantity: '1',
        unitPrice: String(part.unitPrice),
      },
    ]);
    setPartSearchTerm('');
    setPartResults([]);
    setFieldError(null);
  };

  const removeLine = (key: string) => {
    setLines((current) => current.filter((line) => line.key !== key));
  };

  const updateLine = (
    key: string,
    field: 'quantity' | 'unitPrice',
    value: string,
  ) => {
    setLines((current) =>
      current.map((line) =>
        line.key === key ? { ...line, [field]: value } : line,
      ),
    );
  };

  const handleClose = () => {
    if (!isSubmitting) onClose();
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setFieldError(null);
    setApiError(null);

    const parsedSupplierId = Number(supplierId);
    if (!Number.isFinite(parsedSupplierId) || parsedSupplierId <= 0) {
      setFieldError('Select an active supplier');
      return;
    }

    if (lines.length === 0) {
      setFieldError('Add at least one part line');
      return;
    }

    const rawDetails = [];

    for (const line of lines) {
      const quantity = Number(line.quantity);
      const unitPrice = Number(line.unitPrice);

      if (!Number.isFinite(quantity) || quantity <= 0) {
        setFieldError(`Invalid quantity for ${line.primaryLabel}`);
        return;
      }

      if (!Number.isInteger(quantity)) {
        setFieldError(`Quantity must be a whole number for ${line.primaryLabel}`);
        return;
      }

      if (!Number.isFinite(unitPrice) || unitPrice < 0) {
        setFieldError(`Invalid unit price for ${line.primaryLabel}`);
        return;
      }

      rawDetails.push({
        partId: line.partId,
        quantity,
        unitPrice,
      });
    }

    const normalizedDate = normalizePurchaseDate(purchaseDate);
    if (purchaseDate.trim() && !normalizedDate) {
      setFieldError('Purchase date is invalid');
      return;
    }

    const details = normalizePurchaseDetails(rawDetails);

    setIsSubmitting(true);
    try {
      const response = await inventoryApi.registerPurchase({
        supplierId: parsedSupplierId,
        purchaseDate: normalizedDate,
        details,
      });

      onSuccess(
        `Purchase #${response.data.partPurchaseId} registered — total ${formatCurrency(response.data.total)}`,
      );
      onClose();
    } catch (err) {
      setApiError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Register purchase"
      description="Record incoming stock from a supplier. Stock levels update automatically."
      size="lg"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="grid gap-4 sm:grid-cols-2">
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
          />
        </div>

        <div className="rounded-lg border border-border bg-bg-elevated/40 p-4">
          <Input
            label="Search parts to add"
            name="partSearch"
            value={partSearchTerm}
            onChange={(event) => setPartSearchTerm(event.target.value)}
            placeholder="Type at least 2 characters…"
            hint={isSearching ? 'Searching…' : undefined}
          />
          {partResults.length > 0 && (
            <ul className="mt-2 max-h-48 overflow-y-auto rounded-md border border-border divide-y divide-border">
              {partResults.map((part) => {
                const display = getPartDisplayLines(part);
                return (
                  <li key={part.partId}>
                    <button
                      type="button"
                      className="flex w-full flex-col gap-0.5 px-3 py-2.5 text-left hover:bg-bg-elevated"
                      onClick={() => addPartLine(part)}
                    >
                      <span className="text-sm font-medium text-text-primary">
                        {display.primary}
                      </span>
                      <span className="text-xs text-text-secondary">
                        {display.secondary}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {lines.length > 0 && (
          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium text-text-primary">Line items</p>
            <ul className="flex flex-col gap-2">
              {lines.map((line) => (
                <li
                  key={line.key}
                  className="grid gap-2 rounded-lg border border-border p-3 sm:grid-cols-[1fr_100px_120px_auto]"
                >
                  <div className="min-w-0 sm:col-span-1">
                    <p className="text-sm font-medium text-text-primary">
                      {line.primaryLabel}
                    </p>
                    <p className="text-xs text-text-secondary">
                      {line.secondaryLabel}
                    </p>
                  </div>
                  <Input
                    label="Qty"
                    name={`qty-${line.key}`}
                    type="number"
                    min={1}
                    value={line.quantity}
                    onChange={(event) =>
                      updateLine(line.key, 'quantity', event.target.value)
                    }
                  />
                  <Input
                    label="Unit price"
                    name={`price-${line.key}`}
                    type="number"
                    min={0}
                    step="0.01"
                    value={line.unitPrice}
                    onChange={(event) =>
                      updateLine(line.key, 'unitPrice', event.target.value)
                    }
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="self-end"
                    onClick={() => removeLine(line.key)}
                    aria-label="Remove line"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </li>
              ))}
            </ul>
            <p className="text-right text-sm text-text-secondary">
              Estimated total:{' '}
              <strong className="text-text-primary">
                {formatCurrency(estimatedTotal)}
              </strong>
            </p>
          </div>
        )}

        {lines.length === 0 && (
          <Button
            type="button"
            variant="secondary"
            className="self-start"
            onClick={() =>
              setFieldError('Search and select parts above to add lines')
            }
          >
            <Plus className="size-4" aria-hidden />
            Add parts via search
          </Button>
        )}

        {fieldError && (
          <p className="text-sm text-danger" role="alert">
            {fieldError}
          </p>
        )}
        {apiError && (
          <p className="text-sm text-danger" role="alert">
            {apiError}
          </p>
        )}

        <div className="flex justify-end gap-2 border-t border-border pt-4">
          <Button type="button" variant="ghost" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            Register purchase
          </Button>
        </div>
      </form>
    </Modal>
  );
}
