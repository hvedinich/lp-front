import { expect, test, type Page } from '@playwright/test';

// ─── Assertions ───────────────────────────────────────────────────────────────

export const expectDeviceSettingsVisible = async (page: Page): Promise<void> => {
  await test.step('Expect device settings page visible', async () => {
    await expect(page.getByRole('tab', { name: 'Settings' })).toBeVisible({ timeout: 10_000 });
  });
};

export const expectModeSelected = async (
  page: Page,
  mode: 'static' | 'multilink',
): Promise<void> => {
  await test.step(`Expect mode "${mode}" selected`, async () => {
    await expect(page.locator(`[data-testid="device-mode-${mode}"][data-selected]`)).toBeVisible();
  });
};

// ─── Actions ──────────────────────────────────────────────────────────────────

export const selectDeviceMode = async (page: Page, mode: 'static' | 'multilink'): Promise<void> => {
  await test.step(`Select mode "${mode}"`, async () => {
    await page.getByTestId(`device-mode-${mode}`).click();
  });
};

export const fillDeviceName = async (page: Page, name: string): Promise<void> => {
  await test.step(`Fill device name "${name}"`, async () => {
    const input = page.getByLabel('Device name');
    await input.clear();
    await input.fill(name);
  });
};

export const saveSettings = async (page: Page): Promise<void> => {
  await test.step('Save settings', async () => {
    await page.getByRole('button', { name: 'Save' }).click();
    await expect(page.getByText('Changes saved successfully.')).toBeVisible({ timeout: 10_000 });
  });
};

export const clickDeleteDevice = async (page: Page): Promise<void> => {
  await test.step('Click delete device', async () => {
    await page.getByRole('button', { name: 'Delete device' }).click();
  });
};

export const confirmDeleteDevice = async (page: Page): Promise<void> => {
  await test.step('Confirm delete device', async () => {
    await page.getByRole('button', { name: 'Delete' }).click();
  });
};
