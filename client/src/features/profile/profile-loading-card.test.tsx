import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ProfileLoadingCard } from "./profile-loading-card";

describe("ProfileLoadingCard", () => {
  it("renders the loading skeleton surface", () => {
    const { container } = render(<ProfileLoadingCard />);
    expect(container.querySelectorAll(".animate-pulse").length).toBeGreaterThan(0);
  });
});
