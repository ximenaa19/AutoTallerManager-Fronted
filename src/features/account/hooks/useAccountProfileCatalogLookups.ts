import { useEffect, useState } from 'react';
import { catalogsApi } from '@/api/catalogs.api';
import type { PublicRegistrationCatalogsDto } from '@/types/catalogs.types';

export interface AccountProfileCatalogLookups {
  documentTypeNameById: Map<number, string>;
  genderNameById: Map<number, string>;
}

const emptyLookups: AccountProfileCatalogLookups = {
  documentTypeNameById: new Map(),
  genderNameById: new Map(),
};

export function useAccountProfileCatalogLookups() {
  const [catalogs, setCatalogs] = useState<PublicRegistrationCatalogsDto | null>(null);
  const [lookups, setLookups] = useState<AccountProfileCatalogLookups>(emptyLookups);
  const [isLoading, setIsLoading] = useState(true);
  const [catalogsUnavailable, setCatalogsUnavailable] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setCatalogsUnavailable(false);

      try {
        const response = await catalogsApi.getPublicRegistration();
        if (cancelled) {
          return;
        }

        setCatalogs(response.data);
        setLookups({
          documentTypeNameById: new Map(
            response.data.documentTypes.map((item) => [item.id, item.name]),
          ),
          genderNameById: new Map(
            response.data.genders.map((item) => [item.id, item.name]),
          ),
        });
      } catch {
        if (!cancelled) {
          setCatalogs(null);
          setLookups(emptyLookups);
          setCatalogsUnavailable(true);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  return { catalogs, lookups, isLoading, catalogsUnavailable };
}

export function formatAccountDocumentTypeLabel(
  documentTypeId: number,
  lookups: AccountProfileCatalogLookups,
): string {
  return lookups.documentTypeNameById.get(documentTypeId) ?? `Type #${documentTypeId}`;
}

export function formatAccountGenderLabel(
  genderId: number | undefined,
  lookups: AccountProfileCatalogLookups,
): string {
  if (!genderId) {
    return '—';
  }

  return lookups.genderNameById.get(genderId) ?? `Gender #${genderId}`;
}

export function formatAccountCountryLabel(
  countryId: number | undefined,
  catalogs: PublicRegistrationCatalogsDto | null,
): string {
  if (!countryId) {
    return '—';
  }

  const match = catalogs?.countries.find((item) => item.id === countryId);
  return match?.name ?? `Country #${countryId}`;
}
