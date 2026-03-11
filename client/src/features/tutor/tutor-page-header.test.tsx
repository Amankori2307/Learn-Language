import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TutorPageHeader } from "./tutor-page-header";

describe("TutorPageHeader", () => {
  it("renders the tutor heading and description", () => {
    render(<TutorPageHeader />);

    expect(screen.getByText("Tutor Mode (Text)")).toBeTruthy();
    expect(
      screen.getByText("Feature-flagged tutor for vocabulary coaching with safe local logic."),
    ).toBeTruthy();
  });
});
