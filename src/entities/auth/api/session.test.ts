const jsonResponse = (status: number, payload: unknown): Response => {
  return new Response(JSON.stringify(payload), {
    headers: {
      'Content-Type': 'application/json',
    },
    status,
  });
};

const loadSessionApi = async () => {
  vi.resetModules();
  return import('./session');
};

const authSessionPayload = {
  account: {
    contentLanguage: 'en',
    id: 'acc-1',
    name: 'Acme',
    region: 'us',
    role: 'owner',
  },
  user: {
    email: 'test@example.com',
    id: 'user-1',
    isSystemUser: false,
    language: 'en',
    name: 'Test User',
  },
} as const;

describe('getAuthSessionState', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('returns authenticated when /auth/me succeeds', async () => {
    const fetchSpy = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);

      if (url.endsWith('/auth/me')) {
        return jsonResponse(200, authSessionPayload);
      }

      return new Response(null, { status: 404 });
    });

    vi.stubGlobal('fetch', fetchSpy);

    const { getAuthSessionState } = await loadSessionApi();
    await expect(getAuthSessionState()).resolves.toEqual({
      payload: authSessionPayload,
      state: 'authenticated',
    });
  });

  it('refreshes and retries when /auth/me returns nested TOKEN_EXPIRED', async () => {
    let sessionCalls = 0;
    let refreshCalls = 0;

    const fetchSpy = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);

      if (url.endsWith('/auth/refresh')) {
        refreshCalls += 1;
        return jsonResponse(200, {
          accessToken: 'next-access-token',
          refreshToken: 'next-refresh-token',
        });
      }

      if (url.endsWith('/auth/me')) {
        sessionCalls += 1;

        if (sessionCalls === 1) {
          return jsonResponse(401, {
            error: {
              code: 'TOKEN_EXPIRED',
              message: 'Access token expired',
            },
          });
        }

        return jsonResponse(200, authSessionPayload);
      }

      return new Response(null, { status: 404 });
    });

    vi.stubGlobal('fetch', fetchSpy);

    const { getAuthSessionState } = await loadSessionApi();
    await expect(getAuthSessionState()).resolves.toEqual({
      payload: authSessionPayload,
      state: 'authenticated',
    });
    expect(sessionCalls).toBe(2);
    expect(refreshCalls).toBe(1);
  });

  it('returns unauthenticated when refresh fails', async () => {
    let refreshCalls = 0;

    const fetchSpy = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);

      if (url.endsWith('/auth/refresh')) {
        refreshCalls += 1;
        return jsonResponse(401, {
          code: 'refresh_expired',
          message: 'Refresh expired',
        });
      }

      if (url.endsWith('/auth/me')) {
        return jsonResponse(401, {
          code: 'token_expired',
          message: 'Token expired',
        });
      }

      return new Response(null, { status: 404 });
    });

    vi.stubGlobal('fetch', fetchSpy);

    const { getAuthSessionState } = await loadSessionApi();
    await expect(getAuthSessionState()).resolves.toEqual({
      payload: null,
      state: 'unauthenticated',
    });
    expect(refreshCalls).toBe(1);
  });

  it('returns unknown on transport failures', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new TypeError('Network down');
      }),
    );

    const { getAuthSessionState } = await loadSessionApi();
    await expect(getAuthSessionState()).resolves.toEqual({
      payload: null,
      state: 'unknown',
    });
  });
});
