export type MyItem = {
  name: string;
  children?: MyItem[];
  isClosed?: boolean;
  index?: number;
  level?: number;
  value?: number;
  parent?: MyItem;
};

export type MyItemNode = {
  item: MyItem;
  children: MyItemNode[];
  parent?: MyItemNode;
  index?: number;
  level?: number;
};

export const getItemsAfter = (item: MyItem) => {
  const items: MyItem[] = [];
  let parent: MyItem | undefined = item.parent;
  let currentItem: MyItem = item;
  while (parent) {
    items.push(...getArrayElementsAfter(parent.children!, currentItem));
    currentItem = parent;
    parent = parent.parent;
  }
  return items;
};

const getArrayElementsAfter = <T>(arr: T[], val: T) => {
  const index = arr.findIndex((i) => i == val);
  return arr.slice(index);
};
