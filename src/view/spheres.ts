import {
  select,
  forceSimulation,
  forceX,
  forceY,
  forceManyBody,
  forceCenter,
  forceCollide,
  event,
  drag
} from "d3";
import store from "../resultStore";
import state from "../state";


var width = window.innerWidth, height = window.innerHeight;
let graph;

var svg = select("#all")
  .append("svg")
  .attr("width", width)
  .attr("height", height);

var simulation = forceSimulation()
  .force("forceX", forceX().strength(.2).x(width * .5))
  .force("forceY", forceY().strength(.2).y(height * .5))
  .force("center", forceCenter().x(width * .5).y(height * .5))
  .force("charge", forceManyBody().strength(0));

let dx, dy;

function dragstarted(d) {
  dx = d.x;
  dy = d.y;
  if (!event.active) simulation.alphaTarget(.1).restart();
  d.fx = d.x;
  d.fy = d.y;
}

function dragged(d) {
  d.fx = event.x;
  d.fy = event.y;
}

function dragended(d) {

  if (!event.active) simulation.alphaTarget(.1);
  d.fx = null;
  d.fy = null;

  if (Math.abs(dx - d.x) + Math.abs(dy - d.y) < 1) {
    state.send("VIEWSINGLE", { currentTerm: d.id });
  }
}

function init() {

  const graph = store.keys().map(k => {
    return {
      id: k,
      radius: 5 + k.length * 10,
    }
  })

  //update the simulation based on the data
  simulation
    .nodes(graph)
    .force("collide", forceCollide().strength(1).radius(d => d.radius).iterations(1))
    .on("tick", function () {
      node
        .attr("transform", d => {
          console.log(d.vx);
          return "translate(" + d.x + "," + d.y + ")"
        })
    });

  var node = svg
    .selectAll("g")
    .data(graph)
    .enter()
    .append("g");

  var circles = node
    .append("circle")
    .attr("r", function (d) { return d.radius; })
    .attr("cx", function (d) { return d.x; })
    .attr("cy", function (d) { return d.y; })
    .call(drag()
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended));


  node.append("text").text(function (d) {
    return d.id;
  })
}

init();