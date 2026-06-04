import { isTemporaryPlate } from '@/features/admin/vehicles/utils/vehiclePlate';

export interface TemporaryPlateNoticeProps {
  plate: string;
}

export function TemporaryPlateNotice({ plate }: TemporaryPlateNoticeProps) {
  if (!isTemporaryPlate(plate)) {
    return null;
  }

  return (
    <p
      role="note"
      className="rounded-lg border border-warning/30 bg-warning-muted/30 px-4 py-3 text-sm text-text-secondary"
    >
      This vehicle has a temporary plate generated during migration. Replace it with the real
      plate when available.
    </p>
  );
}
