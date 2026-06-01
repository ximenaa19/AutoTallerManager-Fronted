import {
  formatDocumentTypeLabel,
  formatGenderLabel,
  type PersonCatalogLookups,
} from '@/features/admin/customers/hooks/usePersonCatalogLookups';
import type { PersonDto } from '@/features/admin/types/persons.types';
import { formatPersonFullName } from '@/features/admin/types/persons.types';
import { formatDateTime } from '@/utils/format';

export interface CustomerDetailPanelProps {
  person: PersonDto;
  lookups: PersonCatalogLookups;
}

export function CustomerDetailPanel({ person, lookups }: CustomerDetailPanelProps) {
  return (
    <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div>
        <dt className="text-xs uppercase tracking-wide text-text-secondary">Person ID</dt>
        <dd className="mt-1 text-sm font-medium text-text-primary">#{person.personId}</dd>
      </div>
      <div>
        <dt className="text-xs uppercase tracking-wide text-text-secondary">Full name</dt>
        <dd className="mt-1 text-sm font-medium text-text-primary">
          {formatPersonFullName(person)}
        </dd>
      </div>
      <div>
        <dt className="text-xs uppercase tracking-wide text-text-secondary">Document</dt>
        <dd className="mt-1 text-sm text-text-primary">
          {formatDocumentTypeLabel(person.documentTypeId, lookups)}
          <span className="ml-2 text-text-secondary">{person.documentNumber}</span>
        </dd>
      </div>
      <div>
        <dt className="text-xs uppercase tracking-wide text-text-secondary">Gender</dt>
        <dd className="mt-1 text-sm text-text-primary">
          {formatGenderLabel(person.genderId, lookups)}
        </dd>
      </div>
      <div>
        <dt className="text-xs uppercase tracking-wide text-text-secondary">Birth date</dt>
        <dd className="mt-1 text-sm text-text-primary">
          {person.birthDate ? formatDateTime(person.birthDate) : '—'}
        </dd>
      </div>
      <div>
        <dt className="text-xs uppercase tracking-wide text-text-secondary">Address ID</dt>
        <dd className="mt-1 text-sm text-text-primary">
          {person.addressId ? `#${person.addressId}` : '—'}
        </dd>
      </div>
      <div>
        <dt className="text-xs uppercase tracking-wide text-text-secondary">Registered</dt>
        <dd className="mt-1 text-sm text-text-primary">
          {formatDateTime(person.createdAt)}
        </dd>
      </div>
      <div className="sm:col-span-2">
        <dt className="text-xs uppercase tracking-wide text-text-secondary">Notes</dt>
        <dd className="mt-1 text-sm text-text-secondary">
          Email and phone are stored on related person contact records and appear in client
          search results, not in the persons list DTO.
        </dd>
      </div>
    </dl>
  );
}
