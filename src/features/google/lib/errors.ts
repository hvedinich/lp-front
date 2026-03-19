import { createApiErrorMapper, type ApiDomainError } from '@/shared/api';

export type PlaceErrorCode = 'NOT_FOUND' | 'NETWORK' | 'UNKNOWN';

export type PlaceError = ApiDomainError<PlaceErrorCode>;

const placeKnownCodes = [
  'NOT_FOUND',
  'NETWORK',
  'UNKNOWN',
] as const satisfies readonly PlaceErrorCode[];

export const mapToPlaceError = createApiErrorMapper<PlaceErrorCode>({
  knownCodes: placeKnownCodes,
  networkCode: 'NETWORK',
  statusMap: {
    404: 'NOT_FOUND',
  },
  unknownCode: 'UNKNOWN',
});
