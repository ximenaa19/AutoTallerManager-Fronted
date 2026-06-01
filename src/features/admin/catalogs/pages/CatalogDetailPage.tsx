import { useCallback, useMemo, useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { getErrorMessage } from '@/api/apiError';
import { Modal } from '@/components/ui/Modal';
import { catalogsAdminApi } from '@/features/admin/catalogs/api/catalogs.api';
import {
  catalogRecordMatchesSearch,
  getCatalogDefinition,
  getCatalogGroupDefinition,
  getCatalogRecordId,
} from '@/features/admin/catalogs/config/catalogDefinitions';
import { CatalogDeleteModal } from '@/features/admin/catalogs/components/CatalogDeleteModal';
import { CatalogForm } from '@/features/admin/catalogs/components/CatalogForm';
import { CatalogLayout } from '@/features/admin/catalogs/components/CatalogLayout';
import { CatalogSelectorNav } from '@/features/admin/catalogs/components/CatalogList';
import { CatalogTable } from '@/features/admin/catalogs/components/CatalogTable';
import { AdminPageHeader } from '@/features/admin/components/AdminPageHeader';
import { AdminToolbar } from '@/features/admin/components/AdminToolbar';
import {
  filterBySearchTerm,
  useClientPagination,
} from '@/features/admin/hooks/useClientPagination';
import type { CatalogRecord } from '@/features/admin/catalogs/types/catalogs.types';
import { useAsyncRequest } from '@/hooks/useAsyncRequest';
import { ROUTES } from '@/routes/routePaths';

type FormModalMode = 'create' | 'edit' | null;

interface CatalogDetailContentProps {
  definition: NonNullable<ReturnType<typeof getCatalogDefinition>>;
}

function CatalogDetailContent({ definition }: CatalogDetailContentProps) {

  const [search, setSearch] = useState('');
  const [formModalMode, setFormModalMode] = useState<FormModalMode>(null);
  const [selectedRecord, setSelectedRecord] = useState<CatalogRecord | null>(null);
  const [pendingDelete, setPendingDelete] = useState<CatalogRecord | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const loadRecords = useCallback(
    () => catalogsAdminApi.getAll(definition),
    [definition],
  );

  const {
    data: records,
    isLoading,
    error,
    retry,
  } = useAsyncRequest(loadRecords, [refreshKey, definition?.key]);

  const filteredRecords = useMemo(
    () =>
      filterBySearchTerm(records ?? [], search, (record, term) =>
        catalogRecordMatchesSearch(record, definition, term),
      ),
    [records, search, definition],
  );

  const pagination = useClientPagination(filteredRecords);

  const refresh = () => setRefreshKey((value) => value + 1);

  const group = getCatalogGroupDefinition(definition.group);

  const handleFormSubmit = async (payload: Record<string, unknown>) => {
    if (formModalMode === 'create') {
      await catalogsAdminApi.create(definition, payload);
      setSuccessMessage(`${definition.title} record created successfully.`);
    } else if (formModalMode === 'edit' && selectedRecord) {
      await catalogsAdminApi.update(
        definition,
        getCatalogRecordId(selectedRecord, definition),
        payload,
      );
      setSuccessMessage(`${definition.title} record updated successfully.`);
    }

    setFormModalMode(null);
    setSelectedRecord(null);
    refresh();
  };

  const handleConfirmDelete = async () => {
    if (!pendingDelete) return;

    setActionLoading(true);
    setActionError(null);
    try {
      await catalogsAdminApi.delete(
        definition,
        getCatalogRecordId(pendingDelete, definition),
      );
      setSuccessMessage(`${definition.title} record deleted successfully.`);
      setPendingDelete(null);
      refresh();
    } catch (err) {
      setActionError(getErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <CatalogLayout>
      <AdminPageHeader
        title={definition.title}
        description={definition.description}
      />

      <div className="flex flex-wrap items-center gap-2 text-xs text-text-secondary">
        <span>{group?.title ?? definition.group}</span>
        <span aria-hidden>·</span>
        <span className="font-mono">{definition.apiPath}</span>
      </div>

      {definition.readOnlyReason && (
        <div
          role="status"
          className="rounded-lg border border-warning/30 bg-warning-muted/30 px-4 py-3 text-sm text-warning"
        >
          {definition.readOnlyReason}
        </div>
      )}

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

      <CatalogSelectorNav />

      <AdminToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder={`Search ${definition.title.toLowerCase()}…`}
        summary={
          <p className="text-xs text-text-secondary">
            {filteredRecords.length} record{filteredRecords.length === 1 ? '' : 's'}
          </p>
        }
      />

      <CatalogTable
        definition={definition}
        records={pagination.items}
        isLoading={isLoading}
        error={error}
        onRetry={retry}
        onCreate={
          definition.operations.create
            ? () => {
                setSelectedRecord(null);
                setFormModalMode('create');
              }
            : undefined
        }
        onEdit={
          definition.operations.update
            ? (record) => {
                setSelectedRecord(record);
                setFormModalMode('edit');
              }
            : undefined
        }
        onDelete={
          definition.operations.delete
            ? (record) => setPendingDelete(record)
            : undefined
        }
        page={pagination.page}
        totalPages={pagination.totalPages}
        totalCount={pagination.totalCount}
        onPageChange={pagination.setPage}
      />

      <Modal
        open={formModalMode !== null}
        onClose={() => {
          setFormModalMode(null);
          setSelectedRecord(null);
        }}
        title={
          formModalMode === 'create'
            ? `Create ${definition.title.slice(0, -1)} record`
            : `Edit ${definition.title.slice(0, -1)} record`
        }
        description={`Changes apply to ${definition.apiPath}.`}
        size="sm"
      >
        <CatalogForm
          definition={definition}
          mode={formModalMode === 'create' ? 'create' : 'edit'}
          initialRecord={selectedRecord}
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setFormModalMode(null);
            setSelectedRecord(null);
          }}
        />
      </Modal>

      <CatalogDeleteModal
        open={pendingDelete !== null}
        definition={definition}
        record={pendingDelete}
        onClose={() => setPendingDelete(null)}
        onConfirm={() => void handleConfirmDelete()}
        isLoading={actionLoading}
      />
    </CatalogLayout>
  );
}

export function CatalogDetailPage() {
  const { catalogKey } = useParams<{ catalogKey: string }>();
  const definition = catalogKey ? getCatalogDefinition(catalogKey) : undefined;

  if (!catalogKey || !definition) {
    return <Navigate to={ROUTES.ADMIN_CATALOGS} replace />;
  }

  return <CatalogDetailContent definition={definition} />;
}
