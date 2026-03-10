import { mkdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import type { AuthCredentials } from '../contracts/backend.types';

interface RegistryEntry {
  email: string;
  password: string;
}

const REGISTRY_LOCK_PATH = join(tmpdir(), 'lp-front-e2e-user-registry-lock');
const REGISTRY_LOCK_TIMEOUT_MS = 30_000;
const REGISTRY_LOCK_RETRY_MS = 100;
export const E2E_USER_REGISTRY_PATH = join(tmpdir(), 'lp-front-e2e-user-registry.json');

const sleep = async (ms: number): Promise<void> => {
  await new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};

const releaseRegistryLock = async (): Promise<void> => {
  await rm(REGISTRY_LOCK_PATH, { recursive: true, force: true });
};

const acquireRegistryLock = async (): Promise<void> => {
  const startedAt = Date.now();

  while (true) {
    try {
      await mkdir(REGISTRY_LOCK_PATH);
      return;
    } catch (error) {
      const code = error instanceof Error && 'code' in error ? error.code : undefined;
      if (code !== 'EEXIST') {
        throw error;
      }

      const existing = await stat(REGISTRY_LOCK_PATH).catch(() => null);
      if (existing && Date.now() - existing.mtimeMs >= REGISTRY_LOCK_TIMEOUT_MS) {
        await releaseRegistryLock();
        continue;
      }

      if (Date.now() - startedAt >= REGISTRY_LOCK_TIMEOUT_MS) {
        throw new Error('Timed out waiting for E2E user registry lock.');
      }

      await sleep(REGISTRY_LOCK_RETRY_MS);
    }
  }
};

const withRegistryLock = async <T>(callback: () => Promise<T>): Promise<T> => {
  await acquireRegistryLock();
  try {
    return await callback();
  } finally {
    await releaseRegistryLock();
  }
};

const readRegistry = async (): Promise<RegistryEntry[]> => {
  try {
    const raw = await readFile(E2E_USER_REGISTRY_PATH, 'utf8');
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed)
      ? parsed.filter(
          (entry): entry is RegistryEntry =>
            typeof entry === 'object' &&
            entry !== null &&
            'email' in entry &&
            'password' in entry &&
            typeof entry.email === 'string' &&
            typeof entry.password === 'string',
        )
      : [];
  } catch {
    return [];
  }
};

const writeRegistry = async (entries: RegistryEntry[]): Promise<void> => {
  await writeFile(E2E_USER_REGISTRY_PATH, JSON.stringify(entries, null, 2), 'utf8');
};

export const trackE2EUser = async (credentials: AuthCredentials): Promise<void> => {
  await withRegistryLock(async () => {
    const entries = await readRegistry();
    const deduped = entries.filter((entry) => entry.email !== credentials.email);
    deduped.push({
      email: credentials.email,
      password: credentials.password,
    });
    await writeRegistry(deduped);
  });
};

export const untrackE2EUser = async (email: string): Promise<void> => {
  await withRegistryLock(async () => {
    const entries = await readRegistry();
    const remaining = entries.filter((entry) => entry.email !== email);
    await writeRegistry(remaining);
  });
};

export const listTrackedE2EUsers = async (): Promise<AuthCredentials[]> => {
  return withRegistryLock(async () => {
    const entries = await readRegistry();
    return entries.map((entry) => ({
      email: entry.email,
      password: entry.password,
    }));
  });
};
