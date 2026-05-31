import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthLayout } from '@/components/layout/AuthLayout';
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
import { Select } from '@/components/ui/Select';
import { LoadingState } from '@/components/feedback/LoadingState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { getErrorMessage } from '@/api/apiError';
import { AuthErrorBanner } from '@/features/auth/components/AuthErrorBanner';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { catalogsApi } from '@/api/catalogs.api';
import { getSelectedRole } from '@/lib/authToken';
import { resolvePostLoginRoute } from '@/routes/roleRedirects';
import { ROUTES } from '@/routes/routePaths';
import type { PublicRegistrationCatalogsDto } from '@/types/catalogs.types';
import {
  isValidEmail,
  validateMaxLength,
  validatePassword,
  validatePhoneNumber,
  validateRequired,
} from '@/utils/validation';

interface RegisterFormState {
  documentTypeId: string;
  documentNumber: string;
  firstName: string;
  middleName: string;
  lastName: string;
  secondLastName: string;
  genderId: string;
  email: string;
  phoneCountryId: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
}

type RegisterFieldErrors = Partial<Record<keyof RegisterFormState, string>>;

const initialForm: RegisterFormState = {
  documentTypeId: '',
  documentNumber: '',
  firstName: '',
  middleName: '',
  lastName: '',
  secondLastName: '',
  genderId: '',
  email: '',
  phoneCountryId: '',
  phoneNumber: '',
  password: '',
  confirmPassword: '',
};

export function RegisterClientPage() {
  const { registerClient } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState<RegisterFormState>(initialForm);
  const [fieldErrors, setFieldErrors] = useState<RegisterFieldErrors>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [catalogs, setCatalogs] = useState<PublicRegistrationCatalogsDto | null>(
    null,
  );
  const [catalogError, setCatalogError] = useState<string | null>(null);
  const [isLoadingCatalogs, setIsLoadingCatalogs] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadCatalogs() {
      setIsLoadingCatalogs(true);
      setCatalogError(null);
      try {
        const response = await catalogsApi.getPublicRegistration();
        if (!cancelled) setCatalogs(response.data);
      } catch (error) {
        if (!cancelled) setCatalogError(getErrorMessage(error));
      } finally {
        if (!cancelled) setIsLoadingCatalogs(false);
      }
    }

    void loadCatalogs();
    return () => {
      cancelled = true;
    };
  }, []);

  const updateField = <K extends keyof RegisterFormState>(
    key: K,
    value: RegisterFormState[K],
  ) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const validate = (): boolean => {
    const errors: RegisterFieldErrors = {};

    if (!form.documentTypeId) errors.documentTypeId = 'Document type is required';

    const documentNumberError =
      validateRequired(form.documentNumber, 'Document number') ??
      validateMaxLength(form.documentNumber, 30, 'Document number');
    if (documentNumberError) errors.documentNumber = documentNumberError;

    const firstNameError =
      validateRequired(form.firstName, 'First name') ??
      validateMaxLength(form.firstName, 50, 'First name');
    if (firstNameError) errors.firstName = firstNameError;

    if (form.middleName) {
      const middleNameError = validateMaxLength(form.middleName, 50, 'Middle name');
      if (middleNameError) errors.middleName = middleNameError;
    }

    const lastNameError =
      validateRequired(form.lastName, 'Last name') ??
      validateMaxLength(form.lastName, 50, 'Last name');
    if (lastNameError) errors.lastName = lastNameError;

    if (form.secondLastName) {
      const secondLastNameError = validateMaxLength(
        form.secondLastName,
        50,
        'Second last name',
      );
      if (secondLastNameError) errors.secondLastName = secondLastNameError;
    }

    const emailError = validateRequired(form.email, 'Email');
    if (emailError) {
      errors.email = emailError;
    } else if (!isValidEmail(form.email)) {
      errors.email = 'Enter a valid email address';
    }

    if (form.phoneNumber && !form.phoneCountryId) {
      errors.phoneCountryId = 'Country is required when phone number is provided';
    }

    const phoneError = validatePhoneNumber(form.phoneNumber);
    if (phoneError) errors.phoneNumber = phoneError;

    const passwordError = validatePassword(form.password);
    if (passwordError) errors.password = passwordError;

    if (form.password !== form.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setApiError(null);

    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const response = await registerClient({
        documentTypeId: Number(form.documentTypeId),
        documentNumber: form.documentNumber.trim(),
        firstName: form.firstName.trim(),
        middleName: form.middleName.trim() || undefined,
        lastName: form.lastName.trim(),
        secondLastName: form.secondLastName.trim() || undefined,
        genderId: form.genderId ? Number(form.genderId) : undefined,
        email: form.email.trim(),
        phoneCountryId: form.phoneCountryId
          ? Number(form.phoneCountryId)
          : undefined,
        phoneNumber: form.phoneNumber.trim() || undefined,
        password: form.password,
      });

      navigate(
        resolvePostLoginRoute(response.user.roles, getSelectedRole()),
        { replace: true },
      );
    } catch (error) {
      setApiError(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingCatalogs) {
    return (
      <AuthLayout title="Create your client account" subtitle="Loading registration options...">
        <Card>
          <LoadingState title="Loading catalogs" />
        </Card>
      </AuthLayout>
    );
  }

  if (catalogError || !catalogs) {
    return (
      <AuthLayout title="Create your client account" subtitle="Registration is temporarily unavailable.">
        <Card padding="none">
          <ErrorState
            message={catalogError ?? 'Unable to load registration catalogs.'}
            onRetry={() => window.location.reload()}
          />
        </Card>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Create your client account"
      subtitle="Register to view your vehicles, service orders, invoices, and approvals."
    >
      <Card>
        <CardHeader>
          <CardTitle>Client registration</CardTitle>
          <CardDescription>
            Complete your identity and contact details to access the client portal.
          </CardDescription>
        </CardHeader>
        <form onSubmit={(event) => void handleSubmit(event)}>
          <CardContent className="space-y-4">
            <AuthErrorBanner message={apiError} />

            <div className="grid gap-4 sm:grid-cols-2">
              <Select
                label="Document type"
                name="documentTypeId"
                required
                placeholder="Select document type"
                value={form.documentTypeId}
                onChange={(event) => updateField('documentTypeId', event.target.value)}
                options={catalogs.documentTypes.map((item) => ({
                  value: String(item.id),
                  label: item.name,
                }))}
                error={fieldErrors.documentTypeId}
              />
              <Input
                label="Document number"
                name="documentNumber"
                value={form.documentNumber}
                onChange={(event) => updateField('documentNumber', event.target.value)}
                error={fieldErrors.documentNumber}
                required
              />
              <Input
                label="First name"
                name="firstName"
                value={form.firstName}
                onChange={(event) => updateField('firstName', event.target.value)}
                error={fieldErrors.firstName}
                required
              />
              <Input
                label="Middle name"
                name="middleName"
                value={form.middleName}
                onChange={(event) => updateField('middleName', event.target.value)}
                error={fieldErrors.middleName}
              />
              <Input
                label="Last name"
                name="lastName"
                value={form.lastName}
                onChange={(event) => updateField('lastName', event.target.value)}
                error={fieldErrors.lastName}
                required
              />
              <Input
                label="Second last name"
                name="secondLastName"
                value={form.secondLastName}
                onChange={(event) =>
                  updateField('secondLastName', event.target.value)
                }
                error={fieldErrors.secondLastName}
              />
              <Select
                label="Gender"
                name="genderId"
                placeholder="Select gender (optional)"
                value={form.genderId}
                onChange={(event) => updateField('genderId', event.target.value)}
                options={catalogs.genders.map((item) => ({
                  value: String(item.id),
                  label: item.name,
                }))}
                className="sm:col-span-2"
              />
              <Input
                label="Email"
                name="email"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={(event) => updateField('email', event.target.value)}
                error={fieldErrors.email}
                required
                className="sm:col-span-2"
              />
              <Select
                label="Phone country"
                name="phoneCountryId"
                placeholder="Select country (optional)"
                value={form.phoneCountryId}
                onChange={(event) =>
                  updateField('phoneCountryId', event.target.value)
                }
                options={catalogs.countries.map((item) => ({
                  value: String(item.id),
                  label: item.name,
                }))}
                error={fieldErrors.phoneCountryId}
              />
              <Input
                label="Phone number"
                name="phoneNumber"
                value={form.phoneNumber}
                onChange={(event) => updateField('phoneNumber', event.target.value)}
                error={fieldErrors.phoneNumber}
              />
              <Input
                label="Password"
                name="password"
                type="password"
                autoComplete="new-password"
                value={form.password}
                onChange={(event) => updateField('password', event.target.value)}
                error={fieldErrors.password}
                hint="8–100 characters"
                required
              />
              <Input
                label="Confirm password"
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
            </div>
          </CardContent>
          <CardFooter className="flex-col gap-3 sm:flex-row sm:justify-between">
            <p className="text-sm text-text-secondary">
              Already registered?{' '}
              <Link
                to={ROUTES.LOGIN}
                className="font-medium text-accent hover:text-accent-hover"
              >
                Sign in
              </Link>
            </p>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              Create account
            </Button>
          </CardFooter>
        </form>
      </Card>
    </AuthLayout>
  );
}
