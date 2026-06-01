import { useCallback, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react';
import { getErrorMessage } from '@/api/apiError';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingState } from '@/components/feedback/LoadingState';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { personsAdminApi } from '@/features/admin/customers/api/persons.api';
import { CustomerDetailPanel } from '@/features/admin/customers/components/CustomerDetailPanel';
import { CustomerForm } from '@/features/admin/customers/components/CustomerForm';
import {
  CustomerServiceOrdersPanel,
  CustomerVehiclesPanel,
} from '@/features/admin/customers/components/CustomerVehiclesPanel';
import { usePersonCatalogLookups } from '@/features/admin/customers/hooks/usePersonCatalogLookups';
import type { UpdatePersonRequest } from '@/features/admin/customers/types/persons.types';
import { AdminPageHeader } from '@/features/admin/components/AdminPageHeader';
import { ConfirmActionModal } from '@/features/admin/components/ConfirmActionModal';
import { formatPersonFullName } from '@/features/admin/types/persons.types';
import { useAsyncRequest } from '@/hooks/useAsyncRequest';
import { ROUTES } from '@/routes/routePaths';

export function CustomerDetailPage() {
  const navigate = useNavigate();
  const { personId: personIdParam } = useParams();
  const personId = Number(personIdParam);
  const isValidId = Number.isFinite(personId) && personId > 0;

  const { lookups, isLoading: catalogsLoading } = usePersonCatalogLookups();
  const [editOpen, setEditOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const loadPerson = useCallback(() => {
    if (!isValidId) {
      return Promise.reject(new Error('Invalid customer ID'));
    }
    return personsAdminApi.getById(personId);
  }, [isValidId, personId]);

  const {
    data: person,
    isLoading,
    error,
    retry,
  } = useAsyncRequest(loadPerson, [personId, refreshKey]);

  const handleUpdate = async (payload: UpdatePersonRequest) => {
    await personsAdminApi.update(personId, payload);
    setSuccessMessage('Customer updated successfully.');
    setEditOpen(false);
    setRefreshKey((value) => value + 1);
  };

  const handleDelete = async () => {
    setActionLoading(true);
    setActionError(null);

    try {
      await personsAdminApi.delete(personId);
      navigate(ROUTES.ADMIN_CLIENTS);
    } catch (err) {
      setActionError(getErrorMessage(err));
    } finally {
      setActionLoading(false);
      setPendingDelete(false);
    }
  };

  if (!isValidId) {
    return (
      <ErrorState
        title="Invalid customer"
        message="The customer ID in the URL is not valid."
        onRetry={() => navigate(ROUTES.ADMIN_CLIENTS)}
      />
    );
  }

  if (isLoading || catalogsLoading) {
    return (
      <LoadingState
        title="Loading customer"
        description="Fetching person record and related data…"
        className="min-h-[320px]"
      />
    );
  }

  if (error || !person) {
    return (
      <ErrorState
        title="Unable to load customer"
        message={error ?? 'Customer not found.'}
        onRetry={retry}
      />
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <Link
          to={ROUTES.ADMIN_CLIENTS}
          className="inline-flex items-center gap-2 text-sm text-text-secondary transition hover:text-text-primary"
        >
          <ArrowLeft className="size-4" />
          Back to customers
        </Link>
      </div>

      <AdminPageHeader
        title={formatPersonFullName(person)}
        description={`Customer person record #${person.personId}`}
        actions={
          <>
            <Button
              variant="secondary"
              leftIcon={<Pencil className="size-4" />}
              onClick={() => setEditOpen(true)}
            >
              Edit
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
        <CustomerDetailPanel person={person} lookups={lookups} />
      </section>

      <section className="rounded-lg border border-border bg-bg-surface p-5">
        <CustomerVehiclesPanel personId={personId} refreshKey={refreshKey} />
      </section>

      <section className="rounded-lg border border-border bg-bg-surface p-5">
        <CustomerServiceOrdersPanel personId={personId} refreshKey={refreshKey} />
      </section>

      <Modal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title="Edit customer"
        description="Update person identity fields."
        size="md"
      >
        <CustomerForm
          mode="edit"
          initialPerson={person}
          onSubmit={handleUpdate}
          onCancel={() => setEditOpen(false)}
        />
      </Modal>

      <ConfirmActionModal
        open={pendingDelete}
        onClose={() => setPendingDelete(false)}
        onConfirm={() => void handleDelete()}
        title="Delete customer"
        description={`Delete ${formatPersonFullName(person)}? This may fail if related records exist.`}
        confirmLabel="Delete customer"
        isLoading={actionLoading}
      />
    </div>
  );
}
