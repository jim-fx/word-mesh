!function(t,e){"object"==typeof exports&&"undefined"!=typeof module?e(require("d3")):"function"==typeof define&&define.amd?define(["d3"],e):e(t.d3)}(this,function(t){var e=(t=t&&t.hasOwnProperty("default")?t.default:t).select("svg"),n=+e.attr("width"),r=+e.attr("height"),a=t.scaleOrdinal(t.schemeCategory20),o=t.forceSimulation().force("link",t.forceLink().id(function(t){return t.id})).force("charge",t.forceManyBody()).force("center",t.forceCenter(n/2,r/2));function i(e){t.event.active||o.alphaTarget(.3).restart(),e.fx=e.x,e.fy=e.y}function c(e){e.fx=t.event.x,e.fy=t.event.y}function f(e){t.event.active||o.alphaTarget(0),e.fx=null,e.fy=null}t.json("miserables.json",function(n,r){if(n)throw n;!function(n){var r=e.append("g").attr("class","links").selectAll("line").data(n.links).enter().append("line").attr("stroke-width",function(t){return Math.sqrt(t.value)}),u=e.append("g").attr("class","nodes").selectAll("g").data(n.nodes).enter().append("g");u.append("circle").attr("r",5).attr("fill",function(t){return a(t.group)}).call(t.drag().on("start",i).on("drag",c).on("end",f)),u.append("text").text(function(t){return t.id}).attr("x",6).attr("y",3),u.append("title").text(function(t){return t.id}),o.nodes(n.nodes).on("tick",function(){r.attr("x1",function(t){return t.source.x}).attr("y1",function(t){return t.source.y}).attr("x2",function(t){return t.target.x}).attr("y2",function(t){return t.target.y}),u.attr("transform",function(t){return"translate("+t.x+","+t.y+")"})}),o.force("link").links(n.links)}(r)})});
//# sourceMappingURL=bundle.umd.js.map