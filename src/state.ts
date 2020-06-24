import { createMachine, interpret, assign } from "xstate";
import crawl from "./crawl";

const machine = createMachine({
  id: "toggle",
  initial: "viewAll",
  context: {
    currentTerm: null,
    error: null,
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
        VIEWALL: "viewAll",
        CREATE: "creating",
      },
    },
    loading: {
      invoke: {
        src: (context, event) => crawl(event.currentTerm),
        onDone: {
          target: "viewSingle",
        },
        onError: {
          target: "error",
          actions: assign({ error: (context, event) => event.data }),
        },
      },
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
        VIEWALL: "viewAll",
        CREATED: "loading",
      },
    },
  },
});

const swService = interpret(machine).start();

// @ts-ignore
window.service = swService;

export default swService;
