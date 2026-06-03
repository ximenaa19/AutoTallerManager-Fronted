import { Search, SearchX } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { ErrorState } from '@/components/feedback/ErrorState';
import { EmptyState } from '@/components/feedback/EmptyState';
import { LoadingState } from '@/components/feedback/LoadingState';
import { formatCurrency } from '@/utils/format';
import type { PartSearchResultDto } from '@/features/receptionist/types/receptionistPurchases.types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table';

export interface PartPickerPanelProps {
  searchTerm: string;
  onSearchTermChange: (value: string) => void;
  results: PartSearchResultDto[];
  isSearching: boolean;
  error: string | null;
  hasSearched: boolean;
  termTooShort: boolean;
  minTermLength: number;
  onRetry: () => void;
  selectedPart: PartSearchResultDto | null;
  onPartSelect: (part: PartSearchResultDto) => void;
  onClearPart: () => void;
}

export function PartPickerPanel({
  searchTerm,
  onSearchTermChange,
  results,
  isSearching,
  error,
  hasSearched,
  termTooShort,
  minTermLength,
  onRetry,
  selectedPart,
  onPartSelect,
  onClearPart,
}: PartPickerPanelProps) {
  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold text-text-primary">Parts search</h2>

      <Card className="space-y-4 p-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-[2.125rem] size-4 text-text-muted" />
          <Input
            name="part-search"
            label="Search part"
            placeholder="Search by code or description"
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

        {selectedPart ? (
          <Card className="bg-bg-elevated">
            <p className="text-sm font-medium text-text-primary">
              Selected part: {selectedPart.code} - {selectedPart.description}
            </p>
            <p className="text-xs text-text-secondary">
              Stock: {selectedPart.stock} · Min stock: {selectedPart.minimumStock} · Unit
              price: {formatCurrency(selectedPart.unitPrice)}
            </p>
            <div className="mt-3">
              <Button type="button" variant="ghost" size="sm" onClick={onClearPart}>
                Clear selected part
              </Button>
            </div>
          </Card>
        ) : null}
      </Card>

      {isSearching ? (
        <Card>
          <LoadingState title="Searching parts" description="Looking up parts in catalog." />
        </Card>
      ) : null}

      {!isSearching && error ? (
        <Card>
          <ErrorState title="Unable to search parts" message={error} onRetry={onRetry} />
        </Card>
      ) : null}

      {!isSearching && !error && !hasSearched ? (
        <Card>
          <EmptyState
            title="Find a part"
            description="Type at least 2 characters to search by code or description."
            icon={<Search className="size-6" />}
          />
        </Card>
      ) : null}

      {!isSearching && !error && hasSearched && results.length === 0 ? (
        <Card>
          <EmptyState
            title={`No parts found for "${searchTerm}"`}
            description="Try another term or change the search criteria."
            icon={<SearchX className="size-6" />}
          />
        </Card>
      ) : null}

      {!isSearching && !error && results.length > 0 ? (
        <Card className="overflow-hidden p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Min stock</TableHead>
                <TableHead>Unit price</TableHead>
                <TableHead className="w-28 text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {results.map((part) => (
                <TableRow key={part.partId}>
                  <TableCell className="font-medium text-text-primary">
                    {part.code}
                  </TableCell>
                  <TableCell>{part.description}</TableCell>
                  <TableCell>{part.stock}</TableCell>
                  <TableCell>{part.minimumStock}</TableCell>
                  <TableCell>{formatCurrency(part.unitPrice)}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => onPartSelect(part)}
                      disabled={!part.isActive}
                    >
                      Select
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      ) : null}
    </section>
  );
}
