import { useEffect, useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import type {
  CreateSupplierRequest,
  SupplierDto,
  UpdateSupplierRequest,
} from '@/features/admin/inventory/types/suppliers.types';

export interface SupplierFormProps {
  mode: 'create' | 'edit';
  supplier?: SupplierDto | null;
  isSubmitting?: boolean;
  onSubmit: (payload: CreateSupplierRequest | UpdateSupplierRequest) => Promise<void>;
  onCancel: () => void;
}

export function SupplierForm({
  mode,
  supplier,
  isSubmitting = false,
  onSubmit,
  onCancel,
}: SupplierFormProps) {
  const [name, setName] = useState('');
  const [taxId, setTaxId] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [fieldError, setFieldError] = useState<string | null>(null);

  useEffect(() => {
    if (mode === 'edit' && supplier) {
      setName(supplier.name);
      setTaxId(supplier.taxId ?? '');
      setPhone(supplier.phone ?? '');
      setEmail(supplier.email ?? '');
      setIsActive(supplier.isActive);
    } else if (mode === 'create') {
      setName('');
      setTaxId('');
      setPhone('');
      setEmail('');
      setIsActive(true);
    }
  }, [mode, supplier]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setFieldError(null);

    if (!name.trim()) {
      setFieldError('Supplier name is required');
      return;
    }

    const payload = {
      name: name.trim(),
      taxId: taxId.trim() || undefined,
      phone: phone.trim() || undefined,
      email: email.trim() || undefined,
      isActive: mode === 'create' ? isActive : isActive,
    };

    await onSubmit(payload as CreateSupplierRequest | UpdateSupplierRequest);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        label="Name"
        name="name"
        value={name}
        onChange={(event) => setName(event.target.value)}
        required
        maxLength={150}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Tax ID"
          name="taxId"
          value={taxId}
          onChange={(event) => setTaxId(event.target.value)}
          maxLength={50}
        />
        <Input
          label="Phone"
          name="phone"
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          maxLength={30}
        />
      </div>
      <Input
        label="Email"
        name="email"
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        maxLength={100}
      />

      <label className="flex items-center gap-2 text-sm text-text-secondary">
        <input
          type="checkbox"
          checked={isActive}
          onChange={(event) => setIsActive(event.target.checked)}
          className="size-4 rounded border-border accent-accent"
        />
        Active supplier
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
          {mode === 'create' ? 'Create supplier' : 'Save changes'}
        </Button>
      </div>
    </form>
  );
}
