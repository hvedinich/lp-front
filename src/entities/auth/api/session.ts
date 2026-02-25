import { apiUrl, authPaths } from './constants';
import { tokenStorage } from '../lib/tokenStorage';

export const hasActiveSession = async (): Promise<boolean> => {
  try {
    const token = tokenStorage.getToken();
    const headers: HeadersInit = {
      Accept: 'application/json',
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${apiUrl}${authPaths.session}`, {
      method: 'GET',
      credentials: 'include',
      headers,
      cache: 'no-store',
    });

    return response.ok;
  } catch {
    return false;
  }
};
