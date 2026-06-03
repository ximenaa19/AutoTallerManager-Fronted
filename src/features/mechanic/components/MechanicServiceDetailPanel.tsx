import { Link } from 'react-router-dom';
import { FileText, Package, Wrench } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import type { WorkshopCatalogLookups } from '@/features/admin/serviceOrders/hooks/useWorkshopCatalogLookups';
import { MechanicServiceContextCard } from '@/features/mechanic/components/MechanicServiceContextCard';
import type { MechanicAssignedServiceDto } from '@/features/mechanic/types/mechanicAssignments.types';
import {
  mechanicRecordWorkPath,
  mechanicRequestPartsPath,
  mechanicSearchPartsPath,
  ROUTES,
} from '@/routes/routePaths';

export interface MechanicServiceDetailPanelProps {
  service: MechanicAssignedServiceDto;
  lookups: WorkshopCatalogLookups;
  onRecordWork?: () => void;
  onRequestPart?: () => void;
}

export function MechanicServiceDetailPanel({
  service,
  lookups,
  onRecordWork,
  onRequestPart,
}: MechanicServiceDetailPanelProps) {
  return (
    <div className="space-y-6">
      <MechanicServiceContextCard service={service} lookups={lookups} />

      <section className="rounded-lg border border-border bg-bg-surface p-5">
        <h3 className="text-base font-semibold text-text-primary">Your actions</h3>
        <p className="mt-1 text-sm text-text-secondary">
          Record what you performed on this assignment. Labor cost, customer approval, and
          billing fields are managed by reception or admin.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {onRecordWork ? (
            <Button
              type="button"
              leftIcon={<Wrench className="size-4" />}
              onClick={onRecordWork}
            >
              Record work
            </Button>
          ) : (
            <Link
              to={mechanicRecordWorkPath(service.orderServiceId)}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-transparent bg-accent px-4 text-sm font-medium text-white shadow-sm transition-colors hover:bg-accent-hover focus-ring"
            >
              <Wrench className="size-4" aria-hidden />
              Record work
            </Link>
          )}
          {onRequestPart ? (
            <Button
              type="button"
              variant="secondary"
              leftIcon={<Package className="size-4" />}
              onClick={onRequestPart}
            >
              Request part
            </Button>
          ) : (
            <Link
              to={mechanicRequestPartsPath(service.orderServiceId)}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-border bg-bg-elevated px-4 text-sm font-medium text-text-primary transition-colors hover:bg-bg-surface focus-ring"
            >
              <Package className="size-4" aria-hidden />
              Request part
            </Link>
          )}
          <Link
            to={mechanicSearchPartsPath(service.orderServiceId)}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-border bg-bg-elevated px-4 text-sm font-medium text-text-primary transition-colors hover:bg-bg-surface focus-ring"
          >
            Search parts
          </Link>
          <Link
            to={ROUTES.MECHANIC_ASSIGNED_SERVICES}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-border bg-bg-elevated px-4 text-sm font-medium text-text-primary transition-colors hover:bg-bg-surface focus-ring"
          >
            <FileText className="size-4" aria-hidden />
            Back to assigned services
          </Link>
        </div>
      </section>
    </div>
  );
}
