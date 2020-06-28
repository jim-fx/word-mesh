import "./graph.scss";
export default function ({ wrapper }: {
    wrapper: HTMLElement;
}): {
    show: (graph: any) => void;
    stop: () => void;
};
