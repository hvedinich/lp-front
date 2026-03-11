import { z } from 'zod';

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

export const parseOrThrow = <T>(schema: z.ZodType<T>, label: string, data: unknown): T => {
  const result = schema.safeParse(data);
  if (result.success) {
    return result.data;
  }

  const issues = result.error.issues
    .map((issue) => `  • ${issue.path.join('.')}: ${issue.message}`)
    .join('\n');

  throw new Error(`[config] ${label}\n${issues}`);
};
