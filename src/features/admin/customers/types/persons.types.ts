export type { PersonDto } from '@/features/admin/types/persons.types';
export {
  formatPersonFullName,
  formatPersonPrimaryLabel,
  formatPersonSecondaryLabel,
  personMatchesSearch,
} from '@/features/admin/types/persons.types';

/** Aligned with api-contract §9 POST /api/persons request body. */
export interface CreatePersonRequest {
  documentTypeId: number;
  documentNumber: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  secondLastName?: string;
  birthDate?: string;
  genderId?: number;
  addressId?: number;
}

export type UpdatePersonRequest = CreatePersonRequest;
