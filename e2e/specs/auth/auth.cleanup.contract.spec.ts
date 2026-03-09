import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { expect, test } from '../../fixtures/test';
import { loginViaApi } from '../../support/api/auth.api';
import { apiRequest, ensureOk } from '../../support/api/client.api';
import type { SessionPayload } from '../../support/contracts/backend.types';

test.describe('auth cleanup contract', () => {
  test('persists created user details for cleanup verification', async ({
    auth,
    request,
  }, testInfo) => {
    const credentials = await auth.ensureUser(testInfo.workerIndex, `cleanup-${testInfo.testId}`);
    const artifactsDir = join(process.cwd(), 'e2e', 'artifacts');
    const artifactPath = join(
      artifactsDir,
      `cleanup-user-worker-${testInfo.workerIndex}-retry-${testInfo.retry}.json`,
    );
    const loginResponse = await loginViaApi(request, credentials);
    ensureOk(loginResponse, 'Unable to authenticate cleanup verification user');
    const sessionResponse = await apiRequest<SessionPayload>(request, {
      method: 'GET',
      path: '/auth/me',
    });
    ensureOk(sessionResponse, 'Unable to read cleanup verification session');

    await mkdir(artifactsDir, { recursive: true });
    await writeFile(
      artifactPath,
      JSON.stringify(
        {
          createdAt: new Date().toISOString(),
          scope: `cleanup-${testInfo.testId}`,
          testId: testInfo.testId,
          workerIndex: testInfo.workerIndex,
          user: {
            email: credentials.email,
            id: sessionResponse.payload?.user?.id ?? null,
          },
          account: {
            id: sessionResponse.payload?.account?.id ?? null,
          },
        },
        null,
        2,
      ),
      'utf8',
    );

    await testInfo.attach('cleanup-user', {
      body: JSON.stringify({ email: credentials.email }, null, 2),
      contentType: 'application/json',
    });

    expect(credentials.email).toContain('+e2e-');
  });
});
