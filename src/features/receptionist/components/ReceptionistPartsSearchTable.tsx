import { Search, SearchX } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingState } from '@/components/feedback/LoadingState';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table';
import { formatCurrency } from '@/utils/format';
import type { PartSearchResultDto } from '@/features/receptionist/types/receptionistInventory.types';

export interface ReceptionistPartsSearchTableProps {
  results: PartSearchResultDto[];
  isLoading: boolean;
  error: string | null;
  hasSearched: boolean;
  searchTerm: string;
  onRetry?: () => void;
}

export function ReceptionistPartsSearchTable({
  results,
  isLoading,
  error,
  hasSearched,
  searchTerm,
  onRetry,
}: ReceptionistPartsSearchTableProps) {
  if (isLoading) {
    return (
      <Card>
        <LoadingState
          title="Searching parts"
          description="Querying part catalog by code and description."
        />
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <ErrorState
          title="Unable to search parts"
          message={error}
          onRetry={onRetry}
        />
      </Card>
    );
  }

  if (!hasSearched) {
    return (
      <Card>
        <EmptyState
          title="Start a parts search"
          description="Type at least 2 characters to find parts by code or description."
          icon={<Search className="size-6" />}
        />
      </Card>
    );
  }

  if (results.length === 0) {
    return (
      <Card>
        <EmptyState
          title={`No parts found for "${searchTerm}"`}
          description="Try another term or change the query."
          icon={<SearchX className="size-6" />}
        />
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden p-0">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Part ID</TableHead>
            <TableHead>Code</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Brand</TableHead>
            <TableHead>Stock</TableHead>
            <TableHead>Minimum</TableHead>
            <TableHead>Unit price</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {results.map((part) => (
            <TableRow key={part.partId}>
              <TableCell>{part.partId}</TableCell>
              <TableCell className="font-medium text-text-primary">{part.code}</TableCell>
              <TableCell>{part.description}</TableCell>
              <TableCell>—</TableCell>
              <TableCell>—</TableCell>
              <TableCell>{part.stock}</TableCell>
              <TableCell>{part.minimumStock}</TableCell>
              <TableCell>{formatCurrency(part.unitPrice)}</TableCell>
              <TableCell>
                <Badge variant={part.isActive ? 'active' : 'cancelled'} dot>
                  {part.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
