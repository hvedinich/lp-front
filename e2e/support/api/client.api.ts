import type { APIRequestContext, APIResponse } from '@playwright/test';
import type { ApiErrorPayload, BrowserResponse } from '../contracts/backend.types';
import { buildApiRequestPath } from '../helpers/routes';

export interface ApiRequestOptions {
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  path: string;
  body?: unknown;
}

export const toApiError = (response: BrowserResponse): string => {
  const payload = response.payload as ApiErrorPayload | null;
  const code = payload?.error?.code ?? 'UNKNOWN';
  const message = payload?.error?.message ?? `HTTP ${response.status}`;
  return `${code}: ${message}`;
};

export const ensureOk = (response: BrowserResponse, message: string): void => {
  if (!response.ok) {
    throw new Error(`${message}. ${toApiError(response)}`);
  }
};

export const sleep = async (ms: number): Promise<void> => {
  await new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};

export const fromApiResponse = async (response: APIResponse): Promise<BrowserResponse> => {
  return {
    headers: response.headers(),
    ok: response.ok(),
    status: response.status(),
    payload: (await response.json().catch(() => null)) as unknown,
  };
};

export const apiRequest = async <TResponse>(
  request: APIRequestContext,
  options: ApiRequestOptions,
): Promise<BrowserResponse<TResponse>> => {
  const requestPath = buildApiRequestPath(options.path);

  try {
    let response: APIResponse;
    if (options.method === 'GET') {
      response = await request.get(requestPath, {
        failOnStatusCode: false,
      });
    } else if (options.method === 'POST') {
      response = await request.post(requestPath, {
        data: options.body,
        failOnStatusCode: false,
      });
    } else if (options.method === 'PATCH') {
      response = await request.patch(requestPath, {
        data: options.body,
        failOnStatusCode: false,
      });
    } else {
      response = await request.delete(requestPath, {
        failOnStatusCode: false,
      });
    }

    const normalized = await fromApiResponse(response);
    return normalized as BrowserResponse<TResponse>;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`E2E API request failed: ${options.method} ${requestPath}. ${message}`);
  }
};
