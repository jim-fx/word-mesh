import "./sphere.scss";

interface transform {
  x: number;
  y: number;
  r: number;
  // next radius
  nr?: number;
  //Force vector
  fx?: number;
  fy?: number;
  //Last force vector
  lfx?: number;
  lfy?: number;
  // Next position;
  nx?: number;
  ny?: number;
}

interface sphere {
  t: transform;
  e: HTMLElement;
}

interface force {
  t: transform;
  s: number;
}

function needsCollisionCheck(t1: transform, t2: transform) {
  // if they are the same transform abort
  if (t1 === t2) return false;

  // Check the bounding box, because it is faster than the distance checking
  return (
    t1.x + t1.r + t2.r > t2.x &&
    t1.x < t2.x + t1.r + t2.r &&
    t1.y + t1.r + t2.r > t2.y &&
    t1.y < t2.y + t1.r + t2.r
  );
}

function lerp(a, b, v) {
  return (1 - v) * a + v * b;
}

function applyForce(t: transform, f: force) {
  const { t: fp, s: fs } = f;

  if (f.t.nr) {
    f.t.r = lerp(f.t.nr, f.t.r, 0.9);
    if (Math.abs(f.t.nr - f.t.r) < 0.1) {
      f.t.r = f.t.nr;
      f.t.nr = undefined;
    }
  }

  if (needsCollisionCheck(t, f.t)) {
    const vx = fp.x - t.x;
    const vy = fp.y - t.y;
    const distance = Math.hypot(vx, vy);
    const collisionDistance = (t.r + fp.r) / 2;

    if (distance <= collisionDistance) {
      const a = distance / collisionDistance;
      t.fx += vx * a * 0.05 * fs;
      t.fy += vy * a * 0.05 * fs;
    }
  }
}

export default function ({ wrapper }: { wrapper: HTMLElement }) {
  const { innerWidth: width, innerHeight: height } = window;
  let isUpdating = true;
  const spheres: sphere[] = [];
  const forces: force[] = [];

  function update() {
    isUpdating && requestAnimationFrame(update);

    spheres.forEach((s) => {
      s.t.fx = s.t.fx || 0;
      s.t.fy = s.t.fy || 0;
      forces.forEach((force) => applyForce(s.t, force));
    });

    // Apply the detected collisions
    spheres.forEach((s) => {
      // Do we even need to move?
      if (Math.abs(s.t.fx) + Math.abs(s.t.fy) > 0.5) {
        // Conserve some of the energy from the last iteration
        s.t.fx = lerp(s.t.lfx || 0, s.t.fx, 0.1) * 0.95;
        s.t.fy = lerp(s.t.lfy || 0, s.t.fy, 0.1) * 0.95;
        s.t.lfx = s.t.fx;
        s.t.lfy = s.t.fy;

        // Apply the force
        s.t.x += s.t.fx;
        s.t.y += s.t.fy;
        s.e.style.transform = `translate(${s.t.x - s.t.r / 2}px, ${
          s.t.y - s.t.r / 2
        }px)`;
      }
    });
  }
  update();

  const gravity = {
    t: {
      x: width / 2,
      y: height / 2,
      r: window.innerWidth * 2,
    },
    s: 0.4,
  };

  const center = {
    t: {
      x: width / 2,
      y: height / 2,
      r: 0,
    },
    s: -0.5,
  };

  forces.push(gravity);
  forces.push(center);

  return {
    start: () => {
      if (isUpdating) return;
      isUpdating = true;
      update();
    },
    stop: () => {
      isUpdating = false;
    },
    scaleCenter(scale: number) {
      center.t.r = scale;
    },
    addSphere: (term: string) => {
      const radius = 20 + term.length * 10;
      const transform = {
        x: width * Math.random(),
        y: height * Math.random(),
        r: radius,
      };

      const element = document.createElement("div");
      element.className = "sphere";
      element.style.width = radius + "px";
      element.style.height = radius + "px";
      element.innerHTML = term;
      wrapper.appendChild(element);

      forces.push({
        t: transform,
        s: -0.6,
      });

      const s = {
        t: transform,
        e: element,
      };
      spheres.push(s);
      return s;
    },
  };
}
