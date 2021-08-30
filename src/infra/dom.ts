import { Styles, convertNumericStylesToProperJsOjbect } from "./style";
type ClassName = string;
//QUERIES
export const getFirstElementWithClass = (
  elem: Element,
  className: ClassName
): Element => {
  return elem.getElementsByClassName(className)[0];
};

export const fintParentElementWithClass = (
  elem: Element,
  className: ClassName
): Element | null => {
  let parent = elem.parentElement;
  while (parent && !parent.classList.contains(className)) {
    parent = parent.parentElement;
  }
  return parent;
};

//COMMANDS
export const insert = (
  elem: Element,
  target: InsertPosition,
  elemToInsert: Element
) => elem.insertAdjacentElement(target, elemToInsert);

export const appendChildren = (elem: Element, children: Node[]) =>
  children.forEach((child) => elem.appendChild(child));

export const appendChild = (elem: Element, child: Node) =>
  elem.appendChild(child);

export const removeAllChildren = (elem: Element) => {
  while (elem.firstChild) elem.firstChild.remove();
};

const assignChildrenArrayToElement = (
  elem: Element,
  children: ElementChild[]
) =>
  children.forEach((child) => {
    if (child) {
      if (typeof child === "string") elem.append(child);
      else elem.appendChild(child);
    }
  });

export const setChildren = (elem: Element, children: Node[]) => {
  removeAllChildren(elem);
  children.forEach((child) => elem.appendChild(child));
};
export const setChild = (elem: Element, child: Node) => {
  removeAllChildren(elem);
  elem.appendChild(child);
};

export const fragment = (children: (Element | undefined)[]) => {
  const frag = document.createDocumentFragment();
  children.forEach((child) => child && frag.appendChild(child));
  return frag;
};

export type ClassMap = Partial<Record<ClassName, boolean>>;
export type ClassDefinitions = {
  className?: ClassName;
  classNames?: ClassName[];
  classMap?: ClassMap;
};

export type ElementChild = Node | undefined | string | false;

export const assignClasses = <T extends Element>(
  elem: T,
  classes: ClassDefinitions
): T => {
  const { classMap, className, classNames } = classes;
  if (classMap) assignClassMap(elem, classMap);
  if (className) elem.classList.add(className);
  if (classNames) classNames.forEach((cs) => elem.classList.add(cs));
  return elem;
};

export const assignClassMap = (elem: Element, classMap: ClassMap) =>
  Object.entries(classMap).map(([className, isSet]) =>
    toggleClass(elem, className as ClassName, isSet)
  );

export const addClass = (elem: Element, className: ClassName) =>
  elem.classList.add(className);

export const removeClass = (elem: Element, className: ClassName) =>
  elem.classList.remove(className);

export const toggleClass = (
  elem: Element,
  className: ClassName,
  isSet?: boolean
) => elem.classList.toggle(className, !!isSet);

type Events = {
  onKeyDown?: (e: KeyboardEvent) => void;
  onClick?: (e: MouseEvent) => void;
  onClickStopPropagation?: (e: MouseEvent) => void;
  onMouseMove?: (e: MouseEvent) => void;
  onMouseDown?: (e: MouseEvent) => void;
  onMouseEnter?: (e: MouseEvent) => void;
  onMouseLeave?: (e: MouseEvent) => void;
  onBlur?: (e: FocusEvent) => void;
};

const assignElementEvents = (elem: HTMLElement, props: Events) => {
  const { onClickStopPropagation } = props;
  if (props.onKeyDown) elem.addEventListener("keydown", props.onKeyDown);
  if (props.onClick) elem.addEventListener("click", props.onClick);
  if (onClickStopPropagation)
    elem.addEventListener("click", (e) => {
      e.stopPropagation();
      onClickStopPropagation(e);
    });
  if (props.onMouseMove) elem.addEventListener("mousemove", props.onMouseMove);
  if (props.onMouseDown) elem.addEventListener("mousedown", props.onMouseDown);
  if (props.onMouseEnter)
    elem.addEventListener("mouseenter", props.onMouseEnter);
  if (props.onMouseLeave)
    elem.addEventListener("mouseleave", props.onMouseLeave);
  if (props.onBlur) elem.addEventListener("blur", props.onBlur);
};

//ELEMENTS

const elemFactory =
  <T extends keyof HTMLElementTagNameMap>(tag: T) =>
  (
    props: ElementProps<HTMLElementTagNameMap[T]>,
    children?: ElementChild[]
  ): HTMLElementTagNameMap[T] =>
    elem(tag, props, children);

export const div = elemFactory("div");
export const span = elemFactory("span");
export const button = elemFactory("button");

type InputProps = ElementProps<HTMLInputElement> & {
  placeholder?: string;
  value: string;
  onInput?: Action<Event>;
};
export const input = (inputProps: InputProps) => {
  const el = elem("input", inputProps);
  if (inputProps.onInput) el.addEventListener("input", inputProps.onInput);
  if (inputProps.placeholder) el.placeholder = inputProps.placeholder;
  el.value = inputProps.value;
  return el;
};

type ImageProps = ElementProps<HTMLImageElement> & {
  src: string;
};
export const img = (inputProps: ImageProps) => {
  const el = elem("img", inputProps);
  el.src = inputProps.src;
  return el;
};

type ElementProps<T> = {
  id?: string;
  textContent?: string;
  ref?: MyRef<T>;
  style?: Styles;
} & ClassDefinitions &
  Events;

export const elem = <T extends keyof HTMLElementTagNameMap>(
  tag: T,
  props: ElementProps<HTMLElementTagNameMap[T]>,
  children?: ElementChild[]
): HTMLElementTagNameMap[T] => {
  const elem = document.createElement(tag);

  if (props.textContent) elem.textContent = props.textContent;
  if (props.id) elem.id = props.id;
  if (props.ref) props.ref.elem = elem;

  assignClasses(elem, props);
  assignElementEvents(elem, props);
  if (children) assignChildrenArrayToElement(elem, children);
  if (props.style) {
    Object.assign(
      elem.style,
      convertNumericStylesToProperJsOjbect(props.style)
    );
  }
  return elem;
};

export const createRef = <T extends keyof HTMLElementTagNameMap>(
  tag: T
): MyRef<HTMLElementTagNameMap[T]> => ({ elem: undefined as any });

export type MyRef<T> = {
  elem: T;
};
