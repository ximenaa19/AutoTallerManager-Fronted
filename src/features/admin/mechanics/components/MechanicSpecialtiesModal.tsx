import { useEffect, useState } from 'react';
import { getErrorMessage } from '@/api/apiError';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { mechanicSpecialtiesApi } from '@/features/admin/mechanics/api/mechanicSpecialties.api';
import type { MechanicSpecialtyDto } from '@/features/admin/mechanics/types/mechanicSpecialties.types';
import type { MechanicRosterItem } from '@/features/admin/mechanics/types/mechanics.types';

export interface MechanicSpecialtiesModalProps {
  open: boolean;
  mechanic: MechanicRosterItem | null;
  specialtyCatalog: MechanicSpecialtyDto[];
  onClose: () => void;
  onSaved: () => void;
}

export function MechanicSpecialtiesModal({
  open,
  mechanic,
  specialtyCatalog,
  onClose,
  onSaved,
}: MechanicSpecialtiesModalProps) {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !mechanic) {
      setSelectedIds([]);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    mechanicSpecialtiesApi
      .getByPersonId(mechanic.personId)
      .then((response) => {
        setSelectedIds(response.data.map((item) => item.specialtyId));
      })
      .catch((err) => {
        setSelectedIds(mechanic.specialtyIds);
        setError(getErrorMessage(err));
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [open, mechanic]);

  const toggleSpecialty = (specialtyId: number) => {
    setSelectedIds((current) =>
      current.includes(specialtyId)
        ? current.filter((id) => id !== specialtyId)
        : [...current, specialtyId],
    );
  };

  const handleSave = async () => {
    if (!mechanic) return;

    setIsSaving(true);
    setError(null);

    try {
      await mechanicSpecialtiesApi.replaceByPersonId(mechanic.personId, {
        specialtyIds: selectedIds,
      });
      onSaved();
      onClose();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Edit mechanic specialties"
      description={
        mechanic
          ? `Replace specialties for ${mechanic.fullName} via PUT /api/mechanics/${mechanic.personId}/specialties.`
          : undefined
      }
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={() => void handleSave()} isLoading={isSaving} disabled={isLoading}>
            Save specialties
          </Button>
        </>
      }
    >
      {isLoading ? (
        <p className="text-sm text-text-secondary">Loading current specialties…</p>
      ) : specialtyCatalog.length === 0 ? (
        <p className="text-sm text-text-secondary">
          No specialty catalog entries found. Add specialties under Admin → Catalogs → Mechanic
          Specialties before assigning them.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {specialtyCatalog.map((specialty) => {
            const checked = selectedIds.includes(specialty.specialtyId);
            return (
              <label
                key={specialty.specialtyId}
                className="flex cursor-pointer items-center gap-2 rounded-md border border-border px-3 py-2 text-sm text-text-primary hover:bg-bg-elevated/60"
              >
                <input
                  type="checkbox"
                  className="size-4 rounded border-border accent-accent"
                  checked={checked}
                  onChange={() => toggleSpecialty(specialty.specialtyId)}
                />
                {specialty.name}
              </label>
            );
          })}
        </div>
      )}

      {error && (
        <p role="alert" className="mt-4 text-sm text-danger">
          {error}
        </p>
      )}
    </Modal>
  );
}
