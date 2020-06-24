import { Interpreter } from "xstate";

import "./spheres";
import graph from "../graph";

const { body } = document;

const e = {
  createButton: document.getElementById("create-new"),
  viewAll: document.getElementById("list-all"),
  all: document.getElementById("all"),
  input: document.getElementById("input"),
};

export default function (
  state: Interpreter<{
    currentTerm: any;
  }>
) {
  "state" in localStorage &&
    (document.body.className = `state-${localStorage.state}`);

  e.createButton.addEventListener("click", () => {
    state.send("CREATE");
  });

  e.viewAll.addEventListener("click", () => {
    state.send("VIEWALL");
  });

  e.input.addEventListener("keydown", (ev) => {
    if (ev.key === "Enter") {
      ev.preventDefault();

      const currentTerm = e.input.innerText.trim();
      //@ts-ignore;
      window.currentTerm = currentTerm;
      e.input.innerHTML = "";

      state.send("CREATED", { currentTerm });
    }
  });

  return {
    setState: (state, event) => {

      if (state.value === "viewSingle" && (event.currentTerm || event.data)) {
        graph.show(event.currentTerm || event.data);
      }

      document.body.className = `state-${state.value}`;
    },
  };
}
