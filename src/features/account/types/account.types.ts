export interface AccountProfileDto {
  userId: number;
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
  primaryEmail?: string;
  primaryPhoneCountryId?: number;
  primaryPhoneNumber?: string;
  isActive: boolean;
  roles: string[];
}

export interface UpdateAccountProfileRequest {
  firstName: string;
  middleName?: string;
  lastName: string;
  secondLastName?: string;
  birthDate?: string;
  genderId?: number;
  addressId?: number;
  email?: string;
  phoneCountryId?: number;
  phoneNumber?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}
