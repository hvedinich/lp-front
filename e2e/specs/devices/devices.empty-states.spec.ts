import { devicesTest as test, expect } from '../../fixtures/test';
import {
  expectDevicesEmptyState,
  expectDevicesRequireLocation,
  openDevicesPage,
  selectDevicesLocation,
} from '../../support/helpers/devices-screen';

test.describe.configure({ mode: 'serial' });

test('shows prompt state when no location is available', async ({ page }) => {
  await openDevicesPage(page);
  await expectDevicesRequireLocation(page);
});

test('shows empty state for selected location without devices', async ({
  locationTestPrefix,
  locations,
  page,
}) => {
  const seed = await locations.createSeed(locationTestPrefix);

  await openDevicesPage(page);
  await expect(page.getByTestId('location-selector-input')).toHaveValue(seed.defaultLocation.name);
  await expectDevicesEmptyState(page);

  await selectDevicesLocation(page, seed.secondaryLocation);
  await expectDevicesEmptyState(page);
  await expect(page.getByTestId('devices-list')).toHaveCount(0);
});
