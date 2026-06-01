import { useEffect, useState, type FormEvent } from 'react';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { getErrorMessage } from '@/api/apiError';
import type {
  CreatePersonRoleRequest,
  PersonRoleDto,
  UpdatePersonRoleRequest,
} from '@/features/admin/types/personRoles.types';
import type { RoleDto } from '@/features/admin/types/roles.types';

export type PersonRoleFormMode = 'create' | 'edit';

export interface PersonRoleFormProps {
  mode: PersonRoleFormMode;
  roles: RoleDto[];
  initialAssignment?: PersonRoleDto | null;
  onSubmit: (
    payload: CreatePersonRoleRequest | UpdatePersonRoleRequest,
  ) => Promise<void>;
  onCancel: () => void;
}

export function PersonRoleForm({
  mode,
  roles,
  initialAssignment,
  onSubmit,
  onCancel,
}: PersonRoleFormProps) {
  const [personId, setPersonId] = useState('');
  const [roleId, setRoleId] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [fieldErrors, setFieldErrors] = useState<{
    personId?: string;
    roleId?: string;
  }>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (mode === 'edit' && initialAssignment) {
      setPersonId(String(initialAssignment.personId));
      setRoleId(String(initialAssignment.roleId));
      setIsActive(initialAssignment.isActive);
    } else {
      setPersonId('');
      setRoleId('');
      setIsActive(true);
    }
    setFieldErrors({});
    setApiError(null);
  }, [mode, initialAssignment]);

  const roleOptions = roles.map((role) => ({
    value: String(role.roleId),
    label: role.roleName,
  }));

  const validate = (): boolean => {
    const errors: { personId?: string; roleId?: string } = {};
    const parsedPersonId = Number(personId);

    if (!personId.trim()) {
      errors.personId = 'Person ID is required';
    } else if (!Number.isInteger(parsedPersonId) || parsedPersonId <= 0) {
      errors.personId = 'Person ID must be a positive whole number';
    }

    if (!roleId) {
      errors.roleId = 'Role is required';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setApiError(null);
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        personId: Number(personId),
        roleId: Number(roleId),
        isActive,
      });
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
        name="personId"
        label="Person ID"
        type="number"
        min={1}
        required
        value={personId}
        onChange={(event) => setPersonId(event.target.value)}
        error={fieldErrors.personId}
      />

      <Select
        name="roleId"
        label="Role"
        required
        placeholder="Select a role"
        value={roleId}
        onChange={(event) => setRoleId(event.target.value)}
        options={roleOptions}
        error={fieldErrors.roleId}
      />

      <Select
        name="isActive"
        label="Assignment status"
        value={isActive ? 'true' : 'false'}
        onChange={(event) => setIsActive(event.target.value === 'true')}
        options={[
          { value: 'true', label: 'Active' },
          { value: 'false', label: 'Inactive' },
        ]}
      />

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isSubmitting}>
          {mode === 'create' ? 'Assign role' : 'Save assignment'}
        </Button>
      </div>
    </form>
  );
}
