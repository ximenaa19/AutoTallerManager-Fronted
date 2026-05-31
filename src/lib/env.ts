const DEFAULT_API_BASE_URL = 'http://localhost:5077';

export function getApiBaseUrl(): string {
  const configured = import.meta.env.VITE_API_BASE_URL?.trim();
  return configured || DEFAULT_API_BASE_URL;
}

export function isDev(): boolean {
  return import.meta.env.DEV;
}
