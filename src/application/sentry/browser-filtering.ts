import type { Breadcrumb, ErrorEvent } from '@sentry/nextjs';

const REDACTED_VALUE = '[REDACTED]';
const MAX_ARRAY_ITEMS = 20;
const MAX_STRING_LENGTH = 512;
const SECRET_KEY_PATTERN =
  /authorization|cookie|password|passwd|token|secret|api[-_]?key|session|credential/i;
const PAYLOAD_KEY_PATTERN = /body|payload|request|response|data|raw/i;

type SerializableRecord = Record<string, unknown>;

const isRecord = (value: unknown): value is SerializableRecord =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const truncateString = (value: string): string => {
  if (value.length <= MAX_STRING_LENGTH) {
    return value;
  }

  const truncatedCharacters = value.length - MAX_STRING_LENGTH;
  return `${value.slice(0, MAX_STRING_LENGTH)}… [truncated ${truncatedCharacters} chars]`;
};

const sanitizeKeyValue = (key: string, value: unknown): unknown => {
  if (SECRET_KEY_PATTERN.test(key)) {
    return REDACTED_VALUE;
  }

  if (typeof value === 'string') {
    if (PAYLOAD_KEY_PATTERN.test(key)) {
      return truncateString(value);
    }

    return value;
  }

  if (Array.isArray(value)) {
    return value.slice(0, MAX_ARRAY_ITEMS).map((entry) => sanitizeUnknown(entry));
  }

  if (isRecord(value)) {
    return sanitizeRecord(value);
  }

  return value;
};

const sanitizeRecord = (value: SerializableRecord): SerializableRecord => {
  return Object.fromEntries(
    Object.entries(value).map(([key, entryValue]) => [key, sanitizeKeyValue(key, entryValue)]),
  );
};

const sanitizeUnknown = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    return value.slice(0, MAX_ARRAY_ITEMS).map((entry) => sanitizeUnknown(entry));
  }

  if (isRecord(value)) {
    return sanitizeRecord(value);
  }

  if (typeof value === 'string') {
    return truncateString(value);
  }

  return value;
};

const sanitizeBreadcrumb = (breadcrumb: Breadcrumb): Breadcrumb => {
  return {
    ...breadcrumb,
    data: breadcrumb.data ? sanitizeRecord(breadcrumb.data) : breadcrumb.data,
    message: breadcrumb.message ? truncateString(breadcrumb.message) : breadcrumb.message,
  };
};

export const sanitizeBrowserSentryEvent = (event: ErrorEvent): ErrorEvent => {
  const nextEvent: ErrorEvent = {
    ...event,
    breadcrumbs: event.breadcrumbs?.map(sanitizeBreadcrumb),
    contexts: event.contexts
      ? (sanitizeRecord(event.contexts as SerializableRecord) as ErrorEvent['contexts'])
      : event.contexts,
    extra: event.extra ? sanitizeRecord(event.extra) : event.extra,
    request: event.request
      ? (sanitizeRecord(event.request as SerializableRecord) as ErrorEvent['request'])
      : event.request,
    tags: event.tags
      ? (sanitizeRecord(event.tags as SerializableRecord) as ErrorEvent['tags'])
      : event.tags,
    user: event.user
      ? (sanitizeRecord(event.user as SerializableRecord) as ErrorEvent['user'])
      : event.user,
  };

  if (event.exception?.values) {
    nextEvent.exception = {
      ...event.exception,
      values: event.exception.values.map((value) => ({
        ...value,
        value: value.value ? truncateString(value.value) : value.value,
      })),
    };
  }

  return nextEvent;
};

export const beforeSendBrowserSentryEvent = (event: ErrorEvent): ErrorEvent => {
  return sanitizeBrowserSentryEvent(event);
};

export const beforeBrowserSentryBreadcrumb = (breadcrumb: Breadcrumb): Breadcrumb => {
  return sanitizeBreadcrumb(breadcrumb);
};
