import { useState } from 'react';
import { BarChart3 } from 'lucide-react';
import { AdminPageHeader } from '@/features/admin/components/AdminPageHeader';
import { InventoryReportPanel } from '@/features/admin/reports/components/InventoryReportPanel';
import { MechanicsReportPanel } from '@/features/admin/reports/components/MechanicsReportPanel';
import { PaymentsReportPanel } from '@/features/admin/reports/components/PaymentsReportPanel';
import { ReportDateRangeFilter } from '@/features/admin/reports/components/ReportDateRangeFilter';
import { SalesReportPanel } from '@/features/admin/reports/components/SalesReportPanel';
import { ServiceOrdersReportPanel } from '@/features/admin/reports/components/ServiceOrdersReportPanel';
import { useReportFilters } from '@/features/admin/reports/hooks/useReportFilters';
import type { ReportPanelKey } from '@/features/admin/reports/types/reports.types';
import { cn } from '@/lib/cn';

const reportTabs: { key: ReportPanelKey; label: string }[] = [
  { key: 'sales', label: 'Sales' },
  { key: 'inventory', label: 'Inventory' },
  { key: 'service-orders', label: 'Service orders' },
  { key: 'payments', label: 'Payments' },
  { key: 'mechanics', label: 'Mechanics' },
];

export function ReportsPage() {
  const {
    draft,
    setDraft,
    queryParams,
    apply,
    clear,
    rangeLabel,
  } = useReportFilters();

  const [activeTab, setActiveTab] = useState<ReportPanelKey>('sales');

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Reports"
        description="Operational analytics for sales, inventory, service orders, payments, and mechanics. Metrics come from confirmed admin report endpoints."
        actions={
          <div className="flex items-center gap-2 rounded-lg border border-border bg-bg-muted/30 px-3 py-2 text-sm text-text-secondary">
            <BarChart3 className="size-4 text-accent" aria-hidden />
            Admin analytics
          </div>
        }
      />

      <ReportDateRangeFilter
        draft={draft}
        onDraftChange={setDraft}
        onApply={apply}
        onClear={clear}
        rangeLabel={rangeLabel}
      />

      <nav
        className="flex flex-wrap gap-2 border-b border-border pb-1"
        aria-label="Report sections"
      >
        {reportTabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              'rounded-t-lg px-4 py-2 text-sm font-medium transition-colors',
              activeTab === tab.key
                ? 'border border-b-0 border-border bg-bg-surface text-accent'
                : 'text-text-secondary hover:bg-bg-muted/40 hover:text-text-primary',
            )}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {activeTab === 'sales' && <SalesReportPanel queryParams={queryParams} />}
      {activeTab === 'inventory' && (
        <InventoryReportPanel queryParams={queryParams} />
      )}
      {activeTab === 'service-orders' && (
        <ServiceOrdersReportPanel queryParams={queryParams} />
      )}
      {activeTab === 'payments' && <PaymentsReportPanel queryParams={queryParams} />}
      {activeTab === 'mechanics' && <MechanicsReportPanel queryParams={queryParams} />}
    </div>
  );
}
