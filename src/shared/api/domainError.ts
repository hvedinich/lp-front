import { isApiError } from './ApiError';

export interface ApiDomainErrorIssue {
  path: string;
  message: string;
}

export interface ApiDomainError<TCode extends string> {
  code: TCode;
  message: string;
  issues?: ApiDomainErrorIssue[];
}

interface ApiErrorEnvelope {
  error?: {
    code?: string;
    issues?: ApiDomainErrorIssue[];
    message?: string;
  };
}

interface CreateApiErrorMapperOptions<TCode extends string> {
  knownCodes: readonly TCode[];
  networkCode: TCode;
  statusMap?: Partial<Record<number, TCode>>;
  unknownCode: TCode;
  valueAliases?: Partial<Record<string, TCode>>;
}

const readEnvelope = (payload: unknown): ApiErrorEnvelope => {
  if (payload && typeof payload === 'object') {
    return payload as ApiErrorEnvelope;
  }

  return {};
};

const normalizeCode = (value: string | null): string | null => {
  if (!value) {
    return null;
  }

  const normalized = value.trim().toUpperCase();
  return normalized.length > 0 ? normalized : null;
};

export const createApiErrorMapper =
  <TCode extends string>({
    knownCodes,
    networkCode,
    statusMap,
    unknownCode,
    valueAliases,
  }: CreateApiErrorMapperOptions<TCode>) =>
  (error: unknown): ApiDomainError<TCode> => {
    if (!isApiError(error)) {
      return {
        code: unknownCode,
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }

    if (error.status === 0) {
      return {
        code: networkCode,
        message: error.message,
      };
    }

    const envelope = readEnvelope(error.payload);
    const allowedCodes = new Set<string>(knownCodes);
    const aliases = new Map<string, TCode>(
      Object.entries(valueAliases ?? {}).flatMap(([key, value]) =>
        value ? [[key.toUpperCase(), value] as const] : [],
      ),
    );

    const resolveCode = (value: string | null): TCode | null => {
      const normalized = normalizeCode(value);
      if (!normalized) {
        return null;
      }

      const alias = aliases.get(normalized);
      if (alias) {
        return alias;
      }

      return allowedCodes.has(normalized) ? (normalized as TCode) : null;
    };

    const mappedCode =
      resolveCode(error.code) ??
      resolveCode(envelope.error?.code ?? null) ??
      statusMap?.[error.status] ??
      unknownCode;

    return {
      code: mappedCode,
      issues: envelope.error?.issues,
      message: envelope.error?.message ?? error.message,
    };
  };
