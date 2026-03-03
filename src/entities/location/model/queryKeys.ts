import type { GetLocationsParams } from '../api/location.dto';

const normalizeParams = (params: GetLocationsParams = {}) => ({
  limit: params.limit,
  name: params.name,
  offset: params.offset,
  sort: params.sort,
});

export const locationQueryKeys = {
  all: () => ['locations'] as const,
  account: (accountId: string) => ['locations', 'account', accountId] as const,
  lists: (accountId: string) => ['locations', 'account', accountId, 'list'] as const,
  list: (accountId: string, params: GetLocationsParams = {}) =>
    ['locations', 'account', accountId, 'list', normalizeParams(params)] as const,
} as const;
