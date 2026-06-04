import { Eye, FileText, List } from 'lucide-react';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingState } from '@/components/feedback/LoadingState';
import { Button } from '@/components/ui/Button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import type { ClientSearchResultDto } from '@/features/receptionist/types/receptionistClients.types';

export interface ReceptionistClientsTableProps {
  clients: ClientSearchResultDto[];
  isLoading: boolean;
  error: string | null;
  hasSearched: boolean;
  onRetry?: () => void;
  onViewVehicles: (client: ClientSearchResultDto) => void;
  onViewServiceOrders: (client: ClientSearchResultDto) => void;
  onCreateClientWithVehicle?: () => void;
  searchTerm: string;
}

export function ReceptionistClientsTable({
  clients,
  isLoading,
  error,
  hasSearched,
  onRetry,
  onViewVehicles,
  onViewServiceOrders,
  onCreateClientWithVehicle,
  searchTerm,
}: ReceptionistClientsTableProps) {
  if (isLoading) {
    return (
      <LoadingState
        title="Searching clients"
        description="Fetching matching clients from API."
        className="rounded-lg border border-border bg-bg-surface"
      />
    );
  }

  if (error) {
    return (
      <ErrorState
        title="Unable to load clients"
        message={error}
        onRetry={onRetry}
        className="rounded-lg"
      />
    );
  }

  if (!hasSearched) {
    return (
      <EmptyState
        title="Start typing to search clients"
        description="Use document, name, email, or phone to find an existing customer."
        icon={<List className="size-6" />}
        action={
          onCreateClientWithVehicle ? (
            <Button size="sm" onClick={onCreateClientWithVehicle}>
              New client + vehicle
            </Button>
          ) : null
        }
        className="rounded-lg border border-border bg-bg-surface"
      />
    );
  }

  if (clients.length === 0) {
    return (
      <EmptyState
        title={`No clients found for "${searchTerm}"`}
        description="Try another search term or register a new customer with a vehicle."
        icon={<List className="size-6" />}
        action={
          onCreateClientWithVehicle ? (
            <Button size="sm" onClick={onCreateClientWithVehicle}>
              New client + vehicle
            </Button>
          ) : null
        }
        className="rounded-lg border border-border bg-bg-surface"
      />
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Customer</TableHead>
          <TableHead>Document</TableHead>
          <TableHead>Primary contact</TableHead>
          <TableHead className="w-44 text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {clients.map((client) => (
          <TableRow key={client.personId}>
            <TableCell>
              <p className="font-medium text-text-primary">{client.fullName}</p>
              <p className="text-xs text-text-secondary">
                ID #{client.personId}
              </p>
            </TableCell>
            <TableCell>
              <p>{client.documentNumber}</p>
            </TableCell>
            <TableCell className="text-sm">
              {client.primaryEmail ? <p>{client.primaryEmail}</p> : <p>—</p>}
              {client.primaryPhoneNumber ? <p>{client.primaryPhoneNumber}</p> : null}
            </TableCell>
            <TableCell className="text-right">
              <div className="inline-flex flex-wrap justify-end gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  leftIcon={<Eye className="size-4" />}
                  onClick={() => onViewVehicles(client)}
                >
                  Vehicles
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  leftIcon={<FileText className="size-4" />}
                  onClick={() => onViewServiceOrders(client)}
                >
                  Orders
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
