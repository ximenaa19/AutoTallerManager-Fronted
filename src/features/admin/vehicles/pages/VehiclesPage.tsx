import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRightLeft, Eye, ExternalLink, Pencil, Plus, Trash2 } from 'lucide-react';
import { getErrorMessage } from '@/api/apiError';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { AdminDataTable } from '@/features/admin/components/AdminDataTable';
import { AdminPageHeader } from '@/features/admin/components/AdminPageHeader';
import { AdminToolbar } from '@/features/admin/components/AdminToolbar';
import { ConfirmActionModal } from '@/features/admin/components/ConfirmActionModal';
import {
  filterBySearchTerm,
  useClientPagination,
} from '@/features/admin/hooks/useClientPagination';
import { vehiclesApi } from '@/features/admin/vehicles/api/vehicles.api';
import { VehicleDetailPanel } from '@/features/admin/vehicles/components/VehicleDetailPanel';
import { TransferOwnershipModal } from '@/features/admin/vehicles/components/TransferOwnershipModal';
import { VehicleForm } from '@/features/admin/vehicles/components/VehicleForm';
import {
  formatVehicleModelLabel,
  formatVehicleTypeLabel,
  useVehicleCatalogLookups,
} from '@/features/admin/vehicles/hooks/useVehicleCatalogLookups';
import type { VehicleDto } from '@/features/admin/vehicles/types/vehicles.types';
import { formatVehicleIdentityLabel } from '@/features/admin/vehicles/utils/vehiclePlate';
import { useAsyncRequest } from '@/hooks/useAsyncRequest';
import { adminVehicleDetailPath } from '@/routes/routePaths';
import { formatDateTime, formatNumber } from '@/utils/format';

type VehicleModalMode = 'view' | 'transfer' | 'create' | 'edit' | null;

function getVehicleSearchText(vehicle: VehicleDto, lookups: ReturnType<typeof useVehicleCatalogLookups>['lookups']): string {
  const createdAt = vehicle.createdAt ? formatDateTime(vehicle.createdAt) : '';
  const modelLabel = formatVehicleModelLabel(vehicle.modelId, lookups);
  const typeLabel = formatVehicleTypeLabel(vehicle.vehicleTypeId, lookups);
  const statusLabel = vehicle.isActive ? 'Active' : 'Inactive';

  return [
    String(vehicle.vehicleId),
    `#${vehicle.vehicleId}`,
    vehicle.plate,
    vehicle.vin,
    modelLabel,
    typeLabel,
    String(vehicle.year),
    String(vehicle.mileage),
    formatNumber(vehicle.mileage),
    vehicle.color,
    statusLabel,
    createdAt,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

export function VehiclesPage() {
  const navigate = useNavigate();
  const { lookups, isLoading: catalogsLoading } = useVehicleCatalogLookups();

  const [searchTerm, setSearchTerm] = useState('');
  const [modalMode, setModalMode] = useState<VehicleModalMode>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleDto | null>(null);
  const [pendingDelete, setPendingDelete] = useState<VehicleDto | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const loadVehicles = useCallback(() => vehiclesApi.getAll(), []);
  const {
    data: vehicles,
    isLoading,
    error,
    retry,
  } = useAsyncRequest(loadVehicles, [refreshKey]);

  const filteredVehicles = useMemo(
    () =>
      filterBySearchTerm(vehicles ?? [], searchTerm, (vehicle, term) =>
        getVehicleSearchText(vehicle, lookups).includes(term),
      ),
    [vehicles, searchTerm, lookups],
  );

  const pagination = useClientPagination(filteredVehicles);

  const refreshAll = () => setRefreshKey((value) => value + 1);

  const openViewModal = (vehicle: VehicleDto) => {
    setSelectedVehicle(vehicle);
    setModalMode('view');
  };

  const openTransferModal = (vehicle: VehicleDto) => {
    setSelectedVehicle(vehicle);
    setModalMode('transfer');
  };

  const openCreateModal = () => {
    setSelectedVehicle(null);
    setModalMode('create');
  };

  const openEditModal = (vehicle: VehicleDto) => {
    setSelectedVehicle(vehicle);
    setModalMode('edit');
  };

  const closeModal = () => {
    setModalMode(null);
    setSelectedVehicle(null);
  };

  const handleDelete = async () => {
    if (!pendingDelete) return;

    setActionLoading(true);
    setActionError(null);

    try {
      await vehiclesApi.delete(pendingDelete.vehicleId);
      setSuccessMessage(`Vehicle #${pendingDelete.vehicleId} deleted.`);
      setPendingDelete(null);
      refreshAll();
    } catch (err) {
      setSuccessMessage(null);
      setActionError(getErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
  };

  const handleTransfer = async (
    payload: Parameters<typeof vehiclesApi.transferOwnership>[1],
  ) => {
    if (!selectedVehicle) return;

    await vehiclesApi.transferOwnership(selectedVehicle.vehicleId, payload);
    setSuccessMessage(`Ownership transferred for vehicle #${selectedVehicle.vehicleId}.`);
    closeModal();
    refreshAll();
  };

  const handleSaveVehicle = async (
    payload: Parameters<typeof vehiclesApi.create>[0],
  ) => {
    if (modalMode === 'edit' && selectedVehicle) {
      await vehiclesApi.update(selectedVehicle.vehicleId, payload);
      setSuccessMessage(`Vehicle #${selectedVehicle.vehicleId} updated.`);
    } else {
      const response = await vehiclesApi.create(payload);
      setSuccessMessage(`Vehicle #${response.data.vehicleId} created.`);
    }
    closeModal();
    refreshAll();
  };

  const columns = useMemo(
    () => [
      {
        id: 'vehicleId',
        header: 'ID',
        cell: (vehicle: VehicleDto) => (
          <span className="font-medium text-text-primary">#{vehicle.vehicleId}</span>
        ),
      },
      {
        id: 'plate',
        header: 'Plate',
        cell: (vehicle: VehicleDto) => (
          <span className="font-mono text-sm">{vehicle.plate || '—'}</span>
        ),
      },
      {
        id: 'vin',
        header: 'VIN',
        cell: (vehicle: VehicleDto) => (
          <span className="font-mono text-sm">{vehicle.vin || '—'}</span>
        ),
      },
      {
        id: 'model',
        header: 'Model',
        cell: (vehicle: VehicleDto) => formatVehicleModelLabel(vehicle.modelId, lookups),
      },
      {
        id: 'type',
        header: 'Type',
        cell: (vehicle: VehicleDto) =>
          formatVehicleTypeLabel(vehicle.vehicleTypeId, lookups),
      },
      {
        id: 'year',
        header: 'Year',
        cell: (vehicle: VehicleDto) => vehicle.year,
      },
      {
        id: 'mileage',
        header: 'Mileage',
        cell: (vehicle: VehicleDto) => formatNumber(vehicle.mileage),
      },
      {
        id: 'status',
        header: 'Status',
        cell: (vehicle: VehicleDto) => (
          <Badge variant={vehicle.isActive ? 'active' : 'cancelled'} dot>
            {vehicle.isActive ? 'Active' : 'Inactive'}
          </Badge>
        ),
      },
      {
        id: 'createdAt',
        header: 'Created',
        cell: (vehicle: VehicleDto) =>
          vehicle.createdAt ? formatDateTime(vehicle.createdAt) : '—',
      },
      {
        id: 'actions',
        header: 'Actions',
        className: 'text-right',
        cell: (vehicle: VehicleDto) => (
          <div className="flex justify-end gap-1">
            <Button
              variant="ghost"
              size="sm"
              aria-label={`Open vehicle ${vehicle.vehicleId}`}
              onClick={() => navigate(adminVehicleDetailPath(vehicle.vehicleId))}
            >
              <ExternalLink className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              aria-label={`Edit vehicle ${vehicle.vehicleId}`}
              onClick={() => openEditModal(vehicle)}
            >
              <Pencil className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              aria-label={`View vehicle ${vehicle.vehicleId}`}
              onClick={() => openViewModal(vehicle)}
            >
              <Eye className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              aria-label={`Transfer ownership ${vehicle.vehicleId}`}
              onClick={() => openTransferModal(vehicle)}
            >
              <ArrowRightLeft className="size-4 text-accent" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              aria-label={`Delete vehicle ${vehicle.vehicleId}`}
              onClick={() => setPendingDelete(vehicle)}
            >
              <Trash2 className="size-4 text-danger" />
            </Button>
          </div>
        ),
      },
    ],
    [lookups, navigate],
  );

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Vehicles"
        description="Fleet records for the workshop. Create and edit vehicles, transfer ownership between customers, and remove unused records."
        actions={
          <Button leftIcon={<Plus className="size-4" />} onClick={openCreateModal}>
            New vehicle
          </Button>
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

      <AdminToolbar
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search by plate, VIN, model, type, year, or status…"
        summary={
          <p className="text-xs text-text-secondary">
            {filteredVehicles.length} vehicle{filteredVehicles.length === 1 ? '' : 's'} shown
          </p>
        }
      />

      <AdminDataTable
        columns={columns}
        data={pagination.items}
        rowKey={(vehicle) => vehicle.vehicleId}
        isLoading={isLoading || catalogsLoading}
        error={error}
        onRetry={retry}
        emptyTitle="No vehicles yet"
        emptyDescription="Vehicles appear when customers are onboarded with a vehicle or when records are created through supported flows."
        page={pagination.page}
        totalPages={pagination.totalPages}
        totalCount={pagination.totalCount}
        onPageChange={pagination.setPage}
      />

      <Modal
        open={modalMode === 'view' && selectedVehicle !== null}
        onClose={closeModal}
        title={`Vehicle #${selectedVehicle?.vehicleId ?? ''}`}
        description={
          selectedVehicle
            ? formatVehicleIdentityLabel({
                plate: selectedVehicle.plate,
                vin: selectedVehicle.vin,
                vehicleId: selectedVehicle.vehicleId,
              })
            : undefined
        }
        size="md"
        footer={
          selectedVehicle && (
            <div className="flex flex-wrap gap-2">
              <Button
                variant="secondary"
                onClick={() => navigate(adminVehicleDetailPath(selectedVehicle.vehicleId))}
              >
                Open detail page
              </Button>
              <Button onClick={() => openTransferModal(selectedVehicle)}>
                Transfer ownership
              </Button>
            </div>
          )
        }
      >
        {selectedVehicle && (
          <VehicleDetailPanel vehicle={selectedVehicle} lookups={lookups} />
        )}
      </Modal>

      <Modal
        open={modalMode === 'create' || modalMode === 'edit'}
        onClose={closeModal}
        title={modalMode === 'edit' ? `Edit vehicle #${selectedVehicle?.vehicleId ?? ''}` : 'New vehicle'}
        description="Register a fleet record with plate, model, type, and VIN."
        size="lg"
      >
        <VehicleForm
          mode={modalMode === 'edit' ? 'edit' : 'create'}
          initialVehicle={modalMode === 'edit' ? selectedVehicle : null}
          lookups={lookups}
          onSubmit={handleSaveVehicle}
          onCancel={closeModal}
        />
      </Modal>

      {selectedVehicle && (
        <TransferOwnershipModal
          open={modalMode === 'transfer'}
          vehicleId={selectedVehicle.vehicleId}
          onClose={closeModal}
          onSubmit={handleTransfer}
        />
      )}

      <ConfirmActionModal
        open={pendingDelete !== null}
        onClose={() => setPendingDelete(null)}
        onConfirm={() => void handleDelete()}
        title="Delete vehicle"
        description={`Delete vehicle #${pendingDelete?.vehicleId ?? ''}? Related service history may block deletion.`}
        confirmLabel="Delete vehicle"
        isLoading={actionLoading}
      />
    </div>
  );
}
