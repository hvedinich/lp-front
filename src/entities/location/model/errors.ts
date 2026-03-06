import { createApiErrorMapper, type ApiDomainError, type ApiDomainErrorIssue } from '@/shared/api';

export type LocationErrorCode =
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'VALIDATION_ERROR'
  | 'CONFLICT'
  | 'BAD_REQUEST'
  | 'NETWORK'
  | 'UNKNOWN';

export type LocationErrorIssue = ApiDomainErrorIssue;

export type LocationError = ApiDomainError<LocationErrorCode>;

const locationKnownCodes = [
  'UNAUTHORIZED',
  'FORBIDDEN',
  'NOT_FOUND',
  'VALIDATION_ERROR',
  'CONFLICT',
  'BAD_REQUEST',
  'NETWORK',
  'UNKNOWN',
] as const satisfies readonly LocationErrorCode[];

export const mapToLocationError = createApiErrorMapper<LocationErrorCode>({
  knownCodes: locationKnownCodes,
  networkCode: 'NETWORK',
  statusMap: {
    400: 'BAD_REQUEST',
    401: 'UNAUTHORIZED',
    403: 'FORBIDDEN',
    404: 'NOT_FOUND',
    409: 'CONFLICT',
    422: 'VALIDATION_ERROR',
  },
  unknownCode: 'UNKNOWN',
  valueAliases: {
    TOKEN_EXPIRED: 'UNAUTHORIZED',
  },
});
