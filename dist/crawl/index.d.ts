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
export declare function walkGraph(nodes: Node[], edges: Edge[]): {
    parent: Node;
    node: Node;
    edge: Edge;
}[];
export declare const calculateDistanceToRoot: (nodes: Node[], edges: Edge[]) => {
    edges: Edge[];
    nodes: Node[];
};
export declare const filterByDistance: (nodes: Node[], edges: Edge[], percentage: number) => {
    nodes: Node[];
    edges: Edge[];
};
export declare const crawl: (term: string, log?: (s: string, m: number, c: number) => void) => Promise<CrawlResult>;
export {};
