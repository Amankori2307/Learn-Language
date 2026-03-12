import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import NotFound from "./not-found";

describe("NotFound", () => {
  it("renders a theme-safe not-found surface", () => {
    const { container } = render(<NotFound />);

    expect(screen.getByText("Page Not Found")).toBeTruthy();
    expect(screen.getByText("Return Home")).toBeTruthy();
    expect(container.innerHTML.includes("surface-status-error")).toBe(true);
    expect(container.innerHTML.includes("text-status-error")).toBe(true);
    expect(container.innerHTML.includes("bg-gray-50")).toBe(false);
    expect(container.innerHTML.includes("text-red-500")).toBe(false);
  });
});
