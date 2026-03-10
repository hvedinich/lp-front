import type { Page } from '@playwright/test';
import { expect, locationsTest as test } from '../../fixtures/test';

const openSelector = async (page: Page) => {
  await expect(page.getByTestId('location-selector-input')).toBeEnabled();
  await page.getByTestId('location-selector-trigger').click();
};

const testPrefixes = new Map<string, string>();

test.beforeEach(async ({ locations }, testInfo) => {
  const prefix = await locations.cleanupForTest(testInfo.testId);
  testPrefixes.set(testInfo.testId, prefix);
});

test('persists selected location after reload', async ({ locations, page }, testInfo) => {
  const seed = await locations.createSeed(testPrefixes.get(testInfo.testId)!);

  await page.goto('/locations');
  await expect(page.getByTestId('location-selector-input')).toHaveValue(seed.defaultLocation.name);

  await openSelector(page);
  await page.getByTestId(`location-selector-option-${seed.secondaryLocation.id}`).click();
  await expect(page.getByTestId('location-selector-input')).toHaveValue(
    seed.secondaryLocation.name,
  );

  await page.reload();
  await expect(page.getByTestId('location-selector-input')).toHaveValue(
    seed.secondaryLocation.name,
  );
});

test.afterEach(async ({ locations }, testInfo) => {
  const prefix = testPrefixes.get(testInfo.testId);
  await locations.cleanupAfterTest(testInfo, prefix);
  testPrefixes.delete(testInfo.testId);
});
