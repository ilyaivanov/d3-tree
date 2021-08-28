import { svgElem, circle, g, text, svgStyle, path } from "./svg";
import data, { MyItem } from "../data";
import { initViewportController } from "../viewportController";

const nodeSize = 20;
const circleRadius = 4.5;
const viewItem = (item: MyItem, index: number) => {
  const pathD = item.parent
    ? `M0,0H-${nodeSize}V-${
        (item.index! - item.parent.index!) * nodeSize - circleRadius
      }`
    : "";
  return g(
    [
      path({ d: pathD, stroke: "#4C5155", fill: "none" }),
      circle({ fill: "white", r: circleRadius }),

      text(item.name, { x: 10, dy: "0.32em" }),
    ],
    {
      transform: svgStyle.translate(
        nodeSize + 0.5 + item.level! * nodeSize,
        nodeSize + 0.5 + index * nodeSize
      ),
    }
  );
};

const flatNodes: MyItem[] = [];
let index = 0;
const mapChild = (item: MyItem, level: number) => {
  item.index = ++index;
  flatNodes.push(item);
  item.level = level;
  if (item.children)
    item.children.forEach((c) => {
      c.parent = item;
      mapChild(c, level + 1);
    });
};

mapChild(data, 0);

//RENDER
const frag = document.createDocumentFragment();
frag.append(...flatNodes.map(viewItem));

const svg = svgElem("svg");

svg.setAttribute("viewBox", `0 0 ${window.innerWidth} ${window.innerHeight}`);
svg.appendChild(frag);

document.body.appendChild(svg);

initViewportController(
  svg,
  { x: 0, y: 0 },
  {
    maxHeight: flatNodes.length * nodeSize,
  }
);
