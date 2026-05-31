import type { ApiErrorBody } from '@/types/api.types';

export class ApiError extends Error {
  readonly code: string;
  readonly status: number;

  constructor(status: number, body: ApiErrorBody) {
    super(body.message);
    this.name = 'ApiError';
    this.code = body.code;
    this.status = status;
  }
}

export class NetworkError extends Error {
  constructor(message = 'Network request failed. Please check your connection.') {
    super(message);
    this.name = 'NetworkError';
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

export function isNetworkError(error: unknown): error is NetworkError {
  return error instanceof NetworkError;
}

export async function parseApiErrorResponse(
  response: Response,
): Promise<ApiError> {
  const fallback: ApiErrorBody = {
    code: 'UnknownError',
    message: getDefaultMessageForStatus(response.status),
  };

  try {
    const body = (await response.json()) as Partial<ApiErrorBody>;
    return new ApiError(response.status, {
      code: body.code ?? fallback.code,
      message: body.message ?? fallback.message,
    });
  } catch {
    return new ApiError(response.status, fallback);
  }
}

function getDefaultMessageForStatus(status: number): string {
  switch (status) {
    case 400:
      return 'The request could not be processed.';
    case 401:
      return 'Authentication is required.';
    case 403:
      return 'You do not have permission to perform this action.';
    case 404:
      return 'The requested resource was not found.';
    case 409:
      return 'The request conflicts with the current state.';
    case 500:
      return 'An unexpected server error occurred. Please try again.';
    default:
      return 'Something went wrong. Please try again.';
  }
}

export function getErrorMessage(error: unknown): string {
  if (isApiError(error) || isNetworkError(error)) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Something went wrong. Please try again.';
}
