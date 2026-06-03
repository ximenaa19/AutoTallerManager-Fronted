import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import type { AdminMechanicDetailDto } from '@/features/admin/mechanics/types/adminMechanics.types';
import type { MechanicRosterItem } from '@/features/admin/mechanics/types/mechanics.types';
import { ROUTES } from '@/routes/routePaths';
import { formatDateTime } from '@/utils/format';

export interface MechanicDetailPanelProps {
  mechanic: MechanicRosterItem;
  detail?: AdminMechanicDetailDto | null;
  onEditSpecialties: () => void;
}

export function MechanicDetailPanel({
  mechanic,
  detail,
  onEditSpecialties,
}: MechanicDetailPanelProps) {
  const email = detail?.email ?? detail?.user?.email ?? mechanic.email;
  const phone = detail?.phoneNumber;

  return (
    <div className="space-y-6">
      <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-text-secondary">
            Person ID
          </dt>
          <dd className="mt-1 text-sm text-text-primary">#{mechanic.personId}</dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-text-secondary">
            Document
          </dt>
          <dd className="mt-1 text-sm text-text-primary">
            {detail?.documentTypeName
              ? `${detail.documentTypeName} · ${mechanic.documentNumber}`
              : mechanic.documentNumber}
          </dd>
        </div>
        {email && (
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-text-secondary">
              Email
            </dt>
            <dd className="mt-1 text-sm text-text-primary">{email}</dd>
          </div>
        )}
        {phone && (
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-text-secondary">
              Phone
            </dt>
            <dd className="mt-1 text-sm text-text-primary">{phone}</dd>
          </div>
        )}
        {detail?.createdAt && (
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-text-secondary">
              Registered
            </dt>
            <dd className="mt-1 text-sm text-text-primary">
              {formatDateTime(detail.createdAt)}
            </dd>
          </div>
        )}
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-text-secondary">
            Role assignment
          </dt>
          <dd className="mt-1">
            <Badge variant={mechanic.roleAssignmentActive ? 'active' : 'cancelled'} dot>
              {mechanic.roleAssignmentActive ? 'Active' : 'Inactive'}
            </Badge>
          </dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-text-secondary">
            Login account
          </dt>
          <dd className="mt-1">
            {mechanic.accountStatus === 'none' ? (
              <Badge variant="default">No account linked</Badge>
            ) : (
              <Badge variant={mechanic.accountStatus === 'active' ? 'active' : 'pending'} dot>
                {mechanic.accountStatus === 'active' ? 'Active' : 'Inactive'}
                {mechanic.userId ? ` · User #${mechanic.userId}` : ''}
              </Badge>
            )}
          </dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-xs font-medium uppercase tracking-wide text-text-secondary">
            Specialties
          </dt>
          <dd className="mt-2 flex flex-wrap gap-2">
            {mechanic.specialtyNames.length > 0 ? (
              mechanic.specialtyNames.map((name) => (
                <Badge key={name} variant="accent">
                  {name}
                </Badge>
              ))
            ) : (
              <span className="text-sm text-text-secondary">No specialties assigned</span>
            )}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-text-secondary">
            Assigned services
          </dt>
          <dd className="mt-1 text-sm text-text-primary">{mechanic.assignedServicesCount}</dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-text-secondary">
            Active orders
          </dt>
          <dd className="mt-1 text-sm text-text-primary">{mechanic.activeOrdersCount}</dd>
        </div>
      </dl>

      <div className="flex flex-wrap gap-2 border-t border-border pt-4">
        <Button variant="secondary" onClick={onEditSpecialties}>
          Edit specialties
        </Button>
        <Link to={ROUTES.ADMIN_STAFF}>
          <Button variant="ghost">Register new mechanic staff</Button>
        </Link>
        {mechanic.userId && (
          <Link to={ROUTES.ADMIN_USERS}>
            <Button variant="ghost">Manage user account</Button>
          </Link>
        )}
      </div>

      <p className="text-xs text-text-secondary">
        Detail and workload load from GET /api/admin/mechanics/{'{personId}'} and workload
        endpoints. Specialty edits use PUT /api/mechanics/{'{personId}'}/specialties.
      </p>
    </div>
  );
}
