import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { getErrorMessage } from '@/api/apiError';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import type { VehicleCatalogLookups } from '@/features/admin/vehicles/hooks/useVehicleCatalogLookups';
import type {
  CreateVehicleRequest,
  UpdateVehicleRequest,
  VehicleDto,
} from '@/features/admin/vehicles/types/vehicles.types';
import { TemporaryPlateNotice } from '@/features/admin/vehicles/components/TemporaryPlateNotice';
import {
  normalizePlate,
  PLATE_MAX_LENGTH,
  validatePlate,
} from '@/features/admin/vehicles/utils/vehiclePlate';
import { validateMaxLength, validateRequired } from '@/utils/validation';

const VIN_LENGTH = 17;
const COLOR_MAX_LENGTH = 30;

interface VehicleFormState {
  modelId: string;
  vehicleTypeId: string;
  plate: string;
  vin: string;
  year: string;
  color: string;
  mileage: string;
  isActive: string;
}

type VehicleFieldErrors = Partial<Record<keyof VehicleFormState, string>>;

const emptyForm: VehicleFormState = {
  modelId: '',
  vehicleTypeId: '',
  plate: '',
  vin: '',
  year: '',
  color: '',
  mileage: '0',
  isActive: 'true',
};

function vehicleToForm(vehicle: VehicleDto): VehicleFormState {
  return {
    modelId: String(vehicle.modelId),
    vehicleTypeId: String(vehicle.vehicleTypeId),
    plate: vehicle.plate,
    vin: vehicle.vin,
    year: String(vehicle.year),
    color: vehicle.color ?? '',
    mileage: String(vehicle.mileage),
    isActive: vehicle.isActive ? 'true' : 'false',
  };
}

function buildPayload(form: VehicleFormState): CreateVehicleRequest {
  return {
    modelId: Number(form.modelId),
    vehicleTypeId: Number(form.vehicleTypeId),
    plate: normalizePlate(form.plate),
    vin: form.vin.trim().toUpperCase(),
    year: Number(form.year),
    color: form.color.trim() || undefined,
    mileage: Number(form.mileage),
    isActive: form.isActive === 'true',
  };
}

export interface VehicleFormProps {
  mode: 'create' | 'edit';
  initialVehicle?: VehicleDto | null;
  lookups: VehicleCatalogLookups;
  onSubmit: (payload: CreateVehicleRequest | UpdateVehicleRequest) => Promise<void>;
  onCancel: () => void;
}

export function VehicleForm({
  mode,
  initialVehicle,
  lookups,
  onSubmit,
  onCancel,
}: VehicleFormProps) {
  const [form, setForm] = useState<VehicleFormState>(emptyForm);
  const [fieldErrors, setFieldErrors] = useState<VehicleFieldErrors>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (mode === 'edit' && initialVehicle) {
      setForm(vehicleToForm(initialVehicle));
    } else {
      setForm(emptyForm);
    }
    setFieldErrors({});
    setApiError(null);
  }, [mode, initialVehicle]);

  const modelOptions = useMemo(
    () =>
      lookups.models
        .map((model) => {
          const brandName = lookups.brandNameById.get(model.brandId);
          const label = brandName ? `${brandName} ${model.modelName}` : model.modelName;
          return { value: String(model.modelId), label };
        })
        .sort((a, b) => a.label.localeCompare(b.label)),
    [lookups],
  );

  const typeOptions = useMemo(
    () =>
      lookups.types
        .map((type) => ({ value: String(type.vehicleTypeId), label: type.name }))
        .sort((a, b) => a.label.localeCompare(b.label)),
    [lookups],
  );

  const updateField = <K extends keyof VehicleFormState>(key: K, value: VehicleFormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
    setFieldErrors((current) => ({ ...current, [key]: undefined }));
  };

  const validate = (): boolean => {
    const errors: VehicleFieldErrors = {};
    const vin = form.vin.trim().toUpperCase();

    errors.modelId = validateRequired(form.modelId, 'Model');
    errors.vehicleTypeId = validateRequired(form.vehicleTypeId, 'Type');
    errors.plate = validatePlate(form.plate);

    if (!vin) {
      errors.vin = 'VIN is required';
    } else if (vin.length !== VIN_LENGTH) {
      errors.vin = `VIN must be exactly ${VIN_LENGTH} characters`;
    } else if (!/^[A-Z0-9]+$/.test(vin)) {
      errors.vin = 'VIN must contain only letters and numbers';
    }

    const year = Number(form.year);
    const maxYear = new Date().getUTCFullYear() + 1;
    errors.year =
      validateRequired(form.year, 'Year') ??
      (!Number.isFinite(year) ? 'Year is required' : undefined) ??
      (year < 1900 || year > maxYear
        ? `Year must be between 1900 and ${maxYear}`
        : undefined);

    if (form.color.trim()) {
      errors.color = validateMaxLength(form.color.trim(), COLOR_MAX_LENGTH, 'Color');
    }

    const mileage = Number(form.mileage);
    if (!Number.isFinite(mileage) || mileage < 0) {
      errors.mileage = 'Mileage must be zero or greater';
    }

    const filtered = Object.fromEntries(
      Object.entries(errors).filter(([, value]) => value !== undefined),
    ) as VehicleFieldErrors;

    setFieldErrors(filtered);
    return Object.keys(filtered).length === 0;
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setApiError(null);

    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await onSubmit(buildPayload(form));
    } catch (err) {
      setApiError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={(event) => void handleSubmit(event)} className="space-y-4">
      {apiError && (
        <div
          role="alert"
          className="rounded-lg border border-danger/30 bg-danger-muted/40 px-4 py-3 text-sm text-danger"
        >
          {apiError}
        </div>
      )}

      {mode === 'edit' && initialVehicle && (
        <TemporaryPlateNotice plate={initialVehicle.plate} />
      )}

      <Select
        name="modelId"
        label="Model"
        required
        value={form.modelId}
        onChange={(event) => updateField('modelId', event.target.value)}
        options={modelOptions}
        placeholder="Select model"
        error={fieldErrors.modelId}
      />

      <Select
        name="vehicleTypeId"
        label="Vehicle type"
        required
        value={form.vehicleTypeId}
        onChange={(event) => updateField('vehicleTypeId', event.target.value)}
        options={typeOptions}
        placeholder="Select type"
        error={fieldErrors.vehicleTypeId}
      />

      <Input
        name="plate"
        label="Plate"
        required
        value={form.plate}
        onChange={(event) => updateField('plate', event.target.value.toUpperCase())}
        maxLength={PLATE_MAX_LENGTH}
        hint="5–10 characters; letters, numbers, and hyphens"
        error={fieldErrors.plate}
      />

      <Input
        name="vin"
        label="VIN"
        required
        value={form.vin}
        onChange={(event) => updateField('vin', event.target.value.toUpperCase())}
        maxLength={VIN_LENGTH}
        hint={`${VIN_LENGTH} alphanumeric characters`}
        error={fieldErrors.vin}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          name="year"
          label="Year"
          type="number"
          required
          min={1900}
          max={new Date().getUTCFullYear() + 1}
          value={form.year}
          onChange={(event) => updateField('year', event.target.value)}
          error={fieldErrors.year}
        />
        <Input
          name="mileage"
          label="Mileage"
          type="number"
          required
          min={0}
          value={form.mileage}
          onChange={(event) => updateField('mileage', event.target.value)}
          error={fieldErrors.mileage}
        />
      </div>

      <Input
        name="color"
        label="Color"
        value={form.color}
        onChange={(event) => updateField('color', event.target.value)}
        error={fieldErrors.color}
      />

      <Select
        name="isActive"
        label="Status"
        required
        value={form.isActive}
        onChange={(event) => updateField('isActive', event.target.value)}
        options={[
          { value: 'true', label: 'Active' },
          { value: 'false', label: 'Inactive' },
        ]}
      />

      <div className="flex flex-wrap justify-end gap-2 border-t border-border pt-4">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isSubmitting}>
          {mode === 'create' ? 'Create vehicle' : 'Save changes'}
        </Button>
      </div>
    </form>
  );
}
