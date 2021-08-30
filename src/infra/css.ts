import { camelToSnakeCase, Styles, style } from "./style";

type Transition = Partial<Record<keyof Styles, TransitionDefinition>>;

type Easing = "ease-in" | "ease-out";
type TransitionDefinition =
  | number
  | {
      duration: number;
      easing: Easing;
      delay?: number;
    };

export const transition = (transitionDefinition: Transition): string =>
  Object.entries(transitionDefinition)
    .map(
      ([key, value]) =>
        `${camelToSnakeCase(key)} ${formatTransitionDefinition(value)}`
    )
    .join(", ");

const formatTransitionDefinition = (def: TransitionDefinition) => {
  if (typeof def === "number") return `${def}ms`;
  else
    return `${def.duration}ms ${def.easing} ${
      def.delay ? def.delay + "ms" : ""
    }`;
};

export const translate = (x: number, y: number) => `translate(${x}px, ${y}px)`;
export const translate3d = (x: number, y: number, z: number) =>
  `translate3d(${x}px, ${y}px, ${z}px)`;

export const paddingVertical = (v: number): Styles => ({
  paddingBottom: v,
  paddingTop: v,
});

export const paddingHorizontal = (v: number): Styles => ({
  paddingLeft: v,
  paddingRight: v,
});

export function padding(all: number): string;
export function padding(vertical: number, horizontal: number): string;
export function padding(vertical: number, horizontal?: number): string {
  return horizontal ? `${vertical}px ${horizontal}px` : `${vertical}px`;
}

export const createScrollStyles = (
  className: string,
  props: {
    scrollbar: Styles;
    thumb: Styles;
  }
) => {
  style.selector(`.${className}::-webkit-scrollbar`, props.scrollbar);
  style.selector(`.${className}::-webkit-scrollbar-thumb`, props.thumb);
};
