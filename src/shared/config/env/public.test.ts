import { afterEach, describe, expect, it, vi } from 'vitest';

describe('public env', () => {
  afterEach(() => {
    delete process.env.NEXT_PUBLIC_API_URL;
    delete process.env.NEXT_PUBLIC_DEFAULT_LOCALE;
    delete process.env.NEXT_PUBLIC_LOCALES;
    delete process.env.NEXT_PUBLIC_SITE_URL;
    delete process.env.NEXT_PUBLIC_VERCEL_URL;
    vi.resetModules();
  });

  it('can be imported without private server variables', async () => {
    process.env.NEXT_PUBLIC_API_URL = 'https://api.example.com';

    const { envApp, envPublic } = await import('./public');

    expect(envPublic).toEqual(
      expect.objectContaining({
        NEXT_PUBLIC_API_URL: 'https://api.example.com',
      }),
    );
    expect(envApp.app.apiUrl).toBe('https://api.example.com');
  });

  it('uses defaults for optional public variables', async () => {
    delete process.env.NEXT_PUBLIC_API_URL;

    const { envApp } = await import('./public');

    expect(envApp.app.apiUrl).toBe('http://localhost:3000');
    expect(envApp.app.defaultLocale).toBe('en');
    expect(envApp.app.locales).toBe('en,pl,ru');
  });
});
