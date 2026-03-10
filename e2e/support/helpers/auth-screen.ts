import { expect, test, type Locator, type Page } from '@playwright/test';
import type { AuthCredentials } from '../contracts/backend.types';
import { sleep } from '../api/client.api';

const RETRYABLE_ERROR_PATTERNS = [/internal server error/i, /too many requests/i];
const AUTH_UI_RETRY_DELAYS_MS = [300, 700, 1500, 3000, 5000, 8000] as const;

const emailInput = (page: Page): Locator => page.getByLabel('Email');
const passwordInput = (page: Page): Locator => page.getByLabel('Password');
const loginButton = (page: Page): Locator => page.getByRole('button', { name: 'Log In' });
const loginHeading = (page: Page): Locator => page.getByRole('heading', { name: 'Sign In' });
const loginError = (page: Page): Locator => page.getByTestId('auth-login-error');
const logoutButton = (page: Page): Locator => page.getByTestId('auth-logout-button');

const parseRetryAfterMs = (errorText: string): number | null => {
  const match = errorText.match(/retry after (\d+) seconds?/i);
  if (!match) {
    return null;
  }

  const seconds = Number(match[1]);
  return Number.isFinite(seconds) && seconds > 0 ? seconds * 1000 : null;
};

const isRetryableAuthError = (errorText: string): boolean =>
  RETRYABLE_ERROR_PATTERNS.some((pattern) => pattern.test(errorText));

export const openLoginPage = async (page: Page): Promise<void> => {
  await test.step('Open login page', async () => {
    await page.goto('/login');
    if (new URL(page.url()).pathname.startsWith('/login')) {
      await expect(loginHeading(page)).toBeVisible();
    }
  });
};

export const fillLoginForm = async (page: Page, credentials: AuthCredentials): Promise<void> => {
  await test.step('Fill login form', async () => {
    await emailInput(page).fill(credentials.email);
    await passwordInput(page).fill(credentials.password);
  });
};

export const submitLoginForm = async (page: Page): Promise<void> => {
  await test.step('Submit login form', async () => {
    await loginButton(page).click();
  });
};

const expectAuthenticatedWorkspace = async (page: Page): Promise<void> => {
  await expect(page).toHaveURL(/\/$/);
  await expect(logoutButton(page)).toBeVisible();
};

export const loginThroughUi = async (page: Page, credentials: AuthCredentials): Promise<void> => {
  await openLoginPage(page);
  await fillLoginForm(page, credentials);

  for (let attempt = 0; attempt < AUTH_UI_RETRY_DELAYS_MS.length; attempt += 1) {
    await test.step(`Submit login form (attempt ${attempt + 1})`, async () => {
      await submitLoginForm(page);
    });

    try {
      await expectAuthenticatedWorkspace(page);
      return;
    } catch (error) {
      const errorText = (await loginError(page).textContent())?.trim() ?? '';
      if (
        !errorText ||
        !isRetryableAuthError(errorText) ||
        attempt === AUTH_UI_RETRY_DELAYS_MS.length - 1
      ) {
        throw error;
      }

      const retryAfterMs = parseRetryAfterMs(errorText);
      const delayMs =
        retryAfterMs ?? AUTH_UI_RETRY_DELAYS_MS[attempt] ?? AUTH_UI_RETRY_DELAYS_MS.at(-1)!;
      await sleep(delayMs);
    }
  }
};

export const expectLoginError = async (page: Page, message: string): Promise<void> => {
  await expect(loginError(page)).toContainText(message);
};

export const logoutFromWorkspace = async (page: Page): Promise<void> => {
  await test.step('Log out from workspace', async () => {
    await logoutButton(page).click();
    await expect(page).toHaveURL(/\/login(?:\?.*)?$/);
    await expect(loginButton(page)).toBeVisible();
  });
};
