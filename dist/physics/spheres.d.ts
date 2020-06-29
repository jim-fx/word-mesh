import "../@types";
interface Position {
    x: number;
    y: number;
    fx?: number;
    fy?: number;
    lfx?: number;
    lfy?: number;
    nx?: number;
    ny?: number;
    lx?: number;
    ly?: number;
}
export interface Body {
    p: Position;
    r: number;
    data: any;
    needsUpdate?: boolean;
}
declare const enum ForceTypes {
    POINT = 0,
    DIRECTIONAL = 1
}
interface Force {
    p: Position;
    data?: any;
    ty?: ForceTypes;
    /**
     * Strength
     */
    s: number;
    /**
     *
     */
    r: number;
    nr?: number;
}
interface DirectionalForce extends Force {
    vx: number;
    vy: number;
}
interface PointForce extends Force {
    r: number;
}
export declare const createScene: ({ dampening, smoothing, borders, }?: {
    dampening?: number;
    smoothing?: number;
    borders?: number[];
}) => {
    update: () => void;
    setDampening: (v: any) => any;
    setSmoothing: (v: any) => any;
    addBody: (b: Body) => Body;
    addForce: (f: Force) => Force;
    addPointForce: (f: PointForce) => PointForce;
    addDirectionalForce: (f: DirectionalForce) => DirectionalForce;
};
export {};
