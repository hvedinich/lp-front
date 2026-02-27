import { ApiError, isApiError } from './ApiError';
import type { ApiRequestContext, ApiRequestOptions, ApiResponseParser } from './types';

interface ApiClientConfig {
  baseUrl: string;
  defaultCredentials?: RequestCredentials;
  defaultHeaders?: HeadersInit;
  defaultTimeoutMs?: number;
  fetchFn?: typeof fetch;
  shouldAttemptRefresh?: (error: ApiError, context: ApiRequestContext) => boolean;
}

export interface ApiClient {
  request: <TResponse, TBody = unknown>(options: ApiRequestOptions<TBody>) => Promise<TResponse>;
  setRefreshHandler: (handler: (() => Promise<void>) | null) => void;
}

const DEFAULT_TIMEOUT_MS = 15_000;

const hasContentType = (headers: Headers): boolean => headers.has('Content-Type');

const isJsonContentType = (contentType: string | null): boolean =>
  typeof contentType === 'string' && contentType.toLowerCase().includes('application/json');

const isKnownBodyType = (body: unknown): body is BodyInit => {
  if (typeof body === 'string') {
    return true;
  }

  if (typeof Blob !== 'undefined' && body instanceof Blob) {
    return true;
  }

  if (typeof FormData !== 'undefined' && body instanceof FormData) {
    return true;
  }

  if (typeof URLSearchParams !== 'undefined' && body instanceof URLSearchParams) {
    return true;
  }

  if (typeof ArrayBuffer !== 'undefined' && body instanceof ArrayBuffer) {
    return true;
  }

  if (ArrayBuffer.isView(body)) {
    return true;
  }

  if (typeof ReadableStream !== 'undefined' && body instanceof ReadableStream) {
    return true;
  }

  return false;
};

const joinUrl = (baseUrl: string, path: string): string => {
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  const normalizedBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${normalizedBase}${normalizedPath}`;
};

const extractObjectField = (payload: unknown, field: string): Record<string, unknown> | null => {
  if (!payload || typeof payload !== 'object') {
    return null;
  }

  const value = (payload as Record<string, unknown>)[field];
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : null;
};

const extractStringField = (payload: unknown, field: string): string | null => {
  if (!payload || typeof payload !== 'object') {
    return null;
  }

  const value = (payload as Record<string, unknown>)[field];
  return typeof value === 'string' ? value : null;
};

const extractErrorCode = (payload: unknown): string | null => {
  const rootCode = extractStringField(payload, 'code') ?? extractStringField(payload, 'errorCode');
  if (rootCode) {
    return rootCode;
  }

  const nestedErrorPayload = extractObjectField(payload, 'error');
  return (
    extractStringField(nestedErrorPayload, 'code') ??
    extractStringField(nestedErrorPayload, 'errorCode')
  );
};

const extractErrorMessage = (payload: unknown): string | null => {
  const rootMessage =
    extractStringField(payload, 'message') ?? extractStringField(payload, 'error');
  if (rootMessage) {
    return rootMessage;
  }

  const nestedErrorPayload = extractObjectField(payload, 'error');
  return (
    extractStringField(nestedErrorPayload, 'message') ??
    extractStringField(nestedErrorPayload, 'error')
  );
};

const parsePayload = async (response: Response): Promise<unknown> => {
  if (response.status === 204) {
    return null;
  }

  const contentType = response.headers.get('Content-Type');

  if (isJsonContentType(contentType)) {
    try {
      return await response.json();
    } catch {
      return null;
    }
  }

  try {
    const text = await response.text();
    return text.length > 0 ? text : null;
  } catch {
    return null;
  }
};

const parseSuccess = async <TResponse>(
  response: Response,
  parseAs: ApiResponseParser,
): Promise<TResponse> => {
  if (parseAs === 'raw') {
    return response as TResponse;
  }

  if (parseAs === 'void' || response.status === 204) {
    return undefined as TResponse;
  }

  if (parseAs === 'text') {
    return (await response.text()) as TResponse;
  }

  const contentType = response.headers.get('Content-Type');
  if (isJsonContentType(contentType)) {
    return (await response.json()) as TResponse;
  }

  return (await response.text()) as TResponse;
};

const createHeaders = (defaultHeaders?: HeadersInit, headers?: HeadersInit): Headers => {
  const merged = new Headers(defaultHeaders);
  const incoming = new Headers(headers);

  incoming.forEach((value, key) => {
    merged.set(key, value);
  });

  if (!merged.has('Accept')) {
    merged.set('Accept', 'application/json');
  }

  return merged;
};

const normalizeUnknownError = (
  error: unknown,
  context: ApiRequestContext,
  durationMs: number,
): ApiError => {
  if (isApiError(error)) {
    return error;
  }

  const message = error instanceof Error ? error.message : 'Network request failed';

  return new ApiError({
    code: 'network_error',
    context,
    durationMs,
    message,
    status: 0,
  });
};

const abortError = (
  code: string,
  context: ApiRequestContext,
  durationMs: number,
  message: string,
): ApiError => {
  return new ApiError({
    code,
    context,
    durationMs,
    message,
    status: 0,
  });
};

export const createApiClient = (config: ApiClientConfig): ApiClient => {
  const fetchFn = config.fetchFn ?? fetch;
  const shouldAttemptRefresh =
    config.shouldAttemptRefresh ??
    ((error: ApiError) => {
      const normalizedCode = error.code?.trim().toLowerCase() ?? null;
      return error.status === 401 && normalizedCode === 'token_expired';
    });

  let refreshHandler: (() => Promise<void>) | null = null;
  let refreshInFlight: Promise<void> | null = null;

  const runRefresh = async () => {
    if (!refreshHandler) {
      throw new Error('Refresh handler is not configured');
    }

    if (!refreshInFlight) {
      refreshInFlight = Promise.resolve()
        .then(() => refreshHandler?.())
        .then(() => undefined)
        .finally(() => {
          refreshInFlight = null;
        });
    }

    await refreshInFlight;
  };

  const request = async <TResponse, TBody = unknown>(
    options: ApiRequestOptions<TBody>,
  ): Promise<TResponse> => {
    const execute = async (attempt: number): Promise<TResponse> => {
      const {
        body: rawBody,
        headers: optionHeaders,
        method: optionMethod,
        parseAs: optionParseAs,
        path,
        skipAuthRefresh: optionSkipAuthRefresh,
        timeoutMs: optionTimeoutMs,
        ...requestInit
      } = options;

      const method = (optionMethod ?? 'GET').toUpperCase();
      const url = joinUrl(config.baseUrl, path);
      const context: ApiRequestContext = {
        attempt,
        method,
        path,
        skipAuthRefresh: optionSkipAuthRefresh ?? false,
        url,
      };

      const parseAs = optionParseAs ?? 'json';
      const headers = createHeaders(config.defaultHeaders, optionHeaders);

      let body: BodyInit | undefined;
      if (rawBody !== undefined && rawBody !== null) {
        if (isKnownBodyType(rawBody)) {
          body = rawBody;
        } else {
          body = JSON.stringify(rawBody);
          if (!hasContentType(headers)) {
            headers.set('Content-Type', 'application/json');
          }
        }
      }

      const timeoutMs = optionTimeoutMs ?? config.defaultTimeoutMs ?? DEFAULT_TIMEOUT_MS;
      const timeoutController = new AbortController();
      let timedOut = false;
      let timeoutId: ReturnType<typeof setTimeout> | null = null;

      if (timeoutMs > 0) {
        timeoutId = setTimeout(() => {
          timedOut = true;
          timeoutController.abort();
        }, timeoutMs);
      }

      const externalSignal = requestInit.signal;
      const externalAbortListener = () => {
        timeoutController.abort();
      };

      if (externalSignal) {
        if (externalSignal.aborted) {
          timeoutController.abort();
        } else {
          externalSignal.addEventListener('abort', externalAbortListener, { once: true });
        }
      }

      const startedAt = Date.now();

      try {
        const response = await fetchFn(url, {
          ...requestInit,
          body,
          credentials: requestInit.credentials ?? config.defaultCredentials,
          headers,
          method,
          signal: timeoutController.signal,
        });
        const durationMs = Date.now() - startedAt;
        const requestId = response.headers.get('x-request-id');
        const serverTiming = response.headers.get('server-timing');

        if (!response.ok) {
          const payload = await parsePayload(response);
          const apiError = new ApiError({
            code: extractErrorCode(payload),
            context,
            durationMs,
            message: extractErrorMessage(payload) ?? (response.statusText || 'Request failed'),
            payload,
            requestId,
            serverTiming,
            status: response.status,
          });

          const canRetry =
            attempt === 0 &&
            !context.skipAuthRefresh &&
            refreshHandler !== null &&
            shouldAttemptRefresh(apiError, context);

          if (!canRetry) {
            throw apiError;
          }

          try {
            await runRefresh();
          } catch (refreshError) {
            const refreshDurationMs = Date.now() - startedAt;
            throw normalizeUnknownError(refreshError, context, refreshDurationMs);
          }

          return execute(attempt + 1);
        }

        const parsed = await parseSuccess<TResponse>(response, parseAs);
        return parsed;
      } catch (error) {
        const durationMs = Date.now() - startedAt;
        const resolvedError = timedOut
          ? abortError('timeout', context, durationMs, `Request timed out after ${timeoutMs}ms`)
          : normalizeUnknownError(error, context, durationMs);

        throw resolvedError;
      } finally {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }

        if (externalSignal) {
          externalSignal.removeEventListener('abort', externalAbortListener);
        }
      }
    };

    return execute(0);
  };

  return {
    request,
    setRefreshHandler: (handler) => {
      refreshHandler = handler;
    },
  };
};
