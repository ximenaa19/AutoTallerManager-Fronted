import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { formatCurrency, formatDateTime } from '@/utils/format';
import type { ClientSearchResultDto } from '@/features/receptionist/types/receptionistClients.types';
import type { ClientVehicleDto } from '@/features/receptionist/types/receptionistClients.types';

type ClientVehicleResult = ClientVehicleDto & { plate?: string };

export interface ServiceOrderSummaryPanelProps {
  selectedClient: ClientSearchResultDto | null;
  selectedVehicle: ClientVehicleResult | null;
  serviceCount: number;
  servicesTotalLabor: number;
  estimatedDeliveryDate: string;
}

export function ServiceOrderSummaryPanel({
  selectedClient,
  selectedVehicle,
  serviceCount,
  servicesTotalLabor,
  estimatedDeliveryDate,
}: ServiceOrderSummaryPanelProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Order summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-wide text-text-muted">Customer</p>
          <p className="text-text-primary">
            {selectedClient?.fullName ?? 'No customer selected'}
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-wide text-text-muted">Vehicle</p>
          <p className="text-text-primary">
            {selectedVehicle
              ? `#${selectedVehicle.vehicleId} ${selectedVehicle.plate ? `(${selectedVehicle.plate})` : ''}`
              : 'No vehicle selected'}
          </p>
        </div>
        <div className="grid gap-4 border-t border-border pt-2 sm:grid-cols-2">
          <div>
            <p className="text-xs uppercase tracking-wide text-text-muted">Services requested</p>
            <p className="text-text-primary">{serviceCount}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-text-muted">Labor total</p>
            <p className="text-text-primary">{formatCurrency(servicesTotalLabor)}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-text-muted">Estimated delivery</p>
            <p className="text-text-primary">
              {estimatedDeliveryDate
                ? formatDateTime(`${estimatedDeliveryDate}T00:00:00.000Z`)
                : 'Not set'}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
