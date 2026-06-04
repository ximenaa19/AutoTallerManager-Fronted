import { Search } from 'lucide-react';
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
  AddVehicleToClientRequest,
  AddVehicleToClientResponse,
} from '@/features/receptionist/types/receptionistVehicles.types';
import type { ClientSearchResultDto } from '@/features/receptionist/types/receptionistClients.types';
import type { ReceptionistWorkshopCatalogsDto } from '@/features/receptionist/types/receptionistClients.types';

interface AddVehicleFormState {
  clientSearch: string;
  modelId: string;
  vehicleTypeId: string;
  plate: string;
  vin: string;
  year: string;
  color: string;
  mileage: string;
}

type AddVehicleFieldErrors = Partial<Record<keyof AddVehicleFormState, string>>;

type ClientResultState = 'idle' | 'loading' | 'success';

const VIN_PATTERN = /^[A-HJ-NPR-Z0-9]{17}$/;
const PLATE_REGEX = /^[A-Z0-9]+(?:-[A-Z0-9]+)*$/;

function normalizePlate(plate: string): string {
  return plate.trim().toUpperCase();
}

function buildPayload(form: AddVehicleFormState): AddVehicleToClientRequest {
  const normalizedPlate = normalizePlate(form.plate);
  const normalizedVin = form.vin.trim().toUpperCase();
  const year = Number(form.year);
  const mileage = Number(form.mileage);

  return {
    modelId: Number(form.modelId),
    vehicleTypeId: Number(form.vehicleTypeId),
    plate: normalizedPlate,
    vin: normalizedVin || undefined,
    year,
    color: form.color.trim() || undefined,
    mileage,
  };
}

const initialForm: AddVehicleFormState = {
  clientSearch: '',
  modelId: '',
  vehicleTypeId: '',
  plate: '',
  vin: '',
  year: String(new Date().getFullYear()),
  color: '',
  mileage: '0',
};

export interface AddVehicleToClientModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (
    personId: number,
    payload: AddVehicleToClientRequest,
  ) => Promise<AddVehicleToClientResponse>;
}

export function AddVehicleToClientModal({
  open,
  onClose,
  onSubmit,
}: AddVehicleToClientModalProps) {
  const [form, setForm] = useState<AddVehicleFormState>(initialForm);
  const [fieldErrors, setFieldErrors] = useState<AddVehicleFieldErrors>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [clientResults, setClientResults] = useState<ClientSearchResultDto[]>([]);
  const [clientResultState, setClientResultState] = useState<ClientResultState>('idle');
  const [clientSearchError, setClientSearchError] = useState<string | null>(null);
  const [selectedClient, setSelectedClient] = useState<ClientSearchResultDto | null>(null);
  const [catalogError, setCatalogError] = useState<string | null>(null);
  const [catalogsLoading, setCatalogsLoading] = useState(false);
  const [vehicleCatalogs, setVehicleCatalogs] =
    useState<ReceptionistWorkshopCatalogsDto | null>(null);
  const [submittedVehicle, setSubmittedVehicle] = useState<AddVehicleToClientResponse | null>(
    null,
  );

  const loadCatalogs = useCallback(async () => {
    setCatalogsLoading(true);
    setCatalogError(null);
    try {
      const workshopResponse = await receptionistClientsApi.getWorkshopCatalogs();
      setVehicleCatalogs(workshopResponse.data);
    } catch (err) {
      setCatalogError(getErrorMessage(err));
      setVehicleCatalogs(null);
    } finally {
      setCatalogsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }

    setForm(initialForm);
    setFieldErrors({});
    setApiError(null);
    setClientResults([]);
    setClientResultState('idle');
    setClientSearchError(null);
    setSelectedClient(null);
    setCatalogError(null);
    setVehicleCatalogs(null);
    setSubmittedVehicle(null);
    void loadCatalogs();
  }, [loadCatalogs, open]);

  useEffect(() => {
    const normalized = form.clientSearch.trim();
    if (!open || normalized.length < 2) {
      if (!normalized) {
        setClientResults([]);
        setClientSearchError(null);
        setClientResultState('idle');
      }
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setClientResultState('loading');
      receptionistClientsApi
        .searchClients(normalized)
        .then((response) => {
          setClientResults(response.data);
          setClientResultState('success');
          setClientSearchError(null);
        })
        .catch((err) => {
          setClientResults([]);
          setClientSearchError(getErrorMessage(err));
          setClientResultState('idle');
        });
    }, 320);

    return () => window.clearTimeout(timeoutId);
  }, [form.clientSearch, open]);

  const modelOptions = useMemo(
    () =>
      (vehicleCatalogs?.vehicleModels ?? []).map((model) => ({
        value: String(model.id),
        label: model.name,
      })),
    [vehicleCatalogs],
  );

  const vehicleTypeOptions = useMemo(
    () =>
      (vehicleCatalogs?.vehicleTypes ?? []).map((type) => ({
        value: String(type.id),
        label: type.name,
      })),
    [vehicleCatalogs],
  );

  const updateField = <K extends keyof AddVehicleFormState>(
    key: K,
    value: AddVehicleFormState[K],
  ) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const validate = (): boolean => {
    const errors: AddVehicleFieldErrors = {};

    if (!selectedClient) {
      errors.clientSearch = 'Select an existing client';
    }

    if (!form.modelId) {
      errors.modelId = 'Vehicle model is required.';
    }

    if (!form.vehicleTypeId) {
      errors.vehicleTypeId = 'Vehicle type is required.';
    }

    const normalizedPlate = normalizePlate(form.plate);
    if (!normalizedPlate) {
      errors.plate = 'Vehicle plate is required.';
    } else if (normalizedPlate.length < 5 || normalizedPlate.length > 10) {
      errors.plate = 'Vehicle plate must be between 5 and 10 characters.';
    } else if (!PLATE_REGEX.test(normalizedPlate)) {
      errors.plate = 'Vehicle plate can only contain letters, numbers, and optional hyphens.';
    }

    const year = Number(form.year);
    if (!form.year.trim()) {
      errors.year = 'Vehicle year is required.';
    } else if (!Number.isFinite(year) || year < 1900 || year > new Date().getUTCFullYear() + 1) {
      errors.year = `Vehicle year must be between 1900 and ${new Date().getUTCFullYear() + 1}.`;
    }

    const mileage = Number(form.mileage);
    if (!form.mileage.trim() || !Number.isFinite(mileage) || mileage < 0) {
      errors.mileage = 'Vehicle mileage must be 0 or greater.';
    }

    const vin = form.vin.trim().toUpperCase();
    if (vin && !VIN_PATTERN.test(vin)) {
      errors.vin = 'VIN must be 17 alphanumeric characters excluding I, O, Q.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSelectClient = (client: ClientSearchResultDto) => {
    setSelectedClient(client);
    setClientResults([]);
    setClientSearchError(null);
    setForm((current) => ({ ...current, clientSearch: client.fullName }));
    setFieldErrors((current) => ({ ...current, clientSearch: undefined }));
  };

  const clearSelectedClient = () => {
    setSelectedClient(null);
    setClientResults([]);
    setClientSearchError(null);
    setFieldErrors((current) => ({ ...current, clientSearch: undefined }));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setApiError(null);

    if (!validate() || !selectedClient) {
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await onSubmit(selectedClient.personId, buildPayload(form));
      setSubmittedVehicle(response);
    } catch (err) {
      setApiError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const onCloseWithReset = () => {
    setSubmittedVehicle(null);
    onClose();
  };

  if (catalogsLoading) {
    return (
      <Modal
        open={open}
        onClose={onCloseWithReset}
        title="Add vehicle to existing client"
        description="Loading required vehicle catalogs."
        size="lg"
      >
        <LoadingState
          title="Loading catalog data"
          description="Preparing vehicle models and types."
        />
      </Modal>
    );
  }

  if (catalogError) {
    return (
      <Modal
        open={open}
        onClose={onCloseWithReset}
        title="Add vehicle to existing client"
        description="Unable to load catalog data."
        size="lg"
      >
        <ErrorState
          title="Unable to load catalogs"
          message={catalogError}
          retryLabel="Retry catalogs"
          onRetry={loadCatalogs}
        />
      </Modal>
    );
  }

  const isClientLoading = clientResultState === 'loading';

  return (
    <Modal
      open={open}
      onClose={onCloseWithReset}
      title="Add vehicle to existing client"
      description="Search a client and add a new vehicle record."
      size="lg"
    >
      <form onSubmit={(event) => void handleSubmit(event)} className="space-y-6">
        {submittedVehicle ? (
          <div
            role="status"
            className="rounded-lg border border-success/30 bg-success-muted/40 px-4 py-3 text-sm text-success"
          >
            Vehicle #{submittedVehicle.vehicleId} linked to {selectedClient?.fullName}.
            {submittedVehicle.plate ? ` Plate ${submittedVehicle.plate}.` : ''}
          </div>
        ) : null}

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
            Client
          </h3>
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-[2.125rem] size-4 text-text-muted"
              aria-hidden
            />
            <Input
              name="client-search"
              label="Search client"
              value={form.clientSearch}
              onChange={(event) => {
                const value = event.target.value;
                updateField('clientSearch', value);
                setSelectedClient(null);
              }}
              placeholder="Search by name, document, or phone (min. 2 chars)"
              className="pl-9"
              error={fieldErrors.clientSearch}
            />
          </div>

          {isClientLoading && (
            <p className="text-xs text-text-secondary">Searching clients…</p>
          )}
          {clientSearchError && (
            <ErrorState
              title="Unable to search clients"
              message={clientSearchError}
            />
          )}

          {selectedClient && (
            <p className="rounded-lg border border-success/30 bg-success-muted/40 px-3 py-2 text-sm text-success">
              Selected client: {selectedClient.fullName} (ID #{selectedClient.personId})
              <button
                type="button"
                onClick={clearSelectedClient}
                className="ml-3 text-sm font-semibold text-success underline hover:opacity-80"
              >
                Change
              </button>
            </p>
          )}

          {clientResults.length > 0 && (
            <ul className="max-h-40 overflow-y-auto rounded-lg border border-border bg-bg-elevated">
              {clientResults.map((client) => (
                <li
                  key={client.personId}
                  className="border-b border-border last:border-b-0"
                >
                  <button
                    type="button"
                    className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-bg-muted"
                    onClick={() => handleSelectClient(client)}
                  >
                    <span>
                      <p className="text-sm font-medium text-text-primary">{client.fullName}</p>
                      <p className="text-xs text-text-secondary">
                        #{client.personId} · {client.documentNumber}
                      </p>
                    </span>
                    <span className="text-xs text-text-secondary">Select</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="space-y-4 border-t border-border pt-4">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-text-secondary">
            Vehicle
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
              label="Plate *"
              value={form.plate}
              onChange={(event) => {
                updateField('plate', event.target.value);
                setFieldErrors((current) => ({ ...current, plate: undefined }));
              }}
              placeholder="ABC123"
              error={fieldErrors.plate}
              required
            />
            <Input
              name="vin"
              label="VIN"
              value={form.vin}
              onChange={(event) => updateField('vin', event.target.value.toUpperCase())}
              error={fieldErrors.vin}
              maxLength={17}
              hint="Optional · 17 alphanumeric characters"
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
              error={fieldErrors.color}
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
          <Button type="button" variant="ghost" onClick={onCloseWithReset} disabled={isSubmitting}>
            Close
          </Button>
          <Button type="submit" isLoading={isSubmitting} disabled={!!submittedVehicle}>
            {submittedVehicle ? 'Vehicle added' : 'Link vehicle'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
