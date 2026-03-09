import { expect, locationsTest as test } from '../../fixtures/test';
import {
  deleteLocationFromList,
  expectCreateLocationDisabled,
  expectLocationCardName,
  expectLocationRemovedFromList,
  expectLocationVisibleInList,
  expectLocationVisibleInSelector,
  expectSelectedLocation,
  openCreateLocationForm,
  openLocationsPage,
  returnToLocationsList,
  selectLocation,
  submitLocationCreateForm,
  submitLocationEditForm,
} from '../../support/helpers/locations-screen';

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

  await openLocationsPage(page);
  await openCreateLocationForm(page);

  const createdName = `PW-E2E-${prefix}-Create`;
  const createdLocationId = await submitLocationCreateForm(page, { name: createdName });
  await expect(page).toHaveURL(new RegExp(`/locations/${createdLocationId}$`));
  await returnToLocationsList(page);

  await expectLocationVisibleInList(page, createdLocationId);
  await expectLocationVisibleInSelector(page, createdLocationId);
});

test('edits location name', async ({ locations, page }, testInfo) => {
  const prefix = testPrefixes.get(testInfo.testId)!;
  const seed = await locations.createSeed(prefix);

  await page.goto(`/locations/${seed.defaultLocation.id}`);
  const editedName = `PW-E2E-${prefix}-Edited`;
  await submitLocationEditForm(page, { name: editedName });
  await returnToLocationsList(page);
  await expectLocationCardName(page, seed.defaultLocation.id, editedName);
});

test('deletes selected location and falls back to default', async ({
  locations,
  page,
}, testInfo) => {
  const seed = await locations.createSeed(testPrefixes.get(testInfo.testId)!);

  await openLocationsPage(page);
  await expectLocationVisibleInList(page, seed.secondaryLocation.id);
  await selectLocation(page, seed.secondaryLocation.id);
  await expectSelectedLocation(page, seed.secondaryLocation.name);

  await deleteLocationFromList(page, seed.secondaryLocation.id);
  await expectLocationRemovedFromList(page, seed.secondaryLocation.id);
  await expectSelectedLocation(page, seed.defaultLocation.name);
});

test('blocks submit for invalid create form', async ({ locations, page }, testInfo) => {
  await locations.createSeed(testPrefixes.get(testInfo.testId)!);

  await page.goto('/locations/new');
  await page.getByLabel('Name').fill('A');
  await page.getByLabel('Phone').focus();

  await expectCreateLocationDisabled(page);
});

test.afterEach(async ({ locations }, testInfo) => {
  const prefix = testPrefixes.get(testInfo.testId);
  await locations.cleanupAfterTest(testInfo, prefix);
  testPrefixes.delete(testInfo.testId);
});
