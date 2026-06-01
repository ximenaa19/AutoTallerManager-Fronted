import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import type { InventoryLookups } from '@/features/admin/inventory/hooks/useInventoryLookups';
import type {
  CreatePartRequest,
  PartDto,
  UpdatePartRequest,
} from '@/features/admin/inventory/types/parts.types';

export interface PartFormProps {
  mode: 'create' | 'edit';
  part?: PartDto | null;
  lookups: InventoryLookups;
  isSubmitting?: boolean;
  onSubmit: (payload: CreatePartRequest | UpdatePartRequest) => Promise<void>;
  onCancel: () => void;
}

export function PartForm({
  mode,
  part,
  lookups,
  isSubmitting = false,
  onSubmit,
  onCancel,
}: PartFormProps) {
  const [partCategoryId, setPartCategoryId] = useState('');
  const [partBrandId, setPartBrandId] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [stock, setStock] = useState('0');
  const [minimumStock, setMinimumStock] = useState('0');
  const [unitPrice, setUnitPrice] = useState('0');
  const [isActive, setIsActive] = useState(true);
  const [fieldError, setFieldError] = useState<string | null>(null);

  const categoryOptions = useMemo(
    () =>
      lookups.categories.map((category) => ({
        value: String(category.partCategoryId),
        label: category.name,
      })),
    [lookups.categories],
  );

  const brandOptions = useMemo(
    () =>
      lookups.brands.map((brand) => ({
        value: String(brand.partBrandId),
        label: brand.name,
      })),
    [lookups.brands],
  );

  useEffect(() => {
    if (mode === 'edit' && part) {
      setPartCategoryId(String(part.partCategoryId));
      setPartBrandId(part.partBrandId ? String(part.partBrandId) : '');
      setCode(part.code);
      setDescription(part.description);
      setStock(String(part.stock));
      setMinimumStock(String(part.minimumStock));
      setUnitPrice(String(part.unitPrice));
      setIsActive(part.isActive);
    } else if (mode === 'create') {
      setPartCategoryId(
        lookups.categories[0]
          ? String(lookups.categories[0].partCategoryId)
          : '',
      );
      setPartBrandId('');
      setCode('');
      setDescription('');
      setStock('0');
      setMinimumStock('0');
      setUnitPrice('0');
      setIsActive(true);
    }
  }, [mode, part, lookups.categories]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setFieldError(null);

    const parsedCategoryId = Number(partCategoryId);
    if (!Number.isFinite(parsedCategoryId) || parsedCategoryId <= 0) {
      setFieldError('Select a part category');
      return;
    }

    const parsedStock = Number(stock);
    const parsedMinimum = Number(minimumStock);
    const parsedPrice = Number(unitPrice);

    if (!Number.isFinite(parsedStock) || parsedStock < 0) {
      setFieldError('Stock must be zero or greater');
      return;
    }

    if (!Number.isFinite(parsedMinimum) || parsedMinimum < 0) {
      setFieldError('Minimum stock must be zero or greater');
      return;
    }

    if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
      setFieldError('Unit price must be zero or greater');
      return;
    }

    if (!code.trim() || !description.trim()) {
      setFieldError('Code and description are required');
      return;
    }

    const brandValue = partBrandId ? Number(partBrandId) : null;

    const payload = {
      partCategoryId: parsedCategoryId,
      partBrandId: brandValue,
      code: code.trim(),
      description: description.trim(),
      stock: parsedStock,
      minimumStock: parsedMinimum,
      unitPrice: parsedPrice,
      isActive: mode === 'create' ? isActive : isActive,
    };

    await onSubmit(payload as CreatePartRequest | UpdatePartRequest);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Select
          label="Category"
          name="partCategoryId"
          value={partCategoryId}
          onChange={(event) => setPartCategoryId(event.target.value)}
          options={categoryOptions}
          placeholder="Select category"
          required
        />

        <Select
          label="Brand (optional)"
          name="partBrandId"
          value={partBrandId}
          onChange={(event) => setPartBrandId(event.target.value)}
          options={brandOptions}
          placeholder="No brand"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Code"
          name="code"
          value={code}
          onChange={(event) => setCode(event.target.value)}
          required
          maxLength={50}
        />
        <Input
          label="Description"
          name="description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          required
          maxLength={200}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Input
          label="Stock"
          name="stock"
          type="number"
          min={0}
          value={stock}
          onChange={(event) => setStock(event.target.value)}
          required
        />
        <Input
          label="Minimum stock"
          name="minimumStock"
          type="number"
          min={0}
          value={minimumStock}
          onChange={(event) => setMinimumStock(event.target.value)}
          required
        />
        <Input
          label="Unit price"
          name="unitPrice"
          type="number"
          min={0}
          step="0.01"
          value={unitPrice}
          onChange={(event) => setUnitPrice(event.target.value)}
          required
        />
      </div>

      <label className="flex items-center gap-2 text-sm text-text-secondary">
        <input
          type="checkbox"
          checked={isActive}
          onChange={(event) => setIsActive(event.target.checked)}
          className="size-4 rounded border-border accent-accent"
        />
        Active in catalog
      </label>

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
          {mode === 'create' ? 'Create part' : 'Save changes'}
        </Button>
      </div>
    </form>
  );
}
