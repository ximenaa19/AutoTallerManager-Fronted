import { useEffect, useState, type FormEvent } from 'react';
import { Plus, Search, Trash2 } from 'lucide-react';
import { getErrorMessage } from '@/api/apiError';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { serviceOrderLookupsApi } from '@/features/admin/serviceOrders/api/serviceOrderLookups.api';
import type { WorkshopCatalogLookups } from '@/features/admin/serviceOrders/hooks/useWorkshopCatalogLookups';
import type {
  CreateWorkshopIntakeOrderServiceRequest,
  CreateWorkshopIntakeRequest,
} from '@/features/admin/serviceOrders/types/workshopIntake.types';
import type { VehicleSearchResultDto } from '@/features/admin/vehicles/types/vehicles.types';

export interface CreateServiceOrderFormProps {
  lookups: WorkshopCatalogLookups;
  onSubmit: (payload: CreateWorkshopIntakeRequest) => Promise<void>;
  onCancel: () => void;
}

interface ServiceLineFormState extends CreateWorkshopIntakeOrderServiceRequest {
  key: string;
}

function createEmptyServiceLine(): ServiceLineFormState {
  return {
    key: crypto.randomUUID(),
    serviceTypeId: 0,
    description: '',
    laborCost: 0,
  };
}

export function CreateServiceOrderForm({
  lookups,
  onSubmit,
  onCancel,
}: CreateServiceOrderFormProps) {
  const [vehicleSearch, setVehicleSearch] = useState('');
  const [vehicleResults, setVehicleResults] = useState<VehicleSearchResultDto[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleSearchResultDto | null>(null);
  const [isSearchingVehicle, setIsSearchingVehicle] = useState(false);

  const [initialOrderStatusId, setInitialOrderStatusId] = useState('');
  const [entryDate, setEntryDate] = useState('');
  const [estimatedDeliveryDate, setEstimatedDeliveryDate] = useState('');
  const [generalDescription, setGeneralDescription] = useState('');

  const [hasScratches, setHasScratches] = useState(false);
  const [scratchesDescription, setScratchesDescription] = useState('');
  const [hasToolbox, setHasToolbox] = useState(false);
  const [toolboxDescription, setToolboxDescription] = useState('');
  const [ownershipCardDelivered, setOwnershipCardDelivered] = useState(false);
  const [inventoryObservations, setInventoryObservations] = useState('');

  const [services, setServices] = useState<ServiceLineFormState[]>([createEmptyServiceLine()]);

  const [fieldError, setFieldError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const normalized = vehicleSearch.trim();
    if (normalized.length < 2) {
      setVehicleResults([]);
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setIsSearchingVehicle(true);
      serviceOrderLookupsApi
        .searchVehicles(normalized)
        .then((response) => setVehicleResults(response.data))
        .catch(() => setVehicleResults([]))
        .finally(() => setIsSearchingVehicle(false));
    }, 350);

    return () => window.clearTimeout(timeoutId);
  }, [vehicleSearch]);

  const handleSelectVehicle = (vehicle: VehicleSearchResultDto) => {
    setSelectedVehicle(vehicle);
    setVehicleResults([]);
    setVehicleSearch(vehicle.vin ? `VIN ${vehicle.vin}` : `Vehicle #${vehicle.vehicleId}`);
  };

  const updateServiceLine = (
    key: string,
    patch: Partial<CreateWorkshopIntakeOrderServiceRequest>,
  ) => {
    setServices((current) =>
      current.map((line) => (line.key === key ? { ...line, ...patch } : line)),
    );
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setApiError(null);

    if (!selectedVehicle) {
      setFieldError('Select a vehicle for this service order');
      return;
    }

    const validServices = services.filter(
      (line) => line.serviceTypeId > 0 && Number.isFinite(line.laborCost) && line.laborCost >= 0,
    );

    if (validServices.length === 0) {
      setFieldError('Add at least one service with a type and labor cost');
      return;
    }

    setFieldError(null);
    setIsSubmitting(true);

    try {
      await onSubmit({
        vehicleId: selectedVehicle.vehicleId,
        initialOrderStatusId: initialOrderStatusId
          ? Number(initialOrderStatusId)
          : undefined,
        entryDate: entryDate ? `${entryDate}T00:00:00Z` : undefined,
        estimatedDeliveryDate: estimatedDeliveryDate
          ? `${estimatedDeliveryDate}T00:00:00Z`
          : undefined,
        generalDescription: generalDescription.trim() || undefined,
        hasScratches,
        scratchesDescription: hasScratches
          ? scratchesDescription.trim() || undefined
          : undefined,
        hasToolbox,
        toolboxDescription: hasToolbox ? toolboxDescription.trim() || undefined : undefined,
        ownershipCardDelivered,
        inventoryObservations: inventoryObservations.trim() || undefined,
        services: validServices.map(({ serviceTypeId, description, laborCost }) => ({
          serviceTypeId,
          description: description?.trim() || undefined,
          laborCost,
        })),
      });
    } catch (err) {
      setApiError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const serviceTypeOptions = lookups.serviceTypes.map((type) => ({
    value: String(type.id),
    label: type.name,
  }));

  const statusOptions = lookups.orderStatuses.map((status) => ({
    value: String(status.id),
    label: status.name,
  }));

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

      {fieldError && (
        <div
          role="alert"
          className="rounded-lg border border-danger/30 bg-danger-muted/40 px-4 py-3 text-sm text-danger"
        >
          {fieldError}
        </div>
      )}

      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-text-primary">Vehicle</h3>
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3 top-[2.125rem] size-4 text-text-muted"
            aria-hidden
          />
          <Input
            name="vehicleSearch"
            label="Search vehicle"
            required
            placeholder="Search by VIN or vehicle ID (min. 2 chars)…"
            value={vehicleSearch}
            onChange={(event) => {
              setVehicleSearch(event.target.value);
              if (selectedVehicle) setSelectedVehicle(null);
            }}
            className="pl-9"
          />
        </div>
        {isSearchingVehicle && (
          <p className="text-xs text-text-secondary">Searching vehicles…</p>
        )}
        {vehicleResults.length > 0 && (
          <ul className="max-h-40 overflow-y-auto rounded-lg border border-border bg-bg-elevated">
            {vehicleResults.map((vehicle) => (
              <li key={vehicle.vehicleId} className="border-b border-border last:border-b-0">
                <button
                  type="button"
                  className="flex w-full flex-col gap-0.5 px-4 py-3 text-left transition hover:bg-bg-muted"
                  onClick={() => handleSelectVehicle(vehicle)}
                >
                  <span className="text-sm font-medium text-text-primary">
                    #{vehicle.vehicleId} · {vehicle.vin || 'No VIN'}
                  </span>
                  <span className="text-xs text-text-secondary">
                    Year {vehicle.year}
                    {vehicle.color ? ` · ${vehicle.color}` : ''}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
        {selectedVehicle && (
          <p className="text-xs text-success">
            Selected vehicle #{selectedVehicle.vehicleId}
            {selectedVehicle.vin ? ` (${selectedVehicle.vin})` : ''}
          </p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Select
          name="initialOrderStatusId"
          label="Initial status (optional)"
          value={initialOrderStatusId}
          onChange={(event) => setInitialOrderStatusId(event.target.value)}
          options={statusOptions}
          placeholder="Defaults to Pending"
        />
        <Input
          name="entryDate"
          label="Entry date (optional)"
          type="date"
          value={entryDate}
          onChange={(event) => setEntryDate(event.target.value)}
        />
        <Input
          name="estimatedDeliveryDate"
          label="Estimated delivery (optional)"
          type="date"
          value={estimatedDeliveryDate}
          onChange={(event) => setEstimatedDeliveryDate(event.target.value)}
        />
      </div>

      <Textarea
        name="generalDescription"
        label="General description (optional)"
        value={generalDescription}
        onChange={(event) => setGeneralDescription(event.target.value)}
        rows={3}
      />

      <div className="space-y-4 rounded-lg border border-border bg-bg-muted/20 p-4">
        <h3 className="text-sm font-semibold text-text-primary">Entry inventory</h3>
        <label className="flex items-center gap-2 text-sm text-text-primary">
          <input
            type="checkbox"
            checked={hasScratches}
            onChange={(event) => setHasScratches(event.target.checked)}
            className="size-4 rounded border-border accent-accent"
          />
          Vehicle has scratches
        </label>
        {hasScratches && (
          <Input
            name="scratchesDescription"
            label="Scratches description"
            value={scratchesDescription}
            onChange={(event) => setScratchesDescription(event.target.value)}
          />
        )}
        <label className="flex items-center gap-2 text-sm text-text-primary">
          <input
            type="checkbox"
            checked={hasToolbox}
            onChange={(event) => setHasToolbox(event.target.checked)}
            className="size-4 rounded border-border accent-accent"
          />
          Vehicle has toolbox
        </label>
        {hasToolbox && (
          <Input
            name="toolboxDescription"
            label="Toolbox description"
            value={toolboxDescription}
            onChange={(event) => setToolboxDescription(event.target.value)}
          />
        )}
        <label className="flex items-center gap-2 text-sm text-text-primary">
          <input
            type="checkbox"
            checked={ownershipCardDelivered}
            onChange={(event) => setOwnershipCardDelivered(event.target.checked)}
            className="size-4 rounded border-border accent-accent"
          />
          Ownership card delivered
        </label>
        <Textarea
          name="inventoryObservations"
          label="Inventory observations (optional)"
          value={inventoryObservations}
          onChange={(event) => setInventoryObservations(event.target.value)}
          rows={2}
        />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm font-semibold text-text-primary">Initial services</h3>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            leftIcon={<Plus className="size-4" />}
            onClick={() => setServices((current) => [...current, createEmptyServiceLine()])}
          >
            Add line
          </Button>
        </div>

        {services.map((line, index) => (
          <div
            key={line.key}
            className="grid gap-3 rounded-lg border border-border bg-bg-muted/20 p-4 sm:grid-cols-2"
          >
            <Select
              name={`serviceType-${line.key}`}
              label={`Service type ${index + 1}`}
              required
              value={line.serviceTypeId ? String(line.serviceTypeId) : ''}
              onChange={(event) =>
                updateServiceLine(line.key, { serviceTypeId: Number(event.target.value) })
              }
              options={serviceTypeOptions}
              placeholder="Select type…"
            />
            <Input
              name={`laborCost-${line.key}`}
              label="Labor cost"
              type="number"
              min={0}
              step="0.01"
              required
              value={line.laborCost}
              onChange={(event) =>
                updateServiceLine(line.key, { laborCost: Number(event.target.value) })
              }
            />
            <div className="sm:col-span-2">
              <Input
                name={`description-${line.key}`}
                label="Description (optional)"
                value={line.description ?? ''}
                onChange={(event) =>
                  updateServiceLine(line.key, { description: event.target.value })
                }
              />
            </div>
            {services.length > 1 && (
              <div className="sm:col-span-2 flex justify-end">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  leftIcon={<Trash2 className="size-4 text-danger" />}
                  onClick={() =>
                    setServices((current) => current.filter((item) => item.key !== line.key))
                  }
                >
                  Remove line
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex flex-wrap justify-end gap-2 border-t border-border pt-4">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isSubmitting}>
          Create service order
        </Button>
      </div>
    </form>
  );
}
