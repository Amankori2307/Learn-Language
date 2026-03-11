import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ProfilePageHeader } from "./profile-page-header";

describe("ProfilePageHeader", () => {
  it("renders the profile heading and supporting copy", () => {
    render(<ProfilePageHeader />);

    expect(screen.getByText("Profile")).toBeTruthy();
    expect(screen.getByText("Manage your identity and avatar.")).toBeTruthy();
  });
});
