import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PendingButton } from "./pending-button";

describe("PendingButton", () => {
  it("disables interaction and shows the pending label while pending", () => {
    render(
      <PendingButton pending pendingLabel="Saving changes">
        Save
      </PendingButton>,
    );

    const button = screen.getByRole("button", { name: "Saving changes" });
    expect((button as HTMLButtonElement).disabled).toBe(true);
    expect(screen.queryByText("Save")).toBeNull();
  });

  it("renders the normal label when not pending", () => {
    render(<PendingButton>Continue</PendingButton>);

    const button = screen.getByRole("button", { name: "Continue" });
    expect((button as HTMLButtonElement).disabled).toBe(false);
  });
});
