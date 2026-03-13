import { afterEach, describe, expect, it, vi } from 'vitest';

const captureRequestErrorMock = vi.fn();
const serverConfigLoadMock = vi.fn();
const edgeConfigLoadMock = vi.fn();

vi.mock('@sentry/nextjs', () => ({
  captureRequestError: captureRequestErrorMock,
}));

vi.mock('../../../sentry.server.config', () => {
  serverConfigLoadMock();

  return {};
});

vi.mock('../../../sentry.edge.config', () => {
  edgeConfigLoadMock();

  return {};
});

describe('instrumentation', () => {
  afterEach(() => {
    delete process.env.NEXT_RUNTIME;
    serverConfigLoadMock.mockReset();
    edgeConfigLoadMock.mockReset();
    vi.resetModules();
  });

  it('re-exports Sentry request error capture handler', async () => {
    const instrumentationModule = await import('../../../instrumentation');

    expect(instrumentationModule.onRequestError).toBe(captureRequestErrorMock);
  });

  it('loads node runtime config when NEXT_RUNTIME is nodejs', async () => {
    process.env.NEXT_RUNTIME = 'nodejs';

    const instrumentationModule = await import('../../../instrumentation');
    await instrumentationModule.register();

    expect(serverConfigLoadMock.mock.calls.length).toBe(1);
    expect(edgeConfigLoadMock.mock.calls.length).toBe(0);
  });

  it('loads edge runtime config when NEXT_RUNTIME is edge', async () => {
    process.env.NEXT_RUNTIME = 'edge';

    const instrumentationModule = await import('../../../instrumentation');
    await instrumentationModule.register();

    expect(serverConfigLoadMock.mock.calls.length).toBe(0);
    expect(edgeConfigLoadMock.mock.calls.length).toBe(1);
  });

  it('does not load runtime configs for unsupported runtimes', async () => {
    process.env.NEXT_RUNTIME = 'client';

    const instrumentationModule = await import('../../../instrumentation');
    await instrumentationModule.register();

    expect(serverConfigLoadMock.mock.calls.length).toBe(0);
    expect(edgeConfigLoadMock.mock.calls.length).toBe(0);
  });
});
