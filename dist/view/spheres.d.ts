import "./sphere.scss";
import { Body } from "../physics/spheres";
export default function ({ wrapper }: {
    wrapper: HTMLElement;
}): {
    start: () => void;
    stop: () => void;
    scaleCenter(scale: number): void;
    setDampening: (v: any) => any;
    setSmoothing: (v: any) => any;
    addSphere: (term: string) => Body;
};
