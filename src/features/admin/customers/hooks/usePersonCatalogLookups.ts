import { useEffect, useState } from 'react';
import { getErrorMessage } from '@/api/apiError';
import { catalogsApi } from '@/api/catalogs.api';
import { httpClient } from '@/api/httpClient';
import type { PublicRegistrationCatalogsDto } from '@/types/catalogs.types';

interface DocumentTypeRecord {
  documentTypeId: number;
  code: string;
  name: string;
}

export interface PersonCatalogLookups {
  documentTypeNameById: Map<number, string>;
  genderNameById: Map<number, string>;
}

const emptyLookups: PersonCatalogLookups = {
  documentTypeNameById: new Map(),
  genderNameById: new Map(),
};

export function usePersonCatalogLookups() {
  const [catalogs, setCatalogs] = useState<PublicRegistrationCatalogsDto | null>(
    null,
  );
  const [lookups, setLookups] = useState<PersonCatalogLookups>(emptyLookups);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError(null);

      try {
        const [registrationResponse, documentTypesResponse] = await Promise.all([
          catalogsApi.getPublicRegistration(),
          httpClient.get<DocumentTypeRecord[]>('/api/document-types'),
        ]);

        if (cancelled) return;

        setCatalogs(registrationResponse.data);
        setLookups({
          documentTypeNameById: new Map(
            documentTypesResponse.data.map((item) => [
              item.documentTypeId,
              `${item.code} — ${item.name}`,
            ]),
          ),
          genderNameById: new Map(
            registrationResponse.data.genders.map((item) => [item.id, item.name]),
          ),
        });
      } catch (err) {
        if (!cancelled) {
          setCatalogs(null);
          setLookups(emptyLookups);
          setError(getErrorMessage(err));
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  return { catalogs, lookups, isLoading, error };
}

export function formatDocumentTypeLabel(
  documentTypeId: number,
  lookups: PersonCatalogLookups,
): string {
  return lookups.documentTypeNameById.get(documentTypeId) ?? `Type #${documentTypeId}`;
}

export function formatGenderLabel(
  genderId: number | undefined,
  lookups: PersonCatalogLookups,
): string {
  if (!genderId) return '—';
  return lookups.genderNameById.get(genderId) ?? `Gender #${genderId}`;
}
