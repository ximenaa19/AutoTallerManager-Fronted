export interface ApiErrorBody {
  code: string;
  message: string;
}

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface RequestOptions extends Omit<RequestInit, 'body' | 'method'> {
  method?: HttpMethod;
  body?: unknown;
  /** Skip attaching Authorization header even if a token exists */
  skipAuth?: boolean;
  /** Custom query parameters appended to the URL */
  params?: Record<string, string | number | boolean | undefined | null>;
}

export interface HttpResponse<T> {
  data: T;
  status: number;
  headers: Headers;
}
