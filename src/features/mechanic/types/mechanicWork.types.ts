import type { MechanicAssignedServiceDto } from '@/features/mechanic/types/mechanicAssignments.types';
import type { ServiceExecutionResultDto } from '@/features/admin/serviceOrders/types/orderServices.types';

/** Body for `PUT /api/mechanic/order-services/{id}/work-performed`. */
export interface UpdateWorkPerformedRequest {
  workPerformed?: string;
  /** Sent as existing assignment value; mechanic UI does not edit labor cost. */
  laborCost: number;
}

export type { ServiceExecutionResultDto };

export interface MechanicServiceDetailState {
  service: MechanicAssignedServiceDto | null;
  isLoading: boolean;
  error: string | null;
  notFound: boolean;
  retry: () => void;
  refresh: () => void;
}
