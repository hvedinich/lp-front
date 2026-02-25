import { apiUrl, authPaths } from './constants';

export const hasActiveSession = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${apiUrl}${authPaths.session}`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        Accept: 'application/json',
      },
      cache: 'no-store',
    });

    return response.ok;
  } catch {
    return false;
  }
};
