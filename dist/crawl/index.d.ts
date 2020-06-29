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
declare const _default: (term: string, log?: (s: string, m: number, c: number) => void) => Promise<CrawlResult>;
export default _default;
