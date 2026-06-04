import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingState } from '@/components/feedback/LoadingState';
import { AdminPageHeader } from '@/features/admin/components/AdminPageHeader';
import { useWorkshopCatalogLookups } from '@/features/admin/serviceOrders/hooks/useWorkshopCatalogLookups';
import { MechanicEmptyState } from '@/features/mechanic/components/MechanicEmptyState';
import { MechanicServiceContextCard } from '@/features/mechanic/components/MechanicServiceContextCard';
import { MechanicWorkReportForm } from '@/features/mechanic/components/MechanicWorkReportForm';
import { useMechanicServiceDetail } from '@/features/mechanic/hooks/useMechanicServiceDetail';
import { resolveServiceTypeName } from '@/features/mechanic/utils/mechanicEnrichedLabels';
import {
  mechanicServiceDetailPath,
  ROUTES,
} from '@/routes/routePaths';

export function MechanicRecordWorkPage() {
  const navigate = useNavigate();
  const { orderServiceId: orderServiceIdParam } = useParams<{ orderServiceId: string }>();
  const orderServiceId = Number(orderServiceIdParam);
  const isValidId = Number.isFinite(orderServiceId) && orderServiceId > 0;

  const {
    service,
    isLoading,
    error,
    notFound,
    retry,
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
        title="Loading work report"
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
          title="Cannot record work for this service"
          description="The order service is not in your current assignments. You can only report work on services assigned to your account."
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
        to={mechanicServiceDetailPath(service.orderServiceId)}
        className="inline-flex items-center gap-2 text-sm font-medium text-text-secondary hover:text-text-primary"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Service detail
      </Link>

      <AdminPageHeader
        title="Record work performed"
        description={`${serviceTypeName} · Order service #${service.orderServiceId}`}
      />

      <MechanicServiceContextCard service={service} lookups={lookups} />

      <section className="rounded-lg border border-border bg-bg-surface p-5">
        <h3 className="text-base font-semibold text-text-primary">Work report</h3>
        <p className="mt-1 text-sm text-text-secondary">
          Submit a clear description of the work you completed. Labor cost stays as set by
          reception or admin.
        </p>
        <div className="mt-4">
          <MechanicWorkReportForm
            service={service}
            onSuccess={() => {
              navigate(mechanicServiceDetailPath(service.orderServiceId), {
                state: { successMessage: 'Work report saved successfully.' },
              });
            }}
            onCancel={() => navigate(mechanicServiceDetailPath(service.orderServiceId))}
          />
        </div>
      </section>
    </div>
  );
}
