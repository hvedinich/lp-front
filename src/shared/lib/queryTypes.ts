import type { UseMutationOptions, UseQueryOptions } from '@tanstack/react-query';

/**
 * MutationOptions — reusable lifecycle options type for custom mutation hooks.
 *
 * Picks the four lifecycle callbacks from React Query's `UseMutationOptions`
 * so callers can pass them without referencing internal RQ generics directly.
 *
 * Usage:
 *
 *   export const useCreateFoo = (options?: MutationOptions<Foo, FooPayload>) => {
 *     return useMutation<Foo, Error, FooPayload>({
 *       mutationFn: createFoo,
 *       ...options,
 *     });
 *   };
 *
 * Type parameters (Error is last since it is rarely customised — omit it in most cases):
 *   TData      — resolved data type returned by mutationFn
 *   TVariables — variables passed to mutationFn (default: void)
 *   TError     — error type (default: Error)
 */
export type MutationOptions<TData = void, TVariables = void, TError = Error> = Pick<
  UseMutationOptions<TData, TError, TVariables>,
  'onSuccess' | 'onError' | 'onSettled' | 'onMutate'
>;

export type MutationCallbacks<TData = void, TVariables = void, TError = Error> = MutationOptions<
  TData,
  TVariables,
  TError
>;

export interface MutationHookOptions<TScope, TData = void, TVariables = void, TError = Error> {
  options?: MutationOptions<TData, TVariables, TError>;
  scope: TScope;
}

/**
 * QueryOptions — reusable options type for custom query hooks.
 *
 * Picks the most commonly overridden fields from React Query's `UseQueryOptions`.
 * Note: in RQ v5, onSuccess/onError/onSettled callbacks were removed from useQuery;
 * side-effects should be handled in components via `useEffect` on the result.
 *
 * Usage:
 *
 *   export const useGetFoo = (id: string, options?: QueryOptions<Foo>) => {
 *     return useQuery<Foo>({
 *       queryKey: fooQueryKeys.detail(id),
 *       queryFn: () => getFoo(id),
 *       ...options,
 *     });
 *   };
 *
 * Type parameters follow the same order as `useQuery`:
 *   TData       — raw data returned by queryFn
 *   TError      — error type (default: Error)
 *   TSelectData — transformed data type after `select` (default: TData)
 */
export type QueryOptions<TData = unknown, TError = Error, TSelectData = TData> = Pick<
  UseQueryOptions<TData, TError, TSelectData>,
  | 'enabled'
  | 'staleTime'
  | 'gcTime'
  | 'retry'
  | 'refetchInterval'
  | 'refetchOnWindowFocus'
  | 'initialData'
  | 'select'
>;

type QueryScopeField<TScope> = [TScope] extends [void] ? { scope?: never } : { scope: TScope };

export type QueryHookOptions<
  TScope = void,
  TData = unknown,
  TError = Error,
  TSelectData = TData,
> = QueryScopeField<TScope> & {
  options?: QueryOptions<TData, TError, TSelectData>;
};
