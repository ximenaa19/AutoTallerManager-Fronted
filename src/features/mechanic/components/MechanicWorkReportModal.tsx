import { Modal } from '@/components/ui/Modal';
import { MechanicWorkReportForm } from '@/features/mechanic/components/MechanicWorkReportForm';
import type { MechanicAssignedServiceDto } from '@/features/mechanic/types/mechanicAssignments.types';
import type { WorkshopCatalogLookups } from '@/features/admin/serviceOrders/hooks/useWorkshopCatalogLookups';

export interface MechanicWorkReportModalProps {
  open: boolean;
  service: MechanicAssignedServiceDto;
  lookups: WorkshopCatalogLookups;
  onClose: () => void;
  onSuccess: () => void;
}

export function MechanicWorkReportModal({
  open,
  service,
  lookups,
  onClose,
  onSuccess,
}: MechanicWorkReportModalProps) {
  const serviceTypeName =
    lookups.serviceTypeNameById.get(service.serviceTypeId) ??
    `Service type #${service.serviceTypeId}`;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Record work performed"
      description={`Order service #${service.orderServiceId} · ${serviceTypeName}`}
      size="lg"
    >
      <MechanicWorkReportForm
        service={service}
        onSuccess={() => {
          onSuccess();
          onClose();
        }}
        onCancel={onClose}
        submitLabel="Save work report"
      />
    </Modal>
  );
}
