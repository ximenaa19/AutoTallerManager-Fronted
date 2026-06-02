import { useState, type FormEvent } from 'react';
import { formatApiErrorDetail } from '@/api/apiError';
import { Button } from '@/components/ui/Button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { accountApi } from '@/features/account/api/account.api';
import { AuthErrorBanner } from '@/features/auth/components/AuthErrorBanner';
import {
  validatePassword,
  validateRequired,
} from '@/utils/validation';

interface ChangePasswordFormState {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

type ChangePasswordFieldErrors = Partial<
  Record<keyof ChangePasswordFormState, string>
>;

const emptyForm: ChangePasswordFormState = {
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
};

export function ChangePasswordPage() {
  const [form, setForm] = useState<ChangePasswordFormState>(emptyForm);
  const [fieldErrors, setFieldErrors] = useState<ChangePasswordFieldErrors>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = <K extends keyof ChangePasswordFormState>(
    key: K,
    value: ChangePasswordFormState[K],
  ) => {
    setForm((current) => ({ ...current, [key]: value }));
    setSuccessMessage(null);
  };

  const validate = (): boolean => {
    const errors: ChangePasswordFieldErrors = {};

    const currentPasswordError = validateRequired(
      form.currentPassword,
      'Current password',
    );
    if (currentPasswordError) errors.currentPassword = currentPasswordError;

    const newPasswordError = validatePassword(form.newPassword);
    if (newPasswordError) errors.newPassword = newPasswordError;

    const confirmPasswordError = validateRequired(
      form.confirmPassword,
      'Confirm password',
    );
    if (confirmPasswordError) {
      errors.confirmPassword = confirmPasswordError;
    } else if (form.newPassword !== form.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setApiError(null);
    setSuccessMessage(null);

    if (!validate()) return;

    setIsSubmitting(true);

    try {
      await accountApi.changePassword({
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      setForm(emptyForm);
      setFieldErrors({});
      setSuccessMessage('Password changed successfully.');
    } catch (err) {
      setApiError(formatApiErrorDetail(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-text-primary sm:text-3xl">
          Change Password
        </h1>
        <p className="text-sm text-text-secondary">
          Enter your current password and choose a new one.
        </p>
      </div>

      {apiError && <AuthErrorBanner message={apiError} />}

      {successMessage && (
        <div
          role="status"
          className="rounded-lg border border-success/30 bg-success-muted/40 px-4 py-3 text-sm text-success"
        >
          {successMessage}
        </div>
      )}

      <form onSubmit={(event) => void handleSubmit(event)}>
        <Card>
          <CardHeader>
            <CardTitle>Update password</CardTitle>
            <CardDescription>
              Your new password must be at least 8 characters long.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Current password"
              name="currentPassword"
              type="password"
              autoComplete="current-password"
              value={form.currentPassword}
              onChange={(event) =>
                updateField('currentPassword', event.target.value)
              }
              error={fieldErrors.currentPassword}
              required
            />
            <Input
              label="New password"
              name="newPassword"
              type="password"
              autoComplete="new-password"
              value={form.newPassword}
              onChange={(event) => updateField('newPassword', event.target.value)}
              error={fieldErrors.newPassword}
              required
            />
            <Input
              label="Confirm new password"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              value={form.confirmPassword}
              onChange={(event) =>
                updateField('confirmPassword', event.target.value)
              }
              error={fieldErrors.confirmPassword}
              required
            />
          </CardContent>
          <CardFooter>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              Change password
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
