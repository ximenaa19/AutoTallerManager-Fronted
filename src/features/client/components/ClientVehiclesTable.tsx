import { Eye } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table';
import { formatNumber } from '@/utils/format';
import type { ClientVehicleDto } from '@/features/client/types/clientVehicles.types';

export interface ClientVehiclesTableProps {
  vehicles: ClientVehicleDto[];
  onViewDetails: (vehicle: ClientVehicleDto) => void;
}

export function ClientVehiclesTable({
  vehicles,
  onViewDetails,
}: ClientVehiclesTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Plate</TableHead>
          <TableHead>VIN</TableHead>
          <TableHead>Year</TableHead>
          <TableHead>Color</TableHead>
          <TableHead>Mileage</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="w-36 text-right">Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {vehicles.map((vehicle) => (
          <TableRow key={vehicle.vehicleId}>
            <TableCell className="font-semibold">{vehicle.plate || 'No plate'}</TableCell>
            <TableCell className="font-mono text-xs">{vehicle.vin || 'No VIN'}</TableCell>
            <TableCell>{vehicle.year}</TableCell>
            <TableCell>{vehicle.color || '—'}</TableCell>
            <TableCell>{formatNumber(vehicle.mileage)} km</TableCell>
            <TableCell>
              <Badge variant={vehicle.isActive ? 'active' : 'cancelled'} dot>
                {vehicle.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </TableCell>
            <TableCell className="text-right">
              <Button
                size="sm"
                variant="ghost"
                leftIcon={<Eye className="size-4" />}
                onClick={() => onViewDetails(vehicle)}
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
