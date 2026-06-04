import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { CreateClientWithVehicleModal } from '@/features/receptionist/components/CreateClientWithVehicleModal';
import { ReceptionistPageHeader } from '@/features/receptionist/components/ReceptionistPageHeader';
import { receptionistClientsApi } from '@/features/receptionist/api/receptionistClients.api';
import { ROUTES } from '@/routes/routePaths';

export function ReceptionistCreateClientPage() {
  const navigate = useNavigate();

  const handleSubmit = async (payload: Parameters<
    typeof receptionistClientsApi.createClientWithVehicle
  >[0]) => {
    const response = await receptionistClientsApi.createClientWithVehicle(payload);

    navigate(ROUTES.RECEPTIONIST_CLIENTS, {
      state: {
        receptionistClientCreated: {
          fullName: response.data.fullName,
          vehicleId: response.data.vehicleId,
          plate: response.data.plate,
        },
      },
    });
  };

  return (
    <div className="space-y-6">
      <ReceptionistPageHeader
        title="Create customer with vehicle"
        description="Register one customer identity and an initial vehicle in one step."
        actions={
          <Button
            variant="secondary"
            onClick={() => navigate(ROUTES.RECEPTIONIST_CLIENTS)}
          >
            <ArrowLeft className="size-4" />
            Back to customers
          </Button>
        }
      />

      <CreateClientWithVehicleModal
        open
        onClose={() => navigate(ROUTES.RECEPTIONIST_CLIENTS)}
        onSubmit={handleSubmit}
      />
    </div>
  );
}

