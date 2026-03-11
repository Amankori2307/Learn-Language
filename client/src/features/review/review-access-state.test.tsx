import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ReviewAccessState } from "./review-access-state";

describe("ReviewAccessState", () => {
  it("renders the reviewer-only access message", () => {
    render(<ReviewAccessState />);

    expect(screen.getByText("Review Access Required")).toBeTruthy();
    expect(screen.getByText(/Only reviewer\/admin roles can access vocabulary review tools./)).toBeTruthy();
  });
});
