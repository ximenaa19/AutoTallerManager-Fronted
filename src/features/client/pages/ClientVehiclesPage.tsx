import { useState } from 'react';
import { Car, RefreshCw } from 'lucide-react';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingState } from '@/components/feedback/LoadingState';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { ClientVehicleDetailModal } from '@/features/client/components/ClientVehicleDetailModal';
import { ClientVehiclesTable } from '@/features/client/components/ClientVehiclesTable';
import { useClientVehicles } from '@/features/client/hooks/useClientVehicles';
import type { ClientVehicleDto } from '@/features/client/types/clientVehicles.types';

export function ClientVehiclesPage() {
  const { vehicles, isLoading, error, retry } = useClientVehicles();
  const [selectedVehicle, setSelectedVehicle] = useState<ClientVehicleDto | null>(null);

  if (isLoading) {
    return (
      <LoadingState
        title="Loading vehicles"
        description="Getting the vehicles registered to your account."
        className="min-h-[420px]"
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <DashboardHeader
          title="My Vehicles"
          subtitle="View the vehicles registered to your account."
        />
        <Button
          variant="secondary"
          leftIcon={<RefreshCw className="size-4" />}
          onClick={() => {
            void retry();
          }}
        >
          Refresh
        </Button>
      </div>

      {error ? (
        <ErrorState
          title="Unable to load vehicles"
          message={error}
          onRetry={retry}
        />
      ) : vehicles.length === 0 ? (
        <EmptyState
          title="You do not have registered vehicles yet."
          description="Vehicles linked to your account will appear here once the workshop registers them."
          icon={<Car className="size-6" />}
          className="rounded-lg border border-border bg-bg-surface"
        />
      ) : (
        <Card padding="none">
          <CardContent>
            <ClientVehiclesTable
              vehicles={vehicles}
              onViewDetails={setSelectedVehicle}
            />
          </CardContent>
        </Card>
      )}

      <ClientVehicleDetailModal
        vehicle={selectedVehicle}
        onClose={() => setSelectedVehicle(null)}
      />
    </div>
  );
}
