import { useCallback, useMemo, useState } from 'react';
import { PackagePlus, Pencil, Plus, SlidersHorizontal, Trash2 } from 'lucide-react';
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
import { inventoryApi } from '@/features/admin/inventory/api/inventory.api';
import { partsApi } from '@/features/admin/inventory/api/parts.api';
import { AdjustStockModal } from '@/features/admin/inventory/components/AdjustStockModal';
import { InventorySummaryCards } from '@/features/admin/inventory/components/InventorySummaryCards';
import { LowStockPanel } from '@/features/admin/inventory/components/LowStockPanel';
import { PartForm } from '@/features/admin/inventory/components/PartForm';
import {
  formatPartBrandLabel,
  formatPartCategoryLabel,
  useInventoryLookups,
} from '@/features/admin/inventory/hooks/useInventoryLookups';
import type { LowStockPartDto } from '@/features/admin/inventory/types/inventory.types';
import { getStockLevel } from '@/features/admin/inventory/types/inventory.types';
import type {
  CreatePartRequest,
  PartDto,
  UpdatePartRequest,
} from '@/features/admin/inventory/types/parts.types';
import { useAsyncRequest } from '@/hooks/useAsyncRequest';
import { formatCurrency, formatNumber } from '@/utils/format';

type PartModalMode = 'create' | 'edit' | null;

function partMatchesSearch(
  part: PartDto,
  term: string,
  categoryLabel: string,
  brandLabel: string,
): boolean {
  const status = part.isActive ? 'active' : 'inactive';
  const haystack = [
    String(part.partId),
    part.code,
    part.description,
    categoryLabel,
    brandLabel,
    status,
    String(part.stock),
    String(part.minimumStock),
  ]
    .join(' ')
    .toLowerCase();

  return haystack.includes(term);
}

export function InventoryPage() {
  const { lookups, isLoading: catalogsLoading } = useInventoryLookups();

  const [searchTerm, setSearchTerm] = useState('');
  const [partModalMode, setPartModalMode] = useState<PartModalMode>(null);
  const [selectedPart, setSelectedPart] = useState<PartDto | null>(null);
  const [pendingDelete, setPendingDelete] = useState<PartDto | null>(null);
  const [adjustPart, setAdjustPart] = useState<PartDto | LowStockPartDto | null>(
    null,
  );
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const loadSummary = useCallback(() => inventoryApi.getSummary(), []);
  const loadLowStock = useCallback(() => inventoryApi.getLowStock(), []);
  const loadParts = useCallback(() => partsApi.getAll(), []);

  const summaryRequest = useAsyncRequest(loadSummary, [refreshKey]);
  const lowStockRequest = useAsyncRequest(loadLowStock, [refreshKey]);
  const partsRequest = useAsyncRequest(loadParts, [refreshKey]);

  const refreshAll = () => setRefreshKey((value) => value + 1);

  const filteredParts = useMemo(
    () =>
      filterBySearchTerm(partsRequest.data ?? [], searchTerm, (part, term) =>
        partMatchesSearch(
          part,
          term,
          formatPartCategoryLabel(part.partCategoryId, lookups),
          formatPartBrandLabel(part.partBrandId, lookups),
        ),
      ),
    [partsRequest.data, searchTerm, lookups],
  );

  const pagination = useClientPagination(filteredParts);

  const openCreatePart = () => {
    setSelectedPart(null);
    setPartModalMode('create');
  };

  const openEditPart = (part: PartDto) => {
    setSelectedPart(part);
    setPartModalMode('edit');
  };

  const closePartModal = () => {
    setPartModalMode(null);
    setSelectedPart(null);
  };

  const handleSavePart = async (
    payload: CreatePartRequest | UpdatePartRequest,
  ) => {
    setActionLoading(true);
    setActionError(null);

    try {
      if (partModalMode === 'create') {
        await partsApi.create(payload as CreatePartRequest);
        setSuccessMessage('Part created successfully.');
      } else if (partModalMode === 'edit' && selectedPart) {
        await partsApi.update(selectedPart.partId, payload as UpdatePartRequest);
        setSuccessMessage(`Part ${selectedPart.code} updated.`);
      }
      closePartModal();
      refreshAll();
    } catch (err) {
      setActionError(getErrorMessage(err));
      throw err;
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeletePart = async () => {
    if (!pendingDelete) return;

    setActionLoading(true);
    setActionError(null);

    try {
      await partsApi.delete(pendingDelete.partId);
      setSuccessMessage(`Part ${pendingDelete.code} deleted.`);
      setPendingDelete(null);
      refreshAll();
    } catch (err) {
      setActionError(getErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <AdminPageHeader
        title="Inventory"
        description="Monitor stock levels, manage the parts catalog, and adjust on-hand quantities."
        actions={
          <Button leftIcon={<Plus className="size-4" />} onClick={openCreatePart}>
            New part
          </Button>
        }
      />

      {successMessage && (
        <div
          className="rounded-lg border border-success/30 bg-success-muted px-4 py-3 text-sm text-success"
          role="status"
        >
          {successMessage}
        </div>
      )}

      {actionError && (
        <div
          className="rounded-lg border border-danger/30 bg-danger-muted px-4 py-3 text-sm text-danger"
          role="alert"
        >
          {actionError}
        </div>
      )}

      <InventorySummaryCards
        summary={summaryRequest.data}
        isLoading={summaryRequest.isLoading}
        error={summaryRequest.error}
        onRetry={summaryRequest.retry}
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <section className="flex min-w-0 flex-col gap-4">
          <AdminToolbar
            searchValue={searchTerm}
            onSearchChange={setSearchTerm}
            searchPlaceholder="Search by code, description, category…"
            summary={
              <p className="text-xs text-text-muted">
                {filteredParts.length} part{filteredParts.length === 1 ? '' : 's'}
                {catalogsLoading ? ' · loading catalogs…' : ''}
              </p>
            }
          />

          <AdminDataTable
            columns={[
              {
                id: 'code',
                header: 'Code',
                cell: (row) => (
                  <span className="font-medium text-text-primary">{row.code}</span>
                ),
              },
              {
                id: 'description',
                header: 'Description',
                cell: (row) => row.description,
              },
              {
                id: 'category',
                header: 'Category',
                cell: (row) =>
                  formatPartCategoryLabel(row.partCategoryId, lookups),
              },
              {
                id: 'stock',
                header: 'Stock',
                cell: (row) => {
                  const level = getStockLevel(row.stock, row.minimumStock);
                  return (
                    <div className="flex flex-wrap items-center gap-2">
                      <span>{formatNumber(row.stock)}</span>
                      {level === 'low' && (
                        <Badge variant="pending" dot>
                          Low
                        </Badge>
                      )}
                      {level === 'out' && (
                        <Badge variant="low-stock" dot>
                          Out
                        </Badge>
                      )}
                    </div>
                  );
                },
              },
              {
                id: 'minimum',
                header: 'Min',
                className: 'w-16',
                cell: (row) => formatNumber(row.minimumStock),
              },
              {
                id: 'price',
                header: 'Unit price',
                cell: (row) => formatCurrency(row.unitPrice),
              },
              {
                id: 'status',
                header: 'Status',
                cell: (row) => (
                  <Badge variant={row.isActive ? 'active' : 'cancelled'}>
                    {row.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                ),
              },
              {
                id: 'actions',
                header: '',
                className: 'w-36 text-right',
                cell: (row) => (
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setAdjustPart(row)}
                      aria-label={`Adjust stock for ${row.code}`}
                    >
                      <SlidersHorizontal className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditPart(row)}
                      aria-label={`Edit ${row.code}`}
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setPendingDelete(row)}
                      aria-label={`Delete ${row.code}`}
                    >
                      <Trash2 className="size-4 text-danger" />
                    </Button>
                  </div>
                ),
              },
            ]}
            data={pagination.items}
            rowKey={(row) => row.partId}
            isLoading={partsRequest.isLoading || catalogsLoading}
            error={partsRequest.error}
            onRetry={partsRequest.retry}
            emptyTitle="No parts in catalog"
            emptyDescription="Create your first spare part to start tracking inventory."
            emptyAction={
              <Button
                variant="secondary"
                leftIcon={<PackagePlus className="size-4" />}
                onClick={openCreatePart}
              >
                Create part
              </Button>
            }
            page={pagination.page}
            totalPages={pagination.totalPages}
            totalCount={pagination.totalCount}
            onPageChange={pagination.setPage}
          />
        </section>

        <LowStockPanel
          parts={lowStockRequest.data}
          lookups={lookups}
          isLoading={lowStockRequest.isLoading}
          error={lowStockRequest.error}
          onRetry={lowStockRequest.retry}
          onAdjust={(part) => setAdjustPart(part)}
        />
      </div>

      <Modal
        open={partModalMode !== null}
        onClose={closePartModal}
        title={partModalMode === 'create' ? 'Create part' : 'Edit part'}
        size="lg"
      >
        {partModalMode && (
          <PartForm
            mode={partModalMode}
            part={selectedPart}
            lookups={lookups}
            isSubmitting={actionLoading}
            onSubmit={handleSavePart}
            onCancel={closePartModal}
          />
        )}
      </Modal>

      <AdjustStockModal
        open={adjustPart !== null}
        part={adjustPart}
        onClose={() => setAdjustPart(null)}
        onSuccess={(message) => {
          setSuccessMessage(message);
          refreshAll();
        }}
      />

      <ConfirmActionModal
        open={pendingDelete !== null}
        onClose={() => setPendingDelete(null)}
        onConfirm={handleDeletePart}
        title="Delete part"
        description={
          pendingDelete
            ? `Remove "${pendingDelete.code}" from the catalog? This cannot be undone if the part is referenced elsewhere.`
            : ''
        }
        confirmLabel="Delete"
        isLoading={actionLoading}
      />
    </div>
  );
}
