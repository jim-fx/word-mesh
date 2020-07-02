import createStore from "./store";

export default function createState<T>(
  initialState: string = "initial"
): State<T> {
  let state = initialState;
  let value = {} as T;
  const store = createStore<T>();

  const cbs = {};

  const emit = (event: string, data?: any) => {
    event in cbs && cbs[event].forEach((cb) => cb(data));
  };

  return {
    store,
    get current() {
      return state;
    },
    on: (event: string, cb) => {
      cbs[event] = event in cbs ? [...cbs[event], cb] : [cb];
    },
    set: (nextState: string, nextValue: Partial<T> = {}) => {
      value = Object.assign(value, { ...nextValue });
      emit("state.out." + state, {});
      emit("state", nextState);
      emit("state." + nextState, value);
      state = nextState;
    },
  };
}
