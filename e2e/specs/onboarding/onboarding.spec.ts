import type { Page, Request, Response } from '@playwright/test';
import { expect } from '@playwright/test';
import { onboardingTest, newUserOnboardingTest } from '../../fixtures/test';
import {
  deactivateDevice,
  deactivateDeviceWithToken,
  deleteOnboardedAccount,
} from '../../support/api/devices.api';
import {
  openAddDevicePage,
  expectLocationStepVisible,
  selectExistingLocation,
  selectNewLocationOption,
  expectModeStepVisible,
  selectSingleMode,
  selectMultiMode,
  expectPlatformLinksStepVisible,
  selectPlatformTile,
  fillPlatformUrl,
  deletePlatformInput,
  clickPlatformLinksStepNext,
  expectUserInfoStepVisible,
  fillUserInfoForm,
  checkConsentCheckbox,
  clickUserInfoStepSubmit,
  expectSuccessStepVisible,
  clickFinishButton,
} from '../../support/helpers/add-device-screen';
import { envTest } from '@/shared/config';

// Suppress unused import warnings for type-only imports used in JSDoc
void (undefined as unknown as Page);
void (undefined as unknown as Request);

// ─── Device Pool ──────────────────────────────────────────────────────────────

const getDevice = (index: number): { shortCode: string; id: string } => {
  const shortCodes = envTest.playwright.onboardingDeviceShortCodes;
  const ids = envTest.playwright.onboardingDeviceIds;

  if (shortCodes.length === 0 || ids.length === 0) {
    throw new Error(
      'NEXT_PUBLIC_E2E_ONBOARD_DEVICE_SHORT_CODES and PLAYWRIGHT_ONBOARDING_DEVICE_IDS ' +
        'must be configured for onboarding tests.',
    );
  }

  const i = index % shortCodes.length;
  return { shortCode: shortCodes[i]!, id: ids[i]! };
};

// Index 0: used by authenticated-user tests (worker session can deactivate)
// Index 1: used by new-user tests (deactivated via captured onboarding token)
const AUTH_DEVICE = getDevice(0);
const NEW_USER_DEVICE = getDevice(1);

// Facebook URL used in all tests — avoids Google Places autocomplete complexity
const TEST_FACEBOOK_URL = 'https://www.facebook.com/e2e-test-page';

interface OnboardingBody {
  accessToken: string;
  deviceId: string;
  user: { id: string };
  account: { id: string };
}

const isOnboardingPost = (r: Response): boolean =>
  r.url().includes('/onboarding') && r.request().method() === 'POST';

// ─── New User Onboarding Tests ────────────────────────────────────────────────

newUserOnboardingTest.describe('Onboarding — New User', () => {
  newUserOnboardingTest.describe.configure({ mode: 'serial' });

  let lastOnboardingResult: OnboardingBody | null = null;

  newUserOnboardingTest.beforeEach(async ({ deviceRequest }) => {
    // Attempt to deactivate using worker session; silently ignore if device belongs to a
    // different user (from previous run). The test will fail at page load with a clear
    // "Device not found" error if the device is still active.
    await deactivateDevice(deviceRequest, NEW_USER_DEVICE.id).catch(() => {});
    lastOnboardingResult = null;
  });

  newUserOnboardingTest.afterEach(async () => {
    if (!lastOnboardingResult) return;
    const { accessToken, deviceId, user, account } = lastOnboardingResult;
    await deactivateDeviceWithToken(accessToken, deviceId).catch(() => {});
    await deleteOnboardedAccount(accessToken, account.id, user.id).catch(() => {});
  });

  newUserOnboardingTest('activates device in SINGLE mode', async ({ page }, testInfo) => {
    const email = `pw-e2e-onboard-single-${testInfo.workerIndex}-${Date.now()}@localprof.dev`;

    // Set up response interceptor before navigation so we don't miss the response
    const onboardingResponsePromise = page.waitForResponse(isOnboardingPost);

    // Step 1: Navigate — device must be unconfigured to show the form
    await openAddDevicePage(page, NEW_USER_DEVICE.shortCode);
    await expectModeStepVisible(page);

    // Step 2: Mode step — SINGLE auto-advances on click
    await selectSingleMode(page);

    // Step 3: Platform links step
    // Default links contain google (requires Places API); replace with Facebook via tile click
    await expectPlatformLinksStepVisible(page);
    await selectPlatformTile(page, 'Facebook');
    await fillPlatformUrl(page, 0, TEST_FACEBOOK_URL);
    await clickPlatformLinksStepNext(page);

    // Step 4: User info step
    await expectUserInfoStepVisible(page);
    await fillUserInfoForm(page, {
      name: 'Playwright E2E',
      email,
      password: 'PlaywrightE2E123!',
    });
    await checkConsentCheckbox(page);
    await clickUserInfoStepSubmit(page);

    // Capture onboarding response for cleanup
    const response = await onboardingResponsePromise;
    lastOnboardingResult = (await response.json()) as OnboardingBody;

    // Step 5: Success step
    await expectSuccessStepVisible(page);
    await clickFinishButton(page);
    await expect(page).toHaveURL(new RegExp(`/devices/${lastOnboardingResult.deviceId}$`));
  });

  newUserOnboardingTest(
    'shows email conflict notification when email is already registered',
    async ({ page, auth }, testInfo) => {
      // Use an existing e2e user's email to trigger the conflict
      const existingUser = await auth.ensureUser(testInfo.workerIndex, 'onboard-conflict');

      const onboardingResponsePromise = page.waitForResponse(isOnboardingPost);

      await openAddDevicePage(page, NEW_USER_DEVICE.shortCode);
      await expectModeStepVisible(page);
      await selectSingleMode(page);

      await expectPlatformLinksStepVisible(page);
      await selectPlatformTile(page, 'Facebook');
      await fillPlatformUrl(page, 0, TEST_FACEBOOK_URL);
      await clickPlatformLinksStepNext(page);

      await expectUserInfoStepVisible(page);
      await fillUserInfoForm(page, {
        name: 'Playwright E2E Conflict',
        email: existingUser.email,
        password: 'PlaywrightE2E123!',
      });
      await checkConsentCheckbox(page);
      await clickUserInfoStepSubmit(page);

      // Expect 409 conflict response
      const response = await onboardingResponsePromise;
      expect(response.status()).toBe(409);

      // Device is NOT activated on conflict — no cleanup needed (lastOnboardingResult stays null)
      await expect(page.getByRole('heading', { name: 'Email already in use' })).toBeVisible({
        timeout: 10_000,
      });
      await expect(page.getByRole('button', { name: 'Log in' })).toBeVisible();
    },
  );

  newUserOnboardingTest('activates device in MULTI mode', async ({ page }, testInfo) => {
    const email = `pw-e2e-onboard-multi-${testInfo.workerIndex}-${Date.now()}@localprof.dev`;

    const onboardingResponsePromise = page.waitForResponse(isOnboardingPost);

    // Step 1: Navigate
    await openAddDevicePage(page, NEW_USER_DEVICE.shortCode);
    await expectModeStepVisible(page);

    // Step 2: Mode step — MULTI auto-advances on click
    await selectMultiMode(page);

    // Step 3: Platform links step
    // MULTI + isNewLocation=true: default Google input is shown; delete it, then add Facebook
    await expectPlatformLinksStepVisible(page);
    await deletePlatformInput(page, 0);
    await selectPlatformTile(page, 'Facebook');
    await fillPlatformUrl(page, 0, TEST_FACEBOOK_URL);
    await clickPlatformLinksStepNext(page);

    // Step 4: User info step
    await expectUserInfoStepVisible(page);
    await fillUserInfoForm(page, {
      name: 'Playwright E2E Multi',
      email,
      password: 'PlaywrightE2E123!',
    });
    await checkConsentCheckbox(page);
    await clickUserInfoStepSubmit(page);

    const response = await onboardingResponsePromise;
    lastOnboardingResult = (await response.json()) as OnboardingBody;

    // Step 5: Success step
    await expectSuccessStepVisible(page);
    await clickFinishButton(page);
    await expect(page).toHaveURL(new RegExp(`/devices/${lastOnboardingResult.deviceId}$`));
  });
});

// ─── Authenticated User Onboarding Tests ─────────────────────────────────────

onboardingTest.describe('Onboarding — Authenticated User', () => {
  onboardingTest.describe.configure({ mode: 'serial' });

  onboardingTest.beforeEach(async ({ request }) => {
    await deactivateDevice(request, AUTH_DEVICE.id).catch(() => {});
  });

  onboardingTest.afterEach(async ({ request }) => {
    await deactivateDevice(request, AUTH_DEVICE.id).catch(() => {});
  });

  onboardingTest(
    'activates device in SINGLE mode with existing location',
    async ({ locationTestPrefix, locations, page }) => {
      const seed = await locations.createSeed(locationTestPrefix);

      await openAddDevicePage(page, AUTH_DEVICE.shortCode);
      await expectLocationStepVisible(page);

      // Location step: select existing location (auto-advances on selection)
      await selectExistingLocation(page, seed.defaultLocation.id);

      // Mode step: SINGLE auto-advances on click
      await expectModeStepVisible(page);
      await selectSingleMode(page);

      // Platform links step: links were cleared on location select; add Facebook
      await expectPlatformLinksStepVisible(page);
      await selectPlatformTile(page, 'Facebook');
      await fillPlatformUrl(page, 0, TEST_FACEBOOK_URL);
      await clickPlatformLinksStepNext(page);

      // Success step
      await expectSuccessStepVisible(page);
      await clickFinishButton(page);
      await expect(page).toHaveURL(/\/devices\/[^/?#]+$/);
    },
  );

  onboardingTest(
    'activates device in MULTI mode with existing location',
    async ({ locationTestPrefix, locations, page }) => {
      const seed = await locations.createSeed(locationTestPrefix);

      await openAddDevicePage(page, AUTH_DEVICE.shortCode);
      await expectLocationStepVisible(page);

      await selectExistingLocation(page, seed.defaultLocation.id);

      await expectModeStepVisible(page);
      await selectMultiMode(page);

      await expectPlatformLinksStepVisible(page);
      await clickPlatformLinksStepNext(page);

      await expectSuccessStepVisible(page);
      await clickFinishButton(page);
      await expect(page).toHaveURL(/\/devices\/[^/?#]+$/);
    },
  );

  onboardingTest(
    'activates device in SINGLE mode with new location',
    async ({ locationTestPrefix, locations, page }) => {
      // Seed at least one location so the LocationStep renders the location selector
      await locations.createSeed(locationTestPrefix);

      await openAddDevicePage(page, AUTH_DEVICE.shortCode);
      await expectLocationStepVisible(page);

      // Location step: select "create new" (auto-advances on click)
      await selectNewLocationOption(page);

      await expectModeStepVisible(page);
      await selectSingleMode(page);

      // Platform links step: SINGLE + isNewLocation=true → Google input shown; replace with Facebook
      await expectPlatformLinksStepVisible(page);
      await selectPlatformTile(page, 'Facebook');
      await fillPlatformUrl(page, 0, TEST_FACEBOOK_URL);
      await clickPlatformLinksStepNext(page);

      await expectSuccessStepVisible(page);
      await clickFinishButton(page);
      await expect(page).toHaveURL(/\/devices\/[^/?#]+$/);
    },
  );

  onboardingTest(
    'activates device in MULTI mode with new location',
    async ({ locationTestPrefix, locations, page }) => {
      await locations.createSeed(locationTestPrefix);

      await openAddDevicePage(page, AUTH_DEVICE.shortCode);
      await expectLocationStepVisible(page);

      await selectNewLocationOption(page);

      await expectModeStepVisible(page);
      await selectMultiMode(page);

      // Platform links step: MULTI + isNewLocation=true → Google input shown; delete it, add Facebook
      await expectPlatformLinksStepVisible(page);
      await deletePlatformInput(page, 0);
      await selectPlatformTile(page, 'Facebook');
      await fillPlatformUrl(page, 0, TEST_FACEBOOK_URL);
      await clickPlatformLinksStepNext(page);

      await expectSuccessStepVisible(page);
      await clickFinishButton(page);
      await expect(page).toHaveURL(/\/devices\/[^/?#]+$/);
    },
  );
});
