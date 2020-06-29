interface Store<T> {
    keys: () => string[];
    has: (term: any) => boolean;
    get: (term: any) => any;
    add: (term: any, result: T) => void;
    on: (event: string, cb: (result: T | T[] | string[] | string) => void) => void;
}
interface State<T> {
    store: Store<T>;
    current: string;
    on(event: string, cb: any): any;
    set(state: string, value?: any): any;
}
declare type Await<T> = T extends {
    then(onfulfilled?: (value: infer U) => unknown): unknown;
} ? U : T;
