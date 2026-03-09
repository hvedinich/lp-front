import { devicesTest as test, expect } from '../../fixtures/test';
import {
  expectDevicesEmptyState,
  expectDevicesRequireLocation,
  openDevicesPage,
  selectDevicesLocation,
} from '../../support/helpers/devices-screen';

const testPrefixes = new Map<string, string>();

test.beforeEach(async ({ locations }, testInfo) => {
  const prefix = await locations.cleanupForTest(testInfo.testId);
  testPrefixes.set(testInfo.testId, prefix);
});

test('shows prompt state when no location is available', async ({ page }) => {
  await openDevicesPage(page);
  await expectDevicesRequireLocation(page);
});

test('shows empty state for selected location without devices', async ({
  locations,
  page,
}, testInfo) => {
  const seed = await locations.createSeed(testPrefixes.get(testInfo.testId)!);

  await openDevicesPage(page);
  await expect(page.getByTestId('location-selector-input')).toHaveValue(seed.defaultLocation.name);
  await expectDevicesEmptyState(page);

  await selectDevicesLocation(page, seed.secondaryLocation);
  await expectDevicesEmptyState(page);
  await expect(page.getByTestId('devices-list')).toHaveCount(0);
});

test.afterEach(async ({ locations }, testInfo) => {
  const prefix = testPrefixes.get(testInfo.testId);
  await locations.cleanupAfterTest(testInfo, prefix);
  testPrefixes.delete(testInfo.testId);
});
