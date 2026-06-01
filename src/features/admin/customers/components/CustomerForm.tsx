import { useEffect, useState, type FormEvent } from 'react';
import { getErrorMessage } from '@/api/apiError';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingState } from '@/components/feedback/LoadingState';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { usePersonCatalogLookups } from '@/features/admin/customers/hooks/usePersonCatalogLookups';
import type {
  CreatePersonRequest,
  UpdatePersonRequest,
} from '@/features/admin/customers/types/persons.types';
import type { PersonDto } from '@/features/admin/types/persons.types';
import {
  validateMaxLength,
  validateRequired,
} from '@/utils/validation';

interface PersonFormState {
  documentTypeId: string;
  documentNumber: string;
  firstName: string;
  middleName: string;
  lastName: string;
  secondLastName: string;
  birthDate: string;
  genderId: string;
}

type PersonFieldErrors = Partial<Record<keyof PersonFormState, string>>;

const emptyForm: PersonFormState = {
  documentTypeId: '',
  documentNumber: '',
  firstName: '',
  middleName: '',
  lastName: '',
  secondLastName: '',
  birthDate: '',
  genderId: '',
};

function personToForm(person: PersonDto): PersonFormState {
  return {
    documentTypeId: String(person.documentTypeId),
    documentNumber: person.documentNumber,
    firstName: person.firstName,
    middleName: person.middleName ?? '',
    lastName: person.lastName,
    secondLastName: person.secondLastName ?? '',
    birthDate: person.birthDate ? person.birthDate.slice(0, 10) : '',
    genderId: person.genderId ? String(person.genderId) : '',
  };
}

function buildPayload(form: PersonFormState): CreatePersonRequest {
  return {
    documentTypeId: Number(form.documentTypeId),
    documentNumber: form.documentNumber.trim(),
    firstName: form.firstName.trim(),
    middleName: form.middleName.trim() || undefined,
    lastName: form.lastName.trim(),
    secondLastName: form.secondLastName.trim() || undefined,
    birthDate: form.birthDate ? `${form.birthDate}T00:00:00Z` : undefined,
    genderId: form.genderId ? Number(form.genderId) : undefined,
  };
}

export interface CustomerFormProps {
  mode: 'create' | 'edit';
  initialPerson?: PersonDto | null;
  onSubmit: (payload: CreatePersonRequest | UpdatePersonRequest) => Promise<void>;
  onCancel: () => void;
}

export function CustomerForm({
  mode,
  initialPerson,
  onSubmit,
  onCancel,
}: CustomerFormProps) {
  const { catalogs, lookups, isLoading, error } = usePersonCatalogLookups();
  const [form, setForm] = useState<PersonFormState>(emptyForm);
  const [fieldErrors, setFieldErrors] = useState<PersonFieldErrors>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (mode === 'edit' && initialPerson) {
      setForm(personToForm(initialPerson));
    } else {
      setForm(emptyForm);
    }
    setFieldErrors({});
    setApiError(null);
  }, [mode, initialPerson]);

  const updateField = <K extends keyof PersonFormState>(
    key: K,
    value: PersonFormState[K],
  ) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const validate = (): boolean => {
    const errors: PersonFieldErrors = {};

    if (!form.documentTypeId) {
      errors.documentTypeId = 'Document type is required';
    }

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

    if (form.birthDate) {
      const birthDate = new Date(`${form.birthDate}T00:00:00`);
      if (birthDate.getTime() > Date.now()) {
        errors.birthDate = 'Birth date cannot be in the future';
      }
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
      await onSubmit(buildPayload(form));
    } catch (err) {
      setApiError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <LoadingState
        title="Loading form catalogs"
        description="Fetching document types and genders…"
        className="min-h-[240px]"
      />
    );
  }

  if (error || !catalogs) {
    return (
      <ErrorState
        title="Unable to load form catalogs"
        message={error ?? 'Catalog data is unavailable.'}
      />
    );
  }

  const documentTypeOptions = lookups.documentTypeNameById.size
    ? Array.from(lookups.documentTypeNameById.entries()).map(([id, label]) => ({
        value: String(id),
        label,
      }))
    : catalogs.documentTypes.map((item) => ({
        value: String(item.id),
        label: item.name,
      }));

  const genderOptions = [
    { value: '', label: 'Not specified' },
    ...catalogs.genders.map((item) => ({
      value: String(item.id),
      label: item.name,
    })),
  ];

  return (
    <form onSubmit={(event) => void handleSubmit(event)} className="space-y-5">
      {apiError && (
        <div
          role="alert"
          className="rounded-lg border border-danger/30 bg-danger-muted/40 px-4 py-3 text-sm text-danger"
        >
          {apiError}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Select
          name="documentTypeId"
          label="Document type"
          value={form.documentTypeId}
          onChange={(event) => updateField('documentTypeId', event.target.value)}
          options={documentTypeOptions}
          placeholder="Select document type"
          error={fieldErrors.documentTypeId}
          required
        />
        <Input
          name="documentNumber"
          label="Document number"
          value={form.documentNumber}
          onChange={(event) => updateField('documentNumber', event.target.value)}
          error={fieldErrors.documentNumber}
          required
        />
        <Input
          name="firstName"
          label="First name"
          value={form.firstName}
          onChange={(event) => updateField('firstName', event.target.value)}
          error={fieldErrors.firstName}
          required
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
          value={form.lastName}
          onChange={(event) => updateField('lastName', event.target.value)}
          error={fieldErrors.lastName}
          required
        />
        <Input
          name="secondLastName"
          label="Second last name"
          value={form.secondLastName}
          onChange={(event) => updateField('secondLastName', event.target.value)}
          error={fieldErrors.secondLastName}
        />
        <Input
          name="birthDate"
          label="Birth date"
          type="date"
          value={form.birthDate}
          onChange={(event) => updateField('birthDate', event.target.value)}
          error={fieldErrors.birthDate}
        />
        <Select
          name="genderId"
          label="Gender"
          value={form.genderId}
          onChange={(event) => updateField('genderId', event.target.value)}
          options={genderOptions}
        />
      </div>

      <div className="flex flex-wrap justify-end gap-2 border-t border-border pt-4">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isSubmitting}>
          {mode === 'create' ? 'Create customer' : 'Save changes'}
        </Button>
      </div>
    </form>
  );
}
