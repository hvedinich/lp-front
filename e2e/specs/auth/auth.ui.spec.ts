import type { Page } from '@playwright/test';
import { expect, test } from '../../fixtures/test';
import { loginSelectors, visibleByTestId } from '../../support/helpers/selectors';

const loginByUi = async (page: Page, credentials: { email: string; password: string }) => {
  await page.goto('/login');
  const selectors = loginSelectors(page);
  await selectors.email.fill(credentials.email);
  await selectors.password.fill(credentials.password);
  await selectors.submit.click();
};

test.beforeEach(async ({ auth }, testInfo) => {
  await auth.ensureUser(testInfo.workerIndex, 'auth');
  await auth.clearState();
});

test('logs in and logs out via UI', async ({ auth, page }, testInfo) => {
  const credentials = await auth.ensureUser(testInfo.workerIndex, 'auth');

  await loginByUi(page, credentials);
  await expect(page).toHaveURL(/\/$/);
  await expect(visibleByTestId(page, 'auth-logout-button')).toBeVisible();

  await visibleByTestId(page, 'auth-logout-button').click();
  await expect(page).toHaveURL(/\/login(?:\?.*)?$/);
  await expect(visibleByTestId(page, 'auth-login-submit')).toBeVisible();
});

test('shows error for invalid password', async ({ auth, page }, testInfo) => {
  const credentials = await auth.ensureUser(testInfo.workerIndex, 'auth');

  await loginByUi(page, {
    email: credentials.email,
    password: `${credentials.password}-invalid`,
  });

  await expect(page).toHaveURL(/\/login$/);
  await expect(loginSelectors(page).error).toBeVisible();
});
