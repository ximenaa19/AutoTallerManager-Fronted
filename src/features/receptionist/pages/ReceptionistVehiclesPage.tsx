import { Search } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { getErrorMessage } from '@/api/apiError';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingState } from '@/components/feedback/LoadingState';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { ReceptionistPageHeader } from '@/features/receptionist/components/ReceptionistPageHeader';
import { AddVehicleToClientModal } from '@/features/receptionist/components/AddVehicleToClientModal';
import { ReceptionistVehiclesTable } from '@/features/receptionist/components/ReceptionistVehiclesTable';
import { receptionistClientsApi } from '@/features/receptionist/api/receptionistClients.api';
import { receptionistVehiclesApi } from '@/features/receptionist/api/receptionistVehicles.api';
import { useReceptionistVehicleSearch } from '@/features/receptionist/hooks/useReceptionistVehicleSearch';
import type { ReceptionistWorkshopCatalogsDto } from '@/features/receptionist/types/receptionistClients.types';
import type { AddVehicleToClientResponse, VehicleDetailDto } from '@/features/receptionist/types/receptionistVehicles.types';

function ReceptionistVehicleDetailModal({
  vehicleId,
  onClose,
}: {
  vehicleId: number | null;
  onClose: () => void;
}) {
  const [vehicle, setVehicle] = useState<VehicleDetailDto | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    if (!vehicleId) {
      return;
    }

    setIsLoading(true);
    setError(null);
    receptionistVehiclesApi
      .getVehicleById(vehicleId)
      .then((response) => {
        setVehicle(response.data);
      })
      .catch((err) => {
        setVehicle(null);
        setError(err instanceof Error ? err.message : 'Unable to load vehicle detail');
      })
      .finally(() => setIsLoading(false));
  }, [vehicleId]);

  useEffect(() => {
    load();
  }, [load]);

  if (!vehicleId) return null;

  return (
    <Modal
      open
      onClose={onClose}
      title={`Vehicle #${vehicleId}`}
      description="Basic vehicle detail and operational status."
      size="md"
    >
      {isLoading ? (
        <LoadingState
          title="Loading vehicle details"
          description="Fetching full vehicle information."
        />
      ) : error ? (
        <ErrorState
          title="Unable to load vehicle detail"
          message={error}
          onRetry={load}
        />
      ) : vehicle ? (
        <div className="space-y-4 text-sm text-text-secondary">
          <div>
            <p className="text-xs uppercase tracking-wide text-text-muted">Vehicle ID</p>
            <p className="text-base font-semibold text-text-primary">#{vehicle.vehicleId}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-text-muted">Plate</p>
            <p className="text-sm text-text-primary">{vehicle.plate || '—'}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-text-muted">VIN</p>
            <p className="font-mono text-sm text-text-primary">{vehicle.vin || '—'}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-text-muted">Model</p>
              <p className="text-sm text-text-primary">#{vehicle.modelId}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-text-muted">Type</p>
              <p className="text-sm text-text-primary">#{vehicle.vehicleTypeId}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-text-muted">Year</p>
              <p className="text-sm text-text-primary">{vehicle.year}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-text-muted">Color</p>
              <p className="text-sm text-text-primary">{vehicle.color || '—'}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-text-muted">Mileage</p>
              <p className="text-sm text-text-primary">{vehicle.mileage.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-text-muted">Status</p>
              <p className="text-sm text-text-primary">
                {vehicle.isActive ? 'Active' : 'Inactive'}
              </p>
            </div>
          </div>
          <div className="border-t border-border pt-3">
            <p className="text-xs text-text-muted">
              Service-order creation from this screen is deferred to the next phase.
            </p>
          </div>
        </div>
      ) : null}
    </Modal>
  );
}

export function ReceptionistVehiclesPage() {
  const search = useReceptionistVehicleSearch({ minTermLength: 2 });
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [catalogs, setCatalogs] = useState<ReceptionistWorkshopCatalogsDto | null>(null);
  const [catalogsError, setCatalogsError] = useState<string | null>(null);
  const [catalogsLoading, setCatalogsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [selectedVehicleId, setSelectedVehicleId] = useState<number | null>(null);

  const loadCatalogs = useCallback(async () => {
    setCatalogsLoading(true);
    setCatalogsError(null);
    try {
      const workshopResponse = await receptionistClientsApi.getWorkshopCatalogs();
      setCatalogs(workshopResponse.data);
    } catch (err) {
      setCatalogsError(getErrorMessage(err));
      setCatalogs(null);
    } finally {
      setCatalogsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCatalogs();
  }, [loadCatalogs]);

  const closeVehicleDetail = () => {
    setSelectedVehicleId(null);
  };

  const handleAddVehicleSubmit = async (
    personId: number,
    payload: Parameters<typeof receptionistVehiclesApi.addVehicleToClient>[1],
  ) => {
    const response = await receptionistVehiclesApi.addVehicleToClient(personId, payload);
    const added: AddVehicleToClientResponse = response.data;
    setSuccessMessage(
      `Vehicle ${added.plate ? `${added.plate} (ID #${added.vehicleId})` : `#${added.vehicleId}`} has been linked to the client.`,
    );
    search.reload();
    return added;
  };

  const handleOpenAddVehicleModal = () => {
    setSuccessMessage(null);
    setIsAddModalOpen(true);
  };

  const handleCloseAddVehicleModal = () => {
    setIsAddModalOpen(false);
  };

  if (catalogsLoading) {
    return (
      <div className="space-y-6">
        <ReceptionistPageHeader
          title="Vehicles"
          description="Search and manage workshop vehicle records used in intake and service planning."
        />
        <LoadingState
          title="Loading vehicle setup"
          description="Preparing catalog data."
          className="rounded-lg border border-border bg-bg-surface"
        />
      </div>
    );
  }

  if (catalogsError) {
    return (
      <div className="space-y-6">
        <ReceptionistPageHeader
          title="Vehicles"
          description="Search and manage workshop vehicle records used in intake and service planning."
        />
        <ErrorState
          title="Unable to load vehicle catalogs"
          message={catalogsError}
          onRetry={() => void loadCatalogs()}
          retryLabel="Retry catalogs"
        />
        <AddVehicleToClientModal
          open={isAddModalOpen}
          onClose={handleCloseAddVehicleModal}
          onSubmit={handleAddVehicleSubmit}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ReceptionistPageHeader
        title="Vehicles"
        description="Search workshop vehicles, review operational details, and add vehicles to existing customers."
        actions={
          <Button onClick={handleOpenAddVehicleModal}>Add vehicle to client</Button>
        }
      />

      {successMessage && (
        <div
          role="status"
          className="rounded-lg border border-success/30 bg-success-muted/40 px-4 py-3 text-sm text-success"
        >
          {successMessage}
        </div>
      )}

      <div className="rounded-lg border border-border bg-bg-surface p-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-[2.125rem] size-4 text-text-muted" />
          <Input
            name="receptionist-vehicle-search"
            label="Search vehicles"
            value={search.term}
            onChange={(event) => search.setTerm(event.target.value)}
            placeholder="Search by plate or VIN (min. 2 chars)"
            className="pl-9"
          />
        </div>
        {search.termTooShort ? (
          <p className="mt-2 text-xs text-text-secondary">
            Write at least {search.minTermLength} characters to search vehicles.
          </p>
        ) : null}
      </div>

      <ReceptionistVehiclesTable
        vehicles={search.results}
        isLoading={search.isSearching}
        error={search.error}
        hasSearched={search.hasSearched}
        onRetry={search.reload}
        onViewDetails={setSelectedVehicleId}
        vehicleModels={catalogs?.vehicleModels}
        vehicleTypes={catalogs?.vehicleTypes}
        searchTerm={search.term}
      />

      <ReceptionistVehicleDetailModal
        vehicleId={selectedVehicleId}
        onClose={closeVehicleDetail}
      />

      <AddVehicleToClientModal
        open={isAddModalOpen}
        onClose={handleCloseAddVehicleModal}
        onSubmit={handleAddVehicleSubmit}
      />
    </div>
  );
}
