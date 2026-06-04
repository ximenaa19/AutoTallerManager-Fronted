/** Body for `POST /api/order-services/{id}/request-part`. */
export interface RequestPartRequest {
  partId: number;
  quantity: number;
  appliedUnitPrice: number;
}

/** Success payload from order service business actions. */
export interface ServiceExecutionResultDto {
  id: number;
  entity: string;
  action: string;
  success: boolean;
}
