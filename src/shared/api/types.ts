export type ApiResponseParser = 'json' | 'text' | 'void' | 'raw';

export interface ApiRequestOptions<TBody = unknown>
  extends Omit<RequestInit, 'body' | 'headers' | 'method'> {
  path: string;
  method?: string;
  headers?: HeadersInit;
  body?: TBody;
  parseAs?: ApiResponseParser;
  timeoutMs?: number;
  skipAuthRefresh?: boolean;
}

export interface ApiRequestContext {
  attempt: number;
  method: string;
  path: string;
  skipAuthRefresh: boolean;
  url: string;
}
