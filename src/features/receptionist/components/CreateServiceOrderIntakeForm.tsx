import { useCallback, useMemo, useRef, useState, type FormEvent } from 'react';
import { CalendarCheck, Search } from 'lucide-react';
import { getErrorMessage } from '@/api/apiError';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { receptionistClientsApi } from '@/features/receptionist/api/receptionistClients.api';
import { receptionistServiceOrdersApi } from '@/features/receptionist/api/receptionistServiceOrders.api';
import { useReceptionistClientSearch } from '@/features/receptionist/hooks/useReceptionistClientSearch';
import { useWorkshopCatalogs } from '@/features/receptionist/hooks/useWorkshopCatalogs';
import { ServiceOrderIntakeInventorySection } from '@/features/receptionist/components/ServiceOrderIntakeInventorySection';
import {
  ServiceOrderServicesEditor,
  type ServiceOrderServiceLineInput,
} from '@/features/receptionist/components/ServiceOrderServicesEditor';
import { ServiceOrderSummaryPanel } from '@/features/receptionist/components/ServiceOrderSummaryPanel';
import type { CreateWorkshopIntakeRequest } from '@/features/receptionist/types/receptionistServiceOrders.types';
import type { ClientSearchResultDto, ClientVehicleDto } from '@/features/receptionist/types/receptionistClients.types';

type ClientVehicleResult = ClientVehicleDto & { plate?: string };

interface CreateServiceOrderIntakeFormProps {
  onCancel: () => void;
  onSubmitSuccess: (serviceOrderId: number) => void;
}

function createEmptyServiceLine(): ServiceOrderServiceLineInput {
  return {
    key: crypto.randomUUID(),
    serviceTypeId: 0,
    description: '',
    laborCost: '',
  };
}

function toIsoDate(value: string): string {
  return `${value}T00:00:00.000Z`;
}

function parseLaborCost(value: ServiceOrderServiceLineInput['laborCost']): number | null {
  if (value === '') {
    return null;
  }

  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return null;
  }

  return parsed;
}

export function CreateServiceOrderIntakeForm({
  onCancel,
  onSubmitSuccess,
}: CreateServiceOrderIntakeFormProps) {
  const serviceOrderCatalogs = useWorkshopCatalogs();
  const clientSearch = useReceptionistClientSearch({ minTermLength: 2 });
  const vehicleRequestIdRef = useRef(0);

  const [selectedClient, setSelectedClient] = useState<ClientSearchResultDto | null>(null);
  const [vehicleResults, setVehicleResults] = useState<ClientVehicleResult[]>([]);
  const [vehicleResultsClientId, setVehicleResultsClientId] = useState<number | null>(null);
  const [isLoadingVehicles, setIsLoadingVehicles] = useState(false);
  const [vehicleError, setVehicleError] = useState<string | null>(null);
  const [selectedVehicleId, setSelectedVehicleId] = useState<number | null>(null);

  const [entryDate, setEntryDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [estimatedDeliveryDate, setEstimatedDeliveryDate] = useState('');
  const [generalDescription, setGeneralDescription] = useState('');
  const [ownershipCardDelivered, setOwnershipCardDelivered] = useState(false);
  const [inventoryObservations, setInventoryObservations] = useState('');
  const [hasScratches, setHasScratches] = useState(false);
  const [scratchesDescription, setScratchesDescription] = useState('');
  const [hasToolbox, setHasToolbox] = useState(false);
  const [toolboxDescription, setToolboxDescription] = useState('');

  const [services, setServices] = useState<ServiceOrderServiceLineInput[]>([
    createEmptyServiceLine(),
  ]);

  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadVehiclesForClient = useCallback(async (personId: number) => {
    const requestId = vehicleRequestIdRef.current + 1;
    vehicleRequestIdRef.current = requestId;

    setIsLoadingVehicles(true);
    setVehicleError(null);

    try {
      const response = await receptionistClientsApi.getClientVehicles(personId);

      if (vehicleRequestIdRef.current !== requestId) {
        return;
      }

      setVehicleResults(response.data as ClientVehicleResult[]);
      setVehicleResultsClientId(personId);
    } catch (err) {
      if (vehicleRequestIdRef.current !== requestId) {
        return;
      }

      setVehicleError(getErrorMessage(err));
      setVehicleResultsClientId(null);
    } finally {
      if (vehicleRequestIdRef.current === requestId) {
        setIsLoadingVehicles(false);
      }
    }
  }, []);

  const selectedVehicle = useMemo<ClientVehicleResult | null>(() => {
    return vehicleResults.find((vehicle) => vehicle.vehicleId === selectedVehicleId) ?? null;
  }, [vehicleResults, selectedVehicleId]);

  const visibleVehicleResults =
    selectedClient && vehicleResultsClientId === selectedClient.personId ? vehicleResults : [];

  const serviceLinesWithParsedCost = useMemo(
    () =>
      services.map((service) => ({
        ...service,
        parsedLaborCost: parseLaborCost(service.laborCost),
      })),
    [services],
  );

  const validServiceLines = serviceLinesWithParsedCost.filter(
    (line) => line.serviceTypeId > 0 && line.parsedLaborCost !== null,
  );

  const servicesTotalLabor = serviceLinesWithParsedCost.reduce(
    (acc, line) => acc + (line.parsedLaborCost ?? 0),
    0,
  );

  const serviceTypeOptions = useMemo(
    () => serviceOrderCatalogs.lookups.serviceTypes,
    [serviceOrderCatalogs.lookups.serviceTypes],
  );

  const addServiceLine = () => {
    setServices((current) => [...current, createEmptyServiceLine()]);
  };

  const updateServiceLine = (
    key: string,
    patch: Partial<ServiceOrderServiceLineInput>,
  ) => {
    setServices((current) =>
      current.map((line) => (line.key === key ? { ...line, ...patch } : line)),
    );
  };

  const removeServiceLine = (key: string) => {
    setServices((current) => current.filter((line) => line.key !== key));
  };

  const handleClientSearchTermChange = (value: string) => {
    clientSearch.setTerm(value);
    if (selectedClient) {
      vehicleRequestIdRef.current += 1;
      setSelectedClient(null);
      setVehicleResults([]);
      setVehicleResultsClientId(null);
      setSelectedVehicleId(null);
      setVehicleError(null);
      setIsLoadingVehicles(false);
    }
  };

  const handleSelectClient = useCallback(
    (client: ClientSearchResultDto) => {
      if (selectedClient?.personId === client.personId) {
        return;
      }

      setSelectedClient(client);
      setSelectedVehicleId(null);
      setVehicleError(null);
      void loadVehiclesForClient(client.personId);
    },
    [loadVehiclesForClient, selectedClient?.personId],
  );

  const hasInvalidServiceLines =
    services.length === 0 ||
    serviceLinesWithParsedCost.some(
      (line) => line.serviceTypeId <= 0 || line.parsedLaborCost === null,
    );

  const canSubmit =
    !isSubmitting &&
    !isLoadingVehicles &&
    !serviceOrderCatalogs.isLoading &&
    Boolean(selectedClient) &&
    Boolean(selectedVehicleId) &&
    !hasInvalidServiceLines;

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setFormError(null);

    if (!selectedClient) {
      setFormError('Select a customer before creating a service order.');
      return;
    }

    if (!selectedVehicleId) {
      setFormError('Select a vehicle for this customer before creating a service order.');
      return;
    }

    if (!entryDate) {
      setFormError('Entry date is required.');
      return;
    }

    if (estimatedDeliveryDate && estimatedDeliveryDate < entryDate) {
      setFormError('Estimated delivery date must be equal or later than entry date.');
      return;
    }

    if (hasScratches && !scratchesDescription.trim()) {
      setFormError('Scratches description is required when scratches are selected.');
      return;
    }

    if (hasToolbox && !toolboxDescription.trim()) {
      setFormError('Toolbox description is required when toolbox is selected.');
      return;
    }

    if (services.length === 0) {
      setFormError('Add at least one service.');
      return;
    }

    if (hasInvalidServiceLines) {
      setFormError('Complete every service line or remove the incomplete ones.');
      return;
    }

    const payload: CreateWorkshopIntakeRequest = {
      vehicleId: selectedVehicleId,
      entryDate: toIsoDate(entryDate),
      estimatedDeliveryDate: estimatedDeliveryDate
        ? toIsoDate(estimatedDeliveryDate)
        : undefined,
      generalDescription: generalDescription.trim() || undefined,
      hasScratches,
      scratchesDescription: hasScratches ? scratchesDescription.trim() || undefined : undefined,
      hasToolbox,
      toolboxDescription: hasToolbox ? toolboxDescription.trim() || undefined : undefined,
      ownershipCardDelivered,
      inventoryObservations: inventoryObservations.trim() || undefined,
      services: serviceLinesWithParsedCost.map((line) => ({
        serviceTypeId: line.serviceTypeId,
        description: line.description.trim() || undefined,
        laborCost: line.parsedLaborCost ?? 0,
      })),
    };

    setIsSubmitting(true);
    try {
      const response = await receptionistServiceOrdersApi.createServiceOrderIntake(payload);
      const createdOrderId = response.data.serviceOrderId;
      onSubmitSuccess(createdOrderId);
      setSelectedClient(null);
      setVehicleResults([]);
      setVehicleResultsClientId(null);
      setSelectedVehicleId(null);
      setServices([createEmptyServiceLine()]);
      setEntryDate(new Date().toISOString().slice(0, 10));
      setEstimatedDeliveryDate('');
      setGeneralDescription('');
      setOwnershipCardDelivered(false);
      setInventoryObservations('');
      setHasScratches(false);
      setScratchesDescription('');
      setHasToolbox(false);
      setToolboxDescription('');
      clientSearch.setTerm('');
      setFormError(null);
    } catch (err) {
      setFormError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      {formError ? (
        <div
          role="alert"
          className="rounded-lg border border-danger/30 bg-danger-muted/40 px-4 py-3 text-sm text-danger"
        >
          {formError}
        </div>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Customer selection</CardTitle>
          <CardDescription>
            Search and pick an existing customer before selecting the vehicle.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-[2.125rem] size-4 text-text-muted"
            />
            <Input
              name="clientSearch"
              label="Search customers"
              placeholder="Search by document, name, email (min. 2 chars)"
              value={clientSearch.term}
              onChange={(event) => handleClientSearchTermChange(event.target.value)}
              className="pl-9"
            />
          </div>
          {clientSearch.termTooShort ? (
            <p className="text-xs text-text-secondary">
              Search needs at least {clientSearch.minTermLength} characters.
            </p>
          ) : null}
          {clientSearch.isSearching ? (
            <p className="text-xs text-text-secondary">Searching customers...</p>
          ) : null}
          {clientSearch.error ? (
            <p className="text-xs text-danger">{clientSearch.error}</p>
          ) : null}
          {clientSearch.results.length > 0 ? (
            <ul className="max-h-48 overflow-y-auto rounded-lg border border-border">
              {clientSearch.results.map((client) => (
                <li
                  key={client.personId}
                  className={`border-b border-border last:border-b-0 ${
                    selectedClient?.personId === client.personId
                      ? 'border-l-4 border-l-accent bg-accent-muted/30'
                      : 'hover:bg-bg-muted/40'
                  }`}
                >
                  <button
                    type="button"
                    className="flex w-full flex-col gap-1 px-4 py-3 text-left transition"
                    onClick={() => handleSelectClient(client)}
                    aria-pressed={selectedClient?.personId === client.personId}
                  >
                    <span className="flex flex-wrap items-center gap-2 text-sm font-medium text-text-primary">
                      {client.fullName}
                      {selectedClient?.personId === client.personId ? (
                        <Badge variant="accent">Selected</Badge>
                      ) : null}
                    </span>
                    <span className="text-xs text-text-secondary">
                      #{client.personId} · {client.documentNumber || 'No document'}
                    </span>
                    <span className="text-xs text-text-secondary">
                      {[client.primaryEmail, client.primaryPhoneNumber].filter(Boolean).join(' / ') ||
                        'No contact data'}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
          {selectedClient ? (
            <p className="text-xs text-success">Selected: {selectedClient.fullName}</p>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Vehicle selection</CardTitle>
          <CardDescription>
            {selectedClient
              ? `Choose one of ${selectedClient.fullName}'s registered vehicles.`
              : 'Select a customer first to load vehicles.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoadingVehicles ? <p className="text-xs text-text-secondary">Loading vehicles...</p> : null}
          {vehicleError ? <p className="text-xs text-danger">{vehicleError}</p> : null}
          {selectedClient && !isLoadingVehicles && !vehicleError && (
            <>
              {visibleVehicleResults.length === 0 ? (
                <p className="text-sm text-text-secondary">
                  No vehicles available for this customer.
                </p>
              ) : (
                <ul className="max-h-48 overflow-y-auto rounded-lg border border-border">
                  {visibleVehicleResults.map((vehicle) => (
                    <li
                      key={vehicle.vehicleId}
                      className={`border-b border-border last:border-b-0 ${
                        selectedVehicleId === vehicle.vehicleId
                          ? 'border-l-4 border-l-accent bg-accent-muted/30'
                          : 'hover:bg-bg-muted/40'
                      }`}
                    >
                      <button
                        type="button"
                        className="flex w-full flex-col gap-1 px-4 py-3 text-left transition"
                        onClick={() => setSelectedVehicleId(vehicle.vehicleId)}
                        aria-pressed={selectedVehicleId === vehicle.vehicleId}
                      >
                        <span className="flex flex-wrap items-center gap-2 text-sm font-medium text-text-primary">
                          {vehicle.plate ? `${vehicle.plate} · ` : ''}
                          Year {vehicle.year}
                          {selectedVehicleId === vehicle.vehicleId ? (
                            <Badge variant="accent">Selected vehicle</Badge>
                          ) : null}
                        </span>
                        <span className="text-xs text-text-secondary">
                          #{vehicle.vehicleId} · {vehicle.vin}
                          {vehicle.color ? ` · ${vehicle.color}` : ''}
                        </span>
                        <span className="text-xs text-text-secondary">
                          Mileage {vehicle.mileage.toLocaleString()} km -{' '}
                          {vehicle.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Intake details</CardTitle>
          <CardDescription>Set date and initial entry notes.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Input
            name="entryDate"
            label="Entry date"
            type="date"
            value={entryDate}
            onChange={(event) => setEntryDate(event.target.value)}
            required
          />
          <Input
            name="estimatedDeliveryDate"
            label="Estimated delivery (optional)"
            type="date"
            value={estimatedDeliveryDate}
            onChange={(event) => setEstimatedDeliveryDate(event.target.value)}
          />
          <Textarea
            name="generalDescription"
            label="General description (optional)"
            value={generalDescription}
            onChange={(event) => setGeneralDescription(event.target.value)}
            rows={3}
            className="sm:col-span-2"
          />
          <div className="sm:col-span-2">
            <ServiceOrderIntakeInventorySection
              hasScratches={hasScratches}
              scratchesDescription={scratchesDescription}
              hasToolbox={hasToolbox}
              toolboxDescription={toolboxDescription}
              ownershipCardDelivered={ownershipCardDelivered}
              inventoryObservations={inventoryObservations}
              onHasScratchesChange={setHasScratches}
              onScratchesDescriptionChange={setScratchesDescription}
              onHasToolboxChange={setHasToolbox}
              onToolboxDescriptionChange={setToolboxDescription}
              onOwnershipCardDeliveredChange={setOwnershipCardDelivered}
              onInventoryObservationsChange={setInventoryObservations}
            />
          </div>
        </CardContent>
      </Card>

      <ServiceOrderSummaryPanel
        selectedClient={selectedClient}
        selectedVehicle={selectedVehicle}
        services={services}
        serviceTypeNameById={serviceOrderCatalogs.lookups.serviceTypeNameById}
        serviceCount={validServiceLines.length}
        servicesTotalLabor={servicesTotalLabor}
        entryDate={entryDate}
        estimatedDeliveryDate={estimatedDeliveryDate}
        ownershipCardDelivered={ownershipCardDelivered}
        hasScratches={hasScratches}
        scratchesDescription={scratchesDescription}
        hasToolbox={hasToolbox}
        toolboxDescription={toolboxDescription}
        inventoryObservations={inventoryObservations}
      />

      <Card>
        <CardHeader>
          <CardTitle>Services requested</CardTitle>
        </CardHeader>
        <CardContent>
          {serviceOrderCatalogs.isLoading ? (
            <p className="text-xs text-text-secondary">Loading workshop catalog...</p>
          ) : serviceOrderCatalogs.error ? (
            <p className="text-xs text-danger">{serviceOrderCatalogs.error}</p>
          ) : (
            <>
              <ServiceOrderServicesEditor
                services={services}
                serviceTypeOptions={serviceTypeOptions}
                onAddLine={addServiceLine}
                onUpdateLine={updateServiceLine}
                onRemoveLine={removeServiceLine}
                disabled={isSubmitting || serviceOrderCatalogs.isLoading}
              />
              {hasInvalidServiceLines ? (
                <p className="mt-3 text-xs text-warning">
                  Complete every service line or remove the incomplete ones.
                </p>
              ) : null}
            </>
          )}
        </CardContent>
      </Card>

      <div className="flex flex-wrap justify-end gap-2 border-t border-border pt-4">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button
          type="submit"
          leftIcon={<CalendarCheck className="size-4" />}
          isLoading={isSubmitting}
          disabled={!canSubmit}
        >
          Create service order
        </Button>
      </div>
    </form>
  );
}
