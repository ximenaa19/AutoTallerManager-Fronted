export type AppRole = 'Admin' | 'Receptionist' | 'Mechanic' | 'Client';

export interface AuthUserDto {
  userId: number;
  personId: number;
  email: string;
  isActive: boolean;
  roles: string[];
}

export interface AuthResponseDto {
  accessToken: string;
  accessTokenExpiresAt: string;
  refreshToken: string;
  refreshTokenExpiresAt: string;
  user: AuthUserDto;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterClientRequest {
  documentTypeId: number;
  documentNumber: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  secondLastName?: string;
  birthDate?: string;
  genderId?: number;
  addressId?: number;
  email: string;
  phoneCountryId?: number;
  phoneNumber?: string;
  password: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface LogoutRequest {
  refreshToken: string;
}

export interface AuthSession {
  accessToken: string;
  accessTokenExpiresAt: string;
  refreshToken: string;
  refreshTokenExpiresAt: string;
  user: AuthUserDto;
}

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
