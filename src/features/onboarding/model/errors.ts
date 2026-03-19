import { createApiErrorMapper, type ApiDomainError, type ApiDomainErrorIssue } from '@/shared/api';

export type OnboardDeviceErrorCode =
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'VALIDATION_ERROR'
  | 'BAD_REQUEST'
  | 'NETWORK'
  | 'UNKNOWN';

export type OnboardDeviceErrorIssue = ApiDomainErrorIssue;

export type OnboardDeviceError = ApiDomainError<OnboardDeviceErrorCode>;

const onboardDeviceKnownCodes = [
  'UNAUTHORIZED',
  'FORBIDDEN',
  'NOT_FOUND',
  'CONFLICT',
  'VALIDATION_ERROR',
  'BAD_REQUEST',
  'NETWORK',
  'UNKNOWN',
] as const satisfies readonly OnboardDeviceErrorCode[];

export const mapToOnboardDeviceError = createApiErrorMapper<OnboardDeviceErrorCode>({
  knownCodes: onboardDeviceKnownCodes,
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
