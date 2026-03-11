import * as Sentry from '@sentry/nextjs';
import type { NextApiRequest, NextApiResponse } from 'next';

const getMode = (value: string | string[] | undefined): 'capture' | 'throw' => {
  return value === 'capture' ? 'capture' : 'throw';
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const mode = getMode(req.query.mode);
  const error = new Error(`Sentry manual node API ${mode} test error`);

  if (mode === 'capture') {
    Sentry.captureException(error);
    await Sentry.flush(2000);

    res.status(500).json({
      mode,
      ok: false,
      runtime: 'node',
    });
    return;
  }

  throw error;
}
