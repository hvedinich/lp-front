import type { NextPageContext } from 'next';
import { afterEach, describe, expect, it, vi } from 'vitest';

const captureUnderscoreErrorExceptionMock = vi.fn();
const nextErrorGetInitialPropsMock = vi.fn();

vi.mock('@sentry/nextjs', () => ({
  captureUnderscoreErrorException: captureUnderscoreErrorExceptionMock,
}));

vi.mock('next/error', () => {
  const NextErrorComponent = ({ statusCode }: { statusCode: number }) => statusCode;

  return {
    __esModule: true,
    default: Object.assign(NextErrorComponent, {
      getInitialProps: nextErrorGetInitialPropsMock,
    }),
  };
});

describe('pages/_error', () => {
  afterEach(() => {
    captureUnderscoreErrorExceptionMock.mockReset();
    nextErrorGetInitialPropsMock.mockReset();
  });

  it('forwards getInitialProps to Sentry capture and Next error page', async () => {
    captureUnderscoreErrorExceptionMock.mockResolvedValue('event-id');
    nextErrorGetInitialPropsMock.mockResolvedValue({ statusCode: 500 });

    const pageModule = await import('../../../pages/_error');
    const contextData = { err: new Error('boom') } as NextPageContext;

    await expect(pageModule.default.getInitialProps?.(contextData)).resolves.toEqual({
      statusCode: 500,
    });
    expect(captureUnderscoreErrorExceptionMock.mock.calls).toEqual([[contextData]]);
    expect(nextErrorGetInitialPropsMock.mock.calls).toEqual([[contextData]]);
  });
});
