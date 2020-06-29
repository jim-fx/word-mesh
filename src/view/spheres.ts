import "./sphere.scss";
import { createScene, Body } from "../physics/spheres";
import { mouse } from "d3";

export default function ({ wrapper }: { wrapper: HTMLElement }) {
  const { innerWidth: width, innerHeight: height } = window;
  let isUpdating = true;

  const s = createScene({
    borders: [window.innerWidth, window.innerHeight],
  });

  const spheres = [];

  function update() {
    isUpdating && requestAnimationFrame(update);

    s.update();

    // Apply the calculated force vectors
    spheres.forEach(({ data: { e }, needsUpdate, p, r }) => {
      // If the force vector is small dont move
      if (needsUpdate) {
        e.style.transform = `translate(${p.x - r / 2}px, ${p.y - r / 2}px)`;
      }
    });
  }
  update();

  // Gravity
  s.addPointForce({
    p: {
      x: width / 2,
      y: height / 2,
    },
    r: window.innerWidth * 2,
    s: -2,
  });

  const center = s.addPointForce({
    p: {
      x: width / 2,
      y: height / 2,
    },
    r: 0,
    s: 8,
  });

  //@ts-ignore
  window.c = center;

  // Mouse direction
  const mouseDirectionForce = s.addDirectionalForce({
    p: {
      x: width / 2,
      y: height / 2,
    },
    vx: 1,
    vy: 1,
    r: 50,
    s: 1,
  });

  // Mouse attraction
  const mouseAttractionForce = s.addPointForce({
    p: {
      x: width / 2,
      y: height / 2,
    },
    r: 100,
    s: -2,
  });

  window.addEventListener("mousemove", ({ clientX: x, clientY: y }) => {
    mouseDirectionForce.p.x = x;
    mouseDirectionForce.p.y = y;
    mouseAttractionForce.p.x = x;
    mouseAttractionForce.p.y = y;
  });

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
      center.nr = scale;
    },
    setDampening: s.setDampening,
    setSmoothing: s.setSmoothing,
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

      // make the spheres push each other away
      s.addPointForce({
        p: transform,
        s: 4,
        r: radius,
      });

      // but also make them attract each other
      s.addPointForce({
        p: transform,
        s: -0.05,
        r: radius + 200,
      });

      const sphere = s.addBody({
        p: transform,
        r: radius,
        data: {
          e: element,
        },
      });

      spheres.push(sphere);

      return sphere;
    },
  };
}
