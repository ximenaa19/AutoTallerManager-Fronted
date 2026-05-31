import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { authApi } from '@/api/auth.api';
import { refreshAccessToken } from '@/api/authRefresh';
import { setUnauthorizedHandler } from '@/api/httpClient';
import {
  AuthContext,
  type AuthContextValue,
} from '@/features/auth/context/AuthContext';
import {
  clearAuthSession,
  getRefreshToken,
  getSelectedRole,
  getStoredUser,
  hasStoredSession,
  isAccessTokenExpired,
  persistAuthSession,
  setSelectedRole as persistSelectedRole,
  clearSelectedRole,
} from '@/lib/authToken';
import {
  getPrimaryRole,
  resolveActiveRole,
  userNeedsRoleSelection,
} from '@/lib/roles';
import type {
  AppRole,
  AuthResponseDto,
  AuthUserDto,
  LoginRequest,
  RegisterClientRequest,
} from '@/types/auth.types';

function applyAuthResponse(response: AuthResponseDto): AuthUserDto {
  persistAuthSession(response);

  if (!userNeedsRoleSelection(response.user.roles)) {
    const primary = getPrimaryRole(response.user.roles);
    if (primary) {
      persistSelectedRole(primary);
    }
  } else {
    clearSelectedRole();
  }

  return response.user;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUserDto | null>(() => getStoredUser());
  const [selectedRole, setSelectedRoleState] = useState<AppRole | null>(() =>
    getSelectedRole(),
  );
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  const handleUnauthorized = useCallback(() => {
    clearAuthSession();
    setUser(null);
    setSelectedRoleState(null);
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(handleUnauthorized);
    return () => setUnauthorizedHandler(null);
  }, [handleUnauthorized]);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      if (!hasStoredSession()) {
        if (!cancelled) setIsBootstrapping(false);
        return;
      }

      try {
        if (isAccessTokenExpired()) {
          await refreshAccessToken();
        }
        if (!cancelled) {
          setUser(getStoredUser());
          setSelectedRoleState(getSelectedRole());
        }
      } catch {
        handleUnauthorized();
      } finally {
        if (!cancelled) setIsBootstrapping(false);
      }
    }

    void bootstrap();

    return () => {
      cancelled = true;
    };
  }, [handleUnauthorized]);

  const login = useCallback(async (credentials: LoginRequest) => {
    const response = await authApi.login(credentials);
    const nextUser = applyAuthResponse(response.data);
    setUser(nextUser);
    setSelectedRoleState(getSelectedRole());
    return response.data;
  }, []);

  const registerClient = useCallback(async (payload: RegisterClientRequest) => {
    const response = await authApi.registerClient(payload);
    const nextUser = applyAuthResponse(response.data);
    setUser(nextUser);
    setSelectedRoleState(getSelectedRole());
    return response.data;
  }, []);

  const logout = useCallback(async () => {
    try {
      const refreshToken = getRefreshToken();
      if (refreshToken) {
        await authApi.logout({ refreshToken });
      }
    } catch {
      // Clear local session even if server logout fails
    } finally {
      handleUnauthorized();
    }
  }, [handleUnauthorized]);

  const selectRole = useCallback((role: AppRole) => {
    persistSelectedRole(role);
    setSelectedRoleState(role);
  }, []);

  const clearRoleSelection = useCallback(() => {
    clearSelectedRole();
    setSelectedRoleState(null);
  }, []);

  const activeRole = useMemo(() => {
    if (!user) return null;
    return resolveActiveRole(user.roles, selectedRole);
  }, [user, selectedRole]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      activeRole,
      isAuthenticated: Boolean(user),
      isBootstrapping,
      login,
      registerClient,
      logout,
      selectRole,
      clearRoleSelection,
    }),
    [
      user,
      activeRole,
      isBootstrapping,
      login,
      registerClient,
      logout,
      selectRole,
      clearRoleSelection,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
