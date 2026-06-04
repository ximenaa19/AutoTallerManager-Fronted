import { Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { ErrorState } from '@/components/feedback/ErrorState';
import { EmptyState } from '@/components/feedback/EmptyState';
import { Input } from '@/components/ui/Input';
import { LoadingState } from '@/components/feedback/LoadingState';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { getErrorMessage } from '@/api/apiError';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table';
import { receptionistClientsApi } from '@/features/receptionist/api/receptionistClients.api';
import { CreateClientWithVehicleModal } from '@/features/receptionist/components/CreateClientWithVehicleModal';
import { ReceptionistClientsTable } from '@/features/receptionist/components/ReceptionistClientsTable';
import { ReceptionistPageHeader } from '@/features/receptionist/components/ReceptionistPageHeader';
import { useReceptionistClientSearch } from '@/features/receptionist/hooks/useReceptionistClientSearch';
import { ROUTES } from '@/routes/routePaths';
import type {
  ClientSearchResultDto,
  ClientVehicleDto,
  ClientServiceOrderSummaryDto,
} from '@/features/receptionist/types/receptionistClients.types';
import { formatDateTime } from '@/utils/format';

type RelationPanelType = 'vehicles' | 'orders';

interface ClientCreatedState {
  receptionistClientCreated?: {
    fullName: string;
    vehicleId: number;
    plate?: string;
  };
}

function ReceptionistClientRelationModal({
  client,
  type,
  onClose,
}: {
  client: ClientSearchResultDto;
  type: RelationPanelType;
  onClose: () => void;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [vehicles, setVehicles] = useState<ClientVehicleDto[]>([]);
  const [orders, setOrders] = useState<ClientServiceOrderSummaryDto[]>([]);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      setError(null);

      try {
        if (type === 'vehicles') {
          const response = await receptionistClientsApi.getClientVehicles(client.personId);
          setVehicles(response.data);
          setOrders([]);
        } else {
          const response = await receptionistClientsApi.getClientServiceOrders(
            client.personId,
          );
          setOrders(response.data);
          setVehicles([]);
        }
      } catch (err) {
        setVehicles([]);
        setOrders([]);
        setError(getErrorMessage(err));
      } finally {
        setIsLoading(false);
      }
    };

    void load();
  }, [client.personId, type]);

  const renderVehicles = () => {
    if (vehicles.length === 0) {
      return (
        <EmptyState
          title="No vehicles found"
          description="No vehicles are linked to this customer yet."
        />
      );
    }

    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Vehicle</TableHead>
            <TableHead>Model</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Plate</TableHead>
            <TableHead>VIN</TableHead>
            <TableHead>Year</TableHead>
            <TableHead>Mileage</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {vehicles.map((vehicle) => (
            <TableRow key={vehicle.vehicleId}>
              <TableCell>#{vehicle.vehicleId}</TableCell>
              <TableCell>Model #{vehicle.modelId}</TableCell>
              <TableCell>Type #{vehicle.vehicleTypeId}</TableCell>
              <TableCell>{vehicle.plate || '—'}</TableCell>
              <TableCell>{vehicle.vin || 'N/A'}</TableCell>
              <TableCell>{vehicle.year}</TableCell>
              <TableCell>{vehicle.mileage.toLocaleString()}</TableCell>
              <TableCell>
                <Badge variant={vehicle.isActive ? 'active' : 'cancelled'} dot>
                  {vehicle.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };

  const renderOrders = () => {
    if (orders.length === 0) {
      return (
        <EmptyState
          title="No service orders found"
          description="No service orders are associated with this customer yet."
        />
      );
    }

    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order</TableHead>
            <TableHead>Vehicle</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Entry date</TableHead>
            <TableHead>Delivery</TableHead>
            <TableHead>Description</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.serviceOrderId}>
              <TableCell>#{order.serviceOrderId}</TableCell>
              <TableCell>#{order.vehicleId}</TableCell>
              <TableCell>
                <Badge variant="accent">Status #{order.orderStatusId}</Badge>
              </TableCell>
              <TableCell>{formatDateTime(order.entryDate)}</TableCell>
              <TableCell>{formatDateTime(order.estimatedDeliveryDate)}</TableCell>
            <TableCell>{order.generalDescription || 'N/A'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };

  return (
    <Modal
      open
      onClose={onClose}
      title={
        type === 'vehicles'
          ? `Vehicles for ${client.fullName}`
          : `Service orders for ${client.fullName}`
      }
      description={`Customer person #${client.personId}`}
      size="lg"
    >
      {isLoading ? (
        <LoadingState
          title="Loading client details"
          description="Loading related records from the workshop."
        />
      ) : error ? (
        <ErrorState title="Unable to load client records" message={error} />
      ) : type === 'vehicles' ? (
        renderVehicles()
      ) : (
        renderOrders()
      )}
    </Modal>
  );
}

export function ReceptionistClientsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const createdState = (location.state as ClientCreatedState | null) ?? null;
  const search = useReceptionistClientSearch({ minTermLength: 2 });
  const [relationPanelType, setRelationPanelType] = useState<RelationPanelType | null>(
    null,
  );
  const [selectedClient, setSelectedClient] = useState<ClientSearchResultDto | null>(
    null,
  );
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [createdConfirmation] = useState(
    createdState?.receptionistClientCreated
      ? `Client ${createdState.receptionistClientCreated.fullName} and vehicle #${createdState.receptionistClientCreated.vehicleId}${createdState.receptionistClientCreated.plate ? ` (${createdState.receptionistClientCreated.plate})` : ''} were created.`
      : null,
  );

  const activeRelationType = relationPanelType;

  const closeRelationModal = () => {
    setRelationPanelType(null);
    setSelectedClient(null);
  };

  const openVehicles = (client: ClientSearchResultDto) => {
    setSelectedClient(client);
    setRelationPanelType('vehicles');
  };

  const openOrders = (client: ClientSearchResultDto) => {
    setSelectedClient(client);
    setRelationPanelType('orders');
  };

  const handleCreateClientSuccess = async (payload: Parameters<
    typeof receptionistClientsApi.createClientWithVehicle
  >[0]) => {
    const response = await receptionistClientsApi.createClientWithVehicle(payload);
    setIsCreateModalOpen(false);
    setSuccessMessage(
      `Client ${response.data.fullName} and vehicle #${response.data.vehicleId}${response.data.plate ? ` (${response.data.plate})` : ''} were created.`,
    );
    search.reload();
  };

  return (
    <div className="space-y-6">
      <ReceptionistPageHeader
        title="Customers"
        description="Search existing customers and keep reception workflows ready."
        actions={
          <>
            <Button onClick={() => setIsCreateModalOpen(true)}>New client + vehicle</Button>
            <Button
              variant="secondary"
              onClick={() => navigate(ROUTES.RECEPTIONIST_CLIENTS_NEW)}
            >
              Open create form
            </Button>
          </>
        }
      />

      {(createdConfirmation ?? successMessage) && (
        <div
          role="status"
          className="rounded-lg border border-success/30 bg-success-muted/40 px-4 py-3 text-sm text-success"
        >
          {createdConfirmation ?? successMessage}
        </div>
      )}

      <div className="rounded-lg border border-border bg-bg-surface p-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-[2.125rem] size-4 text-text-muted" />
          <Input
            name="receptionist-client-search"
            label="Search customers"
            value={search.term}
            onChange={(event) => search.setTerm(event.target.value)}
            placeholder="Search by name, document, email, or phone"
            className="pl-9"
          />
        </div>

        {search.termTooShort && (
          <p className="mt-2 text-xs text-text-secondary">
            Write at least {search.minTermLength} characters to search customers.
          </p>
        )}
      </div>

      <ReceptionistClientsTable
        clients={search.results}
        isLoading={search.isSearching}
        error={search.error}
        hasSearched={search.hasSearched}
        onRetry={search.reload}
        onViewVehicles={openVehicles}
        onViewServiceOrders={openOrders}
        onCreateClientWithVehicle={() => setIsCreateModalOpen(true)}
        searchTerm={search.term}
      />

      <CreateClientWithVehicleModal
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateClientSuccess}
      />

      {selectedClient && activeRelationType && (
        <ReceptionistClientRelationModal
          client={selectedClient}
          type={activeRelationType}
          onClose={closeRelationModal}
        />
      )}
    </div>
  );
}





