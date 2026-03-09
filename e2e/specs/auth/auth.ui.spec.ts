import { expect, test } from '../../fixtures/test';
import {
  expectLoginError,
  loginThroughUi,
  logoutFromWorkspace,
  openLoginPage,
  fillLoginForm,
} from '../../support/helpers/auth-screen';

test.beforeEach(async ({ auth }) => {
  await auth.clearState();
});

test.describe('auth happy path', () => {
  test.describe.configure({ retries: 2 });

  test('logs in and logs out via UI', async ({ auth, page }, testInfo) => {
    test.setTimeout(90_000);
    const credentials = await auth.ensureUser(testInfo.workerIndex, 'auth-ui');

    await loginThroughUi(page, credentials);
    await expect(page).toHaveURL(/\/$/);
    await logoutFromWorkspace(page);
  });
});

test('shows error for invalid password', async ({ page }, testInfo) => {
  await openLoginPage(page);
  await fillLoginForm(page, {
    email: `playwright-invalid-${testInfo.workerIndex}@localprof.dev`,
    password: 'invalid-password',
  });
  await page.getByRole('button', { name: 'Log In' }).click();

  await expect(page).toHaveURL(/\/login$/);
  await expectLoginError(page, 'Invalid email or password');
});
