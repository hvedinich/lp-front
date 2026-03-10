import type { TFunction } from 'i18next';
import { resolveDeviceToastMessage } from './deviceErrorUi';

const t = ((key: string) => key) as unknown as TFunction<'common'>;

describe('resolveDeviceToastMessage', () => {
  it('returns null when no error is provided', () => {
    expect(
      resolveDeviceToastMessage({
        error: null,
        t,
      }),
    ).toBe(null);
  });

  it('maps known codes to explicit user-facing keys', () => {
    expect(
      resolveDeviceToastMessage({
        error: { code: 'BAD_REQUEST', message: 'Invalid UUID' },
        t,
      }),
    ).toBe('workspace.devicesPage.errors.invalidDeviceId');

    expect(
      resolveDeviceToastMessage({
        error: { code: 'NOT_FOUND', message: 'Missing' },
        t,
      }),
    ).toBe('workspace.devicesPage.errors.notFound');

    expect(
      resolveDeviceToastMessage({
        error: { code: 'NETWORK', message: 'Network error' },
        t,
      }),
    ).toBe('workspace.devicesPage.errors.network');
  });

  it('maps unknown codes to generic fallback', () => {
    expect(
      resolveDeviceToastMessage({
        error: { code: 'UNKNOWN', message: 'Internal' },
        t,
      }),
    ).toBe('workspace.devicesPage.errors.generic');
  });
});
