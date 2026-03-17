import { z } from 'zod';
import { describe, expect, it } from 'vitest';
import { emptyStringToUndefined, parseBooleanFlag, parseEnv } from './core';

describe('parseEnv', () => {
  it('returns parsed values when the schema matches', () => {
    const schema = z.object({
      PORT: z.preprocess(emptyStringToUndefined, z.coerce.number().int().positive()),
    });

    expect(
      parseEnv({
        label: 'Invalid test environment variables',
        schema,
        source: { PORT: '4000' },
      }),
    ).toEqual({ PORT: 4000 });
  });

  it('formats validation errors with the config prefix', () => {
    const schema = z.object({
      API_URL: z.url(),
    });

    expect(() =>
      parseEnv({
        label: 'Invalid public environment variables',
        schema,
        source: { API_URL: 'not-a-url' },
      }),
    ).toThrowError('[config] Invalid public environment variables');
  });
});

describe('parseBooleanFlag', () => {
  it('treats common truthy flags as enabled', () => {
    expect(parseBooleanFlag('1')).toBe(true);
    expect(parseBooleanFlag('true')).toBe(true);
    expect(parseBooleanFlag('yes')).toBe(true);
    expect(parseBooleanFlag('on')).toBe(true);
  });

  it('treats empty and falsey values as disabled', () => {
    expect(parseBooleanFlag(undefined)).toBe(false);
    expect(parseBooleanFlag('')).toBe(false);
    expect(parseBooleanFlag('false')).toBe(false);
    expect(parseBooleanFlag('0')).toBe(false);
  });
});
