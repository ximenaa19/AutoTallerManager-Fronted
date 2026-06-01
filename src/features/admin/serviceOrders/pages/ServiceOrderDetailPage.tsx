import { useCallback, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { getErrorMessage } from '@/api/apiError';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingState } from '@/components/feedback/LoadingState';
import { CancelOrderModal } from '@/features/admin/serviceOrders/components/CancelOrderModal';
import { ChangeStatusModal } from '@/features/admin/serviceOrders/components/ChangeStatusModal';
import { CompleteOrderModal } from '@/features/admin/serviceOrders/components/CompleteOrderModal';
import { ServiceOrderActionsPanel } from '@/features/admin/serviceOrders/components/ServiceOrderActionsPanel';
import { ServiceOrderDetailHeader } from '@/features/admin/serviceOrders/components/ServiceOrderDetailHeader';
import { ServiceOrderHistoryPanel } from '@/features/admin/serviceOrders/components/ServiceOrderHistoryPanel';
import { ServiceOrderServicesPanel } from '@/features/admin/serviceOrders/components/ServiceOrderServicesPanel';
import { ServiceOrderSummaryPanel } from '@/features/admin/serviceOrders/components/ServiceOrderSummaryPanel';
import { VoidOrderModal } from '@/features/admin/serviceOrders/components/VoidOrderModal';
import { serviceOrdersApi } from '@/features/admin/serviceOrders/api/serviceOrders.api';
import { useWorkshopCatalogLookups } from '@/features/admin/serviceOrders/hooks/useWorkshopCatalogLookups';
import { vehiclesApi } from '@/features/admin/vehicles/api/vehicles.api';
import { useVehicleCatalogLookups } from '@/features/admin/vehicles/hooks/useVehicleCatalogLookups';
import { useAsyncRequest } from '@/hooks/useAsyncRequest';
import { ROUTES } from '@/routes/routePaths';

type ActionModal = 'changeStatus' | 'cancel' | 'void' | 'complete' | null;

export function ServiceOrderDetailPage() {
  const navigate = useNavigate();
  const { serviceOrderId: serviceOrderIdParam } = useParams();
  const serviceOrderId = Number(serviceOrderIdParam);
  const isValidId = Number.isFinite(serviceOrderId) && serviceOrderId > 0;

  const { lookups, isLoading: workshopCatalogsLoading } = useWorkshopCatalogLookups();
  const { lookups: vehicleLookups, isLoading: vehicleCatalogsLoading } =
    useVehicleCatalogLookups();

  const [actionModal, setActionModal] = useState<ActionModal>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const loadOrder = useCallback(() => {
    if (!isValidId) {
      return Promise.reject(new Error('Invalid service order ID'));
    }
    return serviceOrdersApi.getFullDetail(serviceOrderId);
  }, [isValidId, serviceOrderId]);

  const {
    data: order,
    isLoading,
    error,
    retry,
  } = useAsyncRequest(loadOrder, [serviceOrderId, refreshKey]);

  const vehicleId = order?.vehicleId;

  const loadVehicle = useCallback(() => {
    if (!vehicleId) {
      return Promise.resolve({ data: null });
    }
    return vehiclesApi.getById(vehicleId);
  }, [vehicleId]);

  const { data: vehicle } = useAsyncRequest(loadVehicle, [vehicleId, refreshKey]);

  const refreshOrder = () => setRefreshKey((value) => value + 1);

  const runWorkflowAction = async (action: () => Promise<unknown>, successText: string) => {
    setActionLoading(true);
    setActionError(null);

    try {
      await action();
      setSuccessMessage(successText);
      setActionModal(null);
      refreshOrder();
    } catch (err) {
      setActionError(getErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
  };

  if (!isValidId) {
    return (
      <ErrorState
        title="Invalid service order"
        message="The service order ID in the URL is not valid."
        onRetry={() => navigate(ROUTES.ADMIN_SERVICE_ORDERS)}
      />
    );
  }

  if (isLoading || workshopCatalogsLoading || vehicleCatalogsLoading) {
    return (
      <LoadingState
        title="Loading service order"
        description="Fetching order details…"
        className="min-h-[320px]"
      />
    );
  }

  if (error || !order) {
    return (
      <ErrorState
        title="Unable to load service order"
        message={error ?? 'Service order not found.'}
        onRetry={retry}
      />
    );
  }

  return (
    <div className="space-y-8">
      <Link
        to={ROUTES.ADMIN_SERVICE_ORDERS}
        className="inline-flex items-center gap-2 text-sm text-text-secondary transition hover:text-text-primary"
      >
        <ArrowLeft className="size-4" />
        Back to service orders
      </Link>

      <ServiceOrderDetailHeader
        order={order}
        vehicle={vehicle}
        lookups={lookups}
        vehicleLookups={vehicleLookups}
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

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          <ServiceOrderSummaryPanel order={order} lookups={lookups} />
          <ServiceOrderServicesPanel
            services={order.services}
            lookups={lookups}
            onRefresh={refreshOrder}
          />
          <ServiceOrderHistoryPanel />
        </div>

        <ServiceOrderActionsPanel
          order={order}
          onChangeStatus={() => setActionModal('changeStatus')}
          onCancel={() => setActionModal('cancel')}
          onVoid={() => setActionModal('void')}
          onComplete={() => setActionModal('complete')}
          isLoading={actionLoading}
        />
      </div>

      <ChangeStatusModal
        open={actionModal === 'changeStatus'}
        currentStatusId={order.orderStatusId}
        lookups={lookups}
        onClose={() => setActionModal(null)}
        onSubmit={(payload) =>
          runWorkflowAction(
            () => serviceOrdersApi.changeStatus(serviceOrderId, payload),
            'Order status updated.',
          )
        }
      />

      <CancelOrderModal
        open={actionModal === 'cancel'}
        serviceOrderId={serviceOrderId}
        onClose={() => setActionModal(null)}
        onSubmit={(payload) =>
          runWorkflowAction(
            () => serviceOrdersApi.cancel(serviceOrderId, payload),
            'Order cancelled.',
          )
        }
      />

      <VoidOrderModal
        open={actionModal === 'void'}
        serviceOrderId={serviceOrderId}
        onClose={() => setActionModal(null)}
        onSubmit={(payload) =>
          runWorkflowAction(
            () => serviceOrdersApi.void(serviceOrderId, payload),
            'Order voided.',
          )
        }
      />

      <CompleteOrderModal
        open={actionModal === 'complete'}
        serviceOrderId={serviceOrderId}
        onClose={() => setActionModal(null)}
        isLoading={actionLoading}
        onConfirm={() =>
          runWorkflowAction(
            () => serviceOrdersApi.complete(serviceOrderId),
            'Order marked as completed.',
          )
        }
      />
    </div>
  );
}
