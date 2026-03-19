import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useQuery } from '@tanstack/react-query';
import { HostedPageDTO } from '@/entities/contracts';
import { getHostedPageByLocation } from '../api/api';
import { useHostedPage } from './useHostedPage';

vi.mock('@tanstack/react-query', () => ({
  useQuery: vi.fn((options: unknown) => options),
}));

vi.mock('../api/api', () => ({
  getHostedPageByLocation: vi.fn(),
}));

// ── Fixtures ──────────────────────────────────────────────────────────────────

const makeDto = (overrides: Partial<HostedPageDTO> = {}): HostedPageDTO => ({
  id: 'hp-1',
  accountId: 'acc-1',
  locationId: 'loc-1',
  publishedConfig: {
    links: JSON.stringify([{ type: 'google', url: 'https://g.co/review' }]),
  },
  createdAt: '2026-03-01T00:00:00.000Z',
  updatedAt: '2026-03-01T00:00:00.000Z',
  ...overrides,
});

type QueryOptions = {
  queryKey: unknown;
  queryFn: () => Promise<unknown>;
  enabled: boolean;
  retry: boolean;
};

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('useHostedPage', () => {
  const useQueryMock = vi.mocked(useQuery);
  const getHostedPageMock = vi.mocked(getHostedPageByLocation);

  beforeEach(() => {
    useQueryMock.mockClear();
    getHostedPageMock.mockReset();
  });

  it('builds the query key from locationId', () => {
    const query = useHostedPage({ scope: { locationId: 'loc-1' } }) as unknown as QueryOptions;

    expect(query.queryKey).toEqual(['hostedPages', 'loc-1']);
  });

  it('queryFn calls getHostedPageByLocation with locationId', async () => {
    getHostedPageMock.mockResolvedValue(makeDto());

    const query = useHostedPage({ scope: { locationId: 'loc-1' } }) as unknown as QueryOptions;

    await query.queryFn();

    expect(getHostedPageMock).toHaveBeenCalledWith('loc-1');
  });

  it('queryFn maps the DTO and parses the links JSON string', async () => {
    getHostedPageMock.mockResolvedValue(makeDto());

    const query = useHostedPage({ scope: { locationId: 'loc-1' } }) as unknown as QueryOptions;

    const result = (await query.queryFn()) as { publishedConfig: { links: unknown[] } };

    expect(result.publishedConfig.links).toEqual([{ type: 'google', url: 'https://g.co/review' }]);
  });

  it('queryFn returns undefined links when DTO publishedConfig has no links field', async () => {
    getHostedPageMock.mockResolvedValue(makeDto({ publishedConfig: {} }));

    const query = useHostedPage({ scope: { locationId: 'loc-1' } }) as unknown as QueryOptions;

    const result = (await query.queryFn()) as { publishedConfig: { links: unknown } };

    expect(result.publishedConfig.links).toBeUndefined();
  });

  it('queryFn maps all scalar DTO fields through to the domain model', async () => {
    getHostedPageMock.mockResolvedValue(makeDto());

    const query = useHostedPage({ scope: { locationId: 'loc-1' } }) as unknown as QueryOptions;

    const result = (await query.queryFn()) as Record<string, unknown>;

    expect(result).toMatchObject({
      id: 'hp-1',
      accountId: 'acc-1',
      locationId: 'loc-1',
      createdAt: '2026-03-01T00:00:00.000Z',
      updatedAt: '2026-03-01T00:00:00.000Z',
    });
  });

  it('sets retry to false', () => {
    const query = useHostedPage({ scope: { locationId: 'loc-1' } }) as unknown as QueryOptions;

    expect(query.retry).toBe(false);
  });

  it('is enabled when locationId is provided and options.enabled is not set', () => {
    const query = useHostedPage({ scope: { locationId: 'loc-1' } }) as unknown as QueryOptions;

    expect(query.enabled).toBe(true);
  });

  it('is disabled when locationId is null', () => {
    const query = useHostedPage({ scope: { locationId: null } }) as unknown as QueryOptions;

    expect(query.enabled).toBe(false);
  });

  it('is disabled when locationId is undefined', () => {
    const query = useHostedPage({ scope: {} }) as unknown as QueryOptions;

    expect(query.enabled).toBe(false);
  });

  it('is disabled when options.enabled is false even with a valid locationId', () => {
    const query = useHostedPage({
      scope: { locationId: 'loc-1' },
      options: { enabled: false },
    }) as unknown as QueryOptions;

    expect(query.enabled).toBe(false);
  });
});
