//@ts-nocheck
import "./graph.scss";
import {
  event,
  create,
  drag,
  forceSimulation,
  forceLink,
  forceManyBody,
  forceCenter,
  scaleOrdinal,
  schemeCategory10,
} from "d3";

import { filterByDistance, calculateDistanceToRoot } from "../crawl";

const { innerWidth: width, innerHeight: height } = window;

const _drag = (simulation) => {
  function dragstarted(d) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }

  function dragged(d) {
    d.fx = event.x;
    d.fy = event.y;
  }

  function dragended(d) {
    if (!event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
  }

  return drag()
    .on("start", dragstarted)
    .on("drag", dragged)
    .on("end", dragended);
};

const scale = scaleOrdinal(schemeCategory10);
const color = (d) => {
  return scale(d);
};

export default function ({ wrapper }: { wrapper: HTMLElement }) {
  const svg = create("svg").attr("viewBox", `0, 0, ${width}, ${height}`);

  let percentage = 1;
  let lastPercentage = 1;
  const range = document.createElement("input");
  range.type = "range";
  range.min = 0;
  range.max = 100;

  let updatePercentage = (val) => {};
  range.addEventListener("input", () => {
    percentage = parseInt(range.value) / 100;
    console.log(percentage);
    updatePercentage(percentage);
  });
  range.value = "100";
  wrapper.appendChild(range);

  const s = svg.node();
  wrapper.appendChild(s);

  let labelsHidden = false;
  window.addEventListener("keydown", ({ key }) => {
    if (key.toLowerCase() === "h") {
      labelsHidden = !labelsHidden;
      wrapper.classList[labelsHidden ? "add" : "remove"]("labels-hidden");
    }
  });

  let simulation;

  const clone = (obj) => JSON.parse(JSON.stringify(obj));

  const show = (graph) => {
    const clonedGraph = clone(graph);

    const { edges, nodes } = calculateDistanceToRoot(
      clonedGraph.nodes,
      clonedGraph.edges
    );

    const maxDistance = nodes.reduce((a, b) => (a > b.dtr ? a : b.dtr), 0);

    s.innerHTML = "";

    const maxDepth = nodes
      .map((n) => n.depth)
      .reduce((a, b) => (a > b ? a : b), 0);

    simulation = forceSimulation(nodes)
      .force(
        "link",
        forceLink(edges)
          .id((d) => d.id)
          .distance(70)
          .strength(1)
      )
      .force("charge", forceManyBody().strength(-20))
      .force("center", forceCenter(width / 2, height / 2));

    const link = svg
      .append("g")
      .attr("stroke", "#999")
      .attr("stroke-opacity", 0.6)
      .selectAll("line")
      .data(edges)
      .join("line")
      .attr("stroke-width", (d) => Math.sqrt(d.weight) * 2);

    var node = svg
      .append("g")
      .attr("class", "nodes")
      .selectAll("g")
      .data(nodes)
      .enter()
      .append("g");

    var circles = node
      .append("circle")
      .attr("r", function (d) {
        return 5 + (maxDepth - d.depth) * 3;
      })
      .attr("fill", function (d) {
        return color(d.depth);
      })
      .call(_drag(simulation));

    var lables = node
      .append("text")
      .text(function (d) {
        return d.id;
      })
      .attr("x", 6)
      .attr("y", 3);

    node.append("title").text((d) => d.id);

    updatePercentage = (perc) => {
      node.attr("visibility", (d) =>
        d.dtr > maxDistance * perc ? "hidden" : ""
      );
      link.attr("visibility", ({ target, source }) =>
        target.dtr > maxDistance * perc || source.dtr > maxDistance * perc
          ? "hidden"
          : ""
      );
    };

    simulation.on("tick", () => {
      link
        .attr("x1", (d) => d.source.x)
        .attr("y1", (d) => d.source.y)
        .attr("x2", (d) => d.target.x)
        .attr("y2", (d) => d.target.y);

      node.attr("transform", function (d) {
        return "translate(" + d.x + "," + d.y + ")";
      });
    });
  };

  return {
    show,
    stop: () => {
      simulation && simulation.stop();
    },
  };
}
