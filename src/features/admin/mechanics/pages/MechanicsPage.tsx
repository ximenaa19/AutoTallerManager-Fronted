import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { AdminPageHeader } from '@/features/admin/components/AdminPageHeader';
import { AdminToolbar } from '@/features/admin/components/AdminToolbar';
import { MechanicDetailPanel } from '@/features/admin/mechanics/components/MechanicDetailPanel';
import { MechanicSearchBox } from '@/features/admin/mechanics/components/MechanicSearchBox';
import { MechanicSpecialtiesModal } from '@/features/admin/mechanics/components/MechanicSpecialtiesModal';
import { MechanicsTable } from '@/features/admin/mechanics/components/MechanicsTable';
import { MechanicWorkloadPanel } from '@/features/admin/mechanics/components/MechanicWorkloadPanel';
import { useMechanicDetail } from '@/features/admin/mechanics/hooks/useMechanicDetail';
import { useMechanicsData } from '@/features/admin/mechanics/hooks/useMechanicsData';
import type { MechanicRosterItem } from '@/features/admin/mechanics/types/mechanics.types';
import { mechanicRosterMatchesSearch } from '@/features/admin/mechanics/types/mechanics.types';
import {
  filterBySearchTerm,
  useClientPagination,
} from '@/features/admin/hooks/useClientPagination';
import { ROUTES } from '@/routes/routePaths';

type DetailModalMode = 'view' | 'specialties' | null;

export function MechanicsPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMechanic, setSelectedMechanic] = useState<MechanicRosterItem | null>(null);
  const [modalMode, setModalMode] = useState<DetailModalMode>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const { roster, specialtyCatalog, isLoading, error, retry } = useMechanicsData(refreshKey);

  const viewPersonId = modalMode === 'view' ? selectedMechanic?.personId ?? null : null;
  const {
    detail,
    workload,
    isLoading: detailLoading,
    error: detailError,
    retry: retryDetail,
  } = useMechanicDetail(viewPersonId, refreshKey);

  const filteredMechanics = useMemo(
    () =>
      filterBySearchTerm(roster, searchTerm, (mechanic, term) =>
        mechanicRosterMatchesSearch(mechanic, term),
      ),
    [roster, searchTerm],
  );

  const pagination = useClientPagination(filteredMechanics);

  const refreshAll = () => setRefreshKey((value) => value + 1);

  const openViewModal = (mechanic: MechanicRosterItem) => {
    setSelectedMechanic(mechanic);
    setModalMode('view');
  };

  const openSpecialtiesModal = (mechanic: MechanicRosterItem) => {
    setSelectedMechanic(mechanic);
    setModalMode('specialties');
  };

  const closeModal = () => {
    setModalMode(null);
    setSelectedMechanic(null);
  };

  const handleSearchSelect = (result: { personId: number; fullName: string }) => {
    const matched = roster.find((mechanic) => mechanic.personId === result.personId);
    if (matched) {
      openViewModal(matched);
      return;
    }

    setSearchTerm(result.fullName);
  };

  const handleSpecialtiesSaved = () => {
    setSuccessMessage('Mechanic specialties updated successfully.');
    refreshAll();
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Mechanics"
        description="Supervise workshop mechanics — review identity, specialties, account linkage, and current service assignments. Register new mechanics from Staff; manage login accounts from Users."
        actions={
          <Link to={ROUTES.ADMIN_STAFF}>
            <Button variant="secondary" leftIcon={<UserPlus className="size-4" />}>
              Register mechanic staff
            </Button>
          </Link>
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

      <div className="rounded-lg border border-border bg-bg-elevated/40 px-4 py-3 text-sm text-text-secondary">
        The roster loads from GET /api/admin/mechanics. Open a mechanic to fetch detail and
        workload from the aggregate admin endpoints. Quick search still uses GET
        /api/search/mechanics?term=.
      </div>

      <MechanicSearchBox onSelect={handleSearchSelect} />

      <AdminToolbar
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Filter mechanics by name, document, email, specialty, or counts…"
        summary={
          <p className="text-xs text-text-secondary">
            {filteredMechanics.length} mechanic{filteredMechanics.length === 1 ? '' : 's'} shown
          </p>
        }
      />

      <MechanicsTable
        mechanics={pagination.items}
        isLoading={isLoading}
        error={error}
        onRetry={retry}
        page={pagination.page}
        totalPages={pagination.totalPages}
        totalCount={pagination.totalCount}
        onPageChange={pagination.setPage}
        onView={openViewModal}
        onEditSpecialties={openSpecialtiesModal}
      />

      <Modal
        open={modalMode === 'view' && selectedMechanic !== null}
        onClose={closeModal}
        title={selectedMechanic?.fullName ?? 'Mechanic'}
        description={`Person #${selectedMechanic?.personId ?? ''}`}
        size="lg"
      >
        {selectedMechanic && (
          <div className="space-y-6">
            <MechanicDetailPanel
              mechanic={selectedMechanic}
              detail={detail}
              onEditSpecialties={() => openSpecialtiesModal(selectedMechanic)}
            />
            <MechanicWorkloadPanel
              workload={workload}
              activeOrders={detail?.activeOrders}
              isLoading={detailLoading}
              error={detailError}
              onRetry={retryDetail}
            />
          </div>
        )}
      </Modal>

      <MechanicSpecialtiesModal
        open={modalMode === 'specialties' && selectedMechanic !== null}
        mechanic={selectedMechanic}
        specialtyCatalog={specialtyCatalog}
        onClose={closeModal}
        onSaved={handleSpecialtiesSaved}
      />
    </div>
  );
}
