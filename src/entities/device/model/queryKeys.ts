import type { GetDevicesParams } from '../api/device.dto';
import { normalizeListQueryParams } from '@/shared/lib';

const normalizeParams = (params: GetDevicesParams = {}) => normalizeListQueryParams(params);

export const deviceQueryKeys = {
  all: () => ['devices'] as const,
  account: (accountId: string) => ['devices', 'account', accountId] as const,
  lists: (accountId: string) => ['devices', 'account', accountId, 'list'] as const,
  list: (accountId: string, params: GetDevicesParams = {}) =>
    ['devices', 'account', accountId, 'list', normalizeParams(params)] as const,
  items: (accountId: string) => ['devices', 'account', accountId, 'item'] as const,
  item: (accountId: string, id: string) => ['devices', 'account', accountId, 'item', id] as const,
} as const;
