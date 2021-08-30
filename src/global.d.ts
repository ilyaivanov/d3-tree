type EmptyAction = () => void;
type Action<TIn> = (arg: TIn) => void;
type Func0<TOut> = () => TOut;
type Func1<TIn, TOut> = (arg: TIn) => TOut;

type ElementId = string;

type AppTheme = "dark" | "light";
type DropPlacement = "after" | "before" | "inside";

declare function haveBeenCalledWith<T extends (...args: any) => any>(
  fn: T,
  ...args: Parameters<T>
);

declare function haveLastBeenCalledWith<T extends (...args: any) => any>(
  fn: T,
  ...args: Parameters<T>
);

declare function haveBeenCalled<T extends (...args: any) => any>(fn: T);

declare function areEqual<T>(a: T, b: T);
declare function areSame<T>(a: T, b: T);

type KeyboardKey =
  | "ArrowDown"
  | "ArrowLeft"
  | "ArrowRight"
  | "ArrowUp"
  | "Escape"
  | "Space"
  | "Enter";
