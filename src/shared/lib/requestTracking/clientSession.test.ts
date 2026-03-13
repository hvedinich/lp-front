import { getClientSessionId, resetClientSessionIdForTests } from './clientSession';

const createSessionStorageMock = () => {
  const storage = new Map<string, string>();
  const getItemCalls: string[][] = [];
  const setItemCalls: string[][] = [];

  const getItem = (key: string) => {
    getItemCalls.push([key]);
    return storage.get(key) ?? null;
  };
  const setItem = (key: string, value: string) => {
    setItemCalls.push([key, value]);
    storage.set(key, value);
  };

  return {
    getItem,
    getItemCalls,
    setItem,
    setItemCalls,
  };
};

const createThrowingSessionStorageMock = () => {
  const getItemCalls: string[][] = [];

  return {
    getItem: (key: string) => {
      getItemCalls.push([key]);
      throw new Error('Storage access denied');
    },
    getItemCalls,
    setItem: () => {
      throw new Error('Storage access denied');
    },
  };
};

describe('getClientSessionId', () => {
  afterEach(() => {
    resetClientSessionIdForTests();
    vi.unstubAllGlobals();
  });

  it('returns null on the server', () => {
    expect(getClientSessionId()).toBe(null);
  });

  it('creates and reuses a browser session id from sessionStorage', () => {
    const sessionStorage = createSessionStorageMock();

    vi.stubGlobal('crypto', {
      randomUUID: vi.fn(() => 'session-uuid-1'),
    });
    vi.stubGlobal('window', {
      sessionStorage,
    });

    expect(getClientSessionId()).toBe('session-uuid-1');
    expect(getClientSessionId()).toBe('session-uuid-1');

    expect(sessionStorage.getItemCalls).toEqual([['lp.client-session-id']]);
    expect(sessionStorage.setItemCalls).toEqual([['lp.client-session-id', 'session-uuid-1']]);
  });

  it('reuses an existing browser session id from sessionStorage', () => {
    const sessionStorage = createSessionStorageMock();
    sessionStorage.setItem('lp.client-session-id', 'persisted-session-id');

    vi.stubGlobal('crypto', {
      randomUUID: vi.fn(() => 'session-uuid-2'),
    });
    vi.stubGlobal('window', {
      sessionStorage,
    });

    expect(getClientSessionId()).toBe('persisted-session-id');
    expect(getClientSessionId()).toBe('persisted-session-id');

    expect(sessionStorage.getItemCalls).toEqual([['lp.client-session-id']]);
    expect(sessionStorage.setItemCalls).toEqual([['lp.client-session-id', 'persisted-session-id']]);
  });

  it('falls back to an in-memory id when sessionStorage access throws', () => {
    const sessionStorage = createThrowingSessionStorageMock();

    vi.stubGlobal('crypto', {
      randomUUID: vi.fn(() => 'fallback-session-id'),
    });
    vi.stubGlobal('window', {
      sessionStorage,
    });

    expect(getClientSessionId()).toBe('fallback-session-id');
    expect(getClientSessionId()).toBe('fallback-session-id');

    expect(sessionStorage.getItemCalls).toEqual([['lp.client-session-id']]);
  });
});
