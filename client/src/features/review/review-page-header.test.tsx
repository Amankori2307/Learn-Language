import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ReviewPageHeader } from "./review-page-header";

describe("ReviewPageHeader", () => {
  it("renders status controls and forwards status changes", async () => {
    const user = userEvent.setup();
    const setStatus = vi.fn();

    render(
      <ReviewPageHeader
        status="pending_review"
        setStatus={setStatus}
        statusOptions={["draft", "pending_review", "approved"]}
        canDownloadVocabularyExport
        onDownloadVocabularyExport={vi.fn()}
      />,
    );

    await user.click(screen.getByRole("button", { name: "approved" }));

    expect(screen.getByText("Review Queue")).toBeTruthy();
    expect(
      screen.getByText(
        "Pending review items are ready for reviewer decision before learner exposure.",
      ),
    ).toBeTruthy();
    expect(setStatus).toHaveBeenCalledWith("approved");
    expect(screen.getByRole("button", { name: "Download Vocab Data" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Go to Add Vocabulary" })).toBeTruthy();
  });
});
