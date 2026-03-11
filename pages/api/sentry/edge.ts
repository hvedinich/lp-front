import * as Sentry from '@sentry/nextjs';

export const config = {
  runtime: 'edge',
};

export default async function handler(request: Request) {
  const mode = new URL(request.url).searchParams.get('mode') === 'capture' ? 'capture' : 'throw';
  const error = new Error(`Sentry manual edge API ${mode} test error`);

  if (mode === 'capture') {
    Sentry.captureException(error);
    await Sentry.flush(2000);

    return Response.json(
      {
        mode,
        ok: false,
        runtime: 'edge',
      },
      {
        status: 500,
      },
    );
  }

  throw error;
}
