import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { APP_BRAND_NAME } from "@shared/domain/constants/app-brand";
import { AuthBrandPanel } from "./auth-brand-panel";

describe("AuthBrandPanel", () => {
  it("renders the auth marketing copy and brand name", () => {
    render(<AuthBrandPanel />);

    expect(screen.getByText(APP_BRAND_NAME)).toBeTruthy();
    expect(screen.getByText("Master languages the natural way.")).toBeTruthy();
    expect(
      screen.getByText(new RegExp(`${APP_BRAND_NAME} helps you build fluency step by step.`)),
    ).toBeTruthy();
  });
});
