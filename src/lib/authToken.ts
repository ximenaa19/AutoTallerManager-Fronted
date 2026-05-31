import type { AuthSession, AuthUserDto, AppRole } from '@/types/auth.types';

const ACCESS_TOKEN_KEY = 'atm_access_token';
const REFRESH_TOKEN_KEY = 'atm_refresh_token';
const ACCESS_TOKEN_EXPIRES_KEY = 'atm_access_token_expires';
const REFRESH_TOKEN_EXPIRES_KEY = 'atm_refresh_token_expires';
const AUTH_USER_KEY = 'atm_auth_user';
const SELECTED_ROLE_KEY = 'atm_selected_role';

export function getAccessToken(): string | null {
  return sessionStorage.getItem(ACCESS_TOKEN_KEY);
}

export function setAccessToken(token: string): void {
  sessionStorage.setItem(ACCESS_TOKEN_KEY, token);
}

export function clearAccessToken(): void {
  sessionStorage.removeItem(ACCESS_TOKEN_KEY);
}

export function hasAccessToken(): boolean {
  return Boolean(getAccessToken());
}

export function getRefreshToken(): string | null {
  return sessionStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setRefreshToken(token: string): void {
  sessionStorage.setItem(REFRESH_TOKEN_KEY, token);
}

export function clearRefreshToken(): void {
  sessionStorage.removeItem(REFRESH_TOKEN_KEY);
}

export function getAccessTokenExpiresAt(): string | null {
  return sessionStorage.getItem(ACCESS_TOKEN_EXPIRES_KEY);
}

export function setAccessTokenExpiresAt(value: string): void {
  sessionStorage.setItem(ACCESS_TOKEN_EXPIRES_KEY, value);
}

export function getRefreshTokenExpiresAt(): string | null {
  return sessionStorage.getItem(REFRESH_TOKEN_EXPIRES_KEY);
}

export function setRefreshTokenExpiresAt(value: string): void {
  sessionStorage.setItem(REFRESH_TOKEN_EXPIRES_KEY, value);
}

export function getStoredUser(): AuthUserDto | null {
  const raw = sessionStorage.getItem(AUTH_USER_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as AuthUserDto;
  } catch {
    return null;
  }
}

export function setStoredUser(user: AuthUserDto): void {
  sessionStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
}

export function clearStoredUser(): void {
  sessionStorage.removeItem(AUTH_USER_KEY);
}

export function getSelectedRole(): AppRole | null {
  const value = sessionStorage.getItem(SELECTED_ROLE_KEY);
  if (!value) return null;
  return value as AppRole;
}

export function setSelectedRole(role: AppRole): void {
  sessionStorage.setItem(SELECTED_ROLE_KEY, role);
}

export function clearSelectedRole(): void {
  sessionStorage.removeItem(SELECTED_ROLE_KEY);
}

export function persistAuthSession(session: AuthSession): void {
  setAccessToken(session.accessToken);
  setRefreshToken(session.refreshToken);
  setAccessTokenExpiresAt(session.accessTokenExpiresAt);
  setRefreshTokenExpiresAt(session.refreshTokenExpiresAt);
  setStoredUser(session.user);
}

export function clearAuthSession(): void {
  clearAccessToken();
  clearRefreshToken();
  sessionStorage.removeItem(ACCESS_TOKEN_EXPIRES_KEY);
  sessionStorage.removeItem(REFRESH_TOKEN_EXPIRES_KEY);
  clearStoredUser();
  clearSelectedRole();
}

export function hasStoredSession(): boolean {
  return Boolean(getAccessToken() && getRefreshToken() && getStoredUser());
}

export function isAccessTokenExpired(): boolean {
  const expiresAt = getAccessTokenExpiresAt();
  if (!expiresAt) return true;
  return new Date(expiresAt).getTime() <= Date.now();
}
