import type { APIRequestContext } from '@playwright/test';
import { request as playwrightRequest } from '@playwright/test';
import { apiRequest, ensureOk } from './client.api';
import { envTest } from '@/shared/config';

export const deactivateDevice = async (
  request: APIRequestContext,
  deviceId: string,
): Promise<void> => {
  const response = await apiRequest(request, {
    method: 'PATCH',
    path: `/devices/${deviceId}/deactivate`,
  });
  if (!response.ok && response.status !== 404 && response.status !== 409) {
    ensureOk(response, `Unable to deactivate device ${deviceId}`);
  }
};

export const deactivateDeviceWithToken = async (
  accessToken: string,
  deviceId: string,
): Promise<void> => {
  const ctx = await playwrightRequest.newContext({
    baseURL: envTest.playwright.baseUrl,
    extraHTTPHeaders: { Authorization: `Bearer ${accessToken}` },
  });
  try {
    const response = await apiRequest(ctx, {
      method: 'PATCH',
      path: `/devices/${deviceId}/deactivate`,
    });
    if (!response.ok && response.status !== 404 && response.status !== 409) {
      ensureOk(response, `Unable to deactivate device ${deviceId} with token`);
    }
  } finally {
    await ctx.dispose();
  }
};

export const deleteOnboardedAccount = async (
  accessToken: string,
  accountId: string,
  userId: string,
): Promise<void> => {
  const ctx = await playwrightRequest.newContext({
    baseURL: envTest.playwright.baseUrl,
    extraHTTPHeaders: { Authorization: `Bearer ${accessToken}` },
  });
  try {
    await apiRequest(ctx, { method: 'DELETE', path: `/accounts/${accountId}` });
    await apiRequest(ctx, { method: 'DELETE', path: `/users/${userId}` });
  } finally {
    await ctx.dispose();
  }
};
