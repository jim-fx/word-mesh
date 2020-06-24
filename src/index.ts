import graph from "./graph";
import crawl from "./crawl";
import state from "./state";
import createView from "./view";

const v = createView(state);

state.onTransition((state, event) => {
  v.setState(state, event);
});
