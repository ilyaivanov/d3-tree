import * as vec from "./vector";

export const initViewportController = (
  svgElement: SVGSVGElement,
  initialCameraPosition: vec.Vector,
  props: { itemsCount: number; nodeSize: number }
) => {
  let cameraPosition = initialCameraPosition;
  const scale = 1;

  const updateViewBox = (v: vec.Vector) => {
    cameraPosition = v;
    // const windowSize = vec.create(window.innerWidth, window.innerHeight);
    const windowSize = vec.create(500, 500);
    const scaledWindowDimensions = vec.divide(windowSize, scale);
    const f = (a: number) => a;
    svgElement.setAttribute(
      "viewBox",
      `${f(cameraPosition.x)} ${f(cameraPosition.y)} ${f(
        scaledWindowDimensions.x
      )} ${f(scaledWindowDimensions.y)}`
    );
  };

  svgElement.style.width = "500px";
  svgElement.style.height = "500px";
  updateViewBox(cameraPosition);
  // const updateWindowSize = () => {
  //   // svgElement.style.width = window.innerWidth + "px";
  //   // svgElement.style.height = window.innerHeight + "px";
  //   svgElement.style.width = "500px";
  //   svgElement.style.height = "500px";
  //   updateViewBox(cameraPosition);
  // };
  // updateWindowSize();
  // window.addEventListener("resize", updateWindowSize);

  // const onKeyDown = () => {
  //   window.addEventListener("mousemove", onMouseMove);
  // };
  // const onKeyUp = () => {
  //   window.removeEventListener("mousemove", onMouseMove);
  // };

  // const onMouseMove = (e: MouseEvent) => {
  //   if (e.buttons == 1) {
  //     const shift = vec.create(-e.movementX / scale, -e.movementY / scale);
  //     updateViewBox(vec.add(cameraPosition, shift));
  //   } else {
  //     window.removeEventListener("mousemove", onMouseMove);
  //   }
  // };
  // window.addEventListener("mousedown", onKeyDown);
  // window.addEventListener("mouseup", onKeyUp);

  const onMouseWheel = (event: Event) => {
    const e = event as WheelEvent;
    //regular delta is 100 or -100, so our step is always 10%
    // other apps do not do this like that.
    // They probably scale "scale factor" not always by 10%
    // Checkout Figma for example
    // const nextScale = scale + scale * 0.1 * (-e.deltaY / 100);

    // const mousePosition = vec.fromMousePosition(e);
    // const currentMouseWorldPosition = vec.add(
    //   cameraPosition,
    //   vec.multiply(mousePosition, 1 / scale)
    // );
    // const nextMouseWorldPosition = vec.add(
    //   cameraPosition,
    //   vec.multiply(mousePosition, 1 / nextScale)
    // );
    // const diff = vec.subtract(
    //   currentMouseWorldPosition,
    //   nextMouseWorldPosition
    // );
    // const nextCameraPosition = vec.add(cameraPosition, diff);

    // updateViewBox(nextCameraPosition, nextScale);

    updateViewBox({
      x: cameraPosition.x,
      y: vec.clamp(
        cameraPosition.y + e.deltaY,
        initialCameraPosition.y,
        props.itemsCount * props.nodeSize - 500
      ),
    });
  };
  window.addEventListener("mousewheel", onMouseWheel);
};
