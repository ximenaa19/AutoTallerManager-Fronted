import { useEffect, useState, type FormEvent } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { getErrorMessage } from '@/api/apiError';
import type {
  CreateRoleRequest,
  RoleDto,
  UpdateRoleRequest,
} from '@/features/admin/types/roles.types';
import { validateMaxLength, validateRequired } from '@/utils/validation';

export type RoleFormMode = 'create' | 'edit';

export interface RoleFormProps {
  mode: RoleFormMode;
  initialRole?: RoleDto | null;
  onSubmit: (payload: CreateRoleRequest | UpdateRoleRequest) => Promise<void>;
  onCancel: () => void;
}

export function RoleForm({ mode, initialRole, onSubmit, onCancel }: RoleFormProps) {
  const [roleName, setRoleName] = useState('');
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setRoleName(initialRole?.roleName ?? '');
    setFieldError(null);
    setApiError(null);
  }, [initialRole, mode]);

  const validate = (): boolean => {
    const requiredError = validateRequired(roleName, 'Role name');
    const lengthError =
      requiredError ?? validateMaxLength(roleName, 50, 'Role name');
    setFieldError(lengthError ?? null);
    return !lengthError;
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setApiError(null);
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await onSubmit({ roleName: roleName.trim() });
    } catch (error) {
      setApiError(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={(event) => void handleSubmit(event)} className="space-y-4">
      {apiError && (
        <div
          role="alert"
          className="rounded-lg border border-danger/30 bg-danger-muted/40 px-4 py-3 text-sm text-danger"
        >
          {apiError}
        </div>
      )}

      <Input
        name="roleName"
        label="Role name"
        required
        value={roleName}
        onChange={(event) => setRoleName(event.target.value)}
        error={fieldError ?? undefined}
        hint="Use a clear name such as Admin, Receptionist, or Mechanic."
      />

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isSubmitting}>
          {mode === 'create' ? 'Create role' : 'Save changes'}
        </Button>
      </div>
    </form>
  );
}
