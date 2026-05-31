import { httpClient } from '@/api/httpClient';
import type {
  AuthResponseDto,
  LoginRequest,
  LogoutRequest,
  RefreshTokenRequest,
  RegisterClientRequest,
} from '@/types/auth.types';

const AUTH_BASE = '/api/auth';

export const authApi = {
  login(body: LoginRequest) {
    return httpClient.post<AuthResponseDto>(`${AUTH_BASE}/login`, body, {
      skipAuth: true,
    });
  },

  registerClient(body: RegisterClientRequest) {
    return httpClient.post<AuthResponseDto>(`${AUTH_BASE}/register-client`, body, {
      skipAuth: true,
    });
  },

  refresh(body: RefreshTokenRequest) {
    return httpClient.post<AuthResponseDto>(`${AUTH_BASE}/refresh`, body, {
      skipAuth: true,
    });
  },

  logout(body: LogoutRequest) {
    return httpClient.post<void>(`${AUTH_BASE}/logout`, body, {
      skipAuth: true,
    });
  },
};
