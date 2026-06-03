import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import { getErrorMessage } from '@/api/apiError';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingState } from '@/components/feedback/LoadingState';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { receptionistClientsApi } from '@/features/receptionist/api/receptionistClients.api';
import type {
  CreateClientWithVehicleRequest,
  ReceptionistPublicRegistrationCatalogsDto,
  ReceptionistWorkshopCatalogsDto,
} from '@/features/receptionist/types/receptionistClients.types';
import { isValidEmail, validateMaxLength, validatePhoneNumber } from '@/utils/validation';

interface FormState {
  documentTypeId: string;
  documentNumber: string;
  firstName: string;
  middleName: string;
  lastName: string;
  secondLastName: string;
  birthDate: string;
  email: string;
  phoneCountryId: string;
  phoneNumber: string;
  modelId: string;
  vehicleTypeId: string;
  plate: string;
  vin: string;
  year: string;
  color: string;
  mileage: string;
}

type FormFieldErrors = Partial<Record<keyof FormState, string>>;

const initialForm: FormState = {
  documentTypeId: '',
  documentNumber: '',
  firstName: '',
  middleName: '',
  lastName: '',
  secondLastName: '',
  birthDate: '',
  email: '',
  phoneCountryId: '',
  phoneNumber: '',
  modelId: '',
  vehicleTypeId: '',
  plate: '',
  vin: '',
  year: String(new Date().getFullYear()),
  color: '',
  mileage: '0',
};

const plateRegex = /^[A-Z0-9]+(?:-[A-Z0-9]+)*$/;

function normalizePlate(plate: string): string {
  return plate.trim().toUpperCase();
}

function buildPayload(form: FormState): CreateClientWithVehicleRequest {
  const normalizedPlate = normalizePlate(form.plate);

  return {
    documentTypeId: Number(form.documentTypeId),
    documentNumber: form.documentNumber.trim() || undefined,
    firstName: form.firstName.trim() || undefined,
    middleName: form.middleName.trim() || undefined,
    lastName: form.lastName.trim() || undefined,
    secondLastName: form.secondLastName.trim() || undefined,
    birthDate: form.birthDate ? `${form.birthDate}T00:00:00Z` : undefined,
    email: form.email.trim() || undefined,
    phoneCountryId: form.phoneNumber.trim() && form.phoneCountryId
      ? Number(form.phoneCountryId)
      : undefined,
    phoneNumber: form.phoneNumber.trim() || undefined,
    modelId: Number(form.modelId),
    vehicleTypeId: Number(form.vehicleTypeId),
    plate: normalizedPlate,
    vin: form.vin.trim() || undefined,
    year: Number(form.year),
    color: form.color.trim() || undefined,
    mileage: Number(form.mileage),
  };
}

export interface CreateClientWithVehicleModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateClientWithVehicleRequest) => Promise<void>;
}

function getModelOptions(catalogs: ReceptionistWorkshopCatalogsDto | null) {
  if (!catalogs) return [];

  return catalogs.vehicleModels.map((model) => ({
    value: String(model.id),
    label: model.name,
  }));
}

export function CreateClientWithVehicleModal({
  open,
  onClose,
  onSubmit,
}: CreateClientWithVehicleModalProps) {
  const [form, setForm] = useState<FormState>(initialForm);
  const [fieldErrors, setFieldErrors] = useState<FormFieldErrors>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [catalogsLoading, setCatalogsLoading] = useState(false);
  const [catalogError, setCatalogError] = useState<string | null>(null);
  const [catalogReloadToken, setCatalogReloadToken] = useState(0);
  const [registrationCatalogs, setRegistrationCatalogs] =
    useState<ReceptionistPublicRegistrationCatalogsDto | null>(null);
  const [workshopCatalogs, setWorkshopCatalogs] =
    useState<ReceptionistWorkshopCatalogsDto | null>(null);

  const loadCatalogs = useCallback(async () => {
    setCatalogsLoading(true);
    setCatalogError(null);

    try {
      const [registrationResponse, workshopResponse] = await Promise.all([
        receptionistClientsApi.getPublicRegistrationCatalogs(),
        receptionistClientsApi.getWorkshopCatalogs(),
      ]);

      setRegistrationCatalogs(registrationResponse.data);
      setWorkshopCatalogs(workshopResponse.data);
    } catch (err) {
      setCatalogError(getErrorMessage(err));
      setRegistrationCatalogs(null);
      setWorkshopCatalogs(null);
    } finally {
      setCatalogsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }

    void loadCatalogs();
  }, [loadCatalogs, open, catalogReloadToken]);

  useEffect(() => {
    if (!open) {
      return;
    }

    setForm(initialForm);
    setFieldErrors({});
    setApiError(null);
  }, [open]);

  useEffect(() => {
    if (!open || !registrationCatalogs) {
      return;
    }

    if (!form.phoneCountryId && registrationCatalogs.countries[0]) {
      setForm((current) => ({
        ...current,
        phoneCountryId: String(registrationCatalogs.countries[0]?.id ?? ''),
      }));
    }
  }, [open, registrationCatalogs, form.phoneCountryId]);

  const modelOptions = useMemo(() => getModelOptions(workshopCatalogs), [workshopCatalogs]);

  const vehicleTypeOptions = useMemo(() => {
    return (workshopCatalogs?.vehicleTypes ?? []).map((type) => ({
      value: String(type.id),
      label: type.name,
    }));
  }, [workshopCatalogs]);

  const documentTypeOptions = useMemo(() => {
    return (registrationCatalogs?.documentTypes ?? []).map((item) => ({
      value: String(item.id),
      label: item.name,
    }));
  }, [registrationCatalogs]);

  const phoneCountryOptions = useMemo(() => {
    return (registrationCatalogs?.countries ?? []).map((item) => ({
      value: String(item.id),
      label: item.name,
    }));
  }, [registrationCatalogs]);

  const updateField = <K extends keyof FormState>(
    key: K,
    value: FormState[K],
  ) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const validate = (): boolean => {
    const errors: FormFieldErrors = {};

    if (!form.documentTypeId) errors.documentTypeId = 'Document type is required';
    if (!form.modelId) errors.modelId = 'Vehicle model is required';
    if (!form.vehicleTypeId) errors.vehicleTypeId = 'Vehicle type is required';

    const normalizedPlate = normalizePlate(form.plate);
    if (!normalizedPlate) {
      errors.plate = 'Vehicle plate is required.';
    } else if (normalizedPlate.length < 5 || normalizedPlate.length > 10) {
      errors.plate = 'Vehicle plate must be between 5 and 10 characters.';
    } else if (!plateRegex.test(normalizedPlate)) {
      errors.plate = 'Vehicle plate can only contain letters, numbers, and optional hyphens.';
    }

    const year = Number(form.year);
    if (!form.year.trim() || Number.isNaN(year) || year < 1900 || year > 2100) {
      errors.year = 'Enter a valid year';
    }

    const mileage = Number(form.mileage);
    if (form.mileage.trim() === '' || Number.isNaN(mileage) || mileage < 0) {
      errors.mileage = 'Enter a valid mileage';
    }

    const documentNumberError = validateMaxLength(form.documentNumber, 30, 'Document number');
    if (documentNumberError) {
      errors.documentNumber = documentNumberError;
    }

    if (form.email && !isValidEmail(form.email)) {
      errors.email = 'Enter a valid email address';
    }

    if (form.phoneNumber) {
      const phoneError = validatePhoneNumber(form.phoneNumber);
      if (phoneError) errors.phoneNumber = phoneError;
      if (!form.phoneCountryId) {
        errors.phoneCountryId = 'Country code is required';
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setApiError(null);

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(buildPayload(form));
      onClose();
    } catch (err) {
      setApiError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    onClose();
  };

  if (catalogsLoading) {
    return (
      <Modal
        open={open}
        onClose={handleClose}
        title="Create client with vehicle"
        description="Loading required form catalogs."
        size="lg"
      >
        <LoadingState
          title="Loading form catalogs"
          description="Preparing identity and vehicle reference data."
          className="rounded-lg"
        />
      </Modal>
    );
  }

  if (catalogError) {
    return (
      <Modal
        open={open}
        onClose={handleClose}
        title="Create client with vehicle"
        description="Unable to load form catalogs."
        size="lg"
      >
        <ErrorState
          title="Unable to load form catalogs"
          message={catalogError}
          onRetry={() => setCatalogReloadToken((value) => value + 1)}
          retryLabel="Retry catalogs"
        />
      </Modal>
    );
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Create client with vehicle"
      description="Use this flow to onboard identity and an initial vehicle."
      size="lg"
    >
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
              onChange={(event) =>
                updateField('documentTypeId', event.target.value)
              }
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
            />
            <Input
              name="middleName"
              label="Middle name"
              value={form.middleName}
              onChange={(event) => updateField('middleName', event.target.value)}
            />
            <Input
              name="lastName"
              label="Last name"
              value={form.lastName}
              onChange={(event) => updateField('lastName', event.target.value)}
            />
            <Input
              name="secondLastName"
              label="Second last name"
              value={form.secondLastName}
              onChange={(event) => updateField('secondLastName', event.target.value)}
            />
            <Input
              name="birthDate"
              label="Birth date"
              type="date"
              value={form.birthDate}
              onChange={(event) => updateField('birthDate', event.target.value)}
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
              options={phoneCountryOptions}
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
              label="Vehicle model"
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
              name="plate"
              label="Vehicle plate *"
              value={form.plate}
              onChange={(event) => updateField('plate', event.target.value)}
              error={fieldErrors.plate}
              placeholder="ABC123"
              required
            />
            <Input
              name="vin"
              label="VIN"
              value={form.vin}
              onChange={(event) => updateField('vin', event.target.value)}
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
          <Button type="button" variant="ghost" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            Create client + vehicle
          </Button>
        </div>
      </form>
    </Modal>
  );
}
