import type { WorkshopCatalogLookups } from '@/features/admin/serviceOrders/hooks/useWorkshopCatalogLookups';
import { MechanicActiveOrderCard } from '@/features/mechanic/components/MechanicActiveOrderCard';
import { MechanicEmptyState } from '@/features/mechanic/components/MechanicEmptyState';
import type { MechanicActiveOrderDto } from '@/features/mechanic/types/mechanicActiveOrders.types';

export interface MechanicActiveOrdersBoardProps {
  orders: MechanicActiveOrderDto[];
  lookups: WorkshopCatalogLookups;
  hasActiveFilters: boolean;
}

export function MechanicActiveOrdersBoard({
  orders,
  lookups,
  hasActiveFilters,
}: MechanicActiveOrdersBoardProps) {
  if (orders.length === 0) {
    return (
      <MechanicEmptyState
        title={hasActiveFilters ? 'No matching active orders' : 'No active orders'}
        description={
          hasActiveFilters
            ? 'Try adjusting your search or status filter.'
            : 'Active service orders linked to your assignments will appear here when work is in progress.'
        }
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
      {orders.map((order) => (
        <MechanicActiveOrderCard
          key={order.serviceOrderId}
          order={order}
          lookups={lookups}
        />
      ))}
    </div>
  );
}
