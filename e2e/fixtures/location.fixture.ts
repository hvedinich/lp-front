import type { APIRequestContext, TestInfo } from '@playwright/test';
import {
  cleanupLocationsByPrefix,
  createLocationSeed,
  getLocations,
} from '../support/api/locations.api';
import type { ApiLocation, LocationSeed } from '../support/contracts/backend.types';
import { toTestPrefix } from '../support/helpers/routes';

export interface LocationFixture {
  testPrefix: (testId: string) => string;
  cleanup: (prefix: string) => Promise<void>;
  cleanupForTest: (testId: string) => Promise<string>;
  cleanupAfterTest: (testInfo: TestInfo, prefix: string | undefined) => Promise<void>;
  createSeed: (prefix: string) => Promise<LocationSeed>;
  getAll: () => Promise<ApiLocation[]>;
}

export const createLocationFixture = (request: APIRequestContext): LocationFixture => {
  return {
    testPrefix: (testId: string) => toTestPrefix(testId),
    cleanup: (prefix: string) => cleanupLocationsByPrefix(request, `PW-E2E-${prefix}`),
    cleanupForTest: async (testId: string) => {
      const prefix = toTestPrefix(testId);
      await cleanupLocationsByPrefix(request, `PW-E2E-${prefix}`);
      return prefix;
    },
    cleanupAfterTest: async (testInfo: TestInfo, prefix: string | undefined) => {
      if (prefix && testInfo.status !== 'timedOut') {
        await cleanupLocationsByPrefix(request, `PW-E2E-${prefix}`);
      }
    },
    createSeed: (prefix: string) => createLocationSeed(request, prefix),
    getAll: () => getLocations(request),
  };
};
