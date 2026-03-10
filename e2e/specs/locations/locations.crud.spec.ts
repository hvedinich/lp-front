import type { Page } from '@playwright/test';
import { expect, locationsTest as test } from '../../fixtures/test';
import { visibleByTestId } from '../../support/helpers/selectors';

const openSelector = async (page: Page) => {
  await expect(page.getByTestId('location-selector-input')).toBeEnabled();
  await page.getByTestId('location-selector-trigger').click();
};

const testPrefixes = new Map<string, string>();

test.beforeEach(async ({ locations }, testInfo) => {
  const prefix = await locations.cleanupForTest(testInfo.testId);
  testPrefixes.set(testInfo.testId, prefix);
});

test('creates location and shows it in list and selector', async ({
  locations,
  page,
}, testInfo) => {
  const prefix = testPrefixes.get(testInfo.testId)!;
  await locations.createSeed(prefix);

  await page.goto('/locations');
  await page.getByTestId('locations-create-button').click();
  await expect(page).toHaveURL(/\/locations\/new$/);

  const createdName = `PW-E2E-${prefix}-Create`;
  await page.getByTestId('location-form-name-input').fill(createdName);
  await page.getByTestId('location-form-phone-input').focus();
  await expect(visibleByTestId(page, 'location-form-create-submit')).toBeEnabled();
  await visibleByTestId(page, 'location-form-create-submit').click();
  await expect(page).toHaveURL(/\/locations\/(?!new$)[^/?#]+$/);

  const locationUrl = page.url();
  const createdLocationId = locationUrl.match(/\/locations\/([^/?#]+)$/)?.[1];
  expect(createdLocationId).toBeDefined();
  expect(createdLocationId).not.toBe('new');

  await expect(page).toHaveURL(new RegExp(`/locations/${createdLocationId}$`));
  await visibleByTestId(page, 'location-form-cancel-button').click();

  await expect(page).toHaveURL(/\/locations$/);
  await expect(page.getByTestId(`locations-card-${createdLocationId}`)).toBeVisible();

  await openSelector(page);
  await expect(page.getByTestId(`location-selector-option-${createdLocationId}`)).toBeVisible();
});

test('edits location name', async ({ locations, page }, testInfo) => {
  const prefix = testPrefixes.get(testInfo.testId)!;
  const seed = await locations.createSeed(prefix);

  await page.goto(`/locations/${seed.defaultLocation.id}`);
  const editedName = `PW-E2E-${prefix}-Edited`;
  await page.getByTestId('location-form-name-input').fill(editedName);
  await page.getByTestId('location-form-phone-input').focus();
  await expect(visibleByTestId(page, 'location-form-edit-submit')).toBeEnabled();
  await visibleByTestId(page, 'location-form-edit-submit').click();

  await visibleByTestId(page, 'location-form-cancel-button').click();
  await expect(page).toHaveURL(/\/locations$/);
  await expect(page.getByTestId(`locations-card-${seed.defaultLocation.id}`)).toContainText(
    editedName,
  );
});

test('deletes selected location and falls back to default', async ({
  locations,
  page,
}, testInfo) => {
  const seed = await locations.createSeed(testPrefixes.get(testInfo.testId)!);

  await page.goto('/locations');
  await expect(page.getByTestId(`locations-card-${seed.secondaryLocation.id}`)).toBeVisible();
  await openSelector(page);
  await expect(
    page.getByTestId(`location-selector-option-${seed.secondaryLocation.id}`),
  ).toBeVisible();
  await page.getByTestId(`location-selector-option-${seed.secondaryLocation.id}`).click();
  await expect(page.getByTestId('location-selector-input')).toHaveValue(
    seed.secondaryLocation.name,
  );

  await page.getByTestId(`locations-delete-button-${seed.secondaryLocation.id}`).click();
  await expect(page.getByTestId(`locations-card-${seed.secondaryLocation.id}`)).toHaveCount(0);
  await expect(page.getByTestId('location-selector-input')).toHaveValue(seed.defaultLocation.name);
});

test('blocks submit for invalid create form', async ({ locations, page }, testInfo) => {
  await locations.createSeed(testPrefixes.get(testInfo.testId)!);

  await page.goto('/locations/new');
  await page.getByTestId('location-form-name-input').fill('A');
  await page.getByTestId('location-form-phone-input').focus();

  await expect(visibleByTestId(page, 'location-form-create-submit')).toBeDisabled();
});

test.afterEach(async ({ locations }, testInfo) => {
  const prefix = testPrefixes.get(testInfo.testId);
  await locations.cleanupAfterTest(testInfo, prefix);
  testPrefixes.delete(testInfo.testId);
});
