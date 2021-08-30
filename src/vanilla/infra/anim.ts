export const removeViaTransparency = (elem: Element, duration: number) => {
  elem
    .animate([{ opacity: 1 }, { opacity: 0 }], { duration })
    .addEventListener("finish", () => {
      elem.remove();
    });
};

export const animateToOpaque = (elem: Element, duration: number) => {
  elem.animate([{ opacity: 0 }, { opacity: 1 }], { duration });
};
