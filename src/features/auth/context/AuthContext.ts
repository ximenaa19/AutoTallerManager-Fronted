import { createContext } from 'react';
import type {
  AppRole,
  AuthResponseDto,
  AuthUserDto,
  LoginRequest,
  RegisterClientRequest,
} from '@/types/auth.types';

export interface AuthContextValue {
  user: AuthUserDto | null;
  activeRole: AppRole | null;
  isAuthenticated: boolean;
  isBootstrapping: boolean;
  login: (credentials: LoginRequest) => Promise<AuthResponseDto>;
  registerClient: (payload: RegisterClientRequest) => Promise<AuthResponseDto>;
  logout: () => Promise<void>;
  selectRole: (role: AppRole) => void;
  clearRoleSelection: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
