import "./index.scss";

import createState from "./state";
import createView from "./view";

const state = createState<CrawlResult>();

createView(state);
