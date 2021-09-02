import { rect, svgElem } from "../infra/svg";
import { MyItem } from "../items";
import { ItemView } from "./itemView";
import * as items from "../items";
import { ViewportController } from "./viewportController";
import { spacings } from "./constants";
import { css, dom, style } from "../infra";
import { clamp } from "../infra/vector";
import "greensock";

export const viewTree = (data: MyItem) => {
  return new TreeView(data).el;
};

class TreeView {
  itemMap: WeakMap<MyItem, ItemView> = new WeakMap();

  flatNodes: MyItem[] = [];
  selectedItemIndex = 0;
  svg: SVGSVGElement;
  el: Element;
  scrollbar: Scrollbar;
  viewportController: ViewportController;
  constructor(private root: MyItem) {
    this.svg = svgElem("svg");
    this.scrollbar = new Scrollbar();
    this.el = dom.div({}, [this.svg, this.scrollbar.el]);

    this.updateIndexes();
    this.scrollbar.setTrackerHeight(
      (window.innerHeight / this.canvasSize) * 100
    );

    const rootG = new ItemView({
      item: root,
      isFocusRoot: true,
      onView: (item) => this.itemMap.set(item.item, item),
    }).el;

    this.svg.appendChild(rootG);

    this.viewportController = new ViewportController(
      this.svg,
      this.onScroll,
      this.canvasSize
    );
    this.scrollbar.onDrag((windowOffset) => {
      this.viewportController.setOffset(
        (windowOffset / window.innerHeight) *
          (this.canvasSize - window.innerHeight + 150)
      );
    });

    this.selectItemAt(this.selectedItemIndex);
    document.addEventListener("keydown", this.onKeyDown);
  }

  private updateIndexes = () => {
    this.flatNodes = items.createFlatItems(this.root);
  };

  private toggleSelectedItemVisibility = () => {
    const item = this.flatNodes[this.selectedItemIndex];
    item.isClosed = !item.isClosed;
    if (item.isClosed) this.itemMap.get(item)?.removeChildren();
    else this.itemMap.get(item)?.appendChildren();
    this.updateIndexes();
    items.getAllItemsAfter(item).forEach((next) => {
      this.itemMap.get(next)?.updatePositionInTree();
    });
  };

  private selectItemAt = (newIndex: number) => {
    const { flatNodes } = this;
    const itemToUnselect = flatNodes[this.selectedItemIndex];
    this.actionOnView(itemToUnselect, (view) => view.unselect());
    this.selectedItemIndex = newIndex;
    const itemToSelect = flatNodes[this.selectedItemIndex];
    this.actionOnView(itemToSelect, (view) => view.select());
  };

  private onKeyDown = (e: KeyboardEvent) => {
    const { selectedItemIndex, flatNodes, itemMap } = this;
    if (e.code === "ArrowRight" && e.altKey && e.shiftKey) {
      const item = flatNodes[selectedItemIndex];

      const y = (item.index! - 1) * spacings.nodeVerticalDistance;
      const x = item.level! * spacings.nodeHorizontalDistance;

      this.viewportController.shiftTo({ x, y });
      (this.svg.childNodes[0] as SVGElement).setAttribute("fill", "red");
      this.actionOnView(flatNodes[selectedItemIndex], (view) => view.focus());

      this.actionOnView(flatNodes[selectedItemIndex], (view) => {
        const mask = svgElem("mask");
        mask.id = "myMask";
        const rectToAnimate = rect({
          height: 4000,
          width: 4000,
          x: 0,
          y: 0,
          fill: "rgba(255,255,255)",
        });

        mask.appendChild(rectToAnimate);
        mask.appendChild(
          rect({
            height: view.getHeight(),
            width: 2000,
            y:
              view.item.index! * spacings.nodeVerticalDistance -
              spacings.nodeVerticalDistance * 1.5,
            x:
              view.item.level! * spacings.nodeHorizontalDistance -
              spacings.nodeHorizontalDistance * 0.5,
            fill: "rgba(255,255,255)",
          })
        );

        this.svg.appendChild(mask);
        const rootG = this.svg.childNodes[0]! as SVGElement;
        rootG.setAttribute("mask", "url(#myMask)");

        gsap.to(rectToAnimate, {
          fill: "black",
          duration: 0.6,
          onCompete: () => {
            this.root = view.item;
            this.updateIndexes();
          },
        });
      });
    } else if (e.code === "ArrowDown") {
      if (selectedItemIndex < flatNodes.length - 1)
        this.selectItemAt(selectedItemIndex + 1);
    } else if (e.code === "ArrowUp") {
      if (selectedItemIndex > 0) this.selectItemAt(selectedItemIndex - 1);
    } else if (e.code === "ArrowLeft") {
      const selectedItem = flatNodes[selectedItemIndex];
      if (!selectedItem.isClosed && selectedItem.children)
        this.toggleSelectedItemVisibility();
      else if (selectedItem.parent)
        this.selectItemAt(flatNodes.indexOf(selectedItem.parent));
    } else if (e.code === "ArrowRight") {
      const selectedItem = flatNodes[selectedItemIndex];
      if (selectedItem.isClosed && selectedItem.children)
        this.toggleSelectedItemVisibility();
      else if (selectedItem.children)
        this.selectItemAt(flatNodes.indexOf(selectedItem.children[0]));
    } else if (e.code === "KeyE") {
      this.actionOnView(flatNodes[selectedItemIndex], (view) =>
        view.startEdit()
      );
      e.preventDefault();
    }
  };

  private actionOnView = (item: MyItem, action: (view: ItemView) => void) => {
    const view = this.itemMap.get(item);
    view && action(view);
  };

  get canvasSize() {
    return this.flatNodes.length * spacings.nodeVerticalDistance;
  }

  private onScroll = (canvasOffset: number) => {
    const windowHeight = window.innerHeight;
    this.scrollbar.setPosition(
      (canvasOffset / (this.canvasSize - windowHeight + 150)) * windowHeight
    );
  };
}

class Scrollbar {
  el: HTMLElement;
  top: number = 0;
  trackHeight: number = 0;
  bar = dom.createRef("div");
  onDragCb?: Action<number>;
  constructor() {
    this.el = dom.div({ className: "scrollbar-track" }, [
      dom.div({
        ref: this.bar,
        className: "scrollbar",
        onMouseDown: (e) => {
          //prevents selection
          e.preventDefault();
          this.startDrag();
        },
      }),
    ]);
    this.setPosition(0);
  }

  setPosition(x: number) {
    this.top = x;
    this.bar.elem.style.top = this.top + "px";
  }

  setTrackerHeight(height: number) {
    this.trackHeight = height;
    this.bar.elem.style.height = height + "px";
  }

  onDrag = (cb: Action<number>) => {
    this.onDragCb = cb;
  };

  private startDrag = () => {
    document.addEventListener("mousemove", this.updateTrackPosition);
    document.addEventListener("mouseup", this.stopDrag);
  };
  private stopDrag = () => {
    document.removeEventListener("mousemove", this.updateTrackPosition);
    document.removeEventListener("mouseup", this.stopDrag);
  };

  private updateTrackPosition = (e: MouseEvent) => {
    if (e.buttons != 1) this.stopDrag();
    else {
      const maxTrackerPosition = window.innerHeight - this.trackHeight;
      const pos = clamp(this.top + e.movementY, 0, maxTrackerPosition);
      this.setPosition(pos);
      this.onDragCb && this.onDragCb(pos);
    }
  };
}

style.class("scrollbar", {
  position: "absolute",
  right: 0,
  width: 10,
  cursor: "pointer",
  transition: css.transition({ backgroundColor: 200 }),
  backgroundColor: "grey",
});

style.class("scrollbar-track", {
  position: "absolute",
  right: 0,
  bottom: 0,
  top: 0,
  width: 10,
  cursor: "pointer",
  transition: css.transition({ backgroundColor: 200 }),
  backgroundColor: "#272727",
});

style.classHover("scrollbar", {
  backgroundColor: "lightGray",
});
