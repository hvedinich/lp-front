import {
  createQueryEntityModalController,
  resolveQueryEntityModalState,
} from './useQueryEntityModalState';

describe('resolveQueryEntityModalState', () => {
  it('returns closed state when query is absent', () => {
    expect(resolveQueryEntityModalState(null, 'new')).toEqual({
      editId: null,
      isCreate: false,
      isOpen: false,
      rawValue: null,
    });
  });

  it('returns create state when query equals new token', () => {
    expect(resolveQueryEntityModalState('new', 'new')).toEqual({
      editId: null,
      isCreate: true,
      isOpen: true,
      rawValue: 'new',
    });
  });

  it('returns edit state when query contains entity id', () => {
    expect(resolveQueryEntityModalState('abc', 'new')).toEqual({
      editId: 'abc',
      isCreate: false,
      isOpen: true,
      rawValue: 'abc',
    });
  });
});

describe('createQueryEntityModalController', () => {
  it('openCreate updates only target query key via shallow replace', async () => {
    const replaceCalls: unknown[][] = [];
    const replace = (async (...args: unknown[]) => {
      replaceCalls.push(args);
      return true;
    }) as never;

    const controller = createQueryEntityModalController({
      isReady: true,
      newValue: 'new',
      pathname: '/locations',
      query: { section: 'locations' },
      queryKey: 'location',
      replace,
    });

    await controller.openCreate();

    expect(replaceCalls.length).toBe(1);
    expect(replaceCalls[0]).toEqual([
      {
        pathname: '/locations',
        query: {
          section: 'locations',
          location: 'new',
        },
      },
      undefined,
      { shallow: true },
    ]);
  });

  it('openEdit sets location id and keeps other query params', async () => {
    const replaceCalls: unknown[][] = [];
    const replace = (async (...args: unknown[]) => {
      replaceCalls.push(args);
      return true;
    }) as never;

    const controller = createQueryEntityModalController({
      isReady: true,
      newValue: 'new',
      pathname: '/locations',
      query: { foo: 'bar', location: 'new' },
      queryKey: 'location',
      replace,
    });

    await controller.openEdit('loc-1');

    expect(replaceCalls.length).toBe(1);
    expect(replaceCalls[0]).toEqual([
      {
        pathname: '/locations',
        query: {
          foo: 'bar',
          location: 'loc-1',
        },
      },
      undefined,
      { shallow: true },
    ]);
  });

  it('close removes only target key from query', async () => {
    const replaceCalls: unknown[][] = [];
    const replace = (async (...args: unknown[]) => {
      replaceCalls.push(args);
      return true;
    }) as never;

    const controller = createQueryEntityModalController({
      isReady: true,
      newValue: 'new',
      pathname: '/locations',
      query: { foo: 'bar', location: 'loc-1' },
      queryKey: 'location',
      replace,
    });

    await controller.close();

    expect(replaceCalls.length).toBe(1);
    expect(replaceCalls[0]).toEqual([
      {
        pathname: '/locations',
        query: {
          foo: 'bar',
        },
      },
      undefined,
      { shallow: true },
    ]);
  });

  it('skips replace for no-op transitions', async () => {
    const replaceCalls: unknown[][] = [];
    const replace = (async (...args: unknown[]) => {
      replaceCalls.push(args);
      return true;
    }) as never;

    const controller = createQueryEntityModalController({
      isReady: true,
      newValue: 'new',
      pathname: '/locations',
      query: { location: 'new' },
      queryKey: 'location',
      replace,
    });

    await controller.openCreate();

    expect(replaceCalls.length).toBe(0);
  });

  it('skips replace when router is not ready', async () => {
    const replaceCalls: unknown[][] = [];
    const replace = (async (...args: unknown[]) => {
      replaceCalls.push(args);
      return true;
    }) as never;

    const controller = createQueryEntityModalController({
      isReady: false,
      newValue: 'new',
      pathname: '/locations',
      query: { foo: 'bar' },
      queryKey: 'location',
      replace,
    });

    await controller.openEdit('loc-1');

    expect(replaceCalls.length).toBe(0);
  });
});
