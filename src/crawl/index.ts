interface Node {
  id: string;
  depth: number;
}

interface Edge {
  source: string;
  target: string;
  weight: number;
}

interface CrawlResult {
  term: string;
  nodes: {
    id: string;
    depth: number;
  }[];
  edges: {
    source: string;
    target: string;
    weight: number;
  };
}

const cleanTerms = (term, terms: string[]) => {
  const r1 = new RegExp(`^${term} vs `, "gm");
  const r2 = new RegExp(`^${term} `, "gm");
  return terms.map((t) => t.replace(r1, "").replace(r2, ""));
};

const makeUrl = (term) =>
  "https://cors-anywhere.herokuapp.com/google.com/complete/search?client=firefox&q=" +
  term +
  "%20vs";

const request = (term): Promise<string[]> =>
  new Promise((resolve, reject) => {
    fetch(makeUrl(term))
      .then((res) => {
        if (res.ok) {
          res.json().then((j) => resolve(j[1]));
        } else {
          reject(res.statusText);
        }
      })
      .catch(reject);
  });

const NodeStore = () => {
  const nodes: { [key: string]: Node } = {};

  return {
    has: (term) => term in nodes,
    get: () => JSON.parse(JSON.stringify(Object.values(nodes))),
    add: (term, parentNode?: Node) => {
      if (term in nodes) return nodes[term];
      else {
        let depth = 0;
        if (parentNode) depth = parentNode.depth + 1;

        const newNode = {
          id: term,
          depth,
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
        edges[id].weight += 1;
      } else {
        edges[id] = {
          source: term1,
          target: term2,
          weight: 1,
        };
      }
    },
  };
};

const handleSingleNode = (nodeStore, edgeStore, rootNode): Promise<Node[]> =>
  new Promise((resolve, reject) => {
    request(rootNode.id)
      .then((rawTerms) => cleanTerms(rootNode.id, rawTerms))
      .then((terms) => {
        const newNodes: Node[] = [];
        const oldNodes: Node[] = [];

        const allNodes = terms.map((t) => {
          const isNew = nodeStore.has(t);
          const newNode = nodeStore.add(t, rootNode);
          (isNew ? oldNodes : newNodes).push(newNode);
          return newNode;
        });

        allNodes.forEach((node) => edgeStore.add(rootNode, node));

        resolve(newNodes);
      })
      .catch(reject);
  });

const BATCH_SIZE = 5;
const MAX_AMOUNT = 100;

export default (
  term: string,
  log: (s: string, m: number, c: number) => void = () => {}
): Promise<CrawlResult> =>
  new Promise((resolve, reject) => {
    const nodeStore = NodeStore();
    const edgeStore = EdgeStore();

    const queue: Node[] = [nodeStore.add(term)];

    function workQueue() {
      const currentBatchSize =
        nodeStore.size() + BATCH_SIZE > MAX_AMOUNT
          ? MAX_AMOUNT - nodeStore.size()
          : BATCH_SIZE;

      const batchNodes = queue.splice(0, currentBatchSize);

      Promise.all(
        batchNodes.map((n) => handleSingleNode(nodeStore, edgeStore, n))
      )
        .then((newNodes) => {
          //@ts-ignore
          queue.push(...newNodes.flat());
          log("a", MAX_AMOUNT, nodeStore.size());

          if (queue.length && nodeStore.size() < MAX_AMOUNT) {
            workQueue();
          } else {
            setTimeout(() => {
              resolve({
                term,
                nodes: nodeStore.get(),
                edges: edgeStore.get(),
              });
            }, 500);
          }
        })
        .catch(reject);
    }
    workQueue();
  });
