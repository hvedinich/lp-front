interface VitestExpectMatcher {
  rejects: VitestExpectMatcher;
  resolves: VitestExpectMatcher;
  toBe: (value: unknown) => void;
  toBeInstanceOf: (constructor: abstract new (...args: never[]) => unknown) => void;
  toEqual: (value: unknown) => void;
}

interface VitestExpectStatic {
  (value: unknown): VitestExpectMatcher;
  objectContaining: (value: Record<string, unknown>) => unknown;
}

interface VitestMockApi {
  fn: <TArgs extends readonly unknown[] = readonly unknown[], TReturn = unknown>(
    implementation?: (...args: TArgs) => TReturn,
  ) => (...args: TArgs) => TReturn;
  resetModules: () => void;
  restoreAllMocks: () => void;
  stubGlobal: (key: string, value: unknown) => void;
  unstubAllGlobals: () => void;
  waitFor: (assertion: () => void | Promise<void>) => Promise<void>;
}

declare const afterEach: (fn: () => void | Promise<void>) => void;
declare const describe: (name: string, fn: () => void | Promise<void>) => void;
declare const expect: VitestExpectStatic;
declare const it: (name: string, fn: () => void | Promise<void>) => void;
declare const vi: VitestMockApi;
