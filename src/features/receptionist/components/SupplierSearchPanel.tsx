import { Search, SearchX } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { ErrorState } from '@/components/feedback/ErrorState';
import { EmptyState } from '@/components/feedback/EmptyState';
import { LoadingState } from '@/components/feedback/LoadingState';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table';
import type { SupplierSearchResultDto } from '@/features/receptionist/types/receptionistPurchases.types';

export interface SupplierSearchPanelProps {
  searchTerm: string;
  onSearchTermChange: (value: string) => void;
  results: SupplierSearchResultDto[];
  isSearching: boolean;
  error: string | null;
  hasSearched: boolean;
  termTooShort: boolean;
  minTermLength: number;
  onRetry: () => void;
  selectedSupplier: SupplierSearchResultDto | null;
  onSupplierSelect: (supplier: SupplierSearchResultDto) => void;
}

export function SupplierSearchPanel({
  searchTerm,
  onSearchTermChange,
  results,
  isSearching,
  error,
  hasSearched,
  termTooShort,
  minTermLength,
  onRetry,
  selectedSupplier,
  onSupplierSelect,
}: SupplierSearchPanelProps) {
  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold text-text-primary">Supplier selection</h2>

      <Card className="space-y-4 p-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-[2.125rem] size-4 text-text-muted" />
          <Input
            name="supplier-search"
            label="Search supplier"
            placeholder="Search by name, tax ID, phone, or email"
            value={searchTerm}
            onChange={(event) => onSearchTermChange(event.target.value)}
            className="pl-9"
          />
        </div>

        {termTooShort ? (
          <p className="text-xs text-text-secondary">
            Search requires at least {minTermLength} characters.
          </p>
        ) : null}
      </Card>

      {isSearching ? (
        <Card>
          <LoadingState title="Searching suppliers" description="Looking up suppliers..." />
        </Card>
      ) : null}

      {!isSearching && error ? (
        <Card>
          <ErrorState
            title="Unable to search suppliers"
            message={error}
            onRetry={onRetry}
          />
        </Card>
      ) : null}

      {!isSearching && !error && !hasSearched ? (
        <Card>
          <EmptyState
            title="Find a supplier"
            description="Type at least 2 characters to search."
            icon={<Search className="size-6" />}
          />
        </Card>
      ) : null}

      {!isSearching && !error && hasSearched && results.length === 0 ? (
        <Card>
          <EmptyState
            title={`No suppliers found for "${searchTerm}"`}
            description="Try another term or check spelling."
            icon={<SearchX className="size-6" />}
          />
        </Card>
      ) : null}

      {!isSearching && !error && results.length > 0 ? (
        <Card className="overflow-hidden p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Tax ID</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-28 text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {results.map((supplier) => (
                <TableRow key={supplier.supplierId}>
                  <TableCell>
                    <p className="font-medium text-text-primary">{supplier.name}</p>
                    <p className="text-xs text-text-secondary">#{supplier.supplierId}</p>
                  </TableCell>
                  <TableCell>{supplier.taxId ?? '—'}</TableCell>
                  <TableCell>{supplier.phone ?? '—'}</TableCell>
                  <TableCell>{supplier.email ?? '—'}</TableCell>
                  <TableCell>
                    <Badge variant={supplier.isActive ? 'active' : 'cancelled'} dot>
                      {supplier.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => onSupplierSelect(supplier)}
                      disabled={!supplier.isActive}
                    >
                      {selectedSupplier?.supplierId === supplier.supplierId ? 'Selected' : 'Select'}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      ) : null}

      {selectedSupplier ? (
        <Card className="border border-accent/30 bg-accent-muted/25">
          <p className="text-sm font-medium text-text-primary">Selected supplier: {selectedSupplier.name}</p>
          <p className="text-xs text-text-secondary">ID: {selectedSupplier.supplierId}</p>
        </Card>
      ) : null}
    </section>
  );
}
