import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { formatCurrency, formatDateTime } from '@/utils/format';
import type { ClientSearchResultDto } from '@/features/receptionist/types/receptionistClients.types';
import type { ClientVehicleDto } from '@/features/receptionist/types/receptionistClients.types';
import type { ServiceOrderServiceLineInput } from '@/features/receptionist/components/ServiceOrderServicesEditor';

type ClientVehicleResult = ClientVehicleDto & { plate?: string };

export interface ServiceOrderSummaryPanelProps {
  selectedClient: ClientSearchResultDto | null;
  selectedVehicle: ClientVehicleResult | null;
  services: ServiceOrderServiceLineInput[];
  serviceTypeNameById: Map<number, string>;
  serviceCount: number;
  servicesTotalLabor: number;
  entryDate: string;
  estimatedDeliveryDate: string;
  ownershipCardDelivered: boolean;
  hasScratches: boolean;
  scratchesDescription: string;
  hasToolbox: boolean;
  toolboxDescription: string;
  inventoryObservations: string;
}

export function ServiceOrderSummaryPanel({
  selectedClient,
  selectedVehicle,
  services,
  serviceTypeNameById,
  serviceCount,
  servicesTotalLabor,
  entryDate,
  estimatedDeliveryDate,
  ownershipCardDelivered,
  hasScratches,
  scratchesDescription,
  hasToolbox,
  toolboxDescription,
  inventoryObservations,
}: ServiceOrderSummaryPanelProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Order summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5 text-sm">
        <div className="grid gap-4 lg:grid-cols-2">
          <section className="space-y-1 rounded-lg border border-border bg-bg-elevated p-3">
          <p className="text-xs uppercase tracking-wide text-text-muted">Customer</p>
          <p className="text-text-primary">
            {selectedClient?.fullName ?? 'No customer selected'}
          </p>
            <p className="text-text-secondary">
              Document: {selectedClient?.documentNumber || 'Not selected'}
            </p>
            <p className="text-text-secondary">
              Email: {selectedClient?.primaryEmail || 'No email'}
            </p>
            <p className="text-text-secondary">
              Phone: {selectedClient?.primaryPhoneNumber || 'No phone'}
            </p>
          </section>

          <section className="space-y-1 rounded-lg border border-border bg-bg-elevated p-3">
          <p className="text-xs uppercase tracking-wide text-text-muted">Vehicle</p>
          <p className="text-text-primary">
            {selectedVehicle
              ? `#${selectedVehicle.vehicleId} ${selectedVehicle.plate ? `(${selectedVehicle.plate})` : ''}`
              : 'No vehicle selected'}
          </p>
            <p className="text-text-secondary">VIN: {selectedVehicle?.vin || 'Not selected'}</p>
            <p className="text-text-secondary">
              Year: {selectedVehicle?.year ?? 'Not selected'}
              {selectedVehicle?.color ? ` / ${selectedVehicle.color}` : ''}
            </p>
            <p className="text-text-secondary">
              Mileage:{' '}
              {selectedVehicle ? `${selectedVehicle.mileage.toLocaleString()} km` : 'Not selected'}
            </p>
            <p className="text-text-secondary">
              Status:{' '}
              {selectedVehicle ? (selectedVehicle.isActive ? 'Active' : 'Inactive') : 'Not selected'}
            </p>
          </section>
        </div>

        <section className="space-y-2 rounded-lg border border-border bg-bg-elevated p-3">
          <p className="text-xs uppercase tracking-wide text-text-muted">Intake</p>
          <div className="grid gap-2 sm:grid-cols-2">
            <p>Entry date: {entryDate ? formatDateTime(`${entryDate}T00:00:00.000Z`) : 'Not set'}</p>
            <p>
              Estimated delivery:{' '}
              {estimatedDeliveryDate
                ? formatDateTime(`${estimatedDeliveryDate}T00:00:00.000Z`)
                : 'Not set'}
            </p>
            <p>Ownership card delivered: {ownershipCardDelivered ? 'Yes' : 'No'}</p>
            <p>Scratches: {hasScratches ? 'Yes' : 'No'}</p>
            {hasScratches ? <p className="sm:col-span-2">Scratches detail: {scratchesDescription || 'Missing detail'}</p> : null}
            <p>Toolbox: {hasToolbox ? 'Yes' : 'No'}</p>
            {hasToolbox ? <p className="sm:col-span-2">Toolbox detail: {toolboxDescription || 'Missing detail'}</p> : null}
            {inventoryObservations ? (
              <p className="sm:col-span-2">Inventory observations: {inventoryObservations}</p>
            ) : null}
          </div>
        </section>

        <section className="space-y-3 rounded-lg border border-border bg-bg-elevated p-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs uppercase tracking-wide text-text-muted">Services</p>
            <p className="text-text-primary">
              {serviceCount} valid / {services.length} visible
            </p>
          </div>
          <div className="space-y-2">
            {services.map((service, index) => (
              <div key={service.key} className="rounded-md border border-border bg-bg-surface px-3 py-2">
                <p className="font-medium text-text-primary">
                  {service.serviceTypeId > 0
                    ? serviceTypeNameById.get(service.serviceTypeId) ??
                      `Service type #${service.serviceTypeId}`
                    : `Service ${index + 1}: type not selected`}
                </p>
                <p className="text-text-secondary">
                  Labor cost:{' '}
                  {service.laborCost === ''
                    ? 'Missing'
                    : formatCurrency(Number(service.laborCost) || 0)}
                </p>
                <p className="text-text-secondary">
                  Description: {service.description || 'No description'}
                </p>
              </div>
            ))}
          </div>
          <p className="text-text-primary">Total labor cost: {formatCurrency(servicesTotalLabor)}</p>
        </section>
      </CardContent>
    </Card>
  );
}
