import { isApiError } from '@/shared/api';

export type LocationErrorCode =
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'VALIDATION_ERROR'
  | 'CONFLICT'
  | 'BAD_REQUEST'
  | 'NETWORK'
  | 'UNKNOWN';

export interface LocationErrorIssue {
  path: string;
  message: string;
}

export interface LocationError {
  code: LocationErrorCode;
  message: string;
  issues?: LocationErrorIssue[];
}

interface ApiErrorEnvelope {
  error?: {
    code?: string;
    issues?: LocationErrorIssue[];
    message?: string;
  };
}

const toKnownCode = (value: string | null): LocationErrorCode | null => {
  if (!value) {
    return null;
  }

  switch (value.trim().toUpperCase()) {
    case 'UNAUTHORIZED':
    case 'TOKEN_EXPIRED':
      return 'UNAUTHORIZED';
    case 'FORBIDDEN':
      return 'FORBIDDEN';
    case 'NOT_FOUND':
      return 'NOT_FOUND';
    case 'VALIDATION_ERROR':
      return 'VALIDATION_ERROR';
    case 'CONFLICT':
      return 'CONFLICT';
    case 'BAD_REQUEST':
      return 'BAD_REQUEST';
    default:
      return null;
  }
};

const toStatusCode = (status: number): LocationErrorCode | null => {
  switch (status) {
    case 400:
      return 'BAD_REQUEST';
    case 401:
      return 'UNAUTHORIZED';
    case 403:
      return 'FORBIDDEN';
    case 404:
      return 'NOT_FOUND';
    case 409:
      return 'CONFLICT';
    case 422:
      return 'VALIDATION_ERROR';
    default:
      return null;
  }
};

const readEnvelope = (payload: unknown): ApiErrorEnvelope => {
  if (payload && typeof payload === 'object') {
    return payload as ApiErrorEnvelope;
  }

  return {};
};

export const mapToLocationError = (error: unknown): LocationError => {
  if (!isApiError(error)) {
    return {
      code: 'UNKNOWN',
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  }

  if (error.status === 0) {
    return {
      code: 'NETWORK',
      message: error.message,
    };
  }

  const envelope = readEnvelope(error.payload);
  const mappedCode =
    toKnownCode(error.code) ??
    toKnownCode(envelope.error?.code ?? null) ??
    toStatusCode(error.status) ??
    'UNKNOWN';

  return {
    code: mappedCode,
    issues: envelope.error?.issues,
    message: envelope.error?.message ?? error.message,
  };
};
