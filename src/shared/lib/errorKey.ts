interface CreateErrorKeyResolverOptions<TCode extends string, TKey extends string> {
  fallbackKey: TKey;
  keyMap: Partial<Record<TCode, TKey>>;
}

interface ErrorWithCode<TCode extends string> {
  code: TCode;
}

export const createErrorKeyResolver =
  <TCode extends string, TKey extends string>({
    fallbackKey,
    keyMap,
  }: CreateErrorKeyResolverOptions<TCode, TKey>) =>
  (error: ErrorWithCode<TCode> | null | undefined): TKey | null => {
    if (!error) {
      return null;
    }

    return keyMap[error.code] ?? fallbackKey;
  };
