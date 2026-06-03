import { useCallback, useMemo, useState } from 'react';
import {
  Ban,
  Eye,
  Pencil,
  Plus,
  ShoppingCart,
  Trash2,
  Truck,
} from 'lucide-react';
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
import { purchasesApi } from '@/features/admin/inventory/api/purchases.api';
import { suppliersApi } from '@/features/admin/inventory/api/suppliers.api';
import { CancelPurchaseModal } from '@/features/admin/inventory/components/CancelPurchaseModal';
import { PurchaseDetailsPanel } from '@/features/admin/inventory/components/PurchaseDetailsPanel';
import { PurchaseForm } from '@/features/admin/inventory/components/PurchaseForm';
import { RegisterPurchaseModal } from '@/features/admin/inventory/components/RegisterPurchaseModal';
import { SupplierForm } from '@/features/admin/inventory/components/SupplierForm';
import {
  formatSupplierLabel,
  useInventoryLookups,
} from '@/features/admin/inventory/hooks/useInventoryLookups';
import type {
  PartPurchaseDto,
  UpdatePartPurchaseRequest,
} from '@/features/admin/inventory/types/purchases.types';
import type {
  CreateSupplierRequest,
  SupplierDto,
  UpdateSupplierRequest,
} from '@/features/admin/inventory/types/suppliers.types';
import { useAsyncRequest } from '@/hooks/useAsyncRequest';
import { formatCurrency, formatDateTime } from '@/utils/format';
import { cn } from '@/lib/cn';

type PurchasesTab = 'purchases' | 'suppliers';
type SupplierModalMode = 'create' | 'edit' | null;

function isPurchaseCancelled(purchase: PartPurchaseDto): boolean {
  return purchase.isCancelled === true;
}

function purchaseMatchesSearch(
  purchase: PartPurchaseDto,
  term: string,
  supplierLabel: string,
): boolean {
  const dateLabel = formatDateTime(purchase.purchaseDate).toLowerCase();
  const statusLabel = isPurchaseCancelled(purchase) ? 'cancelled' : 'active';
  const haystack = [
    String(purchase.partPurchaseId),
    `#${purchase.partPurchaseId}`,
    supplierLabel,
    dateLabel,
    String(purchase.total),
    statusLabel,
    purchase.cancellationReason,
  ]
    .join(' ')
    .toLowerCase();

  return haystack.includes(term);
}

function supplierMatchesSearch(supplier: SupplierDto, term: string): boolean {
  const status = supplier.isActive ? 'active' : 'inactive';
  const haystack = [
    String(supplier.supplierId),
    supplier.name,
    supplier.taxId,
    supplier.phone,
    supplier.email,
    status,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  return haystack.includes(term);
}

export function PurchasesPage() {
  const { lookups, isLoading: catalogsLoading, retry: retryLookups } =
    useInventoryLookups({ loadParts: true });

  const [activeTab, setActiveTab] = useState<PurchasesTab>('purchases');
  const [searchTerm, setSearchTerm] = useState('');
  const [registerOpen, setRegisterOpen] = useState(false);
  const [viewPurchase, setViewPurchase] = useState<PartPurchaseDto | null>(null);
  const [editPurchase, setEditPurchase] = useState<PartPurchaseDto | null>(null);
  const [pendingDeletePurchase, setPendingDeletePurchase] =
    useState<PartPurchaseDto | null>(null);
  const [cancelPurchase, setCancelPurchase] = useState<PartPurchaseDto | null>(null);
  const [supplierModalMode, setSupplierModalMode] =
    useState<SupplierModalMode>(null);
  const [selectedSupplier, setSelectedSupplier] = useState<SupplierDto | null>(
    null,
  );
  const [pendingDeleteSupplier, setPendingDeleteSupplier] =
    useState<SupplierDto | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const loadPurchases = useCallback(() => purchasesApi.getAll(), []);
  const loadDetails = useCallback(() => purchasesApi.getAllDetails(), []);
  const loadSuppliers = useCallback(() => suppliersApi.getAll(), []);

  const purchasesRequest = useAsyncRequest(loadPurchases, [refreshKey]);
  const detailsRequest = useAsyncRequest(loadDetails, [refreshKey]);
  const suppliersRequest = useAsyncRequest(loadSuppliers, [refreshKey]);

  const refreshAll = () => {
    setRefreshKey((value) => value + 1);
    void retryLookups();
  };

  const detailsByPurchaseId = useMemo(() => {
    const map = new Map<
      number,
      NonNullable<typeof detailsRequest.data>
    >();
    for (const detail of detailsRequest.data ?? []) {
      const existing = map.get(detail.partPurchaseId) ?? [];
      map.set(detail.partPurchaseId, [...existing, detail]);
    }
    return map;
  }, [detailsRequest]);

  const filteredPurchases = useMemo(
    () =>
      filterBySearchTerm(purchasesRequest.data ?? [], searchTerm, (purchase, term) =>
        purchaseMatchesSearch(
          purchase,
          term,
          formatSupplierLabel(purchase.supplierId, lookups),
        ),
      ),
    [purchasesRequest.data, searchTerm, lookups],
  );

  const filteredSuppliers = useMemo(
    () =>
      filterBySearchTerm(suppliersRequest.data ?? [], searchTerm, (supplier, term) =>
        supplierMatchesSearch(supplier, term),
      ),
    [suppliersRequest.data, searchTerm],
  );

  const purchasesPagination = useClientPagination(filteredPurchases);
  const suppliersPagination = useClientPagination(filteredSuppliers);

  const viewPurchaseDetails = viewPurchase
    ? detailsByPurchaseId.get(viewPurchase.partPurchaseId) ?? []
    : [];

  const handleCancelPurchase = async (reason: string) => {
    if (!cancelPurchase) return;

    setActionLoading(true);
    setActionError(null);

    try {
      const response = await inventoryApi.cancelPurchase(cancelPurchase.partPurchaseId, {
        reason,
      });
      setSuccessMessage(
        response.data.message ||
          `Purchase #${cancelPurchase.partPurchaseId} cancelled.`,
      );
      setCancelPurchase(null);
      if (viewPurchase?.partPurchaseId === cancelPurchase.partPurchaseId) {
        setViewPurchase({
          ...viewPurchase,
          isCancelled: true,
          cancelledAt: response.data.cancelledAt,
          cancellationReason: response.data.cancellationReason,
          cancelledByUserId: response.data.cancelledByUserId,
        });
      }
      refreshAll();
    } catch (err) {
      setActionError(getErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeletePurchase = async () => {
    if (!pendingDeletePurchase) return;

    setActionLoading(true);
    setActionError(null);

    try {
      await purchasesApi.delete(pendingDeletePurchase.partPurchaseId);
      setSuccessMessage(
        `Purchase #${pendingDeletePurchase.partPurchaseId} deleted.`,
      );
      setPendingDeletePurchase(null);
      if (viewPurchase?.partPurchaseId === pendingDeletePurchase.partPurchaseId) {
        setViewPurchase(null);
      }
      refreshAll();
    } catch (err) {
      setActionError(getErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
  };

  const handleSavePurchaseHeader = async (payload: UpdatePartPurchaseRequest) => {
    if (!editPurchase) return;

    setActionLoading(true);
    setActionError(null);

    try {
      await purchasesApi.update(editPurchase.partPurchaseId, payload);
      setSuccessMessage(`Purchase #${editPurchase.partPurchaseId} updated.`);
      setEditPurchase(null);
      refreshAll();
    } catch (err) {
      setActionError(getErrorMessage(err));
      throw err;
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveSupplier = async (
    payload: CreateSupplierRequest | UpdateSupplierRequest,
  ) => {
    setActionLoading(true);
    setActionError(null);

    try {
      if (supplierModalMode === 'create') {
        await suppliersApi.create(payload as CreateSupplierRequest);
        setSuccessMessage('Supplier created successfully.');
      } else if (supplierModalMode === 'edit' && selectedSupplier) {
        await suppliersApi.update(
          selectedSupplier.supplierId,
          payload as UpdateSupplierRequest,
        );
        setSuccessMessage(`Supplier ${selectedSupplier.name} updated.`);
      }
      setSupplierModalMode(null);
      setSelectedSupplier(null);
      refreshAll();
    } catch (err) {
      setActionError(getErrorMessage(err));
      throw err;
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteSupplier = async () => {
    if (!pendingDeleteSupplier) return;

    setActionLoading(true);
    setActionError(null);

    try {
      await suppliersApi.delete(pendingDeleteSupplier.supplierId);
      setSuccessMessage(`Supplier ${pendingDeleteSupplier.name} deleted.`);
      setPendingDeleteSupplier(null);
      refreshAll();
    } catch (err) {
      setActionError(getErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
  };

  const tabButtonClass = (tab: PurchasesTab) =>
    cn(
      'rounded-lg px-4 py-2 text-sm font-medium transition-colors',
      activeTab === tab
        ? 'bg-accent-muted text-accent'
        : 'text-text-secondary hover:bg-bg-elevated hover:text-text-primary',
    );

  return (
    <div className="flex flex-col gap-8">
      <AdminPageHeader
        title="Purchases"
        description="Register incoming stock, review purchase history, and manage suppliers."
        actions={
          <Button
            leftIcon={<ShoppingCart className="size-4" />}
            onClick={() => setRegisterOpen(true)}
          >
            Register purchase
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

      <div className="flex flex-wrap gap-2 border-b border-border pb-4">
        <button
          type="button"
          className={tabButtonClass('purchases')}
          onClick={() => {
            setActiveTab('purchases');
            setSearchTerm('');
          }}
        >
          Purchase history
        </button>
        <button
          type="button"
          className={tabButtonClass('suppliers')}
          onClick={() => {
            setActiveTab('suppliers');
            setSearchTerm('');
          }}
        >
          Suppliers
        </button>
      </div>

      {activeTab === 'purchases' && (
        <>
          <AdminToolbar
            searchValue={searchTerm}
            onSearchChange={setSearchTerm}
            searchPlaceholder="Search by purchase ID, supplier, date…"
            summary={
              <p className="text-xs text-text-muted">
                {filteredPurchases.length} purchase
                {filteredPurchases.length === 1 ? '' : 's'}
              </p>
            }
          />

          <AdminDataTable
            columns={[
              {
                id: 'id',
                header: 'ID',
                className: 'w-20',
                cell: (row) => `#${row.partPurchaseId}`,
              },
              {
                id: 'supplier',
                header: 'Supplier',
                cell: (row) =>
                  formatSupplierLabel(row.supplierId, lookups),
              },
              {
                id: 'date',
                header: 'Date',
                cell: (row) => formatDateTime(row.purchaseDate),
              },
              {
                id: 'total',
                header: 'Total',
                cell: (row) => formatCurrency(row.total),
              },
              {
                id: 'status',
                header: 'Status',
                cell: (row) =>
                  isPurchaseCancelled(row) ? (
                    <Badge variant="cancelled" dot>
                      Cancelled
                    </Badge>
                  ) : (
                    <Badge variant="active" dot>
                      Active
                    </Badge>
                  ),
              },
              {
                id: 'lines',
                header: 'Lines',
                className: 'w-20',
                cell: (row) =>
                  detailsByPurchaseId.get(row.partPurchaseId)?.length ?? '—',
              },
              {
                id: 'actions',
                header: '',
                className: 'w-40 text-right',
                cell: (row) => {
                  const cancelled = isPurchaseCancelled(row);
                  return (
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setViewPurchase(row)}
                        aria-label={`View purchase ${row.partPurchaseId}`}
                      >
                        <Eye className="size-4" />
                      </Button>
                      {!cancelled && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setCancelPurchase(row)}
                            aria-label={`Cancel purchase ${row.partPurchaseId}`}
                          >
                            <Ban className="size-4 text-danger" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditPurchase(row)}
                            aria-label={`Edit purchase ${row.partPurchaseId}`}
                          >
                            <Pencil className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setPendingDeletePurchase(row)}
                            aria-label={`Delete purchase ${row.partPurchaseId}`}
                          >
                            <Trash2 className="size-4 text-danger" />
                          </Button>
                        </>
                      )}
                    </div>
                  );
                },
              },
            ]}
            data={purchasesPagination.items}
            rowKey={(row) => row.partPurchaseId}
            isLoading={purchasesRequest.isLoading || catalogsLoading}
            error={purchasesRequest.error}
            onRetry={purchasesRequest.retry}
            emptyTitle="No purchases yet"
            emptyDescription="Register a purchase to record incoming stock from suppliers."
            emptyAction={
              <Button
                variant="secondary"
                leftIcon={<ShoppingCart className="size-4" />}
                onClick={() => setRegisterOpen(true)}
              >
                Register purchase
              </Button>
            }
            page={purchasesPagination.page}
            totalPages={purchasesPagination.totalPages}
            totalCount={purchasesPagination.totalCount}
            onPageChange={purchasesPagination.setPage}
          />
        </>
      )}

      {activeTab === 'suppliers' && (
        <>
          <AdminToolbar
            searchValue={searchTerm}
            onSearchChange={setSearchTerm}
            searchPlaceholder="Search suppliers…"
            actions={
              <Button
                leftIcon={<Plus className="size-4" />}
                onClick={() => {
                  setSelectedSupplier(null);
                  setSupplierModalMode('create');
                }}
              >
                New supplier
              </Button>
            }
            summary={
              <p className="text-xs text-text-muted">
                {filteredSuppliers.length} supplier
                {filteredSuppliers.length === 1 ? '' : 's'}
              </p>
            }
          />

          <AdminDataTable
            columns={[
              {
                id: 'name',
                header: 'Name',
                cell: (row) => (
                  <span className="font-medium text-text-primary">{row.name}</span>
                ),
              },
              {
                id: 'taxId',
                header: 'Tax ID',
                cell: (row) => row.taxId ?? '—',
              },
              {
                id: 'phone',
                header: 'Phone',
                cell: (row) => row.phone ?? '—',
              },
              {
                id: 'email',
                header: 'Email',
                cell: (row) => row.email ?? '—',
              },
              {
                id: 'status',
                header: 'Status',
                cell: (row) => (
                  <span
                    className={cn(
                      'text-xs font-semibold',
                      row.isActive ? 'text-success' : 'text-text-muted',
                    )}
                  >
                    {row.isActive ? 'Active' : 'Inactive'}
                  </span>
                ),
              },
              {
                id: 'actions',
                header: '',
                className: 'w-28 text-right',
                cell: (row) => (
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedSupplier(row);
                        setSupplierModalMode('edit');
                      }}
                      aria-label={`Edit ${row.name}`}
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setPendingDeleteSupplier(row)}
                      aria-label={`Delete ${row.name}`}
                    >
                      <Trash2 className="size-4 text-danger" />
                    </Button>
                  </div>
                ),
              },
            ]}
            data={suppliersPagination.items}
            rowKey={(row) => row.supplierId}
            isLoading={suppliersRequest.isLoading}
            error={suppliersRequest.error}
            onRetry={suppliersRequest.retry}
            emptyTitle="No suppliers"
            emptyDescription="Add suppliers used for spare parts purchases."
            emptyAction={
              <Button
                variant="secondary"
                leftIcon={<Truck className="size-4" />}
                onClick={() => {
                  setSelectedSupplier(null);
                  setSupplierModalMode('create');
                }}
              >
                Create supplier
              </Button>
            }
            page={suppliersPagination.page}
            totalPages={suppliersPagination.totalPages}
            totalCount={suppliersPagination.totalCount}
            onPageChange={suppliersPagination.setPage}
          />
        </>
      )}

      <RegisterPurchaseModal
        open={registerOpen}
        lookups={lookups}
        onClose={() => setRegisterOpen(false)}
        onSuccess={(message) => {
          setSuccessMessage(message);
          refreshAll();
        }}
      />

      <Modal
        open={viewPurchase !== null}
        onClose={() => setViewPurchase(null)}
        title={
          viewPurchase
            ? `Purchase #${viewPurchase.partPurchaseId}`
            : 'Purchase detail'
        }
        description={
          viewPurchase
            ? `${formatSupplierLabel(viewPurchase.supplierId, lookups)} · ${formatDateTime(viewPurchase.purchaseDate)} · ${formatCurrency(viewPurchase.total)}`
            : undefined
        }
        size="lg"
      >
        {viewPurchase && (
          <div className="space-y-4">
            {isPurchaseCancelled(viewPurchase) && (
              <div className="rounded-lg border border-danger/30 bg-danger-muted/20 px-4 py-3 text-sm">
                <p className="font-medium text-danger">This purchase is cancelled</p>
                {viewPurchase.cancelledAt && (
                  <p className="mt-1 text-text-secondary">
                    Cancelled at {formatDateTime(viewPurchase.cancelledAt)}
                  </p>
                )}
                {viewPurchase.cancellationReason && (
                  <p className="mt-1 text-text-primary">
                    Reason: {viewPurchase.cancellationReason}
                  </p>
                )}
                {viewPurchase.cancelledByUserId != null && (
                  <p className="mt-1 text-text-muted">
                    Cancelled by user #{viewPurchase.cancelledByUserId}
                  </p>
                )}
                <p className="mt-2 text-xs text-text-muted">
                  Cancelled purchases cannot be edited, deleted, or modified.
                </p>
              </div>
            )}
            <PurchaseDetailsPanel
              details={viewPurchaseDetails}
              lookups={lookups}
              isLoading={detailsRequest.isLoading}
              error={detailsRequest.error}
              onRetry={detailsRequest.retry}
            />
          </div>
        )}
      </Modal>

      <Modal
        open={editPurchase !== null}
        onClose={() => setEditPurchase(null)}
        title={
          editPurchase ? `Edit purchase #${editPurchase.partPurchaseId}` : 'Edit purchase'
        }
        size="md"
      >
        {editPurchase && (
          <PurchaseForm
            purchase={editPurchase}
            lookups={lookups}
            isSubmitting={actionLoading}
            onSubmit={handleSavePurchaseHeader}
            onCancel={() => setEditPurchase(null)}
          />
        )}
      </Modal>

      <Modal
        open={supplierModalMode !== null}
        onClose={() => {
          setSupplierModalMode(null);
          setSelectedSupplier(null);
        }}
        title={supplierModalMode === 'create' ? 'Create supplier' : 'Edit supplier'}
        size="md"
      >
        {supplierModalMode && (
          <SupplierForm
            mode={supplierModalMode}
            supplier={selectedSupplier}
            isSubmitting={actionLoading}
            onSubmit={handleSaveSupplier}
            onCancel={() => {
              setSupplierModalMode(null);
              setSelectedSupplier(null);
            }}
          />
        )}
      </Modal>

      <CancelPurchaseModal
        open={cancelPurchase !== null}
        purchaseId={cancelPurchase?.partPurchaseId ?? 0}
        isLoading={actionLoading}
        onClose={() => setCancelPurchase(null)}
        onConfirm={handleCancelPurchase}
      />

      <ConfirmActionModal
        open={pendingDeletePurchase !== null}
        onClose={() => setPendingDeletePurchase(null)}
        onConfirm={handleDeletePurchase}
        title="Delete purchase"
        description={
          pendingDeletePurchase
            ? `Delete purchase #${pendingDeletePurchase.partPurchaseId}? Related stock movements may be affected.`
            : ''
        }
        confirmLabel="Delete"
        isLoading={actionLoading}
      />

      <ConfirmActionModal
        open={pendingDeleteSupplier !== null}
        onClose={() => setPendingDeleteSupplier(null)}
        onConfirm={handleDeleteSupplier}
        title="Delete supplier"
        description={
          pendingDeleteSupplier
            ? `Remove supplier "${pendingDeleteSupplier.name}"?`
            : ''
        }
        confirmLabel="Delete"
        isLoading={actionLoading}
      />
    </div>
  );
}
