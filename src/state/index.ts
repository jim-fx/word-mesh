import createStore from "./store";

export default function createState<T>(
  initialState: string = "initial"
): State<T> {
  let state = initialState;
  const store = createStore<T>();

  const cbs = {};

  const emit = (event: string, data: any) => {
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
    set: (nextState: string, value: Partial<T>) => {
      state = Object.assign(state, { ...value });
      emit("state", nextState);
      emit("state." + nextState, value);
    },
  };
}
