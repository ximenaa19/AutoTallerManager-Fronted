import { useCallback, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Car, Search, UserRound } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ErrorState } from '@/components/feedback/ErrorState';
import { EmptyState } from '@/components/feedback/EmptyState';
import { LoadingState } from '@/components/feedback/LoadingState';
import { Modal } from '@/components/ui/Modal';
import { ReceptionistPageHeader } from '@/features/receptionist/components/ReceptionistPageHeader';
import { ReceptionistServiceOrdersTable } from '@/features/receptionist/components/ReceptionistServiceOrdersTable';
import { getErrorMessage } from '@/api/apiError';
import { Input } from '@/components/ui/Input';
import { receptionistClientsApi } from '@/features/receptionist/api/receptionistClients.api';
import { receptionistServiceOrdersApi } from '@/features/receptionist/api/receptionistServiceOrders.api';
import { useReceptionistClientSearch } from '@/features/receptionist/hooks/useReceptionistClientSearch';
import { useReceptionistServiceOrderSearch } from '@/features/receptionist/hooks/useReceptionistServiceOrderSearch';
import { useReceptionistVehicleSearch } from '@/features/receptionist/hooks/useReceptionistVehicleSearch';
import { useWorkshopCatalogs } from '@/features/receptionist/hooks/useWorkshopCatalogs';
import { formatCurrency, formatDateTime } from '@/utils/format';
import { ROUTES } from '@/routes/routePaths';
import type {
  ReceptionistServiceOrderTableRow,
  ServiceOrderFullDetailDto,
} from '@/features/receptionist/types/receptionistServiceOrders.types';
import type {
  ClientSearchResultDto,
  ClientServiceOrderSummaryDto,
} from '@/features/receptionist/types/receptionistClients.types';
import type { VehicleSearchResultDto } from '@/features/receptionist/types/receptionistVehicles.types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';

interface ServiceOrderCreatedState {
  receptionistServiceOrderCreated?: {
    serviceOrderId: number;
  };
}

type SearchMode = 'customer' | 'vehicle' | 'order';

interface DetailContext {
  customerName?: string;
  customerDocumentNumber?: string;
  customerEmail?: string;
  customerPhoneNumber?: string;
  vehiclePlate?: string;
}

const SEARCH_MODES: Array<{
  id: SearchMode;
  label: string;
  description: string;
}> = [
  {
    id: 'customer',
    label: 'Customer document',
    description: 'Find a customer first, then review their service orders.',
  },
  {
    id: 'vehicle',
    label: 'Vehicle plate',
    description: 'Find a vehicle by plate or VIN, then filter orders by vehicle ID.',
  },
  {
    id: 'order',
    label: 'Order search',
    description: 'Use direct order search by order ID or description.',
  },
];

function resolveOrderStatusLabel(
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

function enrichClientOrders(
  orders: ClientServiceOrderSummaryDto[],
  client: ClientSearchResultDto,
): ReceptionistServiceOrderTableRow[] {
  return orders.map((order) => ({
    serviceOrderId: order.serviceOrderId,
    vehicleId: order.vehicleId,
    orderStatusId: order.orderStatusId,
    entryDate: order.entryDate,
    estimatedDeliveryDate: order.estimatedDeliveryDate,
    generalDescription: order.generalDescription,
    customerName: client.fullName,
    customerDocumentNumber: client.documentNumber,
    customerEmail: client.primaryEmail,
    customerPhoneNumber: client.primaryPhoneNumber,
  }));
}

function enrichVehicleOrders(
  orders: ReceptionistServiceOrderTableRow[],
  vehicle: VehicleSearchResultDto,
): ReceptionistServiceOrderTableRow[] {
  return orders
    .filter((order) => order.vehicleId === vehicle.vehicleId)
    .map((order) => ({
      ...order,
      vehiclePlate: vehicle.plate,
    }));
}

function ServiceOrderDetailContent({
  order,
  context,
  orderStatusNameById,
  serviceTypeNameById,
}: {
  order: ServiceOrderFullDetailDto | null;
  context: DetailContext | null;
  orderStatusNameById: Map<number, string>;
  serviceTypeNameById: Map<number, string>;
}) {
  if (!order) {
    return <div className="text-sm text-text-secondary">No data loaded yet.</div>;
  }

  const vehiclePlate = order.vehiclePlate ?? context?.vehiclePlate;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Order #{order.serviceOrderId}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 text-sm">
          {context?.customerName || context?.customerDocumentNumber ? (
            <div className="rounded-lg border border-border bg-bg-elevated p-3">
              <p className="font-medium text-text-primary">{context.customerName ?? 'Customer'}</p>
              <p className="text-text-secondary">
                Document: {context.customerDocumentNumber ?? 'No document'}
              </p>
              <p className="text-text-secondary">
                {[context.customerEmail, context.customerPhoneNumber].filter(Boolean).join(' / ') ||
                  'No contact data'}
              </p>
            </div>
          ) : null}
          <p>
            Vehicle{' '}
            <span className="font-semibold text-text-primary">
              {vehiclePlate ? `${vehiclePlate} (#${order.vehicleId})` : `#${order.vehicleId}`}
            </span>
          </p>
          <p>
            Status:{' '}
            {resolveOrderStatusLabel(order.orderStatusId, orderStatusNameById)}
          </p>
          <p>Entry date: {formatDateTime(order.entryDate)}</p>
          <p>
            Estimated delivery:{' '}
            {order.estimatedDeliveryDate ? formatDateTime(order.estimatedDeliveryDate) : '-'}
          </p>
          <p>Description: {order.generalDescription || '-'}</p>
        </CardContent>
      </Card>

      {order.inventory ? (
        <Card>
          <CardHeader>
            <CardTitle>Intake inventory</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2 text-sm">
            <p>Has scratches: {order.inventory.hasScratches ? 'Yes' : 'No'}</p>
            <p>
              Scratches description:{' '}
              {order.inventory.hasScratches ? order.inventory.scratchesDescription || '-' : '-'}
            </p>
            <p>Has toolbox: {order.inventory.hasToolbox ? 'Yes' : 'No'}</p>
            <p>
              Toolbox description:{' '}
              {order.inventory.hasToolbox ? order.inventory.toolboxDescription || '-' : '-'}
            </p>
            <p>Ownership card delivered: {order.inventory.ownershipCardDelivered ? 'Yes' : 'No'}</p>
            <p>Observations: {order.inventory.observations || '-'}</p>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Requested services</CardTitle>
        </CardHeader>
        <CardContent>
          {order.services.length === 0 ? (
            <EmptyState
              title="No services found"
              description="The selected order does not have initial service lines."
              className="border-none bg-transparent p-0"
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Service</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Labor cost</TableHead>
                  <TableHead>Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {order.services.map((service) => (
                  <TableRow key={service.orderServiceId}>
                    <TableCell>#{service.orderServiceId}</TableCell>
                    <TableCell>
                      {serviceTypeNameById.get(service.serviceTypeId) ??
                        `Type #${service.serviceTypeId}`}
                    </TableCell>
                    <TableCell>{formatCurrency(service.laborCost)}</TableCell>
                    <TableCell>{service.description || '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export function ReceptionistServiceOrdersPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = (location.state as ServiceOrderCreatedState | null) ?? null;
  const created = locationState?.receptionistServiceOrderCreated;

  const [searchMode, setSearchMode] = useState<SearchMode>('customer');
  const orderSearch = useReceptionistServiceOrderSearch({ minTermLength: 2 });
  const clientSearch = useReceptionistClientSearch({ minTermLength: 2 });
  const vehicleSearch = useReceptionistVehicleSearch({ minTermLength: 2 });
  const { lookups, isLoading: catalogsLoading, error: catalogsError } = useWorkshopCatalogs();

  const clientOrdersRequestIdRef = useRef(0);
  const vehicleOrdersRequestIdRef = useRef(0);
  const detailRequestIdRef = useRef(0);

  const [selectedClient, setSelectedClient] = useState<ClientSearchResultDto | null>(null);
  const [clientOrders, setClientOrders] = useState<ReceptionistServiceOrderTableRow[]>([]);
  const [isLoadingClientOrders, setIsLoadingClientOrders] = useState(false);
  const [clientOrdersError, setClientOrdersError] = useState<string | null>(null);

  const [selectedVehicle, setSelectedVehicle] = useState<VehicleSearchResultDto | null>(null);
  const [vehicleOrders, setVehicleOrders] = useState<ReceptionistServiceOrderTableRow[]>([]);
  const [isLoadingVehicleOrders, setIsLoadingVehicleOrders] = useState(false);
  const [vehicleOrdersError, setVehicleOrdersError] = useState<string | null>(null);

  const [openOrderDetail, setOpenOrderDetail] = useState(false);
  const [selectedDetailOrderId, setSelectedDetailOrderId] = useState<number | null>(null);
  const [selectedDetailContext, setSelectedDetailContext] = useState<DetailContext | null>(null);
  const [orderDetail, setOrderDetail] = useState<ServiceOrderFullDetailDto | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  const resetModeState = useCallback(() => {
    setSelectedClient(null);
    setClientOrders([]);
    setClientOrdersError(null);
    setIsLoadingClientOrders(false);
    setSelectedVehicle(null);
    setVehicleOrders([]);
    setVehicleOrdersError(null);
    setIsLoadingVehicleOrders(false);
    clientOrdersRequestIdRef.current += 1;
    vehicleOrdersRequestIdRef.current += 1;
  }, []);

  const handleModeChange = useCallback(
    (mode: SearchMode) => {
      if (mode === searchMode) {
        return;
      }

      resetModeState();
      orderSearch.setTerm('');
      clientSearch.setTerm('');
      vehicleSearch.setTerm('');
      setSearchMode(mode);
    },
    [clientSearch, orderSearch, resetModeState, searchMode, vehicleSearch],
  );

  const loadOrdersForClient = useCallback(async (client: ClientSearchResultDto) => {
    const requestId = clientOrdersRequestIdRef.current + 1;
    clientOrdersRequestIdRef.current = requestId;

    setSelectedClient(client);
    setClientOrders([]);
    setClientOrdersError(null);
    setIsLoadingClientOrders(true);

    try {
      const response = await receptionistClientsApi.getClientServiceOrders(client.personId);

      if (clientOrdersRequestIdRef.current !== requestId) {
        return;
      }

      setClientOrders(enrichClientOrders(response.data, client));
    } catch (err) {
      if (clientOrdersRequestIdRef.current !== requestId) {
        return;
      }

      setClientOrdersError(getErrorMessage(err));
    } finally {
      if (clientOrdersRequestIdRef.current === requestId) {
        setIsLoadingClientOrders(false);
      }
    }
  }, []);

  const loadOrdersForVehicle = useCallback(async (vehicle: VehicleSearchResultDto) => {
    const requestId = vehicleOrdersRequestIdRef.current + 1;
    vehicleOrdersRequestIdRef.current = requestId;

    setSelectedVehicle(vehicle);
    setVehicleOrders([]);
    setVehicleOrdersError(null);
    setIsLoadingVehicleOrders(true);

    try {
      const response = await receptionistServiceOrdersApi.getAll();

      if (vehicleOrdersRequestIdRef.current !== requestId) {
        return;
      }

      setVehicleOrders(
        enrichVehicleOrders(response.data as ReceptionistServiceOrderTableRow[], vehicle),
      );
    } catch (err) {
      if (vehicleOrdersRequestIdRef.current !== requestId) {
        return;
      }

      setVehicleOrdersError(getErrorMessage(err));
    } finally {
      if (vehicleOrdersRequestIdRef.current === requestId) {
        setIsLoadingVehicleOrders(false);
      }
    }
  }, []);

  const activeOrders = useMemo<ReceptionistServiceOrderTableRow[]>(() => {
    if (searchMode === 'customer') {
      return clientOrders;
    }

    if (searchMode === 'vehicle') {
      return vehicleOrders;
    }

    return orderSearch.results;
  }, [clientOrders, orderSearch.results, searchMode, vehicleOrders]);

  const activeOrderById = useMemo(() => {
    return new Map(activeOrders.map((order) => [order.serviceOrderId, order]));
  }, [activeOrders]);

  const isTableLoading =
    searchMode === 'customer'
      ? isLoadingClientOrders
      : searchMode === 'vehicle'
        ? isLoadingVehicleOrders
        : orderSearch.isSearching;

  const tableError =
    searchMode === 'customer'
      ? clientOrdersError
      : searchMode === 'vehicle'
        ? vehicleOrdersError
        : orderSearch.error;

  const hasTableSearched =
    searchMode === 'customer'
      ? Boolean(selectedClient)
      : searchMode === 'vehicle'
        ? Boolean(selectedVehicle)
        : orderSearch.hasSearched;

  const tableSearchTerm =
    searchMode === 'customer'
      ? selectedClient?.documentNumber ?? clientSearch.term
      : searchMode === 'vehicle'
        ? selectedVehicle?.plate ?? selectedVehicle?.vin ?? vehicleSearch.term
        : orderSearch.term;

  const retryTable = useCallback(() => {
    if (searchMode === 'customer' && selectedClient) {
      void loadOrdersForClient(selectedClient);
      return;
    }

    if (searchMode === 'vehicle' && selectedVehicle) {
      void loadOrdersForVehicle(selectedVehicle);
      return;
    }

    orderSearch.reload();
  }, [
    loadOrdersForClient,
    loadOrdersForVehicle,
    orderSearch,
    searchMode,
    selectedClient,
    selectedVehicle,
  ]);

  const closeOrderDetail = () => {
    setOpenOrderDetail(false);
    setSelectedDetailOrderId(null);
    setSelectedDetailContext(null);
    setOrderDetail(null);
    setDetailError(null);
  };

  const openOrderDetailById = useCallback(
    async (serviceOrderId: number, context?: DetailContext | null) => {
      const requestId = detailRequestIdRef.current + 1;
      detailRequestIdRef.current = requestId;

      setOpenOrderDetail(true);
      setSelectedDetailOrderId(serviceOrderId);
      setSelectedDetailContext(context ?? null);
      setIsLoadingDetail(true);
      setDetailError(null);
      setOrderDetail(null);

      try {
        const response =
          await receptionistServiceOrdersApi.getServiceOrderFullDetail(serviceOrderId);

        if (detailRequestIdRef.current !== requestId) {
          return;
        }

        setOrderDetail(response.data);
      } catch (err) {
        if (detailRequestIdRef.current !== requestId) {
          return;
        }

        setDetailError(getErrorMessage(err));
      } finally {
        if (detailRequestIdRef.current === requestId) {
          setIsLoadingDetail(false);
        }
      }
    },
    [],
  );

  const retryOrderDetail = useCallback(() => {
    if (selectedDetailOrderId) {
      void openOrderDetailById(selectedDetailOrderId, selectedDetailContext);
    }
  }, [openOrderDetailById, selectedDetailContext, selectedDetailOrderId]);

  const handleViewDetail = useCallback(
    (serviceOrderId: number) => {
      const order = activeOrderById.get(serviceOrderId);
      void openOrderDetailById(serviceOrderId, order ?? null);
    },
    [activeOrderById, openOrderDetailById],
  );

  if (catalogsLoading) {
    return (
      <LoadingState
        title="Loading service order context"
        description="Preparing catalog lookups for status labels."
        className="min-h-[260px]"
      />
    );
  }

  if (catalogsError) {
    return (
      <div className="space-y-6">
        <ReceptionistPageHeader
          title="Service Orders"
          description="Search and review service orders for workshop intake operations."
          actions={
            <Button onClick={() => navigate(ROUTES.RECEPTIONIST_SERVICE_ORDERS_NEW)}>
              New service order
            </Button>
          }
        />
        <ErrorState
          title="Unable to load workshop data"
          message={catalogsError}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ReceptionistPageHeader
        title="Service Orders"
        description="Search and review workshop service orders."
        actions={
          <Button onClick={() => navigate(ROUTES.RECEPTIONIST_SERVICE_ORDERS_NEW)}>
            New Service Order
          </Button>
        }
      />

      {created ? (
        <div
          role="status"
          className="rounded-lg border border-success/30 bg-success-muted/40 px-4 py-3 text-sm text-success"
        >
          Service order #{created.serviceOrderId} created correctly.
        </div>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Find active service orders</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-3">
            {SEARCH_MODES.map((mode) => (
              <button
                key={mode.id}
                type="button"
                className={`rounded-lg border px-4 py-3 text-left transition ${
                  searchMode === mode.id
                    ? 'border-accent bg-accent-muted/30 text-text-primary'
                    : 'border-border bg-bg-elevated text-text-secondary hover:border-border-strong hover:text-text-primary'
                }`}
                onClick={() => handleModeChange(mode.id)}
                aria-pressed={searchMode === mode.id}
              >
                <span className="block text-sm font-semibold">{mode.label}</span>
                <span className="mt-1 block text-xs">{mode.description}</span>
              </button>
            ))}
          </div>

          {searchMode === 'customer' ? (
            <div className="space-y-3">
              <div className="relative">
                <UserRound className="pointer-events-none absolute left-3 top-[2.125rem] size-4 text-text-muted" />
                <Input
                  name="customerSearch"
                  label="Search customer"
                  placeholder="Search by document number, name, phone, or email"
                  value={clientSearch.term}
                  onChange={(event) => {
                    setSelectedClient(null);
                    setClientOrders([]);
                    setClientOrdersError(null);
                    clientSearch.setTerm(event.target.value);
                  }}
                  className="pl-9"
                />
              </div>
              {clientSearch.termTooShort ? (
                <p className="text-xs text-text-secondary">
                  Search needs at least {clientSearch.minTermLength} characters.
                </p>
              ) : null}
              {clientSearch.isSearching ? (
                <p className="text-xs text-text-secondary">Searching customers...</p>
              ) : null}
              {clientSearch.error ? (
                <p className="text-xs text-danger">{clientSearch.error}</p>
              ) : null}
              {clientSearch.results.length > 0 ? (
                <div className="grid gap-2">
                  {clientSearch.results.map((client) => (
                    <button
                      key={client.personId}
                      type="button"
                      className={`rounded-lg border px-4 py-3 text-left transition ${
                        selectedClient?.personId === client.personId
                          ? 'border-accent bg-accent-muted/30'
                          : 'border-border bg-bg-elevated hover:border-border-strong'
                      }`}
                      onClick={() => {
                        void loadOrdersForClient(client);
                      }}
                      aria-pressed={selectedClient?.personId === client.personId}
                    >
                      <span className="flex flex-wrap items-center gap-2 text-sm font-medium text-text-primary">
                        {client.fullName}
                        {selectedClient?.personId === client.personId ? (
                          <Badge variant="accent">Selected</Badge>
                        ) : null}
                      </span>
                      <span className="mt-1 block text-xs text-text-secondary">
                        {client.documentNumber || 'No document'}
                      </span>
                      <span className="mt-1 block text-xs text-text-secondary">
                        {[client.primaryEmail, client.primaryPhoneNumber].filter(Boolean).join(' / ') ||
                          'No contact data'}
                      </span>
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          ) : null}

          {searchMode === 'vehicle' ? (
            <div className="space-y-3">
              <div className="relative">
                <Car className="pointer-events-none absolute left-3 top-[2.125rem] size-4 text-text-muted" />
                <Input
                  name="vehicleSearch"
                  label="Search vehicle"
                  placeholder="Search by plate or VIN"
                  value={vehicleSearch.term}
                  onChange={(event) => {
                    setSelectedVehicle(null);
                    setVehicleOrders([]);
                    setVehicleOrdersError(null);
                    vehicleSearch.setTerm(event.target.value);
                  }}
                  className="pl-9"
                />
              </div>
              {vehicleSearch.termTooShort ? (
                <p className="text-xs text-text-secondary">
                  Search needs at least {vehicleSearch.minTermLength} characters.
                </p>
              ) : null}
              {vehicleSearch.isSearching ? (
                <p className="text-xs text-text-secondary">Searching vehicles...</p>
              ) : null}
              {vehicleSearch.error ? (
                <p className="text-xs text-danger">{vehicleSearch.error}</p>
              ) : null}
              {vehicleSearch.results.length > 0 ? (
                <div className="grid gap-2">
                  {vehicleSearch.results.map((vehicle) => (
                    <button
                      key={vehicle.vehicleId}
                      type="button"
                      className={`rounded-lg border px-4 py-3 text-left transition ${
                        selectedVehicle?.vehicleId === vehicle.vehicleId
                          ? 'border-accent bg-accent-muted/30'
                          : 'border-border bg-bg-elevated hover:border-border-strong'
                      }`}
                      onClick={() => {
                        void loadOrdersForVehicle(vehicle);
                      }}
                      aria-pressed={selectedVehicle?.vehicleId === vehicle.vehicleId}
                    >
                      <span className="flex flex-wrap items-center gap-2 text-sm font-medium text-text-primary">
                        {vehicle.plate || `Vehicle #${vehicle.vehicleId}`}
                        {selectedVehicle?.vehicleId === vehicle.vehicleId ? (
                          <Badge variant="accent">Selected</Badge>
                        ) : null}
                      </span>
                      <span className="mt-1 block text-xs text-text-secondary">
                        VIN: {vehicle.vin}
                      </span>
                      <span className="mt-1 block text-xs text-text-secondary">
                        Year {vehicle.year}
                        {vehicle.color ? ` / ${vehicle.color}` : ''}
                      </span>
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          ) : null}

          {searchMode === 'order' ? (
            <div className="space-y-3">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-[2.125rem] size-4 text-text-muted" />
                <Input
                  name="serviceOrderSearch"
                  label="Search service orders"
                  placeholder="Search by order ID or description"
                  value={orderSearch.term}
                  onChange={(event) => orderSearch.setTerm(event.target.value)}
                  className="pl-9"
                />
              </div>
              {orderSearch.termTooShort ? (
                <p className="text-xs text-text-secondary">
                  Search needs at least {orderSearch.minTermLength} characters.
                </p>
              ) : null}
            </div>
          ) : null}
        </CardContent>
      </Card>

      <ReceptionistServiceOrdersTable
        orders={activeOrders}
        isLoading={isTableLoading}
        error={tableError}
        hasSearched={hasTableSearched}
        searchTerm={tableSearchTerm}
        orderStatusNameById={lookups.orderStatusNameById}
        onRetry={retryTable}
        onViewDetail={handleViewDetail}
      />

      <Modal
        open={openOrderDetail}
        onClose={closeOrderDetail}
        title="Service order detail"
        description="Current order state and intake lines."
        size="lg"
      >
        {isLoadingDetail ? (
          <LoadingState
            title="Loading service order detail"
            description="Getting full record from the workshop workflow."
          />
        ) : detailError ? (
          <ErrorState
            title="Unable to load order detail"
            message={detailError}
            onRetry={retryOrderDetail}
          />
        ) : (
          <ServiceOrderDetailContent
            order={orderDetail}
            context={selectedDetailContext}
            orderStatusNameById={lookups.orderStatusNameById}
            serviceTypeNameById={lookups.serviceTypeNameById}
          />
        )}
      </Modal>
    </div>
  );
}
