import { expect, test, type Page } from '@playwright/test';

const locationSelectorInput = (page: Page) => page.getByTestId('location-selector-input');
const locationSelectorTrigger = (page: Page) => page.getByTestId('location-selector-trigger');
const locationSelectorOption = (page: Page, locationId: string) =>
  page.getByTestId(`location-selector-option-${locationId}`);
const manageLocationsButton = (page: Page) =>
  page.getByRole('button', { name: 'Manage locations' });

export const openDevicesPage = async (page: Page): Promise<void> => {
  await test.step('Open devices page', async () => {
    await page.goto('/devices');
    await expect(
      page.getByRole('main').getByRole('heading', { name: 'Devices', exact: true }),
    ).toBeVisible();
  });
};

export const expectDevicesRequireLocation = async (page: Page): Promise<void> => {
  await expect(
    page.getByRole('heading', { name: 'Select a location to view devices' }),
  ).toBeVisible();
  await expect(
    page.getByText('Choose a location in the sidebar before opening the devices list.'),
  ).toBeVisible();
  await expect(page.getByTestId('devices-empty-state')).toHaveCount(0);
  await expect(page.getByTestId('devices-list')).toHaveCount(0);
  await expect(manageLocationsButton(page)).toBeVisible();
};

export const expectDevicesEmptyState = async (page: Page): Promise<void> => {
  await expect(
    page.getByRole('heading', { name: 'No devices in this location yet' }),
  ).toBeVisible();
  await expect(
    page.getByText('Connected devices for the selected location will appear here.'),
  ).toBeVisible();
  await expect(page.getByTestId('devices-location-required')).toHaveCount(0);
};

export const selectDevicesLocation = async (
  page: Page,
  location: { id: string; name: string },
): Promise<void> => {
  await test.step(`Select devices location ${location.name}`, async () => {
    await locationSelectorTrigger(page).click();
    await expect(locationSelectorOption(page, location.id)).toBeVisible();
    await locationSelectorOption(page, location.id).click();
    await expect(locationSelectorInput(page)).toHaveValue(location.name);
  });
};
