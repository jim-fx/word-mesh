interface Store<T> {
  keys: () => string[];
  has: (term: any) => boolean;
  get: (term: any) => any;
  add: (term: any, result: T) => void;
  on: (
    event: string,
    cb: (result: T | T[] | string[] | string) => void
  ) => void;
}

interface State<T> {
  store: Store<T>;
  current: string;
  on(event: string, cb);
  set(state: string, value?: any);
}

type Await<T> = T extends {
  then(onfulfilled?: (value: infer U) => unknown): unknown;
}
  ? U
  : T;

declare interface PromiseConstructor {
  allSettled(
    promises: Array<Promise<any>>
  ): Promise<
    Array<{ status: "fulfilled" | "rejected"; value?: any; reason?: any }>
  >;
}
