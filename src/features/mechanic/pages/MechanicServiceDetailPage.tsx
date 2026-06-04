import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingState } from '@/components/feedback/LoadingState';
import { Button } from '@/components/ui/Button';
import { AdminPageHeader } from '@/features/admin/components/AdminPageHeader';
import { useWorkshopCatalogLookups } from '@/features/admin/serviceOrders/hooks/useWorkshopCatalogLookups';
import { MechanicEmptyState } from '@/features/mechanic/components/MechanicEmptyState';
import { MechanicServiceDetailPanel } from '@/features/mechanic/components/MechanicServiceDetailPanel';
import { MechanicPartRequestModal } from '@/features/mechanic/components/MechanicPartRequestModal';
import { MechanicWorkReportModal } from '@/features/mechanic/components/MechanicWorkReportModal';
import { mechanicPartRequestsApi } from '@/features/mechanic/api/mechanicPartRequests.api';
import { MechanicRequestedPartsSection } from '@/features/mechanic/components/MechanicRequestedPartsSection';
import { useMechanicServiceDetail } from '@/features/mechanic/hooks/useMechanicServiceDetail';
import { resolveServiceTypeName } from '@/features/mechanic/utils/mechanicEnrichedLabels';
import {
  mechanicRecordWorkPath,
  ROUTES,
} from '@/routes/routePaths';

interface LocationState {
  successMessage?: string;
}

export function MechanicServiceDetailPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { orderServiceId: orderServiceIdParam } = useParams<{ orderServiceId: string }>();
  const orderServiceId = Number(orderServiceIdParam);
  const isValidId = Number.isFinite(orderServiceId) && orderServiceId > 0;

  const [recordModalOpen, setRecordModalOpen] = useState(false);
  const [partRequestModalOpen, setPartRequestModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const locationState = location.state as LocationState | null;

  useEffect(() => {
    if (locationState?.successMessage) {
      setSuccessMessage(locationState.successMessage);
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location.pathname, locationState?.successMessage, navigate]);

  const {
    service,
    requestedParts,
    fullDetailNotice,
    isLoading,
    isLoadingParts,
    error,
    notFound,
    retry,
    refresh,
  } = useMechanicServiceDetail(orderServiceId, isValidId);

  const {
    lookups,
    isLoading: catalogsLoading,
    error: catalogsError,
    retry: retryCatalogs,
  } = useWorkshopCatalogLookups();

  if (!isValidId) {
    return (
      <div className="space-y-4">
        <ErrorState
          title="Invalid service"
          message="The order service ID in the URL is not valid."
        />
        <p className="text-center">
          <Link
            to={ROUTES.MECHANIC_ASSIGNED_SERVICES}
            className="text-sm font-medium text-accent hover:underline"
          >
            Back to assigned services
          </Link>
        </p>
      </div>
    );
  }

  if (isLoading || catalogsLoading) {
    return (
      <LoadingState
        title="Loading service detail"
        description="Fetching your assigned service from the workshop…"
        className="min-h-[420px]"
      />
    );
  }

  if (error) {
    return (
      <ErrorState
        title="Unable to load service"
        message={error}
        onRetry={retry}
      />
    );
  }

  if (catalogsError) {
    return (
      <ErrorState
        title="Unable to load service labels"
        message={catalogsError}
        onRetry={retryCatalogs}
      />
    );
  }

  if (notFound || !service) {
    return (
      <div className="space-y-6">
        <Link
          to={ROUTES.MECHANIC_ASSIGNED_SERVICES}
          className="inline-flex items-center gap-2 text-sm font-medium text-text-secondary hover:text-text-primary"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Assigned services
        </Link>
        <MechanicEmptyState
          title="Service not found in your assignments"
          description="This order service is not assigned to your account, or it may have been reassigned. Open Assigned Services to pick work allocated to you."
        />
      </div>
    );
  }

  const serviceTypeName = resolveServiceTypeName(
    service.serviceTypeId,
    service.serviceTypeName,
    lookups,
  );

  return (
    <div className="space-y-6">
      <Link
        to={ROUTES.MECHANIC_ASSIGNED_SERVICES}
        className="inline-flex items-center gap-2 text-sm font-medium text-text-secondary hover:text-text-primary"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Assigned services
      </Link>

      <AdminPageHeader
        title="Service detail"
        description={`${serviceTypeName} · Order service #${service.orderServiceId}`}
        actions={
          <Button
            type="button"
            onClick={() =>
              navigate(mechanicRecordWorkPath(service.orderServiceId))
            }
          >
            Record work
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

      <MechanicServiceDetailPanel
        service={service}
        lookups={lookups}
        onRecordWork={() => setRecordModalOpen(true)}
        onRequestPart={() => setPartRequestModalOpen(true)}
      />

      <MechanicRequestedPartsSection
        parts={requestedParts}
        isLoading={isLoadingParts}
        notice={fullDetailNotice}
        onPartsChanged={refresh}
      />

      <MechanicPartRequestModal
        open={partRequestModalOpen}
        orderServiceId={service.orderServiceId}
        serviceTypeLabel={serviceTypeName}
        onClose={() => setPartRequestModalOpen(false)}
        onSubmit={async (payload) => {
          await mechanicPartRequestsApi.requestPart(service.orderServiceId, payload);
          refresh();
          setSuccessMessage(
            'Part request submitted. Awaiting customer or staff approval.',
          );
        }}
      />

      <MechanicWorkReportModal
        open={recordModalOpen}
        service={service}
        lookups={lookups}
        onClose={() => setRecordModalOpen(false)}
        onSuccess={() => {
          refresh();
          setSuccessMessage('Work report saved successfully.');
        }}
      />
    </div>
  );
}
