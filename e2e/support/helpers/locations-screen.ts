import { expect, test, type Locator, type Page } from '@playwright/test';

const createLocationButton = (page: Page): Locator =>
  page.getByRole('button', { name: 'Create location' });
const saveLocationButton = (page: Page): Locator => page.getByRole('button', { name: 'Save' });
const cancelLocationButton = (page: Page): Locator => page.getByRole('button', { name: 'Cancel' });
const nameInput = (page: Page): Locator => page.getByLabel('Name');
const phoneInput = (page: Page): Locator => page.getByLabel('Phone');
const locationSelectorInput = (page: Page): Locator => page.getByTestId('location-selector-input');
const locationSelectorTrigger = (page: Page): Locator =>
  page.getByTestId('location-selector-trigger');
const locationSelectorOption = (page: Page, locationId: string): Locator =>
  page.getByTestId(`location-selector-option-${locationId}`);
const locationCard = (page: Page, locationId: string): Locator =>
  page.getByTestId(`locations-card-${locationId}`);
const locationDeleteButton = (page: Page, locationId: string): Locator =>
  page.getByTestId(`locations-delete-button-${locationId}`);

export const openLocationsPage = async (page: Page): Promise<void> => {
  await test.step('Open locations page', async () => {
    await page.goto('/locations');
    await expect(
      page.getByRole('main').getByRole('heading', { name: 'Locations', exact: true }),
    ).toBeVisible();
  });
};

export const openCreateLocationForm = async (page: Page): Promise<void> => {
  await test.step('Open create location form', async () => {
    await createLocationButton(page).click();
    await expect(page).toHaveURL(/\/locations\/new$/);
    await expect(
      page.getByRole('main').getByRole('heading', { name: 'Create location', exact: true }),
    ).toBeVisible();
  });
};

export const submitLocationCreateForm = async (
  page: Page,
  values: { name: string },
): Promise<string> => {
  return test.step('Create location through form', async () => {
    await nameInput(page).fill(values.name);
    await phoneInput(page).focus();
    await expect(page.getByRole('button', { name: 'Create location' })).toBeEnabled();
    await page.getByRole('button', { name: 'Create location' }).click();
    await expect(page).toHaveURL(/\/locations\/(?!new$)[^/?#]+$/);

    const locationId = page.url().match(/\/locations\/([^/?#]+)$/)?.[1];
    expect(locationId).toBeDefined();
    expect(locationId).not.toBe('new');
    return locationId!;
  });
};

export const submitLocationEditForm = async (
  page: Page,
  values: { name: string },
): Promise<void> => {
  await test.step('Save location changes', async () => {
    await nameInput(page).fill(values.name);
    await phoneInput(page).focus();
    await expect(saveLocationButton(page)).toBeEnabled();
    await saveLocationButton(page).click();
  });
};

export const returnToLocationsList = async (page: Page): Promise<void> => {
  await test.step('Return to locations list', async () => {
    await cancelLocationButton(page).click();
    await expect(page).toHaveURL(/\/locations$/);
  });
};

export const openLocationSelector = async (page: Page): Promise<void> => {
  await test.step('Open location selector', async () => {
    await expect(locationSelectorInput(page)).toBeEnabled();
    await locationSelectorTrigger(page).click();
  });
};

export const selectLocation = async (page: Page, locationId: string): Promise<void> => {
  await test.step(`Select location ${locationId}`, async () => {
    await openLocationSelector(page);
    await expect(locationSelectorOption(page, locationId)).toBeVisible();
    await locationSelectorOption(page, locationId).click();
  });
};

export const expectSelectedLocation = async (page: Page, locationName: string): Promise<void> => {
  await expect(locationSelectorInput(page)).toHaveValue(locationName);
};

export const expectLocationVisibleInList = async (
  page: Page,
  locationId: string,
): Promise<void> => {
  await expect(locationCard(page, locationId)).toBeVisible();
};

export const expectLocationCardName = async (
  page: Page,
  locationId: string,
  locationName: string,
): Promise<void> => {
  await expect(
    locationCard(page, locationId).getByText(locationName, { exact: true }),
  ).toBeVisible();
};

export const expectLocationVisibleInSelector = async (
  page: Page,
  locationId: string,
): Promise<void> => {
  await openLocationSelector(page);
  await expect(locationSelectorOption(page, locationId)).toBeVisible();
};

export const deleteLocationFromList = async (page: Page, locationId: string): Promise<void> => {
  await test.step(`Delete location ${locationId}`, async () => {
    await locationDeleteButton(page, locationId).click();
  });
};

export const expectLocationRemovedFromList = async (
  page: Page,
  locationId: string,
): Promise<void> => {
  await expect(locationCard(page, locationId)).toHaveCount(0);
};

export const expectCreateLocationDisabled = async (page: Page): Promise<void> => {
  await expect(page.getByRole('button', { name: 'Create location' })).toBeDisabled();
};
