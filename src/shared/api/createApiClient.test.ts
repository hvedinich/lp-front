import { ApiError } from './ApiError';
import { createApiClient } from './createApiClient';

const jsonResponse = (status: number, payload: unknown): Response => {
  return new Response(JSON.stringify(payload), {
    headers: {
      'Content-Type': 'application/json',
    },
    status,
  });
};

const refreshSuccessPayload = {
  accessToken: 'next-access-token',
  refreshToken: 'next-refresh-token',
} as const;

describe('createApiClient', () => {
  it('retries once after nested TOKEN_EXPIRED and returns the retried response', async () => {
    let profileCalls = 0;
    let refreshCalls = 0;

    const fetchFn = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);

      if (url.endsWith('/auth/refresh')) {
        refreshCalls += 1;
        return jsonResponse(200, refreshSuccessPayload);
      }

      if (url.endsWith('/profile')) {
        profileCalls += 1;

        if (profileCalls === 1) {
          return jsonResponse(401, {
            error: {
              code: 'TOKEN_EXPIRED',
              message: 'Access token expired',
            },
          });
        }

        return jsonResponse(200, {
          ok: true,
        });
      }

      return new Response(null, { status: 404 });
    });

    const client = createApiClient({
      baseUrl: 'https://api.test',
      fetchFn,
    });

    client.setRefreshHandler(async () => {
      await client.request<void>({
        method: 'POST',
        parseAs: 'void',
        path: '/auth/refresh',
        skipAuthRefresh: true,
      });
    });

    await expect(
      client.request<{ ok: boolean }>({
        path: '/profile',
      }),
    ).resolves.toEqual({ ok: true });

    expect(profileCalls).toBe(2);
    expect(refreshCalls).toBe(1);
  });

  it('uses a single in-flight refresh for concurrent token_expired failures', async () => {
    const requestAttempts: Record<string, number> = {};
    let refreshCalls = 0;
    let releaseRefreshGate: (() => void) | undefined;

    const refreshGate = new Promise<void>((resolve) => {
      releaseRefreshGate = () => {
        resolve();
      };
    });

    const fetchFn = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);

      if (url.endsWith('/auth/refresh')) {
        refreshCalls += 1;
        await refreshGate;
        return jsonResponse(200, refreshSuccessPayload);
      }

      const resource = url.endsWith('/alpha') ? '/alpha' : '/beta';
      requestAttempts[resource] = (requestAttempts[resource] ?? 0) + 1;

      if (requestAttempts[resource] === 1) {
        return jsonResponse(401, {
          code: 'token_expired',
          message: 'Token expired',
        });
      }

      return jsonResponse(200, {
        path: resource,
      });
    });

    const client = createApiClient({
      baseUrl: 'https://api.test',
      fetchFn,
    });

    client.setRefreshHandler(async () => {
      await client.request<void>({
        method: 'POST',
        parseAs: 'void',
        path: '/auth/refresh',
        skipAuthRefresh: true,
      });
    });

    const alpha = client.request<{ path: string }>({ path: '/alpha' });
    const beta = client.request<{ path: string }>({ path: '/beta' });

    await vi.waitFor(() => {
      expect(refreshCalls).toBe(1);
    });

    if (!releaseRefreshGate) {
      throw new Error('Refresh gate was not initialized');
    }
    releaseRefreshGate();

    await expect(Promise.all([alpha, beta])).resolves.toEqual([
      { path: '/alpha' },
      { path: '/beta' },
    ]);

    expect(refreshCalls).toBe(1);
    expect(requestAttempts['/alpha']).toBe(2);
    expect(requestAttempts['/beta']).toBe(2);
  });

  it('throws timeout errors when fetch exceeds the configured timeout', async () => {
    const fetchFn = vi.fn((_input: RequestInfo | URL, init?: RequestInit) => {
      return new Promise<Response>((_resolve, reject) => {
        init?.signal?.addEventListener(
          'abort',
          () => {
            reject(new DOMException('Aborted', 'AbortError'));
          },
          { once: true },
        );
      });
    });

    const client = createApiClient({
      baseUrl: 'https://api.test',
      fetchFn,
    });

    await expect(
      client.request({
        path: '/slow',
        timeoutMs: 5,
      }),
    ).rejects.toEqual(
      expect.objectContaining({
        code: 'timeout',
        status: 0,
      }),
    );
  });

  it('surfaces refresh errors when refresh fails', async () => {
    let resourceCalls = 0;
    let refreshCalls = 0;

    const fetchFn = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);

      if (url.endsWith('/auth/refresh')) {
        refreshCalls += 1;
        return jsonResponse(401, {
          code: 'refresh_expired',
          message: 'Refresh expired',
        });
      }

      if (url.endsWith('/reports')) {
        resourceCalls += 1;
        return jsonResponse(401, {
          code: 'token_expired',
          message: 'Token expired',
        });
      }

      return new Response(null, { status: 404 });
    });

    const client = createApiClient({
      baseUrl: 'https://api.test',
      fetchFn,
    });

    client.setRefreshHandler(async () => {
      await client.request<void>({
        method: 'POST',
        parseAs: 'void',
        path: '/auth/refresh',
        skipAuthRefresh: true,
      });
    });

    const requestPromise = client.request({ path: '/reports' });

    await expect(requestPromise).rejects.toBeInstanceOf(ApiError);
    await expect(requestPromise).rejects.toEqual(
      expect.objectContaining({
        code: 'refresh_expired',
        status: 401,
      }),
    );

    expect(resourceCalls).toBe(1);
    expect(refreshCalls).toBe(1);
  });
});
