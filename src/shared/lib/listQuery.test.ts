import { buildListQueryString, normalizeListQueryParams, type ListQueryParams } from './listQuery';

type TestFilters = {
  isActive?: boolean;
  name?: string;
};

type TestSortField = 'createdAt' | 'name';

describe('buildListQueryString', () => {
  it('serializes filters, sort, limit, and offset using backend list-query format', () => {
    const params: ListQueryParams<TestFilters, TestSortField> = {
      filters: {
        isActive: true,
        name: 'Main office',
      },
      limit: 20,
      offset: 40,
      sort: ['name', '-createdAt'],
    };

    expect(buildListQueryString(params)).toBe(
      '?filter%5BisActive%5D=true&filter%5Bname%5D=Main+office&sort=name%2C-createdAt&limit=20&offset=40',
    );
  });

  it('omits empty values', () => {
    expect(
      buildListQueryString<TestFilters, TestSortField>({
        filters: {
          isActive: undefined,
          name: undefined,
        },
      }),
    ).toBe('');
  });
});

describe('normalizeListQueryParams', () => {
  it('removes nullish filters and preserves stable sort values', () => {
    expect(
      normalizeListQueryParams<TestFilters, TestSortField>({
        filters: {
          isActive: undefined,
          name: null as unknown as string | undefined,
        },
        sort: ['name', '-createdAt'],
      }),
    ).toEqual({
      filters: undefined,
      limit: undefined,
      offset: undefined,
      sort: ['name', '-createdAt'],
    });
  });
});
