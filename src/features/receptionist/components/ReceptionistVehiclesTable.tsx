import { Eye, List, Search } from 'lucide-react';
import { useMemo } from 'react';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingState } from '@/components/feedback/LoadingState';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import type { CatalogItemDto } from '@/types/catalogs.types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import type { VehicleSearchResultDto } from '@/features/receptionist/types/receptionistVehicles.types';

export interface ReceptionistVehiclesTableProps {
  vehicles: VehicleSearchResultDto[];
  isLoading: boolean;
  error: string | null;
  hasSearched: boolean;
  onRetry?: () => void;
  onViewDetails?: (vehicleId: number) => void;
  vehicleModels?: CatalogItemDto[];
  vehicleTypes?: CatalogItemDto[];
  searchTerm: string;
}

export function ReceptionistVehiclesTable({
  vehicles,
  isLoading,
  error,
  hasSearched,
  onRetry,
  onViewDetails,
  vehicleModels = [],
  vehicleTypes = [],
  searchTerm,
}: ReceptionistVehiclesTableProps) {
  const modelNameById = useMemo(() => {
    const map = new Map<number, string>();
    for (const model of vehicleModels) {
      map.set(model.id, model.name);
    }
    return map;
  }, [vehicleModels]);

  const typeNameById = useMemo(() => {
    const map = new Map<number, string>();
    for (const type of vehicleTypes) {
      map.set(type.id, type.name);
    }
    return map;
  }, [vehicleTypes]);

  const resolveModelLabel = (modelId: number) => modelNameById.get(modelId) ?? `Model #${modelId}`;
  const resolveTypeLabel = (typeId: number) => typeNameById.get(typeId) ?? `Type #${typeId}`;

  if (isLoading) {
    return (
      <LoadingState
        title="Searching vehicles"
        description="Finding registered vehicles in workshop records."
        className="rounded-lg border border-border bg-bg-surface"
      />
    );
  }

  if (error) {
    return (
      <ErrorState
        title="Unable to load vehicles"
        message={error}
        onRetry={onRetry}
        className="rounded-lg"
      />
    );
  }

  if (!hasSearched) {
    return (
      <EmptyState
        title="Start typing to search vehicles"
        description="Search by VIN, plate, or year when available."
        icon={<Search className="size-6" />}
        className="rounded-lg border border-border bg-bg-surface"
      />
    );
  }

  if (vehicles.length === 0) {
    return (
      <EmptyState
        title={`No vehicles found for "${searchTerm}"`}
        description="Try another search term or check client ownership before creating service orders."
        icon={<List className="size-6" />}
        className="rounded-lg border border-border bg-bg-surface"
      />
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Vehicle</TableHead>
          <TableHead>Plate</TableHead>
          <TableHead>VIN</TableHead>
          <TableHead>Model</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Year</TableHead>
          <TableHead>Color</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="w-40 text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {vehicles.map((vehicle) => (
          <TableRow key={vehicle.vehicleId}>
            <TableCell>#{vehicle.vehicleId}</TableCell>
            <TableCell>{vehicle.plate?.trim() ? vehicle.plate : '—'}</TableCell>
            <TableCell>{vehicle.vin || '—'}</TableCell>
            <TableCell>{resolveModelLabel(vehicle.modelId)}</TableCell>
            <TableCell>{resolveTypeLabel(vehicle.vehicleTypeId)}</TableCell>
            <TableCell>{vehicle.year}</TableCell>
            <TableCell>{vehicle.color || '—'}</TableCell>
            <TableCell>
              <Badge variant={vehicle.isActive ? 'active' : 'cancelled'} dot>
                {vehicle.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </TableCell>
            <TableCell className="text-right">
              <div className="inline-flex flex-wrap justify-end gap-2">
                {onViewDetails ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    leftIcon={<Eye className="size-4" />}
                    onClick={() => onViewDetails(vehicle.vehicleId)}
                  >
                    View detail
                  </Button>
                ) : null}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
