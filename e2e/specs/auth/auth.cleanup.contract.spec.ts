import { expect, test } from '../../fixtures/test';
import { ensureAuthenticatedE2EUser } from '../../support/api/auth.api';
import { apiRequest, ensureOk } from '../../support/api/client.api';
import type { SessionPayload } from '../../support/contracts/backend.types';

test.describe('auth cleanup contract', () => {
  test('persists created user details for cleanup verification', async ({
    auth,
    request,
  }, testInfo) => {
    const scope = `cleanup-${testInfo.testId}`;
    await auth.ensureUser(testInfo.workerIndex, scope);
    const authenticatedCredentials = await ensureAuthenticatedE2EUser(
      request,
      testInfo.workerIndex,
      scope,
    );
    const sessionResponse = await apiRequest<SessionPayload>(request, {
      method: 'GET',
      path: '/auth/me',
    });
    ensureOk(sessionResponse, 'Unable to read cleanup verification session');

    await testInfo.attach('cleanup-user', {
      body: JSON.stringify(
        {
          createdAt: new Date().toISOString(),
          scope,
          testId: testInfo.testId,
          workerIndex: testInfo.workerIndex,
          user: {
            email: authenticatedCredentials.email,
            id: sessionResponse.payload?.user?.id ?? null,
          },
          account: {
            id: sessionResponse.payload?.account?.id ?? null,
          },
        },
        null,
        2,
      ),
      contentType: 'application/json',
    });

    expect(authenticatedCredentials.email).toContain('+e2e-');
  });
});
