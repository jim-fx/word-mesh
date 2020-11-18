import "./index.scss";

import { crawl } from "./crawl";
import createState from "./state";
import createView from "./view";

const state = createState<Await<ReturnType<typeof crawl>>>();

createView(state);
