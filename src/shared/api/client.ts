import { isApiError } from './ApiError';
import { createApiClient } from './createApiClient';
import type { ApiRequestOptions } from './types';

export const defaultApiUrl = 'http://localhost:3000';
export const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? defaultApiUrl;

const nonRefreshablePaths = new Set<string>([
  '/auth/login',
  '/auth/logout',
  '/auth/register',
  '/auth/refresh',
]);

const client = createApiClient({
  baseUrl: apiUrl,
  defaultCredentials: 'include',
  defaultTimeoutMs: 15_000,
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

export const getLoginRedirectTarget = (currentPath: string): string | null => {
  const normalizedPath = currentPath.trim().length > 0 ? currentPath : '/';

  let pathname = normalizedPath;
  try {
    pathname = new URL(normalizedPath, 'http://localhost').pathname;
  } catch {
    pathname = normalizedPath.startsWith('/') ? normalizedPath : `/${normalizedPath}`;
  }

  if (pathname === '/login' || pathname === '/signup') {
    return null;
  }

  return `/login?next=${encodeURIComponent(normalizedPath)}`;
};

const redirectToLogin = () => {
  if (typeof window === 'undefined') {
    return;
  }

  const currentPath = `${window.location.pathname}${window.location.search}${window.location.hash}`;
  const target = getLoginRedirectTarget(currentPath);

  if (!target) {
    return;
  }

  window.location.replace(target);
};
