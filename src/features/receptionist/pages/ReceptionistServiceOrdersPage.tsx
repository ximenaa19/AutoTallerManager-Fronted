import { useCallback, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ErrorState } from '@/components/feedback/ErrorState';
import { EmptyState } from '@/components/feedback/EmptyState';
import { LoadingState } from '@/components/feedback/LoadingState';
import { Modal } from '@/components/ui/Modal';
import { ReceptionistPageHeader } from '@/features/receptionist/components/ReceptionistPageHeader';
import { ReceptionistServiceOrdersTable } from '@/features/receptionist/components/ReceptionistServiceOrdersTable';
import { getErrorMessage } from '@/api/apiError';
import { Input } from '@/components/ui/Input';
import { receptionistServiceOrdersApi } from '@/features/receptionist/api/receptionistServiceOrders.api';
import { useReceptionistServiceOrderSearch } from '@/features/receptionist/hooks/useReceptionistServiceOrderSearch';
import { useWorkshopCatalogs } from '@/features/receptionist/hooks/useWorkshopCatalogs';
import { formatDateTime } from '@/utils/format';
import { ROUTES } from '@/routes/routePaths';
import type { ServiceOrderFullDetailDto } from '@/features/receptionist/types/receptionistServiceOrders.types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';

interface ServiceOrderCreatedState {
  receptionistServiceOrderCreated?: {
    serviceOrderId: number;
  };
}

function ServiceOrderDetailContent({ order }: { order: ServiceOrderFullDetailDto | null }) {
  if (!order) {
    return <div className="text-sm text-text-secondary">No data loaded yet.</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Order #{order.serviceOrderId}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 text-sm">
          <p>
            Vehicle <span className="font-semibold text-text-primary">#{order.vehicleId}</span>
          </p>
          <p>Entry date: {formatDateTime(order.entryDate)}</p>
          <p>
            Estimated delivery:{' '}
            {order.estimatedDeliveryDate ? formatDateTime(order.estimatedDeliveryDate) : '—'}
          </p>
          <p>Description: {order.generalDescription || '—'}</p>
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
              {order.inventory.hasScratches ? order.inventory.scratchesDescription || '—' : '—'}
            </p>
            <p>Has toolbox: {order.inventory.hasToolbox ? 'Yes' : 'No'}</p>
            <p>
              Toolbox description:{' '}
              {order.inventory.hasToolbox ? order.inventory.toolboxDescription || '—' : '—'}
            </p>
            <p>Ownership card delivered: {order.inventory.ownershipCardDelivered ? 'Yes' : 'No'}</p>
            <p>Observations: {order.inventory.observations || '—'}</p>
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
                  <TableHead>Type ID</TableHead>
                  <TableHead>Labor cost</TableHead>
                  <TableHead>Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {order.services.map((service) => (
                  <TableRow key={service.orderServiceId}>
                    <TableCell>#{service.orderServiceId}</TableCell>
                    <TableCell>{service.serviceTypeId}</TableCell>
                    <TableCell>{service.laborCost}</TableCell>
                    <TableCell>{service.description || '—'}</TableCell>
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

  const search = useReceptionistServiceOrderSearch({ minTermLength: 2 });
  const { lookups, isLoading: catalogsLoading, error: catalogsError } = useWorkshopCatalogs();

  const [openOrderDetail, setOpenOrderDetail] = useState(false);
  const [orderDetail, setOrderDetail] = useState<ServiceOrderFullDetailDto | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  const closeOrderDetail = () => {
    setOpenOrderDetail(false);
    setOrderDetail(null);
    setDetailError(null);
  };

  const openOrderDetailById = useCallback(async (serviceOrderId: number) => {
    setOpenOrderDetail(true);
    setIsLoadingDetail(true);
    setDetailError(null);
    setOrderDetail(null);

    try {
      const response = await receptionistServiceOrdersApi.getServiceOrderFullDetail(serviceOrderId);
      setOrderDetail(response.data);
    } catch (err) {
      setDetailError(getErrorMessage(err));
    } finally {
      setIsLoadingDetail(false);
    }
  }, []);

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

      <div className="rounded-lg border border-border bg-bg-surface p-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-[2.125rem] size-4 text-text-muted" />
          <Input
            name="serviceOrderSearch"
            label="Search service orders"
            placeholder="Search by order ID, vehicle ID, or description"
            value={search.term}
            onChange={(event) => search.setTerm(event.target.value)}
            className="pl-9"
          />
        </div>
        {search.termTooShort ? (
          <p className="mt-2 text-xs text-text-secondary">
            Search needs at least {search.minTermLength} characters.
          </p>
        ) : null}
      </div>

      <ReceptionistServiceOrdersTable
        orders={search.results}
        isLoading={search.isSearching}
        error={search.error}
        hasSearched={search.hasSearched}
        searchTerm={search.term}
        orderStatusNameById={lookups.orderStatusNameById}
        onRetry={search.reload}
        onViewDetail={openOrderDetailById}
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
            onRetry={search.reload}
          />
        ) : (
          <ServiceOrderDetailContent order={orderDetail} />
        )}
      </Modal>
    </div>
  );
}
