import type { Locator, Page } from '@playwright/test';

export const visibleByTestId = (page: Page, testId: string): Locator =>
  page.locator(`[data-testid="${testId}"]:visible`);

export const loginSelectors = (page: Page) => ({
  email: visibleByTestId(page, 'auth-login-email'),
  password: visibleByTestId(page, 'auth-login-password'),
  submit: visibleByTestId(page, 'auth-login-submit'),
  error: visibleByTestId(page, 'auth-login-error'),
});
