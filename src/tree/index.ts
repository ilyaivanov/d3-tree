import { svgElem } from "../infra/svg";
import { MyItem } from "../items";
import { ItemView } from "./itemView";
import * as items from "../items";
import { initViewportController } from "./viewportController";
import { spacings } from "./constants";

export const viewTree = (data: MyItem) => {
  return new TreeView(data).el;
};

class TreeView {
  itemMap: WeakMap<MyItem, ItemView> = new WeakMap();

  flatNodes: MyItem[] = [];
  selectedItemIndex = 0;
  el: SVGSVGElement;
  constructor(private root: MyItem) {
    this.el = svgElem("svg");

    this.updateIndexes();
    this.el.appendChild(
      new ItemView(root, (item) => this.itemMap.set(item.item, item)).el
    );
    initViewportController(
      this.el,
      { x: 0.5, y: 0.5 },
      { maxHeight: this.flatNodes.length * spacings.nodeSize }
    );
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
}
