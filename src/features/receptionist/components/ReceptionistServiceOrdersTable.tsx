import { Eye, List, Search, Settings } from 'lucide-react';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingState } from '@/components/feedback/LoadingState';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatDateTime } from '@/utils/format';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import type { ServiceOrderSearchResultDto } from '@/features/receptionist/types/receptionistServiceOrders.types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

export interface ReceptionistServiceOrdersTableProps {
  orders: ServiceOrderSearchResultDto[];
  isLoading: boolean;
  error: string | null;
  hasSearched: boolean;
  searchTerm: string;
  orderStatusNameById?: Map<number, string>;
  onRetry?: () => void;
  onViewDetail: (serviceOrderId: number) => void;
  onAssignMechanic?: (serviceOrderId: number) => void;
}

function resolveStatusLabel(
  orderStatusId: number,
  orderStatusNameById?: Map<number, string>,
): string {
  if (orderStatusNameById?.has(orderStatusId)) {
    return orderStatusNameById.get(orderStatusId) ?? '';
  }

  switch (orderStatusId) {
    case 1:
      return 'Pending';
    case 2:
      return 'In progress';
    case 3:
      return 'Completed';
    case 4:
      return 'Cancelled';
    case 5:
      return 'Voided';
    default:
      return `Status #${orderStatusId}`;
  }
}

function statusBadgeVariant(orderStatusId: number) {
  switch (orderStatusId) {
    case 1:
      return 'pending';
    case 2:
      return 'accent';
    case 3:
      return 'completed';
    case 4:
      return 'cancelled';
    case 5:
      return 'voided';
    default:
      return 'default';
  }
}

export function ReceptionistServiceOrdersTable({
  orders,
  isLoading,
  error,
  hasSearched,
  searchTerm,
  orderStatusNameById,
  onRetry,
  onViewDetail,
  onAssignMechanic,
}: ReceptionistServiceOrdersTableProps) {
  if (isLoading) {
    return (
      <LoadingState
        title="Searching service orders"
        description="Looking up workshop records with the provided term."
      />
    );
  }

  if (error) {
    return (
      <ErrorState
        title="Unable to load service orders"
        message={error}
        onRetry={onRetry}
      />
    );
  }

  if (!hasSearched) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Search service orders</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            title="Start typing to search"
            description="Use at least 2 characters to find service orders by ID, vehicle, or description."
            icon={<Search className="size-6" />}
          />
        </CardContent>
      </Card>
    );
  }

  if (orders.length === 0) {
    return (
      <EmptyState
        title={`No service orders found for "${searchTerm}"`}
        description="Try another term, and ensure you are searching with at least two characters."
        icon={<List className="size-6" />}
      />
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order</TableHead>
              <TableHead>Vehicle</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Entry date</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="w-64 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => {
              const statusLabel = resolveStatusLabel(order.orderStatusId, orderStatusNameById);
              return (
                <TableRow key={order.serviceOrderId}>
                  <TableCell className="font-medium text-text-primary">
                    #{order.serviceOrderId}
                  </TableCell>
                  <TableCell>Vehicle #{order.vehicleId}</TableCell>
                  <TableCell>
                    <Badge variant={statusBadgeVariant(order.orderStatusId)} dot>
                      {statusLabel}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDateTime(order.entryDate)}</TableCell>
                  <TableCell>
                    <span className="line-clamp-2 max-w-[220px] text-sm text-text-secondary">
                      {order.generalDescription || '—'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="inline-flex flex-wrap justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        leftIcon={<Eye className="size-4" />}
                        onClick={() => onViewDetail(order.serviceOrderId)}
                      >
                        View detail
                      </Button>
                      {onAssignMechanic ? (
                        <Button
                          variant="secondary"
                          size="sm"
                          leftIcon={<Settings className="size-4" />}
                          onClick={() => onAssignMechanic(order.serviceOrderId)}
                        >
                          Assign mechanic
                        </Button>
                      ) : null}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
