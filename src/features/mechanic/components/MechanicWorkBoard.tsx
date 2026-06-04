import type { WorkshopCatalogLookups } from '@/features/admin/serviceOrders/hooks/useWorkshopCatalogLookups';
import { MechanicAssignmentCard } from '@/features/mechanic/components/MechanicAssignmentCard';
import { MechanicEmptyState } from '@/features/mechanic/components/MechanicEmptyState';
import type { MechanicAssignedServiceDto } from '@/features/mechanic/types/mechanicAssignments.types';

export interface MechanicWorkBoardProps {
  assignments: MechanicAssignedServiceDto[];
  lookups: WorkshopCatalogLookups;
  hasActiveFilters: boolean;
}

export function MechanicWorkBoard({
  assignments,
  lookups,
  hasActiveFilters,
}: MechanicWorkBoardProps) {
  if (assignments.length === 0) {
    return (
      <MechanicEmptyState
        title={hasActiveFilters ? 'No matching assignments' : 'No assigned services'}
        description={
          hasActiveFilters
            ? 'Try adjusting your search or filters to find assigned work.'
            : 'Services assigned to you will appear here when reception or admin allocates work.'
        }
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
      {assignments.map((assignment) => (
        <MechanicAssignmentCard
          key={`${assignment.orderServiceId}-${assignment.specialtyId}`}
          assignment={assignment}
          lookups={lookups}
        />
      ))}
    </div>
  );
}
