const prefix = "wm_";

export default function createStore<T>(): Store<T> {
  const keys = () =>
    Object.keys(localStorage)
      .filter((key) => key.includes(prefix))
      .map((key) => key.replace(prefix, ""));

  const cbs = {};

  function emit(event, data) {
    if (event in cbs) {
      cbs[event].forEach((cb) => cb(data));
    }
  }

  return {
    keys,
    has: (term) => prefix + term in localStorage,
    get: (term) => {
      const id = prefix + term;
      return id in localStorage
        ? JSON.parse(localStorage.getItem(prefix + term))
        : undefined;
    },
    add: (term, result) => {
      emit("new", { term, result });
      localStorage.setItem(prefix + term, JSON.stringify(result));
    },
    on: (event: string, cb) => {
      cbs[event] = event in cbs ? [...cbs[event], cb] : [cb];
    },
  };
}
