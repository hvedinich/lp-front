import { expect, test, type Page } from '@playwright/test';

// ─── Navigation ───────────────────────────────────────────────────────────────

export const openAddDevicePage = async (page: Page, shortCode: string): Promise<void> => {
  await test.step(`Open add-device page (shortCode: ${shortCode})`, async () => {
    await page.goto(`/add-device?id=${shortCode}`);
    await page.waitForLoadState('networkidle');
  });
};

// ─── Location Step (authenticated flow only) ──────────────────────────────────

export const expectLocationStepVisible = async (page: Page): Promise<void> => {
  await expect(
    page.getByRole('heading', { name: 'Choose a location for this device' }),
  ).toBeVisible({ timeout: 10_000 });
};

export const selectExistingLocation = async (page: Page, locationId: string): Promise<void> => {
  await test.step(`Select existing location ${locationId}`, async () => {
    await page.getByTestId('location-selector-trigger').click();
    await expect(page.getByTestId(`location-selector-option-${locationId}`)).toBeVisible();
    await page.getByTestId(`location-selector-option-${locationId}`).click();
  });
};

export const selectNewLocationOption = async (page: Page): Promise<void> => {
  await test.step('Select create new location option', async () => {
    await page.getByRole('button', { name: /Create new location/i }).click();
  });
};

// ─── Mode Step ────────────────────────────────────────────────────────────────

export const expectModeStepVisible = async (page: Page): Promise<void> => {
  await expect(page.getByRole('heading', { name: 'Set up your stand' })).toBeVisible({
    timeout: 10_000,
  });
};

export const selectSingleMode = async (page: Page): Promise<void> => {
  await test.step('Select Single mode (Instant Review)', async () => {
    await page.getByRole('button', { name: /Instant Review/i }).click();
  });
};

export const selectMultiMode = async (page: Page): Promise<void> => {
  await test.step('Select Multi mode (Multi-Platform Choice)', async () => {
    await page.getByRole('button', { name: /Multi-Platform Choice/i }).click();
  });
};

// ─── Platform Links Step ──────────────────────────────────────────────────────

export const expectPlatformLinksStepVisible = async (page: Page): Promise<void> => {
  await expect(
    page.getByRole('heading', {
      name: /Where do you want to collect reviews|already has a review page/i,
    }),
  ).toBeVisible({ timeout: 10_000 });
};

export const selectPlatformTile = async (page: Page, platformLabel: string): Promise<void> => {
  await test.step(`Select platform tile: ${platformLabel}`, async () => {
    await page.getByRole('button', { name: platformLabel, exact: true }).click();
  });
};

// Fills the URL input for the nth PlatformInput and triggers blur validation
export const fillPlatformUrl = async (page: Page, index: number, url: string): Promise<void> => {
  await test.step(`Fill platform URL at index ${index}: ${url}`, async () => {
    const input = page.getByPlaceholder('https://...').nth(index);
    await input.fill(url);
    await input.blur();
  });
};

// Deletes the nth platform input (removes it from the field array)
export const deletePlatformInput = async (page: Page, index: number): Promise<void> => {
  await test.step(`Delete platform input at index ${index}`, async () => {
    await page.getByRole('button', { name: 'Delete' }).nth(index).click();
  });
};

export const clickPlatformLinksStepNext = async (page: Page): Promise<void> => {
  await test.step('Click Next on platform links step', async () => {
    await page.getByRole('button', { name: 'Next' }).first().click();
  });
};

// ─── User Info Step (new user flow only) ──────────────────────────────────────

export const expectUserInfoStepVisible = async (page: Page): Promise<void> => {
  await expect(page.getByRole('heading', { name: 'Get access to your stand' })).toBeVisible({
    timeout: 10_000,
  });
};

export const fillUserInfoForm = async (
  page: Page,
  values: { name: string; email: string; password: string; phone?: string },
): Promise<void> => {
  await test.step('Fill user info form', async () => {
    await page.getByLabel('Full Name').fill(values.name);
    await page.getByLabel('Email').fill(values.email);
    if (values.phone) {
      await page.getByLabel('Phone').fill(values.phone);
    }
    await page.getByLabel('Password').fill(values.password);
  });
};

export const checkConsentCheckbox = async (page: Page): Promise<void> => {
  await test.step('Check consent checkbox', async () => {
    await page.getByTestId('checkbox_isConsent').click();
  });
};

export const clickUserInfoStepSubmit = async (page: Page): Promise<void> => {
  await test.step('Click Next on user info step (submits form)', async () => {
    await page.getByRole('button', { name: 'Next' }).first().click();
  });
};

// ─── Success Step ─────────────────────────────────────────────────────────────

export const expectSuccessStepVisible = async (page: Page): Promise<void> => {
  await expect(page.getByRole('heading', { name: 'All set' })).toBeVisible({ timeout: 15_000 });
  await expect(page.getByText('Stand activated')).toBeVisible();
};

export const clickFinishButton = async (page: Page): Promise<void> => {
  await test.step('Click Finish button', async () => {
    await page.getByRole('button', { name: 'Finish' }).click();
  });
};
