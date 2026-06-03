import { Eye } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table';
import { ClientServiceOrderStatusBadge } from '@/features/client/components/ClientServiceOrderStatusBadge';
import { formatDateTime } from '@/utils/format';
import type { ClientServiceOrderSummaryDto } from '@/features/client/types/clientServiceOrders.types';

export interface ClientServiceOrdersTableProps {
  serviceOrders: ClientServiceOrderSummaryDto[];
  onViewDetails: (serviceOrderId: number) => void;
}

export function ClientServiceOrdersTable({
  serviceOrders,
  onViewDetails,
}: ClientServiceOrdersTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Order</TableHead>
          <TableHead>Vehicle</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Entry date</TableHead>
          <TableHead>Estimated delivery</TableHead>
          <TableHead>Description</TableHead>
          <TableHead className="w-36 text-right">Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {serviceOrders.map((order) => (
          <TableRow key={order.serviceOrderId}>
            <TableCell className="font-semibold">#{order.serviceOrderId}</TableCell>
            <TableCell>Vehicle #{order.vehicleId}</TableCell>
            <TableCell>
              <ClientServiceOrderStatusBadge orderStatusId={order.orderStatusId} />
            </TableCell>
            <TableCell>{formatDateTime(order.entryDate)}</TableCell>
            <TableCell>
              {order.estimatedDeliveryDate
                ? formatDateTime(order.estimatedDeliveryDate)
                : '—'}
            </TableCell>
            <TableCell>
              <span className="line-clamp-2 max-w-[260px] text-sm text-text-secondary">
                {order.generalDescription || 'No description'}
              </span>
            </TableCell>
            <TableCell className="text-right">
              <Button
                size="sm"
                variant="ghost"
                leftIcon={<Eye className="size-4" />}
                onClick={() => onViewDetails(order.serviceOrderId)}
              >
                View details
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
