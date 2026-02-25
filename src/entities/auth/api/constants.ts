export const defaultApiUrl = 'http://localhost:3000';
export const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? defaultApiUrl;

export const authPaths = {
  login: process.env.NEXT_PUBLIC_AUTH_LOGIN_PATH ?? '/auth/login',
  register: process.env.NEXT_PUBLIC_AUTH_REGISTER_PATH ?? '/auth/register',
  session: process.env.NEXT_PUBLIC_AUTH_SESSION_PATH ?? '/auth/me',
} as const;

export const parseErrorMessage = (payload: unknown): string | null => {
  if (!payload || typeof payload !== 'object') {
    return null;
  }

  const normalizedPayload = payload as {
    message?: unknown;
    error?: unknown;
  };

  if (typeof normalizedPayload.message === 'string') {
    return normalizedPayload.message;
  }

  if (typeof normalizedPayload.error === 'string') {
    return normalizedPayload.error;
  }

  return null;
};
