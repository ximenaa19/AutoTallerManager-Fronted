import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingState } from '@/components/feedback/LoadingState';
import { AdminPageHeader } from '@/features/admin/components/AdminPageHeader';
import { useWorkshopCatalogLookups } from '@/features/admin/serviceOrders/hooks/useWorkshopCatalogLookups';
import { mechanicPartRequestsApi } from '@/features/mechanic/api/mechanicPartRequests.api';
import { MechanicEmptyState } from '@/features/mechanic/components/MechanicEmptyState';
import { MechanicPartRequestForm } from '@/features/mechanic/components/MechanicPartRequestForm';
import { MechanicServiceContextCard } from '@/features/mechanic/components/MechanicServiceContextCard';
import { useMechanicServiceDetail } from '@/features/mechanic/hooks/useMechanicServiceDetail';
import {
  mechanicServiceDetailPath,
  ROUTES,
} from '@/routes/routePaths';

export function MechanicRequestPartsWithServicePage() {
  const navigate = useNavigate();
  const { orderServiceId: orderServiceIdParam } = useParams<{ orderServiceId: string }>();
  const orderServiceId = Number(orderServiceIdParam);
  const isValidId = Number.isFinite(orderServiceId) && orderServiceId > 0;
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    service,
    isLoading,
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
        title="Loading part request"
        description="Fetching your assigned service…"
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
          title="Cannot request parts for this service"
          description="The order service is not in your current assignments. Part requests are only allowed for services assigned to your account."
        />
      </div>
    );
  }

  const serviceTypeName =
    lookups.serviceTypeNameById.get(service.serviceTypeId) ??
    `Service type #${service.serviceTypeId}`;

  return (
    <div className="space-y-6">
      <Link
        to={mechanicServiceDetailPath(service.orderServiceId)}
        className="inline-flex items-center gap-2 text-sm font-medium text-text-secondary hover:text-text-primary"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Service detail
      </Link>

      <AdminPageHeader
        title="Request spare parts"
        description={`${serviceTypeName} · Order service #${service.orderServiceId}`}
      />

      {successMessage && (
        <div
          role="status"
          className="rounded-lg border border-success/30 bg-success-muted/40 px-4 py-3 text-sm text-success"
        >
          {successMessage}
        </div>
      )}

      <MechanicServiceContextCard service={service} lookups={lookups} />

      <section className="rounded-lg border border-border bg-bg-surface p-5">
        <h3 className="text-base font-semibold text-text-primary">Part request</h3>
        <p className="mt-1 text-sm text-text-secondary">
          Search the workshop catalog and submit a quantity. Applied unit price defaults
          to the catalog price; customer approval is tracked separately.
        </p>
        <div className="mt-4">
          <MechanicPartRequestForm
            orderServiceId={service.orderServiceId}
            onSubmit={async (payload) => {
              await mechanicPartRequestsApi.requestPart(service.orderServiceId, payload);
              refresh();
              setSuccessMessage(
                'Part request submitted. Awaiting customer or staff approval.',
              );
            }}
            onCancel={() => navigate(mechanicServiceDetailPath(service.orderServiceId))}
          />
        </div>
      </section>
    </div>
  );
}
