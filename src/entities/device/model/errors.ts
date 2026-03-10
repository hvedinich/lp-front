import { createApiErrorMapper, type ApiDomainError, type ApiDomainErrorIssue } from '@/shared/api';

export type DeviceErrorCode =
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'VALIDATION_ERROR'
  | 'CONFLICT'
  | 'BAD_REQUEST'
  | 'NETWORK'
  | 'UNKNOWN';

export type DeviceErrorIssue = ApiDomainErrorIssue;

export type DeviceError = ApiDomainError<DeviceErrorCode>;

const deviceKnownCodes = [
  'UNAUTHORIZED',
  'FORBIDDEN',
  'NOT_FOUND',
  'VALIDATION_ERROR',
  'CONFLICT',
  'BAD_REQUEST',
  'NETWORK',
  'UNKNOWN',
] as const satisfies readonly DeviceErrorCode[];

export const mapToDeviceError = createApiErrorMapper<DeviceErrorCode>({
  knownCodes: deviceKnownCodes,
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
