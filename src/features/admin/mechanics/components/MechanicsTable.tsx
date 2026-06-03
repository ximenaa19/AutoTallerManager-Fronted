import type { ReactNode } from 'react';
import { Eye, Wrench } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { AdminDataTable } from '@/features/admin/components/AdminDataTable';
import type { AdminTableColumn } from '@/features/admin/components/AdminDataTable';
import type { MechanicRosterItem } from '@/features/admin/mechanics/types/mechanics.types';

export interface MechanicsTableProps {
  mechanics: MechanicRosterItem[];
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  page: number;
  totalPages: number;
  totalCount: number;
  onPageChange: (page: number) => void;
  onView: (mechanic: MechanicRosterItem) => void;
  onEditSpecialties: (mechanic: MechanicRosterItem) => void;
}

function renderSpecialtyBadges(names: string[]): ReactNode {
  if (names.length === 0) {
    return <span className="text-xs text-text-secondary">No specialties</span>;
  }

  return (
    <div className="flex flex-wrap gap-1">
      {names.map((name) => (
        <Badge key={name} variant="accent">
          {name}
        </Badge>
      ))}
    </div>
  );
}

function renderAccountBadge(status: MechanicRosterItem['accountStatus']): ReactNode {
  if (status === 'active') {
    return (
      <Badge variant="active" dot>
        Active account
      </Badge>
    );
  }

  if (status === 'inactive') {
    return (
      <Badge variant="pending" dot>
        Inactive account
      </Badge>
    );
  }

  return <Badge variant="default">No login account</Badge>;
}

function renderRoleBadge(isActive: boolean): ReactNode {
  return isActive ? (
    <Badge variant="active" dot>
      Active role
    </Badge>
  ) : (
    <Badge variant="cancelled" dot>
      Inactive role
    </Badge>
  );
}

export function MechanicsTable({
  mechanics,
  isLoading = false,
  error = null,
  onRetry,
  page,
  totalPages,
  totalCount,
  onPageChange,
  onView,
  onEditSpecialties,
}: MechanicsTableProps) {
  const columns: AdminTableColumn<MechanicRosterItem>[] = [
    {
      id: 'personId',
      header: 'ID',
      cell: (mechanic) => (
        <span className="font-medium text-text-primary">#{mechanic.personId}</span>
      ),
    },
    {
      id: 'name',
      header: 'Mechanic',
      cell: (mechanic) => (
        <div>
          <p className="font-medium text-text-primary">{mechanic.fullName}</p>
          <p className="text-xs text-text-secondary">Doc {mechanic.documentNumber}</p>
        </div>
      ),
    },
    {
      id: 'specialties',
      header: 'Specialties',
      cell: (mechanic) => renderSpecialtyBadges(mechanic.specialtyNames),
    },
    {
      id: 'roleStatus',
      header: 'Role',
      cell: (mechanic) => renderRoleBadge(mechanic.roleAssignmentActive),
    },
    {
      id: 'accountStatus',
      header: 'Account',
      cell: (mechanic) => renderAccountBadge(mechanic.accountStatus),
    },
    {
      id: 'services',
      header: 'Services',
      cell: (mechanic) => (
        <span className="text-sm text-text-primary">{mechanic.assignedServicesCount}</span>
      ),
    },
    {
      id: 'orders',
      header: 'Active orders',
      cell: (mechanic) => (
        <span className="text-sm text-text-primary">{mechanic.activeOrdersCount}</span>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      className: 'text-right',
      cell: (mechanic) => (
        <div className="flex justify-end gap-1">
          <Button
            variant="ghost"
            size="sm"
            aria-label={`View mechanic ${mechanic.personId}`}
            onClick={() => onView(mechanic)}
          >
            <Eye className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            aria-label={`Edit specialties for mechanic ${mechanic.personId}`}
            onClick={() => onEditSpecialties(mechanic)}
          >
            <Wrench className="size-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <AdminDataTable
      columns={columns}
      data={mechanics}
      rowKey={(mechanic) => mechanic.personId}
      isLoading={isLoading}
      error={error}
      onRetry={onRetry}
      emptyTitle="No mechanics found"
      emptyDescription="Register mechanic staff from the Staff page, then manage specialties and assignments here."
      page={page}
      totalPages={totalPages}
      totalCount={totalCount}
      onPageChange={onPageChange}
    />
  );
}
