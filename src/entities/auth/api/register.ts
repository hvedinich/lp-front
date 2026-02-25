import type { RegisterPayload, RegisterResponse } from '../model/types';
import { apiUrl, authPaths, parseErrorMessage } from './constants';
import { tokenStorage } from '../lib/tokenStorage';

export const registerUser = async (payload: RegisterPayload): Promise<RegisterResponse> => {
  const response = await fetch(`${apiUrl}${authPaths.register}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    let errorMessage: string | null = null;

    try {
      const errorPayload = await response.json();
      errorMessage = parseErrorMessage(errorPayload);
    } catch {
      errorMessage = null;
    }

    throw new Error(errorMessage ?? 'Request failed');
  }

  const data = (await response.json()) as RegisterResponse;

  // Save access token to localStorage
  if (data.accessToken) {
    tokenStorage.setToken(data.accessToken);
  }

  return data;
};
