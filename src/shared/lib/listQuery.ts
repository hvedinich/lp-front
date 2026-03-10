type ListQueryPrimitive = string | number | boolean | null | undefined;

export type ListQueryFilters = Record<string, ListQueryPrimitive>;

export type ListSortToken<TSortField extends string> = TSortField | `-${TSortField}`;

export interface ListQueryParams<
  TFilters extends ListQueryFilters,
  TSortField extends string = never,
> {
  filters?: Partial<TFilters>;
  limit?: number;
  offset?: number;
  sort?: ListSortToken<TSortField> | Array<ListSortToken<TSortField>>;
}

const isPresent = (value: ListQueryPrimitive): value is string | number | boolean =>
  value !== undefined && value !== null;

const appendPrimitive = (searchParams: URLSearchParams, key: string, value: ListQueryPrimitive) => {
  if (!isPresent(value)) {
    return;
  }

  searchParams.set(key, String(value));
};

export const buildListQueryString = <
  TFilters extends ListQueryFilters,
  TSortField extends string = never,
>(
  params: ListQueryParams<TFilters, TSortField> = {},
): string => {
  const searchParams = new URLSearchParams();

  if (params.filters) {
    for (const [key, value] of Object.entries(params.filters)) {
      appendPrimitive(searchParams, `filter[${key}]`, value);
    }
  }

  if (params.sort) {
    const sortValue = Array.isArray(params.sort) ? params.sort.join(',') : params.sort;
    appendPrimitive(searchParams, 'sort', sortValue);
  }

  appendPrimitive(searchParams, 'limit', params.limit);
  appendPrimitive(searchParams, 'offset', params.offset);

  const query = searchParams.toString();
  return query.length > 0 ? `?${query}` : '';
};

export const normalizeListQueryParams = <
  TFilters extends ListQueryFilters,
  TSortField extends string = never,
>(
  params: ListQueryParams<TFilters, TSortField> = {},
): ListQueryParams<TFilters, TSortField> => {
  const normalizedFilters = params.filters
    ? Object.fromEntries(
        Object.entries(params.filters).filter(([, value]) => value !== undefined && value !== null),
      )
    : undefined;

  return {
    filters:
      normalizedFilters && Object.keys(normalizedFilters).length > 0
        ? (normalizedFilters as Partial<TFilters>)
        : undefined,
    limit: params.limit,
    offset: params.offset,
    sort: Array.isArray(params.sort) ? [...params.sort] : params.sort,
  };
};
