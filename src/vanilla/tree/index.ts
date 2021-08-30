import { svgElem } from "../infra/svg";
import { MyItem } from "../items";
import { ItemView } from "./itemView";
import * as items from "../items";
import { initViewportController } from "./viewportController";
import { spacings } from "./constants";

export const viewTree = (data: MyItem) => {
  return new TreeView(data).svg;
};

class TreeView {
  itemMap: WeakMap<MyItem, ItemView> = new WeakMap();

  flatNodes: MyItem[] = [];
  selectedItemIndex = 0;
  svg: SVGSVGElement;
  constructor(private root: MyItem) {
    this.svg = svgElem("svg");

    this.updateIndexes();
    this.svg.appendChild(
      new ItemView(root, (item) => this.itemMap.set(item.item, item)).el
    );
    initViewportController(
      this.svg,
      { x: 0.5, y: 0.5 },
      { maxHeight: this.flatNodes.length * spacings.nodeSize }
    );
    this.selectItemAt(this.selectedItemIndex);
    document.addEventListener("keydown", this.onKeyDown);
  }

  private updateIndexes = () => {
    let index = 0;
    this.flatNodes = [];
    const mapChild = (item: MyItem, level: number) => {
      item.index = ++index;
      this.flatNodes.push(item);
      item.level = level;
      if (item.children && !item.isClosed)
        item.children.forEach((c) => {
          c.parent = item;
          mapChild(c, level + 1);
        });
    };
    mapChild(this.root, 0);
  };

  private toggleSelectedItemVisibility = () => {
    const item = this.flatNodes[this.selectedItemIndex];
    item.isClosed = !item.isClosed;
    if (item.isClosed) this.itemMap.get(item)?.removeChildren();
    else this.itemMap.get(item)?.appendChildren();
    this.updateIndexes();
    items.getItemsAfter(item).forEach((next) => {
      this.itemMap.get(next)?.updateIndex();
    });
  };

  private selectItemAt = (newIndex: number) => {
    const { itemMap, selectedItemIndex, flatNodes } = this;
    itemMap.get(flatNodes[selectedItemIndex])?.unselect();
    this.selectedItemIndex = newIndex;
    itemMap.get(flatNodes[selectedItemIndex])?.select();
  };

  private onKeyDown = (e: KeyboardEvent) => {
    const { selectedItemIndex, flatNodes, itemMap } = this;
    if (e.code === "ArrowDown") {
      if (selectedItemIndex < flatNodes.length - 1)
        this.selectItemAt(selectedItemIndex + 1);
    }
    if (e.code === "ArrowUp") {
      if (selectedItemIndex > 0) this.selectItemAt(selectedItemIndex - 1);
    }
    if (e.code === "ArrowLeft") {
      const selectedItem = flatNodes[selectedItemIndex];
      if (!selectedItem.isClosed && selectedItem.children)
        this.toggleSelectedItemVisibility();
      else if (selectedItem.parent)
        this.selectItemAt(flatNodes.indexOf(selectedItem.parent));
    }
    if (e.code === "ArrowRight") {
      const selectedItem = flatNodes[selectedItemIndex];
      if (selectedItem.isClosed && selectedItem.children)
        this.toggleSelectedItemVisibility();
      else if (selectedItem.children)
        this.selectItemAt(flatNodes.indexOf(selectedItem.children[0]));
    }
    if (e.code === "KeyE") {
      itemMap.get(flatNodes[selectedItemIndex])?.startEdit();
      e.preventDefault();
    }
  };
}
