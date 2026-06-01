/** Fields aligned with api-contract §9 Persons CRUD (CreatePersonRequest + personId, createdAt). */
export interface PersonDto {
  personId: number;
  documentTypeId: number;
  documentNumber: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  secondLastName?: string;
  birthDate?: string;
  genderId?: number;
  addressId?: number;
  createdAt: string;
}

export function formatPersonFullName(person: PersonDto): string {
  return [person.firstName, person.middleName, person.lastName, person.secondLastName]
    .filter(Boolean)
    .join(' ')
    .trim();
}

export function formatPersonPrimaryLabel(person: PersonDto): string {
  const fullName = formatPersonFullName(person);
  return fullName || `Person #${person.personId}`;
}

export function formatPersonSecondaryLabel(person: PersonDto): string {
  const parts = [`ID ${person.personId}`];
  if (person.documentNumber) {
    parts.push(`Doc ${person.documentNumber}`);
  }
  return parts.join(' · ');
}

export function personMatchesSearch(person: PersonDto, term: string): boolean {
  const normalized = term.trim().toLowerCase();
  if (!normalized) return true;

  return [
    formatPersonFullName(person),
    person.documentNumber,
    String(person.personId),
  ]
    .join(' ')
    .toLowerCase()
    .includes(normalized);
}
