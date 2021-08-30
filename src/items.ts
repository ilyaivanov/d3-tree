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

export const getAllItemsAfter = (item: MyItem) => {
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

export const createFlatItems = (root: MyItem): MyItem[] => {
  let index = 0;
  const result: MyItem[] = [];
  const mapChild = (item: MyItem, level: number) => {
    item.index = ++index;
    result.push(item);
    item.level = level;
    if (item.children && !item.isClosed)
      item.children.forEach((c) => {
        c.parent = item;
        mapChild(c, level + 1);
      });
  };
  mapChild(root, 0);
  return result;
};

const getArrayElementsAfter = <T>(arr: T[], val: T) => {
  const index = arr.findIndex((i) => i == val);
  return arr.slice(index);
};
