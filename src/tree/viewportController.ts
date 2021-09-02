import * as vec from "../infra/vector";

export class ViewportController {
  cameraPosition: vec.Vector = {
    x: 0,
    y: 0,
  };
  constructor(
    private elem: SVGSVGElement,
    private onScroll: Action<number>,
    private maxHeight: number
  ) {
    window.addEventListener("resize", this.updateWindowSize);
    window.addEventListener("mousewheel", this.onMouseWheel);
    this.updateWindowSize();
  }

  public setOffset = (y: number) => {
    this.updateViewBox({ x: this.cameraPosition.x, y });
  };

  private updateViewBox = (v: vec.Vector) => {
    this.cameraPosition = v;
    const scaledWindowDimensions = vec.create(
      window.innerWidth,
      window.innerHeight
    );
    const f = (a: number) => a;
    this.elem.setAttribute(
      "viewBox",
      `${f(this.cameraPosition.x)} ${f(this.cameraPosition.y)} ${f(
        scaledWindowDimensions.x
      )} ${f(scaledWindowDimensions.y)}`
    );
  };

  private updateWindowSize = () => {
    this.elem.style.width = window.innerWidth + "px";
    this.elem.style.height = window.innerHeight + "px";
    this.updateViewBox(this.cameraPosition);
  };

  private onMouseWheel = (event: Event) => {
    const e = event as WheelEvent;

    const y = vec.clamp(
      this.cameraPosition.y + e.deltaY,
      0.5,
      this.maxHeight - window.innerHeight + 40
    );
    this.updateViewBox({ x: this.cameraPosition.x, y });
    this.onScroll(y);
  };

  shiftTo = (vector: vec.Vector) => {
    this.cameraPosition = vector;
    const scaledWindowDimensions = vec.create(
      window.innerWidth,
      window.innerHeight
    );
    gsap.to(this.elem, {
      attr: {
        viewBox: `${this.cameraPosition.x} ${this.cameraPosition.y} ${scaledWindowDimensions.x} ${scaledWindowDimensions.y}`,
      },
      duration: 0.6,
    });
  };
}
