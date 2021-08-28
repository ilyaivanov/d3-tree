import data from "./data";
import * as d3 from "d3";
import { initViewportController } from "./viewportController";

// https://observablehq.com/@d3/indented-tree@335

const format = d3.format(",");
const columns = [
  {
    label: "Size",
    value: (d: any) => d.value,
    format,
    x: 450,
  },
  {
    label: "Count",
    value: (d: any) => (d.children ? 0 : 1),
    format: (value: any, d: any) => (d.children ? format(value) : "-"),
    x: 540,
  },
];

//should be odd, checking why
const nodeSize = 19;

let i = 0;
const r = 3.5;
const lineWidth = 1;
const root = d3.hierarchy(data).eachBefore((d) => (d.data.index = i++));
const nodes = root.descendants();

const getViewbox = () =>
  [
    -nodeSize / 2,
    (-nodeSize * 3) / 2,
    window.innerWidth,
    window.innerHeight,
  ].join(" ");

const svg = d3
  .create("svg")
  .attr("viewBox", getViewbox())
  .attr("height", window.innerHeight)
  .attr("width", window.innerWidth)

  .style("overflow", "visible");

const link = svg
  .append("g")
  .attr("fill", "none")
  .attr("stroke", "#999")
  .attr("stroke-width", lineWidth)
  .selectAll("path")
  .data(root.links())
  .join("path")
  .attr(
    "d",
    (d) => `
          M${d.source.depth * nodeSize},${d.source.data.index! * nodeSize}
          V${d.target.data.index! * nodeSize}
          h${nodeSize}
        `
  );

const node = svg
  .append("g")
  .selectAll("g")
  .data(nodes)
  .join("g")
  .attr("transform", (d) => {
    return `translate(0,${d.data.index! * nodeSize})`;
  });

node
  .append("circle")
  .attr("cx", (d) => d.depth * nodeSize)
  .attr("r", r)
  .attr("fill", "#999");

node
  .append("text")
  .attr("dy", "0.32em")
  .attr("x", (d) => d.depth * nodeSize + 6)
  .text((d) => d.data.name);

node.append("title").text((d) =>
  d
    .ancestors()
    .reverse()
    .map((d) => d.data.name)
    .join("/")
);

for (const { label, value, format, x } of columns) {
  svg
    .append("text")
    .attr("dy", "0.32em")
    .attr("y", -nodeSize)
    .attr("x", x)
    .attr("text-anchor", "end")
    .attr("font-weight", "bold")
    .text(label);

  node
    .append("text")
    .attr("dy", "0.32em")
    .attr("x", x)
    .attr("text-anchor", "end")
    .attr("fill", (d) => (d.children ? null : "#555"))
    .data(root.copy().sum(value).descendants())
    .text((d) => format(d.value, d));
}

document.body.appendChild(svg.node()!);

initViewportController(
  svg.node()!,
  {
    x: -nodeSize / 2,
    y: (-nodeSize * 3) / 2,
  },
  { maxHeight: (i + 1) * nodeSize }
);
