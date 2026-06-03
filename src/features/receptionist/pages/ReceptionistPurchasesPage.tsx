import { ReceptionistPageHeader } from '@/features/receptionist/components/ReceptionistPageHeader';
import { RegisterPurchaseForm } from '@/features/receptionist/components/RegisterPurchaseForm';
import { useReceptionistPartSearch } from '@/features/receptionist/hooks/useReceptionistPartSearch';
import { useReceptionistPurchaseForm } from '@/features/receptionist/hooks/useReceptionistPurchaseForm';
import { useReceptionistSupplierSearch } from '@/features/receptionist/hooks/useReceptionistSupplierSearch';

export function ReceptionistPurchasesPage() {
  const supplierSearch = useReceptionistSupplierSearch({ minTermLength: 2 });
  const partSearch = useReceptionistPartSearch({ minTermLength: 2 });
  const purchaseForm = useReceptionistPurchaseForm();

  const handleSubmit = () => {
    void purchaseForm.submitPurchase();
  };

  return (
    <div className="space-y-6">
      <ReceptionistPageHeader
        title="Purchases"
        description="Register spare parts purchases for reception operations."
      />

      {purchaseForm.successMessage ? (
        <div
          role="status"
          className="rounded-lg border border-success/30 bg-success-muted/30 px-4 py-3 text-sm text-success"
        >
          {purchaseForm.successMessage}
        </div>
      ) : null}

      {purchaseForm.formError ? (
        <div
          role="alert"
          className="rounded-lg border border-danger/30 bg-danger-muted/30 px-4 py-3 text-sm text-danger"
        >
          {purchaseForm.formError}
        </div>
      ) : null}

      <RegisterPurchaseForm
        supplierSearch={supplierSearch}
        partSearch={partSearch}
        purchaseForm={purchaseForm}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
