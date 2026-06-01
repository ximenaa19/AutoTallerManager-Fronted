import { useEffect, useState, type FormEvent } from 'react';
import { getErrorMessage } from '@/api/apiError';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingState } from '@/components/feedback/LoadingState';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { usePersonCatalogLookups } from '@/features/admin/customers/hooks/usePersonCatalogLookups';
import type { CreateClientWithVehicleRequest } from '@/features/admin/customers/types/customers.types';
import { useVehicleCatalogLookups } from '@/features/admin/vehicles/hooks/useVehicleCatalogLookups';
import {
  isValidEmail,
  validateMaxLength,
  validatePhoneNumber,
} from '@/utils/validation';

interface ClientWithVehicleFormState {
  documentTypeId: string;
  documentNumber: string;
  firstName: string;
  middleName: string;
  lastName: string;
  secondLastName: string;
  birthDate: string;
  genderId: string;
  email: string;
  phoneCountryId: string;
  phoneNumber: string;
  modelId: string;
  vehicleTypeId: string;
  vin: string;
  year: string;
  color: string;
  mileage: string;
}

type FormFieldErrors = Partial<Record<keyof ClientWithVehicleFormState, string>>;

const initialForm: ClientWithVehicleFormState = {
  documentTypeId: '',
  documentNumber: '',
  firstName: '',
  middleName: '',
  lastName: '',
  secondLastName: '',
  birthDate: '',
  genderId: '',
  email: '',
  phoneCountryId: '',
  phoneNumber: '',
  modelId: '',
  vehicleTypeId: '',
  vin: '',
  year: String(new Date().getFullYear()),
  color: '',
  mileage: '0',
};

function buildPayload(form: ClientWithVehicleFormState): CreateClientWithVehicleRequest {
  return {
    documentTypeId: Number(form.documentTypeId),
    documentNumber: form.documentNumber.trim() || undefined,
    firstName: form.firstName.trim() || undefined,
    middleName: form.middleName.trim() || undefined,
    lastName: form.lastName.trim() || undefined,
    secondLastName: form.secondLastName.trim() || undefined,
    birthDate: form.birthDate ? `${form.birthDate}T00:00:00Z` : undefined,
    genderId: form.genderId ? Number(form.genderId) : undefined,
    email: form.email.trim() || undefined,
    phoneCountryId: form.phoneNumber.trim() && form.phoneCountryId
      ? Number(form.phoneCountryId)
      : undefined,
    phoneNumber: form.phoneNumber.trim() || undefined,
    modelId: Number(form.modelId),
    vehicleTypeId: Number(form.vehicleTypeId),
    vin: form.vin.trim() || undefined,
    year: Number(form.year),
    color: form.color.trim() || undefined,
    mileage: Number(form.mileage),
  };
}

export interface CreateClientWithVehicleFormProps {
  onSubmit: (payload: CreateClientWithVehicleRequest) => Promise<void>;
  onCancel: () => void;
}

export function CreateClientWithVehicleForm({
  onSubmit,
  onCancel,
}: CreateClientWithVehicleFormProps) {
  const {
    catalogs,
    lookups: personLookups,
    isLoading: personCatalogsLoading,
    error: personCatalogsError,
  } = usePersonCatalogLookups();
  const {
    lookups: vehicleLookups,
    isLoading: vehicleCatalogsLoading,
    error: vehicleCatalogsError,
  } = useVehicleCatalogLookups();

  const [form, setForm] = useState<ClientWithVehicleFormState>(initialForm);
  const [fieldErrors, setFieldErrors] = useState<FormFieldErrors>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (catalogs?.countries.length && !form.phoneCountryId) {
      setForm((current) => ({
        ...current,
        phoneCountryId: String(catalogs.countries[0]?.id ?? ''),
      }));
    }
  }, [catalogs, form.phoneCountryId]);

  const updateField = <K extends keyof ClientWithVehicleFormState>(
    key: K,
    value: ClientWithVehicleFormState[K],
  ) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const validate = (): boolean => {
    const errors: FormFieldErrors = {};

    if (!form.documentTypeId) errors.documentTypeId = 'Document type is required';
    if (!form.modelId) errors.modelId = 'Vehicle model is required';
    if (!form.vehicleTypeId) errors.vehicleTypeId = 'Vehicle type is required';

    const year = Number(form.year);
    if (!form.year.trim() || Number.isNaN(year) || year < 1900 || year > 2100) {
      errors.year = 'Enter a valid year';
    }

    const mileage = Number(form.mileage);
    if (form.mileage.trim() === '' || Number.isNaN(mileage) || mileage < 0) {
      errors.mileage = 'Enter a valid mileage';
    }

    if (form.documentNumber) {
      const documentNumberError = validateMaxLength(
        form.documentNumber,
        30,
        'Document number',
      );
      if (documentNumberError) errors.documentNumber = documentNumberError;
    }

    if (form.firstName) {
      const firstNameError = validateMaxLength(form.firstName, 50, 'First name');
      if (firstNameError) errors.firstName = firstNameError;
    }

    if (form.lastName) {
      const lastNameError = validateMaxLength(form.lastName, 50, 'Last name');
      if (lastNameError) errors.lastName = lastNameError;
    }

    if (form.email && !isValidEmail(form.email)) {
      errors.email = 'Enter a valid email address';
    }

    if (form.phoneNumber) {
      const phoneError = validatePhoneNumber(form.phoneNumber);
      if (phoneError) errors.phoneNumber = phoneError;
      if (!form.phoneCountryId) {
        errors.phoneCountryId = 'Country code is required when phone is provided';
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
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

  const isLoading = personCatalogsLoading || vehicleCatalogsLoading;
  const catalogError = personCatalogsError ?? vehicleCatalogsError;

  if (isLoading) {
    return (
      <LoadingState
        title="Loading form catalogs"
        description="Fetching identity and vehicle reference data…"
        className="min-h-[280px]"
      />
    );
  }

  if (catalogError || !catalogs) {
    return (
      <ErrorState
        title="Unable to load form catalogs"
        message={catalogError ?? 'Catalog data is unavailable.'}
      />
    );
  }

  const documentTypeOptions = personLookups.documentTypeNameById.size
    ? Array.from(personLookups.documentTypeNameById.entries()).map(([id, label]) => ({
        value: String(id),
        label,
      }))
    : catalogs.documentTypes.map((item) => ({
        value: String(item.id),
        label: item.name,
      }));

  const modelOptions = Array.from(vehicleLookups.modelLabelById.entries()).map(
    ([id, label]) => ({ value: String(id), label }),
  );

  const vehicleTypeOptions = Array.from(vehicleLookups.typeNameById.entries()).map(
    ([id, label]) => ({ value: String(id), label }),
  );

  return (
    <form onSubmit={(event) => void handleSubmit(event)} className="space-y-6">
      {apiError && (
        <div
          role="alert"
          className="rounded-lg border border-danger/30 bg-danger-muted/40 px-4 py-3 text-sm text-danger"
        >
          {apiError}
        </div>
      )}

      <section className="space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-text-secondary">
          Customer identity
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Select
            name="documentTypeId"
            label="Document type"
            value={form.documentTypeId}
            onChange={(event) => updateField('documentTypeId', event.target.value)}
            options={documentTypeOptions}
            placeholder="Select document type"
            error={fieldErrors.documentTypeId}
            required
          />
          <Input
            name="documentNumber"
            label="Document number"
            value={form.documentNumber}
            onChange={(event) => updateField('documentNumber', event.target.value)}
            error={fieldErrors.documentNumber}
          />
          <Input
            name="firstName"
            label="First name"
            value={form.firstName}
            onChange={(event) => updateField('firstName', event.target.value)}
            error={fieldErrors.firstName}
          />
          <Input
            name="lastName"
            label="Last name"
            value={form.lastName}
            onChange={(event) => updateField('lastName', event.target.value)}
            error={fieldErrors.lastName}
          />
          <Input
            name="email"
            label="Email"
            type="email"
            value={form.email}
            onChange={(event) => updateField('email', event.target.value)}
            error={fieldErrors.email}
          />
          <Select
            name="phoneCountryId"
            label="Phone country"
            value={form.phoneCountryId}
            onChange={(event) => updateField('phoneCountryId', event.target.value)}
            options={catalogs.countries.map((country) => ({
              value: String(country.id),
              label: country.name,
            }))}
            error={fieldErrors.phoneCountryId}
          />
          <Input
            name="phoneNumber"
            label="Phone number"
            value={form.phoneNumber}
            onChange={(event) => updateField('phoneNumber', event.target.value)}
            error={fieldErrors.phoneNumber}
          />
        </div>
      </section>

      <section className="space-y-4 border-t border-border pt-5">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-text-secondary">
          Initial vehicle
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Select
            name="modelId"
            label="Model"
            value={form.modelId}
            onChange={(event) => updateField('modelId', event.target.value)}
            options={modelOptions}
            placeholder="Select model"
            error={fieldErrors.modelId}
            required
          />
          <Select
            name="vehicleTypeId"
            label="Vehicle type"
            value={form.vehicleTypeId}
            onChange={(event) => updateField('vehicleTypeId', event.target.value)}
            options={vehicleTypeOptions}
            placeholder="Select type"
            error={fieldErrors.vehicleTypeId}
            required
          />
          <Input
            name="vin"
            label="VIN"
            value={form.vin}
            onChange={(event) => updateField('vin', event.target.value)}
            error={fieldErrors.vin}
          />
          <Input
            name="year"
            label="Year"
            type="number"
            value={form.year}
            onChange={(event) => updateField('year', event.target.value)}
            error={fieldErrors.year}
            required
          />
          <Input
            name="color"
            label="Color"
            value={form.color}
            onChange={(event) => updateField('color', event.target.value)}
          />
          <Input
            name="mileage"
            label="Mileage"
            type="number"
            min={0}
            value={form.mileage}
            onChange={(event) => updateField('mileage', event.target.value)}
            error={fieldErrors.mileage}
            required
          />
        </div>
      </section>

      <div className="flex flex-wrap justify-end gap-2 border-t border-border pt-4">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isSubmitting}>
          Create customer with vehicle
        </Button>
      </div>
    </form>
  );
}
