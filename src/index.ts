import "./index.scss";

import crawl from "./crawl";
import createState from "./state";
import createView from "./view";

const state = createState<CrawlResult>();

createView(state);

state.on("created", (currentTerm) => {});

state.on("loading", () => {});
