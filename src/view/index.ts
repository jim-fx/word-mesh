import "../@types";
import e from "./elements";

import crawl from "../crawl";
import loading from "./loading";

import { createGraph } from "../physics";
import createSpheres from "./spheres";

export default function (state: State<Await<ReturnType<typeof crawl>>>) {
  const sphereScene = createSpheres({ wrapper: e.all });
  const graphScene = createGraph({ wrapper: e.single });

  function addSphere(term) {
    const s = sphereScene.addSphere(term);
    s.data.e.addEventListener("click", () => {
      state.set("viewSingle", { currentTerm: term });
    });
    return s;
  }

  state.store.keys().forEach((term, i) => {
    setTimeout(() => addSphere(term), i * 400 * Math.random());
  });

  e.input.addEventListener("keydown", (ev) => {
    if (ev.key === "Enter") {
      ev.preventDefault();

      const currentTerm = e.input.innerText.trim();
      e.input.innerHTML = "";

      state.set("created", { currentTerm });
    }
  });

  e.createButton.addEventListener("click", () => {
    state.set("creating");
    e.input.focus();
  });

  e.viewAll.addEventListener("click", () => state.set("viewAll"));

  state.on("state.created", ({ currentTerm }) => {
    if (state.store.has(currentTerm)) {
      state.set("viewSingle", { currentTerm });
      return;
    }

    const s = addSphere(currentTerm);
    s.data.e.classList.add("loading");
    sphereScene.start();
    sphereScene.scaleCenter(0);

    const loader = loading();
    s.data.e.appendChild(loader.wrapper);

    crawl(currentTerm, (s, m, c) => {
      loader.set(c / m);
    })
      .then((result) => {
        loader.remove();
        s.data.e.classList.remove("loading");
        state.store.add(currentTerm, result);
        state.set("viewSingle", { currentTerm });
      })
      .catch((err) => {
        alert(err);
        s.data.e.classList.add("error");
        s.data.e.innerHTML = err;
      });
  });

  state.on("state.viewSingle", ({ currentTerm }) => {
    const graph = state.store.get(currentTerm);
    graphScene.show(graph);
  });

  window.addEventListener("keydown", ({ key }) => {
    if (key === "Escape") state.set("viewAll");
  });

  let int;
  state.on("state", (state) => {
    e.body.className = `state-${state}`;

    if (int) clearTimeout(int);

    if (state === "creating") {
      sphereScene.scaleCenter(
        Math.min(window.innerWidth, window.innerHeight) * 0.5
      );
      int = setTimeout(() => sphereScene.stop(), 10000);
      sphereScene.setDampening(0.99);
      sphereScene.setSmoothing(0.98);
    } else {
      if (state === "viewSingle") {
        sphereScene.stop();
      } else {
        sphereScene.start();
      }

      sphereScene.scaleCenter(0);
      sphereScene.setDampening(0.9);
      sphereScene.setSmoothing(0.9);
    }

    if (state !== "viewSingle") graphScene.stop();
  });
}
