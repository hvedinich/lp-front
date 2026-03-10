import { createErrorKeyResolver } from './errorKey';

describe('createErrorKeyResolver', () => {
  const resolveErrorKey = createErrorKeyResolver<
    'CONFLICT' | 'FORBIDDEN' | 'NETWORK' | 'VALIDATION_ERROR',
    string
  >({
    fallbackKey: 'errors.generic',
    keyMap: {
      CONFLICT: 'errors.conflict',
      FORBIDDEN: 'errors.forbidden',
      NETWORK: 'errors.network',
      VALIDATION_ERROR: 'errors.validation',
    },
  });

  it('returns null when error is absent', () => {
    expect(resolveErrorKey(null)).toBe(null);
    expect(resolveErrorKey(undefined)).toBe(null);
  });

  it('returns mapped key for known codes', () => {
    expect(resolveErrorKey({ code: 'FORBIDDEN' })).toBe('errors.forbidden');
    expect(resolveErrorKey({ code: 'NETWORK' })).toBe('errors.network');
  });

  it('falls back to generic key for unmapped codes', () => {
    expect(resolveErrorKey({ code: 'CONFLICT' })).toBe('errors.conflict');
    expect(
      createErrorKeyResolver<'FORBIDDEN' | 'UNKNOWN', string>({
        fallbackKey: 'errors.generic',
        keyMap: {
          FORBIDDEN: 'errors.forbidden',
        },
      })({ code: 'UNKNOWN' }),
    ).toBe('errors.generic');
  });
});
