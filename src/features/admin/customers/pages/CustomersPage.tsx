import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Car,
  Eye,
  ExternalLink,
  Pencil,
  Plus,
  Trash2,
  UserPlus,
} from 'lucide-react';
import { getErrorMessage } from '@/api/apiError';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { customersApi } from '@/features/admin/customers/api/customers.api';
import { personsAdminApi } from '@/features/admin/customers/api/persons.api';
import { CreateClientWithVehicleForm } from '@/features/admin/customers/components/CreateClientWithVehicleForm';
import { CustomerDetailPanel } from '@/features/admin/customers/components/CustomerDetailPanel';
import { CustomerForm } from '@/features/admin/customers/components/CustomerForm';
import { CustomerSearchBox } from '@/features/admin/customers/components/CustomerSearchBox';
import {
  formatDocumentTypeLabel,
  usePersonCatalogLookups,
} from '@/features/admin/customers/hooks/usePersonCatalogLookups';
import type {
  CreatePersonRequest,
  UpdatePersonRequest,
} from '@/features/admin/customers/types/persons.types';
import type { ClientSearchResultDto } from '@/features/admin/customers/types/customers.types';
import { AdminDataTable } from '@/features/admin/components/AdminDataTable';
import { AdminPageHeader } from '@/features/admin/components/AdminPageHeader';
import { AdminToolbar } from '@/features/admin/components/AdminToolbar';
import { ConfirmActionModal } from '@/features/admin/components/ConfirmActionModal';
import {
  filterBySearchTerm,
  useClientPagination,
} from '@/features/admin/hooks/useClientPagination';
import type { PersonDto } from '@/features/admin/types/persons.types';
import {
  formatPersonFullName,
  personMatchesSearch,
} from '@/features/admin/types/persons.types';
import { useAsyncRequest } from '@/hooks/useAsyncRequest';
import { adminClientDetailPath } from '@/routes/routePaths';
import { formatDateTime } from '@/utils/format';

type CustomerModalMode = 'create' | 'edit' | 'view' | 'create-with-vehicle' | null;

export function CustomersPage() {
  const navigate = useNavigate();
  const { lookups, isLoading: catalogsLoading } = usePersonCatalogLookups();

  const [searchTerm, setSearchTerm] = useState('');
  const [modalMode, setModalMode] = useState<CustomerModalMode>(null);
  const [selectedPerson, setSelectedPerson] = useState<PersonDto | null>(null);
  const [pendingDelete, setPendingDelete] = useState<PersonDto | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const loadPersons = useCallback(() => personsAdminApi.getAll(), []);
  const {
    data: persons,
    isLoading,
    error,
    retry,
  } = useAsyncRequest(loadPersons, [refreshKey]);

  const filteredPersons = useMemo(
    () =>
      filterBySearchTerm(persons ?? [], searchTerm, (person, term) =>
        personMatchesSearch(person, term),
      ),
    [persons, searchTerm],
  );

  const pagination = useClientPagination(filteredPersons);

  const refreshAll = () => setRefreshKey((value) => value + 1);

  const openCreateModal = () => {
    setSelectedPerson(null);
    setModalMode('create');
  };

  const openCreateWithVehicleModal = () => {
    setModalMode('create-with-vehicle');
  };

  const openEditModal = (person: PersonDto) => {
    setSelectedPerson(person);
    setModalMode('edit');
  };

  const openViewModal = (person: PersonDto) => {
    setSelectedPerson(person);
    setModalMode('view');
  };

  const closeModal = () => {
    setModalMode(null);
    setSelectedPerson(null);
  };

  const handleCreateOrUpdate = async (
    payload: CreatePersonRequest | UpdatePersonRequest,
  ) => {
    if (modalMode === 'create') {
      await personsAdminApi.create(payload as CreatePersonRequest);
      setSuccessMessage('Customer created successfully.');
    } else if (modalMode === 'edit' && selectedPerson) {
      await personsAdminApi.update(selectedPerson.personId, payload as UpdatePersonRequest);
      setSuccessMessage('Customer updated successfully.');
    }

    closeModal();
    refreshAll();
  };

  const handleCreateWithVehicle = async (
    payload: Parameters<typeof customersApi.createClientWithVehicle>[0],
  ) => {
    const response = await customersApi.createClientWithVehicle(payload);
    setSuccessMessage(
      `Customer ${response.data.fullName} and vehicle #${response.data.vehicleId} created successfully.`,
    );
    closeModal();
    refreshAll();
  };

  const handleDelete = async () => {
    if (!pendingDelete) return;

    setActionLoading(true);
    setActionError(null);

    try {
      await personsAdminApi.delete(pendingDelete.personId);
      setSuccessMessage('Customer deleted successfully.');
      setPendingDelete(null);
      refreshAll();
    } catch (err) {
      setSuccessMessage(null);
      setActionError(getErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
  };

  const handleSearchSelect = (result: ClientSearchResultDto) => {
    const matchedPerson = (persons ?? []).find(
      (person) => person.personId === result.personId,
    );

    if (matchedPerson) {
      navigate(adminClientDetailPath(matchedPerson.personId));
      return;
    }

    setSearchTerm(result.fullName);
  };

  const columns = useMemo(
    () => [
      {
        id: 'personId',
        header: 'ID',
        cell: (person: PersonDto) => (
          <span className="font-medium text-text-primary">#{person.personId}</span>
        ),
      },
      {
        id: 'name',
        header: 'Customer',
        cell: (person: PersonDto) => (
          <div>
            <p className="font-medium text-text-primary">{formatPersonFullName(person)}</p>
            <p className="text-xs text-text-secondary">Doc {person.documentNumber}</p>
          </div>
        ),
      },
      {
        id: 'documentType',
        header: 'Document type',
        cell: (person: PersonDto) =>
          formatDocumentTypeLabel(person.documentTypeId, lookups),
      },
      {
        id: 'createdAt',
        header: 'Registered',
        cell: (person: PersonDto) => formatDateTime(person.createdAt),
      },
      {
        id: 'actions',
        header: 'Actions',
        className: 'text-right',
        cell: (person: PersonDto) => (
          <div className="flex justify-end gap-1">
            <Button
              variant="ghost"
              size="sm"
              aria-label={`Open customer ${person.personId}`}
              onClick={() => navigate(adminClientDetailPath(person.personId))}
            >
              <ExternalLink className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              aria-label={`View customer ${person.personId}`}
              onClick={() => openViewModal(person)}
            >
              <Eye className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              aria-label={`Edit customer ${person.personId}`}
              onClick={() => openEditModal(person)}
            >
              <Pencil className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              aria-label={`Delete customer ${person.personId}`}
              onClick={() => setPendingDelete(person)}
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
        title="Customers"
        description="Manage workshop customers as person records. Create identity data, onboard customers with an initial vehicle, and review linked vehicles and service order summaries."
        actions={
          <>
            <Button
              variant="secondary"
              leftIcon={<Car className="size-4" />}
              onClick={openCreateWithVehicleModal}
            >
              Customer + vehicle
            </Button>
            <Button leftIcon={<Plus className="size-4" />} onClick={openCreateModal}>
              New customer
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

      <CustomerSearchBox onSelect={handleSearchSelect} />

      <AdminToolbar
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Filter loaded customers by name, document, or ID…"
        summary={
          <p className="text-xs text-text-secondary">
            {filteredPersons.length} customer{filteredPersons.length === 1 ? '' : 's'} shown
          </p>
        }
      />

      <AdminDataTable
        columns={columns}
        data={pagination.items}
        rowKey={(person) => person.personId}
        isLoading={isLoading || catalogsLoading}
        error={error}
        onRetry={retry}
        emptyTitle="No customers yet"
        emptyDescription="Register your first customer or onboard a customer with an initial vehicle."
        emptyAction={
          <div className="flex flex-wrap justify-center gap-2">
            <Button size="sm" leftIcon={<UserPlus className="size-4" />} onClick={openCreateModal}>
              New customer
            </Button>
            <Button
              size="sm"
              variant="secondary"
              leftIcon={<Car className="size-4" />}
              onClick={openCreateWithVehicleModal}
            >
              Customer + vehicle
            </Button>
          </div>
        }
        page={pagination.page}
        totalPages={pagination.totalPages}
        totalCount={pagination.totalCount}
        onPageChange={pagination.setPage}
      />

      <Modal
        open={modalMode === 'create' || modalMode === 'edit'}
        onClose={closeModal}
        title={modalMode === 'create' ? 'Create customer' : 'Edit customer'}
        description="Person identity fields confirmed in api-contract.md §9 POST /api/persons."
        size="md"
      >
        <CustomerForm
          mode={modalMode === 'create' ? 'create' : 'edit'}
          initialPerson={selectedPerson}
          onSubmit={handleCreateOrUpdate}
          onCancel={closeModal}
        />
      </Modal>

      <Modal
        open={modalMode === 'view' && selectedPerson !== null}
        onClose={closeModal}
        title={selectedPerson ? formatPersonFullName(selectedPerson) : 'Customer'}
        description={`Person #${selectedPerson?.personId ?? ''}`}
        size="md"
        footer={
          selectedPerson && (
            <div className="flex flex-wrap gap-2">
              <Button
                variant="secondary"
                onClick={() => navigate(adminClientDetailPath(selectedPerson.personId))}
              >
                Open detail page
              </Button>
              <Button onClick={() => openEditModal(selectedPerson)}>Edit customer</Button>
            </div>
          )
        }
      >
        {selectedPerson && (
          <CustomerDetailPanel person={selectedPerson} lookups={lookups} />
        )}
      </Modal>

      <Modal
        open={modalMode === 'create-with-vehicle'}
        onClose={closeModal}
        title="Create customer with vehicle"
        description="Single-flow onboarding via POST /api/receptionist/create-client-with-vehicle."
        size="lg"
      >
        <CreateClientWithVehicleForm
          onSubmit={handleCreateWithVehicle}
          onCancel={closeModal}
        />
      </Modal>

      <ConfirmActionModal
        open={pendingDelete !== null}
        onClose={() => setPendingDelete(null)}
        onConfirm={() => void handleDelete()}
        title="Delete customer"
        description={`Delete ${pendingDelete ? formatPersonFullName(pendingDelete) : 'this customer'}? Linked vehicles and history may block deletion.`}
        confirmLabel="Delete customer"
        isLoading={actionLoading}
      />
    </div>
  );
}
