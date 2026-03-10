import type { Page } from '@playwright/test';
import { expect, locationsTest as test } from '../../fixtures/test';

test.describe.configure({ mode: 'serial' });

const openSelector = async (page: Page) => {
  await expect(page.getByTestId('location-selector-input')).toBeEnabled();
  await page.getByTestId('location-selector-trigger').click();
};

test('persists selected location after reload', async ({ locationTestPrefix, locations, page }) => {
  const seed = await locations.createSeed(locationTestPrefix);

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
