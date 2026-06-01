import { useEffect, useState, type FormEvent } from 'react';
import { catalogsApi } from '@/api/catalogs.api';
import { getErrorMessage } from '@/api/apiError';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingState } from '@/components/feedback/LoadingState';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { mechanicSpecialtiesApi } from '@/features/admin/api/mechanicSpecialties.api';
import type { MechanicSpecialtyDto } from '@/features/admin/types/mechanicSpecialties.types';
import type { RegisterStaffRequest } from '@/features/admin/types/staff.types';
import { STAFF_ROLE_NAMES } from '@/features/admin/types/staff.types';
import type { PublicRegistrationCatalogsDto } from '@/types/catalogs.types';
import {
  isValidEmail,
  validateMaxLength,
  validatePassword,
  validatePhoneNumber,
  validateRequired,
} from '@/utils/validation';

interface StaffFormState {
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
  roleName: string;
}

type StaffFieldErrors = Partial<Record<keyof StaffFormState | 'specialtyIds', string>>;

const initialForm: StaffFormState = {
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
  roleName: '',
};

export interface StaffRegisterFormProps {
  onSubmit: (payload: RegisterStaffRequest) => Promise<void>;
}

export function StaffRegisterForm({ onSubmit }: StaffRegisterFormProps) {
  const [form, setForm] = useState<StaffFormState>(initialForm);
  const [selectedSpecialtyIds, setSelectedSpecialtyIds] = useState<number[]>([]);
  const [fieldErrors, setFieldErrors] = useState<StaffFieldErrors>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [catalogs, setCatalogs] = useState<PublicRegistrationCatalogsDto | null>(
    null,
  );
  const [specialties, setSpecialties] = useState<MechanicSpecialtyDto[]>([]);
  const [catalogError, setCatalogError] = useState<string | null>(null);
  const [isLoadingCatalogs, setIsLoadingCatalogs] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      setIsLoadingCatalogs(true);
      setCatalogError(null);

      try {
        const [catalogResponse, specialtiesResponse] = await Promise.all([
          catalogsApi.getPublicRegistration(),
          mechanicSpecialtiesApi.getAll(),
        ]);

        if (!cancelled) {
          setCatalogs(catalogResponse.data);
          setSpecialties(specialtiesResponse.data);
        }
      } catch (error) {
        if (!cancelled) setCatalogError(getErrorMessage(error));
      } finally {
        if (!cancelled) setIsLoadingCatalogs(false);
      }
    }

    void loadData();
    return () => {
      cancelled = true;
    };
  }, []);

  const updateField = <K extends keyof StaffFormState>(
    key: K,
    value: StaffFormState[K],
  ) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const toggleSpecialty = (specialtyId: number) => {
    setSelectedSpecialtyIds((current) =>
      current.includes(specialtyId)
        ? current.filter((id) => id !== specialtyId)
        : [...current, specialtyId],
    );
  };

  const validate = (): boolean => {
    const errors: StaffFieldErrors = {};

    if (!form.documentTypeId) errors.documentTypeId = 'Document type is required';

    const documentNumberError =
      validateRequired(form.documentNumber, 'Document number') ??
      validateMaxLength(form.documentNumber, 30, 'Document number');
    if (documentNumberError) errors.documentNumber = documentNumberError;

    const firstNameError =
      validateRequired(form.firstName, 'First name') ??
      validateMaxLength(form.firstName, 50, 'First name');
    if (firstNameError) errors.firstName = firstNameError;

    const lastNameError =
      validateRequired(form.lastName, 'Last name') ??
      validateMaxLength(form.lastName, 50, 'Last name');
    if (lastNameError) errors.lastName = lastNameError;

    if (form.middleName) {
      const middleNameError = validateMaxLength(form.middleName, 50, 'Middle name');
      if (middleNameError) errors.middleName = middleNameError;
    }

    if (form.secondLastName) {
      const secondLastNameError = validateMaxLength(
        form.secondLastName,
        50,
        'Second last name',
      );
      if (secondLastNameError) errors.secondLastName = secondLastNameError;
    }

    const emailError =
      validateRequired(form.email, 'Email') ??
      (!isValidEmail(form.email) ? 'Enter a valid email address' : undefined);
    if (emailError) errors.email = emailError;

    if (form.phoneNumber) {
      if (!form.phoneCountryId) {
        errors.phoneCountryId = 'Country code is required when phone is provided';
      }
      const phoneError = validatePhoneNumber(form.phoneNumber);
      if (phoneError) errors.phoneNumber = phoneError;
    }

    const passwordError = validatePassword(form.password);
    if (passwordError) errors.password = passwordError;

    if (form.password !== form.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    if (!form.roleName) {
      errors.roleName = 'Staff role is required';
    }

    if (form.roleName === 'Mechanic' && selectedSpecialtyIds.length === 0) {
      errors.specialtyIds = 'Select at least one specialty for mechanics';
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
      const payload: RegisterStaffRequest = {
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
        roleName: form.roleName,
      };

      if (form.roleName === 'Mechanic') {
        payload.specialtyIds = selectedSpecialtyIds;
      }

      await onSubmit(payload);
      setForm(initialForm);
      setSelectedSpecialtyIds([]);
      setFieldErrors({});
    } catch (error) {
      setApiError(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingCatalogs) {
    return (
      <LoadingState
        title="Loading registration data"
        description="Fetching catalogs and mechanic specialties…"
        className="min-h-[240px]"
      />
    );
  }

  if (catalogError || !catalogs) {
    return (
      <ErrorState
        title="Unable to load registration data"
        message={catalogError ?? 'Catalog data is unavailable.'}
      />
    );
  }

  const documentTypeOptions = catalogs.documentTypes.map((item) => ({
    value: String(item.id),
    label: item.name,
  }));

  const genderOptions = catalogs.genders.map((item) => ({
    value: String(item.id),
    label: item.name,
  }));

  const countryOptions = catalogs.countries.map((item) => ({
    value: String(item.id),
    label: item.name,
  }));

  const roleOptions = STAFF_ROLE_NAMES.map((role) => ({
    value: role,
    label: role,
  }));

  return (
    <form onSubmit={(event) => void handleSubmit(event)} className="space-y-6">
      {apiError && (
        <div
          role="alert"
          className="rounded-lg border border-danger/30 bg-danger-muted/40 px-4 py-3 text-sm text-danger"
        >
          {apiError}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Select
          name="documentTypeId"
          label="Document type"
          required
          placeholder="Select document type"
          value={form.documentTypeId}
          onChange={(event) => updateField('documentTypeId', event.target.value)}
          options={documentTypeOptions}
          error={fieldErrors.documentTypeId}
        />
        <Input
          name="documentNumber"
          label="Document number"
          required
          value={form.documentNumber}
          onChange={(event) => updateField('documentNumber', event.target.value)}
          error={fieldErrors.documentNumber}
        />
        <Input
          name="firstName"
          label="First name"
          required
          value={form.firstName}
          onChange={(event) => updateField('firstName', event.target.value)}
          error={fieldErrors.firstName}
        />
        <Input
          name="middleName"
          label="Middle name"
          value={form.middleName}
          onChange={(event) => updateField('middleName', event.target.value)}
          error={fieldErrors.middleName}
        />
        <Input
          name="lastName"
          label="Last name"
          required
          value={form.lastName}
          onChange={(event) => updateField('lastName', event.target.value)}
          error={fieldErrors.lastName}
        />
        <Input
          name="secondLastName"
          label="Second last name"
          value={form.secondLastName}
          onChange={(event) => updateField('secondLastName', event.target.value)}
          error={fieldErrors.secondLastName}
        />
        <Select
          name="genderId"
          label="Gender"
          placeholder="Select gender"
          value={form.genderId}
          onChange={(event) => updateField('genderId', event.target.value)}
          options={genderOptions}
        />
        <Select
          name="roleName"
          label="Staff role"
          required
          placeholder="Select staff role"
          value={form.roleName}
          onChange={(event) => updateField('roleName', event.target.value)}
          options={roleOptions}
          error={fieldErrors.roleName}
          hint="Admin, Receptionist, and Mechanic can be registered here."
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Input
          name="email"
          label="Work email"
          type="email"
          autoComplete="email"
          required
          value={form.email}
          onChange={(event) => updateField('email', event.target.value)}
          error={fieldErrors.email}
        />
        <Select
          name="phoneCountryId"
          label="Phone country"
          placeholder="Select country"
          value={form.phoneCountryId}
          onChange={(event) => updateField('phoneCountryId', event.target.value)}
          options={countryOptions}
          error={fieldErrors.phoneCountryId}
        />
        <Input
          name="phoneNumber"
          label="Phone number"
          value={form.phoneNumber}
          onChange={(event) => updateField('phoneNumber', event.target.value)}
          error={fieldErrors.phoneNumber}
        />
        <Input
          name="password"
          label="Temporary password"
          type="password"
          autoComplete="new-password"
          required
          value={form.password}
          onChange={(event) => updateField('password', event.target.value)}
          error={fieldErrors.password}
        />
        <Input
          name="confirmPassword"
          label="Confirm password"
          type="password"
          autoComplete="new-password"
          required
          value={form.confirmPassword}
          onChange={(event) => updateField('confirmPassword', event.target.value)}
          error={fieldErrors.confirmPassword}
        />
      </div>

      {form.roleName === 'Mechanic' && (
        <div className="rounded-lg border border-border bg-bg-elevated/40 p-4">
          <p className="mb-3 text-sm font-medium text-text-primary">
            Mechanic specialties
          </p>
          {specialties.length === 0 ? (
            <p className="text-sm text-text-secondary">
              No specialties are configured yet. Add specialties in the catalog
              module before registering mechanics.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {specialties.map((specialty) => {
                const checked = selectedSpecialtyIds.includes(specialty.specialtyId);
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
          {fieldErrors.specialtyIds && (
            <p className="mt-2 text-xs text-danger" role="alert">
              {fieldErrors.specialtyIds}
            </p>
          )}
        </div>
      )}

      <div className="flex justify-end border-t border-border pt-4">
        <Button type="submit" size="lg" isLoading={isSubmitting}>
          Register staff member
        </Button>
      </div>
    </form>
  );
}
