import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

if (!window.ResizeObserver) {
  window.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

Object.defineProperty(window, "scrollTo", {
  value: () => {},
  writable: true,
});

if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = () => {};
}

afterEach(() => {
  cleanup();
});
