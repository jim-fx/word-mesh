import Matter, {
  Engine,
  Runner,
  World,
  Common,
  Bodies,
  Body,
  Composite,
} from "matter-js";
import attractor from "matter-attractors";
import store from "../resultStore";
import state from "../state";

Matter.use(attractor);

const wrapper = document.getElementById("all");
const { innerWidth: width, innerHeight: height } = window;

// create engine
var engine = Engine.create();

// create runner
var runner = Runner.create();
Runner.run(runner, engine);

// create demo scene
var world = engine.world;
world.gravity.scale = 0;

// create a body with an attractor
var attractiveBody = Bodies.circle(width / 2, height / 2, 1, {
  isStatic: true,
  plugin: {
    attractors: [
      function (bodyA, bodyB) {
        return {
          x: (bodyA.position.x - bodyB.position.x) * 1e-5,
          y: (bodyA.position.y - bodyB.position.y) * 1e-5,
        };
      },
    ],
  },
});

attractiveBody.scale = 1;
attractiveBody.setScale = (scale) => {
  const s = scale / attractiveBody.scale;
  Body.scale(attractiveBody, s, s);
  attractiveBody.scale *= s;
};

World.add(world, attractiveBody);

const bodies = [];

function addCircle({
  radius = Common.random(10, 100),
  x = Common.random(0, width),
  y = Common.random(0, height),
  text = "",
} = {}) {
  if (text) radius = text.length * 10;

  var body = Bodies.circle(x, y, radius);
  body.lastPos = {
    x: 0,
    y: 0,
  };
  body.radius = radius;

  const element = document.createElement("div");
  element.classList.add("sphere");
  element.style.width = radius + "px";
  element.style.height = radius + "px";
  wrapper.appendChild(element);

  if (text) {
    element.innerHTML = text;
  }

  element.addEventListener("click", (ev) => {
    state.send("VIEWSINGLE", { currentTerm: text });
  });

  body.scale = 2;
  body.setScale = (scale) => {
    const s = scale / body.scale;
    Body.scale(body, s, s);
    body.scale *= s;
  };

  body.remove = function () {
    element.remove();
    Composite.remove(world, body);
  };

  body.element = element;

  World.add(world, body);

  return body;
}

store.keys().forEach((key) => {
  bodies.push(addCircle({ text: key }));
});

store.on("new", ({ term }) => {
  bodies.push(addCircle({ text: term }));
});

function update() {
  requestAnimationFrame(update);

  for (let i = 0; i < bodies.length; i++) {
    const body = bodies[i];

    const abs =
      Math.abs(body.lastPos.x - body.position.x) +
      Math.abs(body.lastPos.y - body.position.y);

    body.lastPos.x = body.position.x;
    body.lastPos.y = body.position.y;

    if (abs > 0.03) {
      body.element.style.transform = `translate(${
        body.position.x - body.radius / 2
      }px, ${body.position.y - body.radius / 2}px) scale(${body.scale})`;
    }
  }
}

update();

export default {
  setState: (state) => {
    if (state === "creating") {
      attractiveBody.setScale(150);
    } else {
      attractiveBody.setScale(1);
    }
  },
  addCircle,
  reset: () => {},
};
