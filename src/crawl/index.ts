interface Node {
  id: string;
  depth: number;
  dtr?: number;
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
  }[];
}

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string
}

const cleanTerms = (term, terms: string[]) => {
  const escaped = escapeRegExp(term);
  const r1 = new RegExp(`^${escaped} vs `, "gm");
  const r2 = new RegExp(`^${escaped} `, "gm");
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
    add: ({ id: term1 }: Node, { id: term2 }: Node) => {
      const id = term1 + term2;
      const id2 = term2 + term1;
      if (id in edges) {
        edges[id].weight += 1;
      } else if (id2 in edges) {
        edges[id2].weight += 1;
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
const MAX_AMOUNT = 150;
const FILTER_PERCENTAGE = 0.5;

function walkGraph(nodes: Node[], edges: Edge[]) {
  return nodes
    .sort((a, b) => (a.depth > b.depth ? 1 : -1))
    .map((n) => {
      return edges
        .filter((e) => e.target === n.id)
        .map((e) => {
          return {
            parent: nodes.find((_n) => _n.id === e.source),
            node: n,
            edge: e,
          };
        });
    })
    .flat();
}

const finalFilter = (nodes: Node[], edges: Edge[]) => {
  const maxWeight = edges.reduce((a, b) => (a > b.weight ? a : b.weight), 0);

  let maxDistance = 0;
  const rootNode = nodes.find((n) => n.depth === 0);
  rootNode.dtr = 0;

  console.log("filtering " + nodes.length + " nodes");

  // Calculate the distance to the root node, while taking
  // the weight of the single connections into account
  walkGraph(nodes, edges).forEach(({ parent, node, edge }) => {
    console.log(node.depth, parent, node, edge);
    if (!parent) {
      //RootNode
      node.dtr = 0;
    } else {
      //We need to inverse the weight
      const distanceToRoot =
        (parent.dtr || 0) + node.depth + (maxWeight - edge.weight);

      maxDistance = Math.max(maxDistance, distanceToRoot);
      node.dtr = (node.dtr || 0) + distanceToRoot;
    }
  });

  console.log("max distance to root " + maxDistance);

  //Remove a certain percentage of nodes
  const filteredNodes = nodes
    .sort((a, b) => (a.dtr > b.dtr ? 1 : -1))
    .slice(0, Math.floor(nodes.length * FILTER_PERCENTAGE));

  const nodeIds = {};
  filteredNodes.forEach((n) => {
    nodeIds[n.id] = true;
  });

  console.log(
    "filtered out " + (nodes.length - filteredNodes.length) + " nodes"
  );

  //Filter out all edges which connect to removed nodes;
  const filteredEdges = edges.filter(
    (e) => e.source in nodeIds && e.target in nodeIds
  );

  return { nodes: filteredNodes, edges: filteredEdges };
};

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
            const { nodes, edges } = finalFilter(
              nodeStore.get(),
              edgeStore.get()
            );

            resolve({
              term,
              nodes,
              edges,
            });
          }
        })
        .catch(reject);
    }
    workQueue();
  });
