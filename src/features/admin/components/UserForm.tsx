import { useEffect, useState, type FormEvent } from 'react';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { getErrorMessage } from '@/api/apiError';
import { PersonSelector } from '@/features/admin/components/PersonSelector';
import type {
  CreateUserRequest,
  UpdateUserRequest,
  UserDto,
} from '@/features/admin/types/users.types';
import { validatePassword } from '@/utils/validation';

export type UserFormMode = 'create' | 'edit';

export interface UserFormValues {
  personId: number | null;
  password: string;
  isActive: boolean;
}

export interface UserFormProps {
  mode: UserFormMode;
  initialUser?: UserDto | null;
  linkedPersonIds?: ReadonlySet<number>;
  onSubmit: (payload: CreateUserRequest | UpdateUserRequest) => Promise<void>;
  onCancel: () => void;
}

const emptyValues: UserFormValues = {
  personId: null,
  password: '',
  isActive: true,
};

export function UserForm({
  mode,
  initialUser,
  linkedPersonIds,
  onSubmit,
  onCancel,
}: UserFormProps) {
  const [values, setValues] = useState<UserFormValues>(emptyValues);
  const [fieldErrors, setFieldErrors] = useState<{
    personId?: string;
    password?: string;
  }>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (mode === 'edit' && initialUser) {
      setValues({
        personId: initialUser.personId,
        password: '',
        isActive: initialUser.isActive,
      });
    } else {
      setValues(emptyValues);
    }
    setFieldErrors({});
    setApiError(null);
  }, [mode, initialUser]);

  const validate = (): boolean => {
    const errors: { personId?: string; password?: string } = {};

    if (values.personId === null || values.personId <= 0) {
      errors.personId = 'Please select an existing person.';
    }

    if (mode === 'create') {
      const passwordError = validatePassword(values.password);
      if (passwordError) errors.password = passwordError;
    } else if (values.password.trim()) {
      const passwordError = validatePassword(values.password);
      if (passwordError) errors.password = passwordError;
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setApiError(null);

    if (!validate()) return;

    const personId = values.personId;
    if (personId === null) return;

    setIsSubmitting(true);
    try {
      if (mode === 'create') {
        const payload: CreateUserRequest = {
          personId,
          password: values.password,
          isActive: values.isActive,
        };
        await onSubmit(payload);
      } else {
        const payload: UpdateUserRequest = {
          personId,
          isActive: values.isActive,
        };
        if (values.password.trim()) {
          payload.newPassword = values.password;
        }
        await onSubmit(payload);
      }
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

      <PersonSelector
        value={values.personId}
        onChange={(personId) =>
          setValues((current) => ({ ...current, personId }))
        }
        linkedPersonIds={linkedPersonIds}
        allowLinkedPersonId={
          mode === 'edit' ? initialUser?.personId : undefined
        }
        error={fieldErrors.personId}
        disabled={isSubmitting}
      />

      <Input
        name="password"
        label={mode === 'create' ? 'Password' : 'New password'}
        type="password"
        autoComplete={mode === 'create' ? 'new-password' : 'off'}
        required={mode === 'create'}
        value={values.password}
        onChange={(event) =>
          setValues((current) => ({ ...current, password: event.target.value }))
        }
        error={fieldErrors.password}
        hint={
          mode === 'edit'
            ? 'Leave blank to keep the current password.'
            : 'Minimum 8 characters.'
        }
      />

      <Select
        name="isActive"
        label="Account status"
        value={values.isActive ? 'true' : 'false'}
        onChange={(event) =>
          setValues((current) => ({
            ...current,
            isActive: event.target.value === 'true',
          }))
        }
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
          {mode === 'create' ? 'Create user' : 'Save changes'}
        </Button>
      </div>
    </form>
  );
}
