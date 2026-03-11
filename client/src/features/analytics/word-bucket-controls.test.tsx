import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { WordBucketImprovementCard, WordBucketSwitch } from "./word-bucket-controls";

describe("word bucket controls", () => {
  it("renders the improvement guidance copy", () => {
    render(<WordBucketImprovementCard howToImprove="Review daily." />);

    expect(screen.getByText("How to improve")).toBeTruthy();
    expect(screen.getByText("Review daily.")).toBeTruthy();
  });

  it("forwards bucket selection actions", async () => {
    const user = userEvent.setup();
    const changeBucket = vi.fn();

    render(<WordBucketSwitch bucket="learning" changeBucket={changeBucket} />);

    await user.click(screen.getByRole("button", { name: "Mastered" }));
    await user.click(screen.getByRole("button", { name: "Needs Review" }));

    expect(changeBucket).toHaveBeenCalledWith("mastered");
    expect(changeBucket).toHaveBeenCalledWith("needs_review");
  });
});
