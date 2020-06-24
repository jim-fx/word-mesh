import {
  select,
  forceSimulation,
  forceLink,
  forceManyBody,
  forceCenter,
  event,
  drag,
  scaleOrdinal,
  schemeCategory20,
} from "d3";
import store from "../resultStore";

const wrapper = document.querySelector("svg");

const svg = select("svg");

const { innerWidth: width, innerHeight: height } = window;
wrapper.setAttribute("width", width + "");
wrapper.setAttribute("height", height + "");
var color = scaleOrdinal();

const simulation = forceSimulation()
  .force(
    "link",
    forceLink().id(function (d) {
      return d.id;
    })
  )
  .force("charge", forceManyBody().strength(-80))
  .force("center", forceCenter(width / 2, height / 2));

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

const show = (term) => {
  const graph = store.get(term);

  wrapper.innerHTML = "";

  var link = svg
    .append("g")
    .attr("class", "links")
    .selectAll("line")
    .data(graph.edges)
    .enter()
    .append("line")
    .attr("stroke-width", function (d) {
      return Math.sqrt(d.value * 30);
    });

  var node = svg
    .append("g")
    .attr("class", "nodes")
    .selectAll("g")
    .data(graph.nodes)
    .enter()
    .append("g");

  var circles = node
    .append("circle")
    .attr("fill", function (d) {
      return `hsl(${d.group * 40}, 100%, 50%)`;
    })
    .attr("r", function (d) {
      return 15 - d.group * 3;
    })
    .call(
      drag().on("start", dragstarted).on("drag", dragged).on("end", dragended)
    );

  var lables = node.append("text").text(function (d) {
    return d.id;
  });

  node.append("title").text(function (d) {
    return d.id;
  });

  simulation.nodes(graph.nodes).on("tick", ticked);

  simulation.force("link").links(graph.edges);

  function ticked() {
    link
      .attr("x1", function (d) {
        return d.source.x;
      })
      .attr("y1", function (d) {
        return d.source.y;
      })
      .attr("x2", function (d) {
        return d.target.x;
      })
      .attr("y2", function (d) {
        return d.target.y;
      });

    node.attr("transform", function (d) {
      return "translate(" + d.x + "," + d.y + ")";
    });
  }
};

export default {
  show,
};
