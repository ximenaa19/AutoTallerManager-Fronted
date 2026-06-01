import { useCallback, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRightLeft, Trash2 } from 'lucide-react';
import { getErrorMessage } from '@/api/apiError';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingState } from '@/components/feedback/LoadingState';
import { Button } from '@/components/ui/Button';
import { AdminPageHeader } from '@/features/admin/components/AdminPageHeader';
import { ConfirmActionModal } from '@/features/admin/components/ConfirmActionModal';
import { vehiclesApi } from '@/features/admin/vehicles/api/vehicles.api';
import { TransferOwnershipModal } from '@/features/admin/vehicles/components/TransferOwnershipModal';
import { VehicleDetailPanel } from '@/features/admin/vehicles/components/VehicleDetailPanel';
import { useVehicleCatalogLookups } from '@/features/admin/vehicles/hooks/useVehicleCatalogLookups';
import { useAsyncRequest } from '@/hooks/useAsyncRequest';
import { ROUTES } from '@/routes/routePaths';

export function VehicleDetailPage() {
  const navigate = useNavigate();
  const { vehicleId: vehicleIdParam } = useParams();
  const vehicleId = Number(vehicleIdParam);
  const isValidId = Number.isFinite(vehicleId) && vehicleId > 0;

  const { lookups, isLoading: catalogsLoading } = useVehicleCatalogLookups();
  const [transferOpen, setTransferOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const loadVehicle = useCallback(() => {
    if (!isValidId) {
      return Promise.reject(new Error('Invalid vehicle ID'));
    }
    return vehiclesApi.getById(vehicleId);
  }, [isValidId, vehicleId]);

  const {
    data: vehicle,
    isLoading,
    error,
    retry,
  } = useAsyncRequest(loadVehicle, [vehicleId, refreshKey]);

  const handleDelete = async () => {
    setActionLoading(true);
    setActionError(null);

    try {
      await vehiclesApi.delete(vehicleId);
      navigate(ROUTES.ADMIN_VEHICLES);
    } catch (err) {
      setActionError(getErrorMessage(err));
    } finally {
      setActionLoading(false);
      setPendingDelete(false);
    }
  };

  const handleTransfer = async (
    payload: Parameters<typeof vehiclesApi.transferOwnership>[1],
  ) => {
    await vehiclesApi.transferOwnership(vehicleId, payload);
    setSuccessMessage('Ownership transferred successfully.');
    setTransferOpen(false);
    setRefreshKey((value) => value + 1);
  };

  if (!isValidId) {
    return (
      <ErrorState
        title="Invalid vehicle"
        message="The vehicle ID in the URL is not valid."
        onRetry={() => navigate(ROUTES.ADMIN_VEHICLES)}
      />
    );
  }

  if (isLoading || catalogsLoading) {
    return (
      <LoadingState
        title="Loading vehicle"
        description="Fetching vehicle record…"
        className="min-h-[320px]"
      />
    );
  }

  if (error || !vehicle) {
    return (
      <ErrorState
        title="Unable to load vehicle"
        message={error ?? 'Vehicle not found.'}
        onRetry={retry}
      />
    );
  }

  return (
    <div className="space-y-8">
      <Link
        to={ROUTES.ADMIN_VEHICLES}
        className="inline-flex items-center gap-2 text-sm text-text-secondary transition hover:text-text-primary"
      >
        <ArrowLeft className="size-4" />
        Back to vehicles
      </Link>

      <AdminPageHeader
        title={`Vehicle #${vehicle.vehicleId}`}
        description={vehicle.vin ? `VIN ${vehicle.vin}` : 'Workshop fleet record'}
        actions={
          <>
            <Button
              variant="secondary"
              leftIcon={<ArrowRightLeft className="size-4" />}
              onClick={() => setTransferOpen(true)}
            >
              Transfer ownership
            </Button>
            <Button
              variant="danger"
              leftIcon={<Trash2 className="size-4" />}
              onClick={() => setPendingDelete(true)}
            >
              Delete
            </Button>
          </>
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

      {actionError && (
        <div
          role="alert"
          className="rounded-lg border border-danger/30 bg-danger-muted/40 px-4 py-3 text-sm text-danger"
        >
          {actionError}
        </div>
      )}

      <section className="rounded-lg border border-border bg-bg-surface p-5">
        <VehicleDetailPanel vehicle={vehicle} lookups={lookups} />
      </section>

      <section className="rounded-lg border border-dashed border-border bg-bg-muted/20 p-5">
        <h3 className="text-base font-semibold text-text-primary">Owner history</h3>
        <p className="mt-2 text-sm text-text-secondary">
          GET /api/vehicle-owner-histories is available, but VehicleOwnerHistoryDto field names
          and the vehicle relation are not documented in api-contract.md §10. This panel is
          deferred until the contract is updated.
        </p>
      </section>

      <section className="rounded-lg border border-dashed border-border bg-bg-muted/20 p-5">
        <h3 className="text-base font-semibold text-text-primary">Entry inventory</h3>
        <p className="mt-2 text-sm text-text-secondary">
          GET /api/vehicle-entry-inventories is available, but VehicleEntryInventoryDto fields and
          the link to a vehicle record are not documented in api-contract.md §10. This panel is
          deferred until the contract is updated.
        </p>
      </section>

      <TransferOwnershipModal
        open={transferOpen}
        vehicleId={vehicleId}
        onClose={() => setTransferOpen(false)}
        onSubmit={handleTransfer}
      />

      <ConfirmActionModal
        open={pendingDelete}
        onClose={() => setPendingDelete(false)}
        onConfirm={() => void handleDelete()}
        title="Delete vehicle"
        description={`Delete vehicle #${vehicle.vehicleId}? Related service history may block deletion.`}
        confirmLabel="Delete vehicle"
        isLoading={actionLoading}
      />
    </div>
  );
}
