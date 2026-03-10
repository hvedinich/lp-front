import { useMemo } from 'react';
import type { NextRouter } from 'next/router';
import type { ParsedUrlQuery } from 'querystring';

interface QueryEntityModalControllerOptions {
  isReady?: boolean;
  newValue: string;
  pathname: string;
  query: ParsedUrlQuery;
  queryKey: string;
  replace: NextRouter['replace'];
}

export interface QueryEntityModalState {
  editId: string | null;
  isCreate: boolean;
  isOpen: boolean;
  rawValue: string | null;
}

export interface QueryEntityModalController extends QueryEntityModalState {
  close: () => Promise<void>;
  openCreate: () => Promise<void>;
  openEdit: (id: string) => Promise<void>;
}

interface UseQueryEntityModalStateOptions {
  newValue: string;
  queryKey: string;
  router: NextRouter;
}

export const getSingleQueryValue = (value: ParsedUrlQuery[string]): string | null => {
  if (typeof value === 'string') {
    const normalizedValue = value.trim();
    return normalizedValue.length > 0 ? normalizedValue : null;
  }

  return null;
};

export const resolveQueryEntityModalState = (
  rawValue: string | null,
  newValue: string,
): QueryEntityModalState => {
  const isCreate = rawValue === newValue;
  const editId = rawValue && rawValue !== newValue ? rawValue : null;

  return {
    editId,
    isCreate,
    isOpen: rawValue !== null,
    rawValue,
  };
};

export const buildNextQuery = (
  query: ParsedUrlQuery,
  queryKey: string,
  value: string | null,
): ParsedUrlQuery => {
  if (value === null) {
    const restQuery = { ...query };
    delete restQuery[queryKey];
    return restQuery;
  }

  return {
    ...query,
    [queryKey]: value,
  };
};

export const createQueryEntityModalController = ({
  isReady,
  newValue,
  pathname,
  query,
  queryKey,
  replace,
}: QueryEntityModalControllerOptions): QueryEntityModalController => {
  const rawValue = getSingleQueryValue(query[queryKey]);
  const state = resolveQueryEntityModalState(rawValue, newValue);

  const replaceValue = async (value: string | null) => {
    if (isReady === false) {
      return;
    }

    if (rawValue === value) {
      return;
    }

    const nextQuery = buildNextQuery(query, queryKey, value);

    await replace(
      {
        pathname,
        query: nextQuery,
      },
      undefined,
      { shallow: true },
    );
  };

  return {
    ...state,
    close: () => replaceValue(null),
    openCreate: () => replaceValue(newValue),
    openEdit: (id: string) => {
      const normalizedId = id.trim();

      if (normalizedId.length === 0) {
        return replaceValue(null);
      }

      return replaceValue(normalizedId);
    },
  };
};

export const useQueryEntityModalState = ({
  newValue,
  queryKey,
  router,
}: UseQueryEntityModalStateOptions): QueryEntityModalController => {
  return useMemo(
    () =>
      createQueryEntityModalController({
        isReady: router.isReady,
        newValue,
        pathname: router.pathname,
        query: router.query,
        queryKey,
        replace: router.replace,
      }),
    [newValue, queryKey, router.isReady, router.pathname, router.query, router.replace],
  );
};
