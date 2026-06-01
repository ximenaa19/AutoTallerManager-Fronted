export interface RegisterStaffRequest {
  documentTypeId: number;
  documentNumber?: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  secondLastName?: string;
  birthDate?: string;
  genderId?: number;
  addressId?: number;
  email?: string;
  phoneCountryId?: number;
  phoneNumber?: string;
  password?: string;
  roleName?: string;
  specialtyIds?: number[];
}

export interface StaffUserDto {
  userId: number;
  personId: number;
  email: string;
  roleName: string;
  isActive: boolean;
  specialtyIds: number[];
}

export const STAFF_ROLE_NAMES = ['Admin', 'Receptionist', 'Mechanic'] as const;

export type StaffRoleName = (typeof STAFF_ROLE_NAMES)[number];
