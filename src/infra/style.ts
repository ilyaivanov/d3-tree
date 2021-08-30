const s = document.createElement("style");
s.id = "app-styles";
document.head.appendChild(s);

const selector = (selector: string, styles: StylesWithVariables) => {
  const res = Array.isArray(selector) ? selector.join(", ") : selector;
  s.innerHTML += cssToString(res, styles);
};

const ignoredStyles: Record<string, number> = {
  onHover: 1,
  themes: 1,
  variables: 1,
  at: 1,
};

type StylesWithVariables = Styles & {
  variables?: Record<string, string>;
};

type CompoundStyles = StylesWithVariables & {
  onHover?: Styles;
  active?: Styles;
};

type CN = string; //just for being short

const handleCompoundStyles = (
  elementSelector: string,
  styles: CompoundStyles
) => {
  selector(elementSelector, styles);
  if (styles.onHover) selector(`${elementSelector}:hover`, styles.onHover);
  if (styles.active) selector(`${elementSelector}:active`, styles.active);
};

export const style = {
  selector,
  tag: (tagName: keyof HTMLElementTagNameMap, styles: StylesWithVariables) =>
    selector(`${tagName}`, styles),

  keyframes: (animationName: string, frames: (Styles & { at: string })[]) => {
    s.innerHTML += keyframesToString(animationName, frames);
  },
  class: (className: CN, styles: CompoundStyles) =>
    handleCompoundStyles(`.${className}`, styles),
  classHover: (className: CN, styles: CompoundStyles) =>
    handleCompoundStyles(`.${className}:hover`, styles),
  classActive: (className: CN, styles: CompoundStyles) =>
    handleCompoundStyles(`.${className}:active`, styles),
  classFocus: (className: CN, styles: CompoundStyles) =>
    handleCompoundStyles(`.${className}:focus`, styles),
  firstChild: (className: CN, styles: CompoundStyles) =>
    handleCompoundStyles(`.${className}:first-child`, styles),
  lastChild: (className: CN, styles: CompoundStyles) =>
    handleCompoundStyles(`.${className}:last-of-type`, styles),
  class2: (className1: CN, className2: CN, styles: CompoundStyles) =>
    handleCompoundStyles(`.${className1}.${className2}`, styles),
  id: (id: string, styles: CompoundStyles) =>
    handleCompoundStyles(`#${id}`, styles),
  after: (className: CN, styles: Styles) =>
    selector(`.${className}::after`, styles),
  parentHover: (parent: CN, child: CN, styles: StylesWithVariables) =>
    selector(`.${parent}:hover .${child}`, styles),
  directParentHover: (parent: CN, child: CN, styles: StylesWithVariables) =>
    selector(`.${parent}:hover > .${child}`, styles),
  parentChild: (parent: CN, child: CN, styles: StylesWithVariables) =>
    selector(`.${parent} .${child}`, styles),
  parentDirectChild: (parent: CN, child: CN, styles: StylesWithVariables) =>
    selector(`.${parent} > .${child}`, styles),
};

const cssToString = (selector: string, props: StylesWithVariables) => {
  let values = Object.entries(convertNumericStylesToProperCssOjbect(props)).map(
    ([key, val]) => `    ${key}: ${val};`
  );
  if (props.variables) {
    const variablesFormatted = Object.entries(props.variables).map(
      ([variableKey, variableValue]) => `\t--${variableKey}: ${variableValue};`
    );
    values = values.concat(variablesFormatted);
  }
  return `\n${selector}{\n${values.join("\n")}\n}\n`;
};

const keyframesToString = (
  animationName: string,
  frames: (Styles & { at: string })[]
) => {
  return (
    `\n@keyframes ${animationName} {` +
    frames.map((frame) => cssToString(frame.at, frame)).join("") +
    "\n}"
  );
};

export const convertNumericStylesToProperCssOjbect = (styles: Styles): {} =>
  Object.entries(convertNumericStylesToProperJsOjbect(styles)).reduce(
    (res, [key, val]) => {
      res[camelToSnakeCase(key)] = val;
      return res;
    },
    {} as Record<string, string>
  );

export const convertNumericStylesToProperJsOjbect = (
  styles: Styles
): Record<string, string> =>
  Object.entries(styles).reduce((res, [key, val]) => {
    const isNotIgnored = !ignoredStyles[key];
    if (
      typeof val !== "undefined" &&
      isNotIgnored &&
      (typeof val == "number" || typeof val === "string")
    )
      res[key] = convertVal(key, val);
    return res;
  }, {} as Record<string, string>);

//I'm using whitelist approach
//in other words I add px to every number values expect 'opacity', 'flex' and other
//and I'm leaving zeros for any value as string without px postfix
const whitelist: Styles = {
  zIndex: 1,
  opacity: 1,
  flex: 1,
  // fontWeight: 1,
  lineHeight: 1,
  animationDelay: 1,
};

const convertVal = (key: string, val: number | string) => {
  if ((whitelist as any)[key]) return val + "";

  if (typeof val == "number") return val + "px";
  return val + "";
};

export const camelToSnakeCase = (str: string): string =>
  str.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);

type Easing = "linear" | "ease" | "ease-in" | "ease-out" | "ease-in-out";

export type Styles = Partial<{
  //display
  opacity: number;

  //sizing
  height: number | "100vh" | "100%" | string;
  maxHeight: number;
  width: number | string;
  minWidth: number;
  minHeight: number;
  boxSizing: "border-box";

  //margins and paddings
  margin: number | string;
  marginRight: number | "-100%" | "auto";
  marginLeft: number | "auto";
  marginTop: number;
  marginBottom: number;
  padding: number | string;
  paddingRight: number | string;
  paddingLeft: number | string;
  paddingTop: number | string;
  paddingBottom: number | string;

  //positioning
  position: "absolute" | "relative" | "fixed";
  top: number | "100%" | string;
  right: number | string;
  bottom: number;
  left: number | string;
  zIndex: number;
  overflow: "hidden" | "auto" | "scroll" | "overlay";
  overflowX: "hidden" | "auto" | "scroll" | "overlay";
  overflowY: "hidden" | "auto" | "scroll" | "overlay";

  //flex
  flex: number;
  display: "flex" | "inline-block" | "block" | "grid";
  flexDirection: "row" | "column";
  justifyContent: "flex-start" | "center" | "flex-end" | "space-between";
  flexWrap: "wrap";
  alignSelf: "stretch";
  alignItems: "flex-start" | "center" | "flex-end";

  //border
  border: string;
  borderLeft: string;
  borderTop: string;
  borderBottom: string;
  borderRight: string;
  outline: string;
  borderColor: string;
  borderRadius: number | "50%";
  borderTopRightRadius: number;
  borderTopLeftRadius: number;
  borderBottomLeftRadius: number;
  borderBottomRightRadius: number;

  //colors
  backgroundColor: string;

  //transitions
  transition: string;
  transitionTimingFunction: Easing;

  animation: string;
  animationDelay: string | number;

  //typography
  fontFamily: string;
  color: string;
  lineHeight: number | string;
  fontSize: number;
  fontWeight: "bold" | "500" | "600";
  fontStyle: "italic";
  whiteSpace: "nowrap";
  textDecoration: "underline";

  //shadows
  boxShadow: string;
  textShadow: string;

  //svg
  stroke: string;
  strokeWidth: number;
  fill: string;

  //background
  backgroundImage: string;
  backgroundSize: "cover";
  backgroundPosition: string;
  background: string;
  backgroundRepeat: string;

  //grid
  gridTemplateColumns: string;
  gridTemplateRows: string;
  gridTemplateAreas: string;
  gridArea: string;

  //Other
  cursor: "pointer" | "default";
  userSelect: "none";
  transform: string;
  transformOrigin: string;
  pointerEvents: "none" | "all";
  visibility: "hidden";
  content: `" "`;
  objectFit: "cover";
}>;
