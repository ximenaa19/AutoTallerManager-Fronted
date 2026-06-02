import type { BadgeVariant } from '@/components/ui/Badge';
import type { UpdateOrderServiceRequest } from '@/features/admin/serviceOrders/types/orderServices.types';
import type { ServiceOrderServiceSummaryDto } from '@/features/admin/serviceOrders/types/serviceOrders.types';

export type BillingApprovalStatus = 'pending' | 'approved' | 'rejected';

export function getBillingApprovalStatus(
  customerApproved?: boolean,
): BillingApprovalStatus {
  if (customerApproved === true) {
    return 'approved';
  }

  if (customerApproved === false) {
    return 'rejected';
  }

  return 'pending';
}

export function getBillingApprovalBadgeLabel(status: BillingApprovalStatus): string {
  switch (status) {
    case 'approved':
      return 'Approved for billing';
    case 'rejected':
      return 'Rejected';
    default:
      return 'Pending approval';
  }
}

export function getBillingApprovalBadgeVariant(status: BillingApprovalStatus): BadgeVariant {
  switch (status) {
    case 'approved':
      return 'active';
    case 'rejected':
      return 'cancelled';
    default:
      return 'pending';
  }
}

export function buildUpdateOrderServiceRequestFromSummary(
  service: ServiceOrderServiceSummaryDto,
  serviceOrderId: number,
  customerApproved: boolean,
): UpdateOrderServiceRequest {
  return {
    serviceOrderId,
    serviceTypeId: service.serviceTypeId,
    description: service.description,
    workPerformed: service.workPerformed,
    laborCost: service.laborCost,
    customerApproved,
  };
}

/** Merges form edits with existing billing and work-report fields for PUT /api/order-services/{id}. */
export function buildEditUpdateOrderServiceRequest(
  service: ServiceOrderServiceSummaryDto,
  serviceOrderId: number,
  updates: Pick<UpdateOrderServiceRequest, 'serviceTypeId' | 'description' | 'laborCost'>,
): UpdateOrderServiceRequest {
  return {
    serviceOrderId,
    serviceTypeId: updates.serviceTypeId,
    description: updates.description,
    workPerformed: service.workPerformed,
    laborCost: updates.laborCost,
    customerApproved: service.customerApproved,
    approvalDate: service.approvalDate,
  };
}

export function validateServiceForBillingApproval(
  service: ServiceOrderServiceSummaryDto,
): string | null {
  if (!Number.isFinite(service.serviceTypeId) || service.serviceTypeId <= 0) {
    return 'Service type is required before approving for billing.';
  }

  if (!Number.isFinite(service.laborCost) || service.laborCost < 0) {
    return 'Labor cost must be set before approving for billing.';
  }

  return null;
}
