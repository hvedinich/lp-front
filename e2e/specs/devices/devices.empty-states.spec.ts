import type { Page } from '@playwright/test';
import { devicesTest as test, expect } from '../../fixtures/test';

const openSelector = async (page: Page) => {
  await expect(page.getByTestId('location-selector-input')).toBeVisible();
  await page.getByTestId('location-selector-trigger').click();
};

const testPrefixes = new Map<string, string>();

test.beforeEach(async ({ locations }, testInfo) => {
  const prefix = await locations.cleanupForTest(testInfo.testId);
  testPrefixes.set(testInfo.testId, prefix);
});

test('shows prompt state when no location is available', async ({ page }) => {
  await page.goto('/devices');

  await expect(page.getByTestId('devices-location-required')).toBeVisible();
  await expect(page.getByTestId('devices-empty-state')).toHaveCount(0);
  await expect(page.getByTestId('devices-list')).toHaveCount(0);
  await expect(page.getByTestId('location-selector-manage-button')).toBeVisible();
});

test('shows empty state for selected location without devices', async ({
  locations,
  page,
}, testInfo) => {
  const seed = await locations.createSeed(testPrefixes.get(testInfo.testId)!);

  await page.goto('/devices');

  await expect(page.getByTestId('location-selector-input')).toHaveValue(seed.defaultLocation.name);
  await expect(page.getByTestId('devices-empty-state')).toBeVisible();
  await expect(page.getByTestId('devices-location-required')).toHaveCount(0);

  await openSelector(page);
  await page.getByTestId(`location-selector-option-${seed.secondaryLocation.id}`).click();
  await expect(page.getByTestId('location-selector-input')).toHaveValue(
    seed.secondaryLocation.name,
  );
  await expect(page.getByTestId('devices-empty-state')).toBeVisible();
  await expect(page.getByTestId('devices-list')).toHaveCount(0);
});

test.afterEach(async ({ locations }, testInfo) => {
  const prefix = testPrefixes.get(testInfo.testId);
  await locations.cleanupAfterTest(testInfo, prefix);
  testPrefixes.delete(testInfo.testId);
});
