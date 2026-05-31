import { ApiError, NetworkError, parseApiErrorResponse } from '@/api/apiError';
import { getAccessToken } from '@/lib/authToken';
import { getApiBaseUrl } from '@/lib/env';
import type { HttpResponse, RequestOptions } from '@/types/api.types';

function buildUrl(path: string, params?: RequestOptions['params']): string {
  const base = getApiBaseUrl().replace(/\/$/, '');
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const url = new URL(`${base}${normalizedPath}`);

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null) {
        url.searchParams.set(key, String(value));
      }
    }
  }

  return url.toString();
}

function buildHeaders(
  options: RequestOptions,
  hasBody: boolean,
): Headers {
  const headers = new Headers(options.headers);

  if (hasBody && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  if (!options.skipAuth) {
    const token = getAccessToken();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  }

  return headers;
}

async function parseResponseBody<T>(response: Response): Promise<T | null> {
  if (response.status === 204) {
    return null;
  }

  const contentType = response.headers.get('content-type') ?? '';
  if (!contentType.includes('application/json')) {
    return null;
  }

  return (await response.json()) as T;
}

async function request<T>(
  path: string,
  options: RequestOptions = {},
): Promise<HttpResponse<T>> {
  const { method = 'GET', body, params, skipAuth, ...init } = options;
  const hasBody = body !== undefined;
  const url = buildUrl(path, params);

  let response: Response;

  try {
    response = await fetch(url, {
      ...init,
      method,
      headers: buildHeaders({ ...options, skipAuth }, hasBody),
      body: hasBody ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new NetworkError();
  }

  if (!response.ok) {
    throw await parseApiErrorResponse(response);
  }

  const data = (await parseResponseBody<T>(response)) as T;

  return {
    data,
    status: response.status,
    headers: response.headers,
  };
}

export const httpClient = {
  get<T>(path: string, options?: Omit<RequestOptions, 'method' | 'body'>) {
    return request<T>(path, { ...options, method: 'GET' });
  },

  post<T>(
    path: string,
    body?: unknown,
    options?: Omit<RequestOptions, 'method' | 'body'>,
  ) {
    return request<T>(path, { ...options, method: 'POST', body });
  },

  put<T>(
    path: string,
    body?: unknown,
    options?: Omit<RequestOptions, 'method' | 'body'>,
  ) {
    return request<T>(path, { ...options, method: 'PUT', body });
  },

  patch<T>(
    path: string,
    body?: unknown,
    options?: Omit<RequestOptions, 'method' | 'body'>,
  ) {
    return request<T>(path, { ...options, method: 'PATCH', body });
  },

  delete<T>(path: string, options?: Omit<RequestOptions, 'method' | 'body'>) {
    return request<T>(path, { ...options, method: 'DELETE' });
  },
};

export { ApiError, NetworkError };
