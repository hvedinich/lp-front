import type { ApiRequestContext } from './types';

interface ApiErrorOptions {
  code?: string | null;
  context: ApiRequestContext;
  durationMs: number;
  message: string;
  payload?: unknown;
  requestId?: string | null;
  serverTiming?: string | null;
  status: number;
}

export class ApiError extends Error {
  readonly code: string | null;
  readonly context: ApiRequestContext;
  readonly durationMs: number;
  readonly payload: unknown;
  readonly requestId: string | null;
  readonly serverTiming: string | null;
  readonly status: number;

  constructor(options: ApiErrorOptions) {
    super(options.message);
    this.name = 'ApiError';
    this.code = options.code ?? null;
    this.context = options.context;
    this.durationMs = options.durationMs;
    this.payload = options.payload;
    this.requestId = options.requestId ?? null;
    this.serverTiming = options.serverTiming ?? null;
    this.status = options.status;
  }
}

export const isApiError = (value: unknown): value is ApiError => {
  return value instanceof ApiError;
};
