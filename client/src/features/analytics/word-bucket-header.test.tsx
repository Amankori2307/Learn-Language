import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { WordBucketHeader, WordBucketNextAction } from "./word-bucket-header";

describe("word bucket presentation", () => {
  it("renders the bucket header and back action", async () => {
    const user = userEvent.setup();
    const onBack = vi.fn();

    render(
      <WordBucketHeader
        title="Learning"
        meaning="Track words in progress."
        onBack={onBack}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Back to Dashboard" }));

    expect(screen.getByText("Learning")).toBeTruthy();
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it("forwards next-action CTAs", async () => {
    const user = userEvent.setup();
    const onPrimary = vi.fn();
    const onSecondary = vi.fn();

    render(
      <WordBucketNextAction
        title="Recover Needs Review Words"
        description="Start weak-word drills first."
        primaryLabel="Practice Weak Words"
        secondaryLabel="Start Daily Review"
        onPrimary={onPrimary}
        onSecondary={onSecondary}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Practice Weak Words" }));
    await user.click(screen.getByRole("button", { name: "Start Daily Review" }));

    expect(onPrimary).toHaveBeenCalledTimes(1);
    expect(onSecondary).toHaveBeenCalledTimes(1);
  });
});
