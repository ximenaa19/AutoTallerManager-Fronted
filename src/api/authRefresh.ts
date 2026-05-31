import { parseApiErrorResponse } from '@/api/apiError';
import {
  getRefreshToken,
  persistAuthSession,
} from '@/lib/authToken';
import { getApiBaseUrl } from '@/lib/env';
import type { AuthResponseDto } from '@/types/auth.types';

let refreshPromise: Promise<AuthResponseDto> | null = null;

async function requestRefresh(refreshToken: string): Promise<AuthResponseDto> {
  const base = getApiBaseUrl().replace(/\/$/, '');
  const response = await fetch(`${base}/api/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });

  if (!response.ok) {
    throw await parseApiErrorResponse(response);
  }

  return (await response.json()) as AuthResponseDto;
}

export async function refreshAccessToken(): Promise<AuthResponseDto> {
  if (refreshPromise) {
    return refreshPromise;
  }

  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  refreshPromise = requestRefresh(refreshToken)
    .then((data) => {
      persistAuthSession(data);
      return data;
    })
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
}

export function isRefreshInFlight(): boolean {
  return refreshPromise !== null;
}
