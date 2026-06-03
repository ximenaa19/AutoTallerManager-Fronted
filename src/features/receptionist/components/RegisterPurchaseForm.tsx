import type { FormEvent } from 'react';
import { CalendarDays } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PartPickerPanel } from '@/features/receptionist/components/PartPickerPanel';
import { PurchaseDetailsEditor } from '@/features/receptionist/components/PurchaseDetailsEditor';
import { PurchaseSummaryPanel } from '@/features/receptionist/components/PurchaseSummaryPanel';
import { SupplierSearchPanel } from '@/features/receptionist/components/SupplierSearchPanel';
import type { UseReceptionistPartSearchResult } from '@/features/receptionist/hooks/useReceptionistPartSearch';
import type { UseReceptionistPurchaseFormResult } from '@/features/receptionist/hooks/useReceptionistPurchaseForm';
import type { UseReceptionistSupplierSearchResult } from '@/features/receptionist/hooks/useReceptionistSupplierSearch';

export interface RegisterPurchaseFormProps {
  supplierSearch: UseReceptionistSupplierSearchResult;
  partSearch: UseReceptionistPartSearchResult;
  purchaseForm: UseReceptionistPurchaseFormResult;
  onSubmit: () => void;
}

export function RegisterPurchaseForm({
  supplierSearch,
  partSearch,
  purchaseForm,
  onSubmit,
}: RegisterPurchaseFormProps) {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_360px]">
        <div className="space-y-6">
          <SupplierSearchPanel
            searchTerm={supplierSearch.term}
            onSearchTermChange={supplierSearch.setTerm}
            results={supplierSearch.results}
            isSearching={supplierSearch.isSearching}
            error={supplierSearch.error}
            hasSearched={supplierSearch.hasSearched}
            termTooShort={supplierSearch.termTooShort}
            minTermLength={supplierSearch.minTermLength}
            onRetry={supplierSearch.reload}
            selectedSupplier={purchaseForm.selectedSupplier}
            onSupplierSelect={purchaseForm.selectSupplier}
          />

          <PartPickerPanel
            searchTerm={partSearch.term}
            onSearchTermChange={partSearch.setTerm}
            results={partSearch.results}
            isSearching={partSearch.isSearching}
            error={partSearch.error}
            hasSearched={partSearch.hasSearched}
            termTooShort={partSearch.termTooShort}
            minTermLength={partSearch.minTermLength}
            onRetry={partSearch.reload}
            selectedPart={purchaseForm.draftPart}
            onPartSelect={purchaseForm.selectDraftPart}
            onClearPart={() => purchaseForm.selectDraftPart(null)}
          />

          <PurchaseDetailsEditor
            selectedPart={purchaseForm.draftPart}
            draftQuantity={purchaseForm.draftQuantity}
            draftUnitPrice={purchaseForm.draftUnitPrice}
            draftLineError={purchaseForm.draftLineError}
            onDraftQuantityChange={purchaseForm.setDraftQuantity}
            onDraftUnitPriceChange={purchaseForm.setDraftUnitPrice}
            onAddLine={purchaseForm.addDraftLine}
            lines={purchaseForm.lines}
            onRemoveLine={purchaseForm.removeLine}
            isSubmitting={purchaseForm.isSubmitting}
          />
        </div>

        <div className="space-y-4">
          <PurchaseSummaryPanel
            selectedSupplier={purchaseForm.selectedSupplier}
            lineCount={purchaseForm.lineCount}
            totalVisual={purchaseForm.totalVisual}
          />

          <div className="space-y-4 rounded-lg border border-border bg-bg-surface p-4">
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-text-primary">Purchase date</h3>
              <p className="text-xs text-text-secondary">
                Optional. If not set, backend uses current date.
              </p>
            </div>

            <Input
              name="purchase-date"
              type="date"
              label="Purchase date"
              value={purchaseForm.purchaseDate}
              onChange={(event) => purchaseForm.setPurchaseDate(event.target.value)}
            />

            <Button
              type="submit"
              className="w-full"
              isLoading={purchaseForm.isSubmitting}
              disabled={!purchaseForm.canSubmit}
              leftIcon={<CalendarDays className="size-4" />}
            >
              Register Purchase
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}
