import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { getErrorMessage } from '@/api/apiError';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import type { CatalogDefinition } from '@/features/admin/catalogs/config/catalogDefinitions';
import { getCatalogDefinition } from '@/features/admin/catalogs/config/catalogDefinitions';
import { catalogsAdminApi } from '@/features/admin/catalogs/api/catalogs.api';
import type { CatalogRecord } from '@/features/admin/catalogs/types/catalogs.types';
import { validateMaxLength, validateRequired } from '@/utils/validation';

export type CatalogFormMode = 'create' | 'edit';

export interface CatalogFormProps {
  definition: CatalogDefinition;
  mode: CatalogFormMode;
  initialRecord?: CatalogRecord | null;
  onSubmit: (payload: Record<string, unknown>) => Promise<void>;
  onCancel: () => void;
}

function getFormFields(definition: CatalogDefinition, mode: CatalogFormMode) {
  const canWrite =
    mode === 'create' ? definition.operations.create : definition.operations.update;
  if (!canWrite) return [];

  return definition.fields.filter((field) => !field.formOnly);
}

function getInitialValues(
  definition: CatalogDefinition,
  mode: CatalogFormMode,
  record: CatalogRecord | null | undefined,
): Record<string, string> {
  const values: Record<string, string> = {};

  for (const field of getFormFields(definition, mode)) {
    const raw = record?.[field.key];
    values[field.key] = raw === null || raw === undefined ? '' : String(raw);
  }

  return values;
}

function buildPayload(
  definition: CatalogDefinition,
  mode: CatalogFormMode,
  values: Record<string, string>,
): Record<string, unknown> {
  const payload: Record<string, unknown> = {};

  for (const field of getFormFields(definition, mode)) {
    const raw = values[field.key]?.trim() ?? '';

    if (field.type === 'select') {
      payload[field.key] = raw ? Number(raw) : undefined;
      continue;
    }

    payload[field.key] = raw || undefined;
  }

  return payload;
}

export function CatalogForm({
  definition,
  mode,
  initialRecord,
  onSubmit,
  onCancel,
}: CatalogFormProps) {
  const [values, setValues] = useState<Record<string, string>>(() =>
    getInitialValues(definition, mode, initialRecord),
  );
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectOptions, setSelectOptions] = useState<
    Record<string, { value: string; label: string }[]>
  >({});
  const [selectLoading, setSelectLoading] = useState(false);

  const formFields = useMemo(() => getFormFields(definition, mode), [definition, mode]);

  useEffect(() => {
    setValues(getInitialValues(definition, mode, initialRecord));
    setFieldErrors({});
    setApiError(null);
  }, [definition, initialRecord, mode]);

  useEffect(() => {
    const selectFields = formFields.filter((field) => field.type === 'select');

    if (selectFields.length === 0) {
      return;
    }

    let cancelled = false;

    async function loadSelectOptions() {
      setSelectLoading(true);
      const nextOptions: Record<string, { value: string; label: string }[]> = {};

      try {
        for (const field of selectFields) {
          if (!field.selectCatalogKey) continue;

          const sourceDefinition = getCatalogDefinition(field.selectCatalogKey);
          if (!sourceDefinition) continue;

          const response = await catalogsAdminApi.getAll(sourceDefinition);
          const labelField = field.selectLabelField ?? 'name';
          const valueField = field.selectValueField ?? sourceDefinition.idField;

          nextOptions[field.key] = response.data.map((record) => {
            const labelRaw =
              record[labelField] ??
              record.name ??
              record.brandName ??
              record.modelName ??
              record.domain;
            const valueRaw = record[valueField];
            return {
              value: String(valueRaw),
              label: `${labelRaw ?? valueRaw}`,
            };
          });
        }

        if (!cancelled) {
          setSelectOptions(nextOptions);
        }
      } catch {
        if (!cancelled) {
          setSelectOptions({});
        }
      } finally {
        if (!cancelled) {
          setSelectLoading(false);
        }
      }
    }

    void loadSelectOptions();

    return () => {
      cancelled = true;
    };
  }, [formFields]);

  const validate = (): boolean => {
    const errors: Record<string, string> = {};

    for (const field of formFields) {
      const raw = values[field.key] ?? '';

      if (field.required) {
        const requiredError =
          field.type === 'select'
            ? raw
              ? undefined
              : `${field.label} is required`
            : validateRequired(raw, field.label);
        if (requiredError) {
          errors[field.key] = requiredError;
          continue;
        }
      }

      if (field.type === 'text' && field.maxLength) {
        const lengthError = validateMaxLength(raw, field.maxLength, field.label);
        if (lengthError) {
          errors[field.key] = lengthError;
        }
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
      await onSubmit(buildPayload(definition, mode, values));
    } catch (error) {
      setApiError(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (formFields.length === 0) {
    return (
      <p className="text-sm text-text-secondary">
        This catalog does not support create or edit in the current API contract.
      </p>
    );
  }

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

      {formFields.map((field) => {
        if (field.type === 'select') {
          return (
            <Select
              key={field.key}
              name={field.key}
              label={field.label}
              required={field.required}
              value={values[field.key] ?? ''}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  [field.key]: event.target.value,
                }))
              }
              options={selectOptions[field.key] ?? []}
              placeholder={selectLoading ? 'Loading options…' : `Select ${field.label.toLowerCase()}`}
              error={fieldErrors[field.key]}
              disabled={selectLoading}
            />
          );
        }

        return (
          <Input
            key={field.key}
            name={field.key}
            label={field.label}
            required={field.required}
            value={values[field.key] ?? ''}
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                [field.key]: event.target.value,
              }))
            }
            error={fieldErrors[field.key]}
            hint={
              field.maxLength
                ? `Maximum ${field.maxLength} characters.`
                : undefined
            }
          />
        );
      })}

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isSubmitting}>
          {mode === 'create' ? 'Create record' : 'Save changes'}
        </Button>
      </div>
    </form>
  );
}
