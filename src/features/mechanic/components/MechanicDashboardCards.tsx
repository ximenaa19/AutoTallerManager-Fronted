import {
  ClipboardList,
  Package,
  Wrench,
} from 'lucide-react';
import { DashboardGrid } from '@/components/dashboard/DashboardGrid';
import { StatCard } from '@/components/dashboard/StatCard';
import type { MechanicDashboardDto } from '@/features/mechanic/types/mechanicDashboard.types';
import { formatNumber } from '@/utils/format';

export interface MechanicDashboardCardsProps {
  data: MechanicDashboardDto;
}

export function MechanicDashboardCards({ data }: MechanicDashboardCardsProps) {
  return (
    <DashboardGrid className="2xl:grid-cols-2">
      <StatCard
        title="Assigned Services"
        value={formatNumber(data.assignedServices)}
        icon={<Wrench className="size-5" />}
        tone="purple"
        footer="Services assigned to you"
      />
      <StatCard
        title="Active Orders"
        value={formatNumber(data.activeOrders)}
        icon={<ClipboardList className="size-5" />}
        tone="info"
        footer="Orders currently in progress"
      />
      <StatCard
        title="Pending Work Reports"
        value={formatNumber(data.pendingWorkReports)}
        icon={<Wrench className="size-5" />}
        tone="warning"
        footer="Reports awaiting submission. Open Assigned Services to record work."
      />
      <StatCard
        title="Parts Pending Approval"
        value={formatNumber(data.requestedPartsPendingApproval)}
        icon={<Package className="size-5" />}
        tone="danger"
        footer="Part requests awaiting staff review. Request Parts workflow comes in the next phase."
      />
    </DashboardGrid>
  );
}
