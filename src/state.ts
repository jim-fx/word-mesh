import { createMachine, interpret, assign } from "xstate";

const machine = createMachine({
  id: "toggle",
  initial: "viewAll",
  context: {
    currentTerm: null,
  },
  states: {
    viewAll: {
      on: {
        CREATE: "creating",
        VIEWSINGLE: "viewSingle",
      },
    },
    viewSingle: {
      on: {
        EXIT: "viewAll",
        CREATE: "creating",
      },
    },
    loading: {
      on: {
        ERROR: "error",
        SUCCESS: "viewSingle",
        CANCEL: "viewAll",
      },
    },
    error: {
      on: {
        TRY: "creating",
        CANCEL: "viewAll",
      },
    },
    creating: {
      on: {
        CREATED: "loading",
      },
    },
  },
});

const swService = interpret(machine)
  .onTransition((state) => console.log(state.value))
  .start();

export default swService;
