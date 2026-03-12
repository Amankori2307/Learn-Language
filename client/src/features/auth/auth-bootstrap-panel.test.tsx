import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AuthBootstrapPanel } from "./auth-bootstrap-panel";

describe("AuthBootstrapPanel", () => {
  it("renders the auth bootstrap loading copy", () => {
    const { container } = render(<AuthBootstrapPanel />);

    expect(screen.getByText("Restoring your session")).toBeTruthy();
    expect(screen.getByText("Signing you in and preparing your dashboard.")).toBeTruthy();
    expect(container.innerHTML.includes("min-h-dvh")).toBe(true);
  });
});
