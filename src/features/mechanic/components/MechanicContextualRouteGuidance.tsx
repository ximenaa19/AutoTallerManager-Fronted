import { Link } from 'react-router-dom';
import { ClipboardList, FileText, Wrench } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { AdminPageHeader } from '@/features/admin/components/AdminPageHeader';
import { ROUTES } from '@/routes/routePaths';

export type MechanicContextualGuidanceVariant = 'service-detail' | 'record-work';

export interface MechanicContextualRouteGuidanceProps {
  variant: MechanicContextualGuidanceVariant;
}

const copyByVariant: Record<
  MechanicContextualGuidanceVariant,
  { title: string; description: string }
> = {
  'service-detail': {
    title: 'Select an assigned service',
    description:
      'Service detail opens for a specific order service assigned to you. Choose a service from Assigned Services to view its full context.',
  },
  'record-work': {
    title: 'Select an assigned service',
    description:
      'Recording work requires a specific order service assigned to you. Choose a service from Assigned Services before submitting a work report.',
  },
};

export function MechanicContextualRouteGuidance({
  variant,
}: MechanicContextualRouteGuidanceProps) {
  const { title, description } = copyByVariant[variant];

  return (
    <div className="space-y-6">
      <AdminPageHeader title={title} description={description} />

      <Card padding="md" className="max-w-2xl space-y-4">
        <p className="text-sm leading-relaxed text-text-secondary">
          {variant === 'service-detail' ? (
            <>
              <strong className="font-medium text-text-primary">Service detail</strong>{' '}
              and <strong className="font-medium text-text-primary">record work</strong>{' '}
              both require a selected assigned service. Open{' '}
              <strong className="font-medium text-text-primary">Assigned Services</strong>{' '}
              to see work allocated to your account.
            </>
          ) : (
            <>
              <strong className="font-medium text-text-primary">Record work</strong>{' '}
              and <strong className="font-medium text-text-primary">service detail</strong>{' '}
              both require a selected assigned service. Open{' '}
              <strong className="font-medium text-text-primary">Assigned Services</strong>{' '}
              to pick the order service you are working on.
            </>
          )}
        </p>

        <p className="text-sm text-text-secondary">From each assignment card, use:</p>

        <ul className="space-y-2 text-sm text-text-primary">
          <li className="flex items-start gap-2">
            <FileText className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden />
            <span>
              <strong className="font-medium">View service detail</strong> — opens the
              detail page for that order service
            </span>
          </li>
          <li className="flex items-start gap-2">
            <Wrench className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden />
            <span>
              <strong className="font-medium">Record work</strong> — opens the work report
              form for that order service
            </span>
          </li>
        </ul>

        <div className="border-t border-border pt-4">
          <Link
            to={ROUTES.MECHANIC_ASSIGNED_SERVICES}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-transparent bg-accent px-4 text-sm font-medium text-white shadow-sm transition-colors hover:bg-accent-hover focus-ring"
          >
            <ClipboardList className="size-4" aria-hidden />
            Go to assigned services
          </Link>
        </div>
      </Card>
    </div>
  );
}
