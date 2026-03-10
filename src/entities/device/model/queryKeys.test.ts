import { deviceQueryKeys } from './queryKeys';

describe('deviceQueryKeys', () => {
  it('builds item keys', () => {
    expect(deviceQueryKeys.item('acc-1', 'dev-1')).toEqual([
      'devices',
      'account',
      'acc-1',
      'item',
      'dev-1',
    ]);
  });

  it('builds list keys with normalized location filter', () => {
    expect(
      deviceQueryKeys.list('acc-1', {
        filters: {
          locationId: 'loc-1',
        },
      }),
    ).toEqual([
      'devices',
      'account',
      'acc-1',
      'list',
      {
        filters: {
          locationId: 'loc-1',
        },
        limit: undefined,
        offset: undefined,
        sort: undefined,
      },
    ]);
  });

  it('drops nullish filters during normalization', () => {
    expect(
      deviceQueryKeys.list('acc-1', {
        filters: {
          locationId: undefined,
        },
      }),
    ).toEqual([
      'devices',
      'account',
      'acc-1',
      'list',
      {
        filters: undefined,
        limit: undefined,
        offset: undefined,
        sort: undefined,
      },
    ]);
  });
});
