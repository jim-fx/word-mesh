import * as G from "../graph";

const cleanResults = (rootTerm: string, results: string[]) => {
  return results.reduce((_res: string[], t) => {
    const terms = t
      .split(" vs ")
      .map((_t) => _t.split(" "))
      .flat()
      .reduce((res: string[], _t) => {
        _t = _t.toLowerCase();
        if (_t !== "vs" && _t !== rootTerm) {
          res.push(_t);
        }
        return res;
      }, []);

    if (terms[0]) _res.push(terms[0].trim());

    return _res;
  }, []);
};

const makeUrl = (term) =>
  "https://cors-anywhere.herokuapp.com/google.com/complete/search?client=firefox&q=" +
  term +
  "%20vs%20";

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

const handleSingleNode = (
  nodeStore: G.NodeStore,
  edgeStore: G.EdgeStore,
  rootNode
): Promise<G.Node[]> =>
  new Promise((resolve, reject) => {
    request(rootNode.id)
      .then((rawTerms) => cleanResults(rootNode.id, rawTerms))
      .then((filteredTerms) => {
        const topTerms = filteredTerms.splice(0, 5);

        const newNodes: G.Node[] = [];
        const oldNodes: G.Node[] = [];

        const allNodes = topTerms.map((t) => {
          const isNew = nodeStore.has(t);
          const newNode = nodeStore.add(t, rootNode);
          (isNew ? oldNodes : newNodes).push(newNode);
          return newNode;
        });

        allNodes.forEach((node, i) => edgeStore.add(rootNode, node, 5 - i));

        resolve(newNodes);
      })
      .catch(reject);
  });

const BATCH_SIZE = 5;
const MAX_AMOUNT = 50;
const createQueue = (nodeStore: G.NodeStore, edgeStore: G.EdgeStore) => {
  const queue: G.Node[] = [];
  let log;
  let workQueue;
  let i = 0;

  const promise = new Promise((res, rej) => {
    workQueue = () => {
      const currentBatchSize =
        nodeStore.size() + BATCH_SIZE > MAX_AMOUNT
          ? MAX_AMOUNT - nodeStore.size()
          : BATCH_SIZE;

      const currentBatch = queue.splice(0, currentBatchSize);

      Promise.allSettled(
        currentBatch.map((n) => handleSingleNode(nodeStore, edgeStore, n))
      )
        .then((result) => {
          queue.push(...result.map((n) => n.value).flat());
          log("a", MAX_AMOUNT, nodeStore.size());

          if (queue.length && nodeStore.size() < MAX_AMOUNT) {
            i++;
            workQueue();
          } else {
            res();
          }
        })
        .catch(rej);
    };
  });

  return {
    process: (n: G.Node) => {
      queue.push(n);
      workQueue();
      return promise;
    },
    setLog: (l) => (log = l),
  };
};

export const crawl = async (
  term: string,
  log: (s: string, m: number, c: number) => void = console.log
): Promise<G.Graph> => {
  const graph = G.create();
  const nodeStore = G.createNodeStore(graph);
  const edgeStore = G.createEdgeStore(graph);

  const rootNode = nodeStore.add(term);
  const queue = createQueue(nodeStore, edgeStore);
  queue.setLog(log);
  await queue.process(rootNode);

  console.log(graph);

  return graph;
};
