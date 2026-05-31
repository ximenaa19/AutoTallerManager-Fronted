import { useState } from 'react';
import {
  Users,
  ClipboardList,
  Wrench,
  Package,
  Car,
  AlertTriangle,
} from 'lucide-react';
import {
  AppShell,
  AppShellBrand,
  AppShellContent,
} from '@/components/layout/AppShell';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  MetricCard,
} from '@/components/ui/Card';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingState } from '@/components/feedback/LoadingState';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table';
import { Textarea } from '@/components/ui/Textarea';
import { getApiBaseUrl } from '@/lib/env';

const sampleOrders = [
  { id: 'SO-1042', client: 'Maria Lopez', vehicle: '2019 Toyota Corolla', status: 'pending' as const },
  { id: 'SO-1041', client: 'John Smith', vehicle: '2021 Ford F-150', status: 'active' as const },
  { id: 'SO-1039', client: 'Ana Garcia', vehicle: '2018 Honda Civic', status: 'completed' as const },
  { id: 'SO-1037', client: 'Carlos Ruiz', vehicle: '2020 Nissan Sentra', status: 'cancelled' as const },
];

const statusBadgeMap = {
  active: 'active' as const,
  pending: 'pending' as const,
  completed: 'completed' as const,
  cancelled: 'cancelled' as const,
};

const statusLabelMap = {
  active: 'Active',
  pending: 'Pending',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export function DesignPreview() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <AppShell
      sidebar={
        <div>
          <AppShellBrand />
          <div className="border-t border-border px-5 py-4">
            <p className="text-xs text-text-muted">
              Sidebar navigation will be implemented in Phase 3.
            </p>
          </div>
        </div>
      }
      topbar={
        <div className="flex h-14 items-center justify-between px-4 sm:px-6">
          <p className="text-sm font-medium text-text-secondary">
            Phase 1 — Design System Preview
          </p>
          <Badge variant="accent">Foundation</Badge>
        </div>
      }
    >
      <AppShellContent className="space-y-10">
        <section className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-accent">
            AutoTaller Manager
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary sm:text-3xl">
            UI Foundation Preview
          </h1>
          <p className="max-w-2xl text-sm text-text-secondary">
            Internal component showcase for Phase 1. Dark theme, red accent, and
            production-ready primitives aligned with the dashboard reference.
            API base URL: <code className="text-text-primary">{getApiBaseUrl()}</code>
          </p>
        </section>

        {/* Buttons */}
        <section className="space-y-4">
          <SectionHeading title="Buttons" description="Primary, secondary, ghost, and danger variants." />
          <div className="flex flex-wrap gap-3">
            <Button variant="primary">Primary action</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="danger">Danger</Button>
            <Button variant="primary" isLoading>
              Loading
            </Button>
            <Button variant="primary" disabled>
              Disabled
            </Button>
          </div>
        </section>

        {/* Badges */}
        <section className="space-y-4">
          <SectionHeading title="Badges" description="Status labels for orders, inventory, and payments." />
          <div className="flex flex-wrap gap-2">
            <Badge variant="active" dot>Active</Badge>
            <Badge variant="pending" dot>Pending</Badge>
            <Badge variant="completed">Completed</Badge>
            <Badge variant="cancelled">Cancelled</Badge>
            <Badge variant="low-stock" dot>Low stock</Badge>
            <Badge variant="paid">Paid</Badge>
            <Badge variant="unpaid" dot>Unpaid</Badge>
          </div>
        </section>

        {/* Metric cards */}
        <section className="space-y-4">
          <SectionHeading
            title="Metric cards"
            description="Dashboard KPI layout for future role dashboards."
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
            <MetricCard
              title="Total users"
              value="48"
              icon={<Users className="size-5" />}
              iconTone="accent"
              footer="All registered users"
            />
            <MetricCard
              title="Active orders"
              value="36"
              icon={<ClipboardList className="size-5" />}
              iconTone="warning"
              footer="Open service orders"
            />
            <MetricCard
              title="Mechanics"
              value="18"
              icon={<Wrench className="size-5" />}
              iconTone="purple"
              footer="Workshop staff"
            />
            <MetricCard
              title="Low stock parts"
              value="27"
              icon={<Package className="size-5" />}
              iconTone="danger"
              footer="Requires attention"
            />
            <MetricCard
              title="Vehicles serviced"
              value="156"
              icon={<Car className="size-5" />}
              iconTone="teal"
              footer="This month ↑ 8%"
            />
          </div>
        </section>

        {/* Forms */}
        <section className="space-y-4">
          <SectionHeading title="Form controls" description="Accessible inputs with focus states and validation." />
          <Card className="max-w-2xl">
            <CardHeader>
              <CardTitle>Sample form</CardTitle>
              <CardDescription>
                Form layout preview — not connected to any API endpoint.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <Input label="Full name" placeholder="Enter full name" required />
              <Input
                label="Email"
                type="email"
                placeholder="user@example.com"
                error="Email is required"
              />
              <Select
                label="Service type"
                placeholder="Select a service"
                options={[
                  { value: 'oil', label: 'Oil change' },
                  { value: 'brake', label: 'Brake inspection' },
                  { value: 'diag', label: 'Diagnostics' },
                ]}
                className="sm:col-span-2"
              />
              <Textarea
                label="Notes"
                placeholder="Additional details..."
                className="sm:col-span-2"
              />
            </CardContent>
            <CardFooter>
              <Button variant="ghost">Cancel</Button>
              <Button variant="primary">Save changes</Button>
            </CardFooter>
          </Card>
        </section>

        {/* Table */}
        <section className="space-y-4">
          <SectionHeading title="Data table" description="Dark-mode table for future list pages." />
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Vehicle</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sampleOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.id}</TableCell>
                  <TableCell>{order.client}</TableCell>
                  <TableCell className="text-text-secondary">{order.vehicle}</TableCell>
                  <TableCell>
                    <Badge variant={statusBadgeMap[order.status]} dot>
                      {statusLabelMap[order.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </section>

        {/* Feedback states */}
        <section className="space-y-4">
          <SectionHeading title="Feedback states" description="Loading, empty, and error patterns." />
          <div className="grid gap-4 lg:grid-cols-3">
            <Card>
              <LoadingState
                title="Loading data"
                description="Fetching workshop summary..."
              />
            </Card>
            <Card>
              <EmptyState
                title="No service orders yet"
                description="Create your first service order to get started."
                action={<Button variant="primary" size="sm">Create order</Button>}
              />
            </Card>
            <Card padding="none">
              <ErrorState
                message="Unable to load dashboard data. Please try again."
                onRetry={() => undefined}
              />
            </Card>
          </div>
        </section>

        {/* Modal */}
        <section className="space-y-4">
          <SectionHeading title="Modal" description="Confirmation and form dialog pattern." />
          <Button variant="secondary" onClick={() => setModalOpen(true)}>
            Open sample modal
          </Button>
          <Modal
            open={modalOpen}
            onClose={() => setModalOpen(false)}
            title="Confirm action"
            description="This is a preview of the confirmation dialog pattern."
            footer={
              <>
                <Button variant="ghost" onClick={() => setModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="danger" onClick={() => setModalOpen(false)}>
                  Confirm
                </Button>
              </>
            }
          >
            <div className="flex items-start gap-3 rounded-lg border border-warning/20 bg-warning-muted/40 p-4">
              <AlertTriangle className="mt-0.5 size-5 shrink-0 text-warning" />
              <p className="text-sm text-text-secondary">
                Destructive actions will require explicit confirmation in future
                phases. This modal is for visual testing only.
              </p>
            </div>
          </Modal>
        </section>
      </AppShellContent>
    </AppShell>
  );
}

function SectionHeading({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="space-y-1">
      <h2 className="text-lg font-semibold text-text-primary">{title}</h2>
      <p className="text-sm text-text-secondary">{description}</p>
    </div>
  );
}
