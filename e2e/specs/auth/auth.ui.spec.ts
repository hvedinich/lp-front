import { expect, test } from '../../fixtures/test';
import {
  expectLoginError,
  loginThroughUi,
  logoutFromWorkspace,
  openLoginPage,
  fillLoginForm,
  submitLoginForm,
} from '../../support/helpers/auth-screen';

const authHappyPathRetries = process.env.PLAYWRIGHT_DEBUG_ARTIFACTS ? 0 : 2;

test.beforeEach(async ({ auth }) => {
  await auth.clearState();
});

test.describe('auth happy path', () => {
  test.describe.configure({ retries: authHappyPathRetries });

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
  await submitLoginForm(page);

  await expect(page).toHaveURL(/\/login$/);
  await expectLoginError(page, 'Invalid email or password');
});
