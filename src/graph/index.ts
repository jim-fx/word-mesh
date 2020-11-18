export interface Node {
  id: string;
  depth: number;
  /**
   * DistanceToRoot
   */
  dtr?: number;
}

export interface Edge {
  source: string;
  target: string;
  weight: number;
}

export interface Graph {
  root: string;
  nodes: Node[];
  edges: Edge[];
}

export function walkGraph(
  { nodes, edges }: Graph,
  cb: (res: { parent: Node; node: Node; edge: Edge }) => any
) {
  nodes
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
    .flat()
    .forEach(cb);
}

export const calculateDistanceToRoot = (graph: Graph) => {
  const { nodes, edges } = graph;

  const maxWeight = edges.reduce((a, b) => (a > b.weight ? a : b.weight), 0);

  let maxDistance = 0;

  const rootNode = nodes.find((n) => n.id === graph.root);

  rootNode.dtr = 0;

  // Calculate the distance to the root node, while taking
  // the weight of the single connections into account
  walkGraph(graph, ({ parent, node, edge }) => {
    if (node.id === graph.root) console.log(parent, node, edge);
    if (parent) {
      //We need to inverse the weight
      const distanceToRoot =
        (parent.dtr || 0) + node.depth + (maxWeight - edge.weight);

      maxDistance = Math.max(maxDistance, distanceToRoot);
      node.dtr = (node.dtr || 0) + distanceToRoot;
    }
  });

  return {
    edges,
    nodes,
  };
};

export const filterByDistanceToRoot = (
  { nodes, edges }: Graph,
  percentage: number
) => {
  const maxDistance = nodes.reduce((a, b) => (a > b.dtr ? a : b.dtr), 0);

  console.log("max distance to root " + maxDistance);

  //Remove a certain percentage of nodes
  const filteredNodes = nodes.filter((n) => n.dtr <= maxDistance * percentage);

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

export function addNode(graph: Graph, node: Node) {
  if (!graph.root) graph.root = node.id;
  console.log("Add node", node);
  graph.nodes.push(node);
}

export interface NodeStore {
  has: (term: any) => boolean;
  get: () => any;
  add(term: string, parentNode?: Node): Node;
  size: () => number;
}
export const createNodeStore = (graph: Graph) => {
  const nodes: { [key: string]: Node } = {};

  return {
    has: (term) => term in nodes,
    get: () => JSON.parse(JSON.stringify(Object.values(nodes))),
    add: (term: string, parentNode?: Node) => {
      if (term in nodes) return nodes[term];
      else {
        const depth = parentNode ? parentNode.depth + 1 : 0;

        const node = {
          id: term,
          depth,
        };
        nodes[term] = node;
        addNode(graph, node);
        return node;
      }
    },
    size: () => graph.nodes.length,
  };
};

export interface EdgeStore {
  get: () => any;
  add: ({ id: term1 }: Node, { id: term2 }: Node, weight?: number) => void;
}

export const createEdgeStore = (graph: Graph): EdgeStore => {
  const edges: { [key: string]: Edge } = {};
  return {
    get: () => JSON.parse(JSON.stringify(Object.values(edges))),
    add: ({ id: term1 }: Node, { id: term2 }: Node, weight = 1) => {
      const id = term1 + term2;
      const id2 = term2 + term1;
      if (id in edges) {
        edges[id].weight += weight;
        console.log(id);
      } else if (id2 in edges) {
        console.log(id2);
        edges[id2].weight += weight;
      } else {
        console.log("+" + id);
        const edge = {
          weight,
          source: term1,
          target: term2,
        };
        edges[id] = edge;
        graph.edges.push(edge);
      }
    },
  };
};

export function create(rootNode?: Node): Graph {
  if (rootNode) {
    return {
      root: rootNode.id,
      edges: [],
      nodes: [rootNode],
    };
  } else {
    return {
      root: "",
      edges: [],
      nodes: [],
    };
  }
}
