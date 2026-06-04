import { useEffect, useState, type FormEvent } from 'react';
import { getErrorMessage } from '@/api/apiError';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { mechanicWorkApi } from '@/features/mechanic/api/mechanicWork.api';
import type { MechanicAssignedServiceDto } from '@/features/mechanic/types/mechanicAssignments.types';

export interface MechanicWorkReportFormProps {
  service: MechanicAssignedServiceDto;
  onSuccess: () => void;
  onCancel?: () => void;
  submitLabel?: string;
}

export function MechanicWorkReportForm({
  service,
  onSuccess,
  onCancel,
  submitLabel = 'Save work report',
}: MechanicWorkReportFormProps) {
  const [workPerformed, setWorkPerformed] = useState(service.workPerformed?.trim() ?? '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setWorkPerformed(service.workPerformed?.trim() ?? '');
  }, [service.orderServiceId, service.workPerformed]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const trimmed = workPerformed.trim();
    if (!trimmed) {
      setError('Describe the work you performed before saving.');
      return;
    }

    setIsSubmitting(true);

    try {
      await mechanicWorkApi.updateWorkPerformed(service.orderServiceId, {
        workPerformed: trimmed,
        laborCost: service.laborCost,
      });
      onSuccess();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={(event) => void handleSubmit(event)} className="space-y-4">
      <Textarea
        name="workPerformed"
        label="Work performed"
        required
        rows={6}
        value={workPerformed}
        onChange={(event) => setWorkPerformed(event.target.value)}
        placeholder="Describe diagnostics, repairs, parts installed, tests run, and outcomes…"
        hint="Labor cost and customer approval cannot be changed here. Existing labor cost is sent unchanged for backend validation."
        error={error ?? undefined}
        disabled={isSubmitting}
      />

      <div className="flex flex-wrap justify-end gap-2">
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
        )}
        <Button type="submit" isLoading={isSubmitting}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
