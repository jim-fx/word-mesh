import "./sphere.scss";
export default function ({ wrapper }: {
    wrapper: HTMLElement;
}): {
    start: () => void;
    stop: () => void;
    scaleCenter(scale: number): void;
    addSphere: (term: string) => {
        t: {
            x: number;
            y: number;
            r: number;
        };
        e: HTMLDivElement;
    };
};
