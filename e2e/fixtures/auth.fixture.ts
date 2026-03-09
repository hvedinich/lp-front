import type { APIRequestContext, Page } from '@playwright/test';
import {
  cleanupE2EUser,
  clearAuthState,
  ensureAuthenticatedSession,
  ensureE2EUser,
  getWorkerCredentials,
  loginViaUi,
} from '../support/api/auth.api';
import type { AuthCredentials } from '../support/contracts/backend.types';

export interface AuthFixture {
  clearState: () => Promise<void>;
  cleanupUser: (credentials: AuthCredentials) => Promise<void>;
  ensureSession: (workerIndex: number) => Promise<void>;
  ensureUser: (workerIndex: number, scope?: string) => Promise<AuthCredentials>;
  loginViaUi: (credentials: AuthCredentials) => Promise<boolean>;
  workerCredentials: (workerIndex: number, scope?: string) => AuthCredentials;
}

export const createAuthFixture = (page: Page, request: APIRequestContext): AuthFixture => {
  return {
    clearState: () => clearAuthState(page),
    cleanupUser: (credentials: AuthCredentials) => cleanupE2EUser(request, credentials),
    ensureSession: (workerIndex: number) => ensureAuthenticatedSession(page, workerIndex),
    ensureUser: (workerIndex: number, scope = '') => ensureE2EUser(request, workerIndex, scope),
    loginViaUi: (credentials: AuthCredentials) => loginViaUi(page, credentials),
    workerCredentials: (workerIndex: number, scope = '') =>
      getWorkerCredentials(workerIndex, scope),
  };
};
