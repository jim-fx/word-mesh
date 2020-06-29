import "../@types";
import { forceManyBody } from "d3";

interface Position {
  x: number;
  y: number;
  //Force vector
  fx?: number;
  fy?: number;
  //Last force vector
  lfx?: number;
  lfy?: number;
  // Next position;
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

const enum ForceTypes {
  POINT,
  DIRECTIONAL,
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

function lerp(a, b, v) {
  return (1 - v) * a + v * b;
}

function needsCollisionCheck(t1: Body, t2: Force) {
  // if they are the same transform abort
  if (t1.p === t2.p || t2.r === 0) return false;

  // Check the bounding box, because it is faster than the (Math.hypot) distance checking
  return (
    t1.p.x + t1.r + t2.r > t2.p.x &&
    t1.p.x < t2.p.x + t1.r + t2.r &&
    t1.p.y + t1.r + t2.r > t2.p.y &&
    t1.p.y < t2.p.y + t1.r + t2.r
  );
}

function applyPointForce(b: Body, f: Force) {
  const vx = f.p.x - b.p.x;
  const vy = f.p.y - b.p.y;
  const distance = Math.hypot(vx, vy);
  const collisionDistance = (b.r + f.r) / 2;

  if (distance <= collisionDistance) {
    const a = distance / collisionDistance;
    b.p.fx -= vx * a * 0.05 * f.s;
    b.p.fy -= vy * a * 0.05 * f.s;
  }
}

function applyDirectionalForce(b: Body, f: DirectionalForce) {
  const vx = f.p.x - b.p.x;
  const vy = f.p.y - b.p.y;

  f.vx = lerp(f.p.lx - f.p.x, f.vx, 0.8) * 0.5;
  f.vy = lerp(f.p.ly - f.p.y, f.vy, 0.8) * 0.5;

  f.p.lx = f.p.x;
  f.p.ly = f.p.y;

  const distance = Math.hypot(vx, vy);
  const collisionDistance = (b.r + f.r) / 2;

  if (distance <= collisionDistance) {
    const a = distance / collisionDistance;
    b.p.fx += f.vx * a * -30 * f.s;
    b.p.fy += f.vy * a * -30 * f.s;
  }
}

function applyForce(b: Body, f: Force) {
  // Smoothly lerp the radius if it has changed
  if (f.nr !== undefined) {
    f.r = lerp(f.nr, f.r, 0.9);
    if (Math.abs(f.nr - f.r) < 0.1) {
      f.r = f.nr;
      f.nr = undefined;
    }
  }

  if (needsCollisionCheck(b, f)) {
    if (f.ty === ForceTypes.DIRECTIONAL) {
      applyDirectionalForce(b, f as DirectionalForce);
    } else if (f.ty === ForceTypes.POINT) {
      applyPointForce(b, f as PointForce);
    }
  }
}

export const createScene = ({
  dampening,
  smoothing,
  borders,
}: {
  dampening?: number;
  smoothing?: number;
  borders?: number[];
} = {}) => {
  const bodies: Body[] = [];
  const forces: Force[] = [];

  let DAMPENING = dampening ?? 0.9;
  let SMOOTHING = smoothing ?? 0.9;
  let BORDERS = borders ?? false;

  const update = () => {
    bodies.forEach((b) => forces.forEach((force) => applyForce(b, force)));

    // Apply the calculated force vectors
    bodies.forEach((s) => {
      // Conserve some of the energy from the last iteration
      s.p.fx = lerp(s.p.lfx || 0, s.p.fx, 1 - SMOOTHING);
      s.p.fy = lerp(s.p.lfy || 0, s.p.fy, 1 - SMOOTHING);

      // But also reduce the energy
      const slowDown = 0.8;
      s.p.fx *= slowDown;
      s.p.fy *= slowDown;

      s.p.lfx = s.p.fx;
      s.p.lfy = s.p.fy;

      if (BORDERS) {
        // Apply the force
        s.p.x = Math.max(Math.min(s.p.x + s.p.fx, BORDERS[0]), 0);
        s.p.y = Math.max(Math.min(s.p.y + s.p.fy, BORDERS[1]), 0);
      } else {
        // Apply the force
        s.p.x += s.p.fx;
        s.p.y += s.p.fy;
      }

      // If the force vector is small dont move
      if (Math.abs(s.p.lx - s.p.x) + Math.abs(s.p.ly - s.p.y) > 0.8) {
        s.needsUpdate = true;
        s.p.lx = s.p.x;
        s.p.ly = s.p.y;
      } else {
        s.needsUpdate = false;
      }
    });
  };

  return {
    update,
    setDampening: (v) => (DAMPENING = v),
    setSmoothing: (v) => (SMOOTHING = v),
    addBody: (b: Body) => {
      b.p.lx = 0;
      b.p.ly = 0;
      b.p.fx = b.p.fx || 0;
      b.p.fy = b.p.fy || 0;
      bodies.push(b);
      return b;
    },

    addForce: (f: Force) => {
      forces.push(f);
      return f;
    },

    addPointForce: (f: PointForce) => {
      f.ty = ForceTypes.POINT;
      forces.push(f);
      return f;
    },

    addDirectionalForce: (f: DirectionalForce) => {
      f.ty = ForceTypes.DIRECTIONAL;
      forces.push(f);
      f.p.lx = f.p.x;
      f.p.ly = f.p.y;
      return f;
    },
  };
};
