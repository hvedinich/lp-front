import { z } from 'zod';

type ParseEnvInput<T> = {
  label: string;
  schema: z.ZodType<T>;
  source: unknown;
};

export const emptyStringToUndefined = (value: unknown): unknown => {
  if (typeof value !== 'string') {
    return value;
  }

  return value.trim() === '' ? undefined : value;
};

export const normalizeOptionalString = (value: string | undefined): string | undefined => {
  if (!value) {
    return undefined;
  }

  const normalized = value.trim();
  return normalized === '' ? undefined : normalized;
};

export const parseBooleanFlag = (value: string | undefined): boolean => {
  const normalized = normalizeOptionalString(value)?.toLowerCase();

  if (!normalized) {
    return false;
  }

  return normalized === '1' || normalized === 'true' || normalized === 'yes' || normalized === 'on';
};

export const parseEnv = <T>({ schema, label, source }: ParseEnvInput<T>): T => {
  const result = schema.safeParse(source);
  if (result.success) {
    return result.data;
  }

  const issues = result.error.issues
    .map((issue) => `  • ${issue.path.join('.')}: ${issue.message}`)
    .join('\n');

  throw new Error(`[config] ${label}\n${issues}`);
};
