import { useNavigate } from 'react-router-dom';
import { ReceptionistPageHeader } from '@/features/receptionist/components/ReceptionistPageHeader';
import { CreateServiceOrderIntakeForm } from '@/features/receptionist/components/CreateServiceOrderIntakeForm';
import { ROUTES } from '@/routes/routePaths';

export function ReceptionistCreateServiceOrderPage() {
  const navigate = useNavigate();

  const handleSuccess = (serviceOrderId: number) => {
    navigate(ROUTES.RECEPTIONIST_SERVICE_ORDERS, {
      state: { receptionistServiceOrderCreated: { serviceOrderId } },
    });
  };

  return (
    <div className="space-y-6">
      <ReceptionistPageHeader
        title="New Service Order"
        description="Create workshop intake for an existing client vehicle."
        actions={null}
      />
      <CreateServiceOrderIntakeForm
        onCancel={() => navigate(ROUTES.RECEPTIONIST_SERVICE_ORDERS)}
        onSubmitSuccess={handleSuccess}
      />
    </div>
  );
}
