import { Link } from 'react-router-dom';
import { ClipboardList, FileText, Package } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { AdminPageHeader } from '@/features/admin/components/AdminPageHeader';
import { ROUTES } from '@/routes/routePaths';

export function MechanicRequestPartsGuidance() {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Request spare parts"
        description="Part requests must be linked to an order service assigned to you."
      />

      <Card padding="md" className="max-w-2xl space-y-4">
        <p className="text-sm leading-relaxed text-text-secondary">
          <strong className="font-medium text-text-primary">Request parts</strong>{' '}
          is a contextual action. You can only request parts for services currently
          assigned to your account. The workshop validates assignment on submit.
        </p>

        <p className="text-sm text-text-secondary">Start from an assigned service:</p>

        <ul className="space-y-2 text-sm text-text-primary">
          <li className="flex items-start gap-2">
            <ClipboardList className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden />
            <span>
              <strong className="font-medium">Assigned Services</strong> — use{' '}
              <strong className="font-medium">Request part</strong> on a service card
            </span>
          </li>
          <li className="flex items-start gap-2">
            <FileText className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden />
            <span>
              <strong className="font-medium">Service detail</strong> — open a service,
              then request parts from the actions panel
            </span>
          </li>
          <li className="flex items-start gap-2">
            <Package className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden />
            <span>
              <strong className="font-medium">Search parts</strong> — browse inventory
              read-only; request from an assigned service when ready
            </span>
          </li>
        </ul>

        <div className="flex flex-wrap gap-3 border-t border-border pt-4">
          <Link
            to={ROUTES.MECHANIC_ASSIGNED_SERVICES}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-transparent bg-accent px-4 text-sm font-medium text-white shadow-sm transition-colors hover:bg-accent-hover focus-ring"
          >
            <ClipboardList className="size-4" aria-hidden />
            Go to assigned services
          </Link>
          <Link
            to={ROUTES.MECHANIC_SEARCH_PARTS}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-border bg-bg-elevated px-4 text-sm font-medium text-text-primary transition-colors hover:bg-bg-surface focus-ring"
          >
            <Package className="size-4" aria-hidden />
            Search parts
          </Link>
        </div>
      </Card>
    </div>
  );
}
