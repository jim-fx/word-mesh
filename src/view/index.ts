import e from "./elements";
import "../types";
import crawl from "../crawl";

import { createGraph, createSpheres } from "../physics";
import loading from "./loading";

export default function (state: State<CrawlResult>) {
  const sphereScene = createSpheres({ wrapper: e.all });
  const graphScene = createGraph({ wrapper: e.single });

  function addSphere(term) {
    const s = sphereScene.addSphere(term);
    s.e.addEventListener("click", () => {
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
    const s = addSphere(currentTerm);
    s.e.classList.add("loading");
    sphereScene.start();
    sphereScene.scaleCenter(200);

    const loader = loading();
    s.e.appendChild(loader.wrapper);

    crawl(currentTerm, (s, m, c) => {
      loader.set(c / m);
    })
      .then((result) => {
        loader.remove();
        s.e.classList.remove("loading");
        state.store.add(currentTerm, result);
        state.set("viewSingle", { currentTerm });
      })
      .catch((err) => {
        console.error(err);
        alert(err);
        s.e.classList.add("error");
        s.e.innerHTML = err;
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

    if (state === "viewAll") {
      sphereScene.start();
      sphereScene.scaleCenter(0);
    } else {
      sphereScene.scaleCenter(
        Math.min(window.innerWidth, window.innerHeight) * 0.5
      );
      int = setTimeout(() => sphereScene.stop(), 10000);
    }

    if (state !== "viewSingle") graphScene.stop();
  });
}
