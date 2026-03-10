import type { APIRequestContext, TestInfo } from '@playwright/test';
import {
  cleanupLocationsByPrefix,
  createLocationSeed,
  getLocations,
} from '../support/api/locations.api';
import type { ApiLocation, LocationSeed } from '../support/contracts/backend.types';
import { toTestPrefix } from '../support/helpers/routes';

interface FailureMetadata {
  locationSeedIds?: string[];
  testPrefix?: string;
}

export interface LocationFixture {
  testPrefix: (testId: string) => string;
  cleanup: (prefix: string) => Promise<void>;
  cleanupForTest: (testId: string) => Promise<string>;
  cleanupAfterTest: (testInfo: TestInfo, prefix: string | undefined) => Promise<void>;
  createSeed: (prefix: string) => Promise<LocationSeed>;
  getAll: () => Promise<ApiLocation[]>;
}

export const createLocationFixture = (
  request: APIRequestContext,
  failureMetadata: FailureMetadata,
): LocationFixture => {
  return {
    testPrefix: (testId: string) => toTestPrefix(testId),
    cleanup: (prefix: string) => cleanupLocationsByPrefix(request, `PW-E2E-${prefix}`),
    cleanupForTest: async (testId: string) => {
      const prefix = toTestPrefix(testId);
      failureMetadata.testPrefix = prefix;
      await cleanupLocationsByPrefix(request, `PW-E2E-${prefix}`);
      return prefix;
    },
    cleanupAfterTest: async (testInfo: TestInfo, prefix: string | undefined) => {
      if (prefix && testInfo.status !== 'timedOut') {
        await cleanupLocationsByPrefix(request, `PW-E2E-${prefix}`);
      }
    },
    createSeed: async (prefix: string) => {
      const seed = await createLocationSeed(request, prefix);
      failureMetadata.locationSeedIds = [seed.defaultLocation.id, seed.secondaryLocation.id];
      return seed;
    },
    getAll: () => getLocations(request),
  };
};
