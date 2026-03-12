const CLIENT_SESSION_STORAGE_KEY = 'lp.client-session-id';

let inMemoryClientSessionId: string | null = null;

const canUseBrowserStorage = (): boolean => {
  return typeof window !== 'undefined' && typeof window.sessionStorage !== 'undefined';
};

const generateClientSessionId = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `client-session-${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
};

export const getClientSessionId = (): string | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  if (inMemoryClientSessionId) {
    return inMemoryClientSessionId;
  }

  if (!canUseBrowserStorage()) {
    inMemoryClientSessionId = generateClientSessionId();
    return inMemoryClientSessionId;
  }

  try {
    const storedValue = window.sessionStorage.getItem(CLIENT_SESSION_STORAGE_KEY);
    if (storedValue) {
      inMemoryClientSessionId = storedValue;
      return storedValue;
    }

    const createdValue = generateClientSessionId();
    window.sessionStorage.setItem(CLIENT_SESSION_STORAGE_KEY, createdValue);
    inMemoryClientSessionId = createdValue;
    return createdValue;
  } catch {
    inMemoryClientSessionId = generateClientSessionId();
    return inMemoryClientSessionId;
  }
};

export const resetClientSessionIdForTests = () => {
  inMemoryClientSessionId = null;
};
