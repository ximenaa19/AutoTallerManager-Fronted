import { Search } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { ReceptionistPageHeader } from '@/features/receptionist/components/ReceptionistPageHeader';
import { DashboardSection } from '@/components/dashboard/DashboardSection';
import { useReceptionistInventory } from '@/features/receptionist/hooks/useReceptionistInventory';
import { useReceptionistPartSearch } from '@/features/receptionist/hooks/useReceptionistPartSearch';
import {
  ReceptionistInventorySummaryCards,
} from '@/features/receptionist/components/ReceptionistInventorySummaryCards';
import { ReceptionistLowStockPanel } from '@/features/receptionist/components/ReceptionistLowStockPanel';
import { ReceptionistPartsSearchTable } from '@/features/receptionist/components/ReceptionistPartsSearchTable';

export function ReceptionistInventoryPage() {
  const inventory = useReceptionistInventory();
  const partSearch = useReceptionistPartSearch({ minTermLength: 2 });

  return (
    <div className="space-y-8">
      <ReceptionistPageHeader
        title="Inventory"
        description="Operational parts consultation for receptionist workflows: overview, low-stock alerts, and lookup for service order support."
      />

      <ReceptionistInventorySummaryCards
        summary={inventory.summary}
        isLoading={inventory.isSummaryLoading}
        error={inventory.summaryError}
        onRetry={inventory.reloadSummary}
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_360px]">
        <section className="space-y-4">
          <DashboardSection title="Part search">
            <div className="rounded-lg border border-border bg-bg-surface p-4">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-[2.125rem] size-4 text-text-muted" />
                <Input
                  name="receptionist-part-search"
                  label="Search parts"
                  placeholder="Search by code or description"
                  value={partSearch.term}
                  onChange={(event) => partSearch.setTerm(event.target.value)}
                  className="pl-9"
                />
              </div>
              {partSearch.termTooShort ? (
                <p className="mt-2 text-xs text-text-secondary">
                  Search requires at least {partSearch.minTermLength} characters.
                </p>
              ) : null}
            </div>

            <ReceptionistPartsSearchTable
              results={partSearch.results}
              isLoading={partSearch.isSearching}
              error={partSearch.error}
              hasSearched={partSearch.hasSearched}
              searchTerm={partSearch.term}
              onRetry={partSearch.reload}
            />
          </DashboardSection>
        </section>

        <ReceptionistLowStockPanel
          parts={inventory.lowStockParts}
          isLoading={inventory.isLowStockLoading}
          error={inventory.lowStockError}
          onRetry={inventory.reloadLowStock}
        />
      </div>
    </div>
  );
}
