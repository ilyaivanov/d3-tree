import * as d3 from "d3";

const svg = d3.create("svg").style("overflow", "visible");

const assignSvgSize = () =>
  svg
    .attr("viewBox", [0, 0, window.innerWidth, window.innerHeight] as any)
    .attr("height", window.innerHeight)
    .attr("width", window.innerWidth);

assignSvgSize();

const max = 10000;
const GAP = 20;
const width = 20;
const rand = () => Math.random() * max;
const height = (val: number) => (val / max) * (window.innerHeight - GAP * 2);
let data = [951, 1000].concat(d3.range(30).map(rand));

const removeAt = (d: any, val: number) => {
  svg
    .selectAll("rect")
    //@ts-expect-error
    .data([val], (d: number) => d)
    .transition()
    .duration(1000)
    .ease(d3.easeQuadInOut)
    .attr("y", GAP);
};
const rects = svg
  .selectAll("rect")
  .data(data)
  .enter()
  .append("rect")
  .attr("fill", "gray")
  .attr("x", (d, i) => GAP + (width + GAP * 0.5) * i)
  .attr("y", (d) => window.innerHeight - height(d) - 20)
  .attr("height", (d) => height(d))
  .attr("width", width)
  .on("click", removeAt)
  .append("title")
  .text((d) => d3.format(".1f")(d));

const labels = svg
  .selectAll("text")
  .data(data)
  .enter()
  .append("text")
  .text((d) => (d / 1000).toFixed(1) + "k")
  .attr("x", (d, i) => GAP + (width + GAP * 0.5) * i + width / 2)
  .attr("y", (d) => window.innerHeight - 9)
  .attr("font-size", 10)
  .attr("text-anchor", "middle");

window.addEventListener("resize", () => {
  assignSvgSize();
});

document.body.appendChild(svg.node()!);
