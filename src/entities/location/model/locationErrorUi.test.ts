import type { TFunction } from 'i18next';
import { resolveLocationToastMessage } from './locationErrorUi';

const t = ((key: string) => key) as unknown as TFunction<'common'>;

describe('resolveLocationToastMessage', () => {
  it('returns null when no error is provided', () => {
    expect(
      resolveLocationToastMessage({
        error: null,
        t,
      }),
    ).toBe(null);
  });

  it('maps known codes to explicit user-facing keys', () => {
    expect(
      resolveLocationToastMessage({
        error: { code: 'FORBIDDEN', message: 'Forbidden' },
        t,
      }),
    ).toBe('workspace.locationsPage.errors.forbidden');

    expect(
      resolveLocationToastMessage({
        error: { code: 'NETWORK', message: 'Network error' },
        t,
      }),
    ).toBe('workspace.locationsPage.errors.network');

    expect(
      resolveLocationToastMessage({
        error: { code: 'VALIDATION_ERROR', message: 'Validation error' },
        t,
      }),
    ).toBe('workspace.locationsPage.errors.validation');

    expect(
      resolveLocationToastMessage({
        error: { code: 'CONFLICT', message: 'Conflict' },
        t,
      }),
    ).toBe('workspace.locationsPage.errors.conflict');
  });

  it('maps unknown codes to generic fallback', () => {
    expect(
      resolveLocationToastMessage({
        error: { code: 'UNKNOWN', message: 'Internal' },
        t,
      }),
    ).toBe('workspace.locationsPage.errors.generic');
  });
});
