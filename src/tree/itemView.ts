import { svgElem, circle, g, text, path } from "../infra/svg";
import { dom, svg } from "../infra";
import * as anim from "../infra/anim";
import { MyItem } from "../items";
import { spacings } from "./constants";
import "greensock";

declare var gsap: any;

export class ItemView {
  public el: SVGElement;
  private children?: SVGElement;
  private path: SVGElement;
  private text: SVGElement;
  private circle: SVGElement;

  constructor(public item: MyItem, private onView: (view: ItemView) => void) {
    onView(this);

    this.children = this.renderChildren();

    this.path = path({ d: this.pathD(), stroke: "#4C5155", fill: "none" });
    this.text = text(item.name, { x: 10, dy: "0.32em", fill: "#dddddd" });

    const isEmpty = !item.children;
    this.circle = circle({
      fill: isEmpty ? "transparent" : "white",
      "stroke-width": isEmpty ? 1.5 : 2,
      stroke: isEmpty ? "white" : undefined,
      r: spacings.circleRadius,
    });
    this.el = g([this.path, this.circle, this.text, this.children], {
      transform: `translate(${this.localOffset()})`,
    });
  }

  private localOffset = (): [number, number] => {
    const { item } = this;
    const parentIndex = item.parent?.index || 0;
    const x = spacings.nodeSize;
    const y = (item.index! - parentIndex) * spacings.nodeSize;
    return [x, y];
  };

  private pathD = (): string =>
    this.item.parent
      ? `M0,0H-${spacings.nodeSize}V-${
          (this.item.index! - this.item.parent.index!) * spacings.nodeSize -
          spacings.circleRadius
        }`
      : "";

  //you can use clip-path to remove items in animation
  // https://bennettfeely.com/clippy
  public removeChildren() {
    if (this.children) {
      anim.removeViaTransparency(this.children, 250);
      this.children = undefined;
    }
  }

  public appendChildren() {
    this.children = this.renderChildren();
    if (this.children) {
      this.el.appendChild(this.children);
      anim.animateToOpaque(this.children, 250);
    }
  }

  public updatePositionInTree() {
    gsap.to(this.el, {
      attr: { transform: `translate(${this.localOffset()})` },
    });
    gsap.to(this.path, {
      attr: { d: this.pathD() },
    });
  }

  public select() {
    // this.text.setAttribute("font-weight", "bold");
    this.text.setAttribute("fill", "white");
  }

  public unselect() {
    // this.text.removeAttribute("font-weight");
    this.text.setAttribute("fill", "#dddddd");
  }

  public startEdit() {
    const input = dom.createRef("input");
    const textInput = svg.foreignObject(
      {
        x: 10,
        y: -10,
        height: spacings.nodeSize,
        width: 2000,
      },
      dom.input({
        value: this.item.name,
        className: "my-input",
        ref: input,
        onKeyDown: (e) => {
          e.stopPropagation();
          this.item.name = input.elem.value;
          if (e.code === "Escape" || e.code == "Enter") {
            this.stopEditing(textInput);
          }
        },
      })
    );
    this.text.remove();
    this.circle.insertAdjacentElement("afterend", textInput);
    input.elem.focus();
    input.elem.setSelectionRange(0, 0);
  }

  private stopEditing(elem: Element) {
    this.text.textContent = this.item.name;
    elem.remove();

    this.circle.insertAdjacentElement("afterend", this.text);
  }

  private renderChildren() {
    const { item } = this;
    return item.children && !item.isClosed
      ? g(
          item.children.map(
            (subitem, index) => new ItemView(subitem, this.onView).el
          )
        )
      : undefined;
  }
}
