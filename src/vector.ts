export type Vector = { x: number; y: number };

export const create = (x: number, y: number) => ({ x, y });
export const add = (v1: Vector, v2: Vector) => ({
  x: v1.x + v2.x,
  y: v1.y + v2.y,
});
export const subtract = (v1: Vector, v2: Vector) => ({
  x: v1.x - v2.x,
  y: v1.y - v2.y,
});
export const multiply = (v1: Vector, val: number) => ({
  x: v1.x * val,
  y: v1.y * val,
});
export const divide = (v1: Vector, val: number) => ({
  x: v1.x / val,
  y: v1.y / val,
});
export const fromMousePosition = (e: MouseEvent) => {
  return create(e.clientX, e.clientY);
};
