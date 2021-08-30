import { dom } from ".";

export const svgNamespace = "http://www.w3.org/2000/svg";
export const svgElem = <T extends keyof SVGElementTagNameMap>(name: T) =>
  document.createElementNS(svgNamespace, name) as SVGElementTagNameMap[T];

type RectProps = {
  x: number;
  y: number;
  width: number;
  height: number;
  fill: string;
};
export const rect = (props: RectProps) => assignProps(svgElem("rect"), props);

export const assignProps = <T extends keyof SVGElementTagNameMap>(
  rect: SVGElementTagNameMap[T],
  props: {}
): SVGElementTagNameMap[T] => {
  Object.entries(props).map(([key, value]) =>
    rect.setAttribute(key, value + "")
  );
  return rect;
};

type CircleProps = {
  cx?: number;
  cy?: number;
  r: number;
  fill: string;
  stroke?: string;
  "stroke-width"?: number;
};
export const circle = (props: CircleProps) =>
  assignProps(svgElem("circle"), props);

type TextProps = {
  x?: number;
  y?: number;
  dy?: string;
  fill?: string;
  contentEditable?: boolean;
};
export const text = (text: string, props: TextProps) => {
  const result = assignProps(svgElem("text"), props);

  result.textContent = text;
  return result;
};

type PathProps = {
  d: string;
  stroke?: string;
  fill?: string;
};
export const path = (props: PathProps) => assignProps(svgElem("path"), props);

type ForeignObjectProps = {
  x: number;
  y: number;
  width: number;
  height: number;
};
export const foreignObject = (
  props: ForeignObjectProps,
  children?: Node[] | Node
) => {
  const result = assignProps(svgElem("foreignObject"), props);
  if (children)
    dom.appendChildren(result, Array.isArray(children) ? children : [children]);
  return result;
};

type GProps = {
  transform?: string;
};
export const g = (children: (Node | undefined)[] | Node, props?: GProps) => {
  const result = assignProps(svgElem("g"), props || {});
  if (Array.isArray(children))
    children.forEach((child) => child && result.appendChild(child));
  else result.appendChild(children);
  return result;
};

export const svgStyle = {
  translate: (x: number, y: number) => `translate(${x} ${y})`,
};
