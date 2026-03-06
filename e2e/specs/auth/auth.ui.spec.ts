import type { Page } from '@playwright/test';
import { expect, test } from '../../fixtures/test';
import { loginSelectors, visibleByTestId } from '../../support/helpers/selectors';

const parseRetryAfterMs = (errorText: string): number | null => {
  const match = errorText.match(/retry after (\d+) seconds?/i);
  if (!match) {
    return null;
  }

  const seconds = Number(match[1]);
  return Number.isFinite(seconds) && seconds > 0 ? seconds * 1000 : null;
};

const loginByUi = async (
  page: Page,
  credentials: { email: string; password: string },
  options?: { expectSuccess?: boolean; retryOnInternalError?: boolean },
) => {
  await page.goto('/login');
  const selectors = loginSelectors(page);
  await selectors.email.fill(credentials.email);
  await selectors.password.fill(credentials.password);

  if (!options?.expectSuccess) {
    await selectors.submit.click();
    return;
  }

  const maxAttempts = options?.retryOnInternalError ? 6 : 1;
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    await selectors.submit.click();

    try {
      await expect(page).toHaveURL(/\/$/, { timeout: 2500 });
      return;
    } catch {
      if (!options?.retryOnInternalError) {
        throw new Error('Login by UI failed.');
      }

      const errorText = (await selectors.error.textContent())?.toLowerCase() ?? '';
      const retryAfterMs = parseRetryAfterMs(errorText);
      const isRetryable =
        errorText.includes('internal server error') || errorText.includes('too many requests');

      if (!isRetryable || attempt === maxAttempts - 1) {
        throw new Error('Login by UI failed after retries.');
      }

      const fallbackDelay = 300 * (attempt + 1);
      await page.waitForTimeout(retryAfterMs ?? fallbackDelay);
    }
  }
};

test.beforeEach(async ({ auth }) => {
  await auth.clearState();
});

test.describe('auth happy path', () => {
  test.describe.configure({ retries: 2 });

  test('logs in and logs out via UI', async ({ auth, page }, testInfo) => {
    test.setTimeout(90_000);
    const credentials = await auth.ensureUser(testInfo.workerIndex, 'auth-ui');

    await loginByUi(page, credentials, {
      expectSuccess: true,
      retryOnInternalError: true,
    });
    await expect(page).toHaveURL(/\/$/);
    await expect(visibleByTestId(page, 'auth-logout-button')).toBeVisible();

    await visibleByTestId(page, 'auth-logout-button').click();
    await expect(page).toHaveURL(/\/login(?:\?.*)?$/);
    await expect(visibleByTestId(page, 'auth-login-submit')).toBeVisible();
  });
});

test('shows error for invalid password', async ({ page }, testInfo) => {
  await loginByUi(page, {
    email: `playwright-invalid-${testInfo.workerIndex}@localprof.dev`,
    password: 'invalid-password',
  });

  await expect(page).toHaveURL(/\/login$/);
  await expect(loginSelectors(page).error).toBeVisible();
});
