import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { formatApiErrorDetail } from '@/api/apiError';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingState } from '@/components/feedback/LoadingState';
import { Badge } from '@/components/ui/Badge';
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
import { accountApi } from '@/features/account/api/account.api';
import type {
  AccountProfileDto,
  UpdateAccountProfileRequest,
} from '@/features/account/types/account.types';
import { AuthErrorBanner } from '@/features/auth/components/AuthErrorBanner';
import {
  formatDocumentTypeLabel,
  formatGenderLabel,
  usePersonCatalogLookups,
} from '@/features/admin/customers/hooks/usePersonCatalogLookups';
import {
  isValidEmail,
  validateMaxLength,
  validatePhoneNumber,
  validateRequired,
} from '@/utils/validation';

interface ProfileFormState {
  firstName: string;
  middleName: string;
  lastName: string;
  secondLastName: string;
  birthDate: string;
  genderId: string;
  email: string;
  phoneCountryId: string;
  phoneNumber: string;
}

type ProfileFieldErrors = Partial<Record<keyof ProfileFormState, string>>;

function profileToForm(profile: AccountProfileDto): ProfileFormState {
  return {
    firstName: profile.firstName,
    middleName: profile.middleName ?? '',
    lastName: profile.lastName,
    secondLastName: profile.secondLastName ?? '',
    birthDate: profile.birthDate ? profile.birthDate.slice(0, 10) : '',
    genderId: profile.genderId ? String(profile.genderId) : '',
    email: profile.primaryEmail ?? '',
    phoneCountryId: profile.primaryPhoneCountryId
      ? String(profile.primaryPhoneCountryId)
      : '',
    phoneNumber: profile.primaryPhoneNumber ?? '',
  };
}

function buildUpdatePayload(form: ProfileFormState): UpdateAccountProfileRequest {
  return {
    firstName: form.firstName.trim(),
    middleName: form.middleName.trim() || undefined,
    lastName: form.lastName.trim(),
    secondLastName: form.secondLastName.trim() || undefined,
    birthDate: form.birthDate ? `${form.birthDate}T00:00:00Z` : undefined,
    genderId: form.genderId ? Number(form.genderId) : undefined,
    email: form.email.trim() || undefined,
    phoneCountryId: form.phoneCountryId ? Number(form.phoneCountryId) : undefined,
    phoneNumber: form.phoneNumber.trim() || undefined,
  };
}

export function AccountProfilePage() {
  const { catalogs, lookups, isLoading: catalogsLoading, error: catalogsError } =
    usePersonCatalogLookups();
  const [profile, setProfile] = useState<AccountProfileDto | null>(null);
  const [form, setForm] = useState<ProfileFormState | null>(null);
  const [fieldErrors, setFieldErrors] = useState<ProfileFieldErrors>({});
  const [loadError, setLoadError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadProfile = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);

    try {
      const response = await accountApi.getProfile();
      setProfile(response.data);
      setForm(profileToForm(response.data));
    } catch (err) {
      setProfile(null);
      setForm(null);
      setLoadError(formatApiErrorDetail(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  const updateField = <K extends keyof ProfileFormState>(
    key: K,
    value: ProfileFormState[K],
  ) => {
    setForm((current) => (current ? { ...current, [key]: value } : current));
    setSuccessMessage(null);
  };

  const validate = (): boolean => {
    if (!form) return false;

    const errors: ProfileFieldErrors = {};

    const firstNameError =
      validateRequired(form.firstName, 'First name') ??
      validateMaxLength(form.firstName, 50, 'First name');
    if (firstNameError) errors.firstName = firstNameError;

    const lastNameError =
      validateRequired(form.lastName, 'Last name') ??
      validateMaxLength(form.lastName, 50, 'Last name');
    if (lastNameError) errors.lastName = lastNameError;

    if (form.middleName.trim()) {
      const middleNameError = validateMaxLength(form.middleName, 50, 'Middle name');
      if (middleNameError) errors.middleName = middleNameError;
    }

    if (form.secondLastName.trim()) {
      const secondLastNameError = validateMaxLength(
        form.secondLastName,
        50,
        'Second last name',
      );
      if (secondLastNameError) errors.secondLastName = secondLastNameError;
    }

    if (form.email.trim() && !isValidEmail(form.email)) {
      errors.email = 'Enter a valid email address';
    }

    const phoneError = validatePhoneNumber(form.phoneNumber);
    if (phoneError) errors.phoneNumber = phoneError;

    if (form.phoneNumber.trim() && !form.phoneCountryId) {
      errors.phoneCountryId = 'Select a country for the phone number';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form) return;

    setApiError(null);
    setSuccessMessage(null);

    if (!validate()) return;

    setIsSubmitting(true);

    try {
      const response = await accountApi.updateProfile(buildUpdatePayload(form));
      setProfile(response.data);
      setForm(profileToForm(response.data));
      setSuccessMessage('Profile updated successfully.');
    } catch (err) {
      setApiError(formatApiErrorDetail(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || catalogsLoading) {
    return <LoadingState title="Loading profile" fullPage />;
  }

  if (loadError) {
    return (
      <ErrorState
        title="Unable to load profile"
        message={loadError}
        onRetry={() => void loadProfile()}
      />
    );
  }

  if (!profile || !form) {
    return null;
  }

  const genderOptions =
    catalogs?.genders.map((item) => ({
      value: String(item.id),
      label: item.name,
    })) ?? [];

  const countryOptions =
    catalogs?.countries.map((item) => ({
      value: String(item.id),
      label: item.name,
    })) ?? [];

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-text-primary sm:text-3xl">
          My Profile
        </h1>
        <p className="text-sm text-text-secondary">
          View your account details and update personal contact information.
        </p>
      </div>

      {catalogsError && (
        <AuthErrorBanner message={`Catalog lookup failed: ${catalogsError}`} />
      )}

      {apiError && <AuthErrorBanner message={apiError} />}

      {successMessage && (
        <div
          role="status"
          className="rounded-lg border border-success/30 bg-success-muted/40 px-4 py-3 text-sm text-success"
        >
          {successMessage}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Identity</CardTitle>
          <CardDescription>Document information cannot be changed here.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs font-medium text-text-secondary">Document type</p>
            <p className="text-sm text-text-primary">
              {formatDocumentTypeLabel(profile.documentTypeId, lookups)}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-text-secondary">Document number</p>
            <p className="text-sm text-text-primary">{profile.documentNumber}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-text-secondary">Roles</p>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {profile.roles.map((role) => (
                <Badge key={role} variant="default">
                  {role}
                </Badge>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-medium text-text-secondary">Account status</p>
            <p className="text-sm text-text-primary">
              {profile.isActive ? 'Active' : 'Inactive'}
            </p>
          </div>
          {profile.addressId != null && (
            <div>
              <p className="text-xs font-medium text-text-secondary">Address ID</p>
              <p className="text-sm text-text-primary">{profile.addressId}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <form onSubmit={(event) => void handleSubmit(event)}>
        <Card>
          <CardHeader>
            <CardTitle>Personal information</CardTitle>
            <CardDescription>
              Update the fields supported by your account profile.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
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
              onChange={(event) => updateField('secondLastName', event.target.value)}
              error={fieldErrors.secondLastName}
            />
            <Input
              label="Birth date"
              name="birthDate"
              type="date"
              value={form.birthDate}
              onChange={(event) => updateField('birthDate', event.target.value)}
            />
            <Select
              label="Gender"
              name="genderId"
              value={form.genderId}
              onChange={(event) => updateField('genderId', event.target.value)}
              placeholder="Not specified"
              options={genderOptions}
            />
            {!form.genderId && profile.genderId && (
              <p className="text-xs text-text-secondary sm:col-span-2">
                Current: {formatGenderLabel(profile.genderId, lookups)}
              </p>
            )}
          </CardContent>

          <CardHeader className="border-t border-border pt-4">
            <CardTitle>Contact</CardTitle>
            <CardDescription>Email and phone updates apply to your account.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Email"
              name="email"
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={(event) => updateField('email', event.target.value)}
              error={fieldErrors.email}
              className="sm:col-span-2"
            />
            <Select
              label="Phone country"
              name="phoneCountryId"
              value={form.phoneCountryId}
              onChange={(event) => updateField('phoneCountryId', event.target.value)}
              placeholder="Select country"
              options={countryOptions}
              error={fieldErrors.phoneCountryId}
            />
            <Input
              label="Phone number"
              name="phoneNumber"
              value={form.phoneNumber}
              onChange={(event) => updateField('phoneNumber', event.target.value)}
              error={fieldErrors.phoneNumber}
            />
          </CardContent>

          <CardFooter>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              Save changes
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
