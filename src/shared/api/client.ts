import { buildLoginRedirect, envApp } from '@/shared/config';
import { getClientSessionId } from '@/shared/lib';
import { isApiError } from './ApiError';
import { createApiClient } from './createApiClient';
import type { ApiRequestOptions } from './types';

const nonRefreshablePaths = new Set<string>([
  '/auth/login',
  '/auth/logout',
  '/auth/register',
  '/auth/refresh',
]);

const client = createApiClient({
  baseUrl: envApp.app.apiUrl,
  defaultCredentials: 'include',
  defaultTimeoutMs: 15_000,
  resolveDefaultHeaders: () => {
    const clientSessionId = getClientSessionId();

    if (!clientSessionId) {
      return undefined;
    }

    return {
      'X-Client-Session-Id': clientSessionId,
    };
  },
  shouldAttemptRefresh: (error, context) => {
    if (context.skipAuthRefresh) {
      return false;
    }

    const normalizedCode = error.code?.trim().toLowerCase() ?? null;
    return error.status === 401 && normalizedCode === 'token_expired';
  },
});

client.setRefreshHandler(async () => {
  await client.request<void>({
    method: 'POST',
    parseAs: 'void',
    path: '/auth/refresh',
    skipAuthRefresh: true,
  });
});

export const apiRequest = async <TResponse, TBody = unknown>(
  options: ApiRequestOptions<TBody>,
): Promise<TResponse> => {
  try {
    return await client.request<TResponse, TBody>({
      ...options,
      skipAuthRefresh: options.skipAuthRefresh ?? nonRefreshablePaths.has(options.path),
    });
  } catch (error) {
    if (shouldRedirectToLoginOnAuthError(error)) {
      redirectToLogin();
    }

    throw error;
  }
};

export const shouldRedirectToLoginOnAuthError = (error: unknown): boolean => {
  if (!isApiError(error)) {
    return false;
  }

  return error.status === 401 && error.context.path === '/auth/refresh';
};

const redirectToLogin = () => {
  if (typeof window === 'undefined') {
    return;
  }

  const currentPath = `${window.location.pathname}${window.location.search}${window.location.hash}`;
  const target = buildLoginRedirect(currentPath);

  if (!target) {
    return;
  }

  window.location.replace(target);
};
