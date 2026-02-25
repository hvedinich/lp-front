import { tokenStorage } from '../lib/tokenStorage';

export const logoutUser = (): void => {
  tokenStorage.removeToken();
};
