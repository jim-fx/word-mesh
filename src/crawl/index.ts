import store from "../resultStore";

interface Node {
  id: string;
  group: number;
}

interface Edge {
  source: string;
  target: string;
  value: number;
}

const cleanTerm = (term: string) => term.trim().toLowerCase().split(" ")[0];

async function request(term) {
  const res = await fetch(
    "https://cors-anywhere.herokuapp.com/google.com/complete/search?client=firefox&q=" +
    term +
    "%20vs",
    {
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  const json = await res.json();

  const terms = json[1];

  // console.log("CRAWL: " + term);

  const cleanTerms = terms
    .map((t) => t.replace(term + " vs ", ""))
    .map(cleanTerm);

  return cleanTerms;
}

const NodeStore = () => {
  const nodes: { [key: string]: Node } = {};

  return {
    has: (term) => term in nodes,
    get: () => JSON.parse(JSON.stringify(Object.values(nodes))),
    add: (term, parentNode?: Node) => {
      if (term in nodes) return nodes[term];
      else {
        let group = 0;
        if (parentNode) group = parentNode.group + 1;

        const newNode = {
          id: term,
          group,
        };
        nodes[term] = newNode;
        return newNode;
      }
    },
    size: () => Object.keys(nodes).length,
  };
};

const EdgeStore = () => {
  const edges: { [key: string]: Edge } = {};
  return {
    get: () => JSON.parse(JSON.stringify(Object.values(edges))),
    add: ({ id: _term1 }: Node, { id: _term2 }: Node) => {
      const [term1, term2] = [_term1, _term2].sort();

      const id = term1 + term2;

      if (id in edges) {
        edges[id].value += 1;
      } else {
        edges[id] = {
          source: term1,
          target: term2,
          value: 1,
        };
      }
    },
  };
};

async function handleSingleNode(
  nodeStore,
  edgeStore,
  rootNode
): Promise<Node[]> {
  const terms = await request(rootNode.id);

  const newNodes: Node[] = [];
  const oldNodes: Node[] = [];

  const allNodes = terms.map((t) => {
    const isNew = nodeStore.has(t);
    const newNode = nodeStore.add(t, rootNode);
    (isNew ? oldNodes : newNodes).push(newNode);
    return newNode;
  });

  allNodes.forEach((node) => edgeStore.add(rootNode, node));

  return newNodes;
}

const BATCH_SIZE = 5;
const MAX_AMOUNT = 100;

export default (term: string) =>
  new Promise((resolve, reject) => {
    term = cleanTerm(term);

    if (store.has(term)) return store.get(term);

    const nodeStore = NodeStore();
    const edgeStore = EdgeStore();

    const queue: Node[] = [nodeStore.add(term)];

    async function workQueue() {
      console.log("start");
      const currentBatchSize =
        nodeStore.size() + BATCH_SIZE > MAX_AMOUNT
          ? MAX_AMOUNT - nodeStore.size()
          : BATCH_SIZE;

      const batchNodes = queue.splice(0, currentBatchSize);

      //@ts-ignore
      const newNodes = await Promise.all(
        batchNodes.map((n) => handleSingleNode(nodeStore, edgeStore, n))
      );

      //@ts-ignore;
      queue.push(...newNodes.flat());

      console.log("end");

      if (queue.length && nodeStore.size() < MAX_AMOUNT) {
        workQueue();
      } else {
        const result = {
          nodes: nodeStore.get(),
          edges: edgeStore.get(),
        };

        setTimeout(() => {
          store.add(term, result);
          resolve(term);
        }, 500);
      }
    }

    workQueue();
  });
