import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ReviewStatusEnum } from "@shared/domain/enums";
import { ReviewQueuePanel } from "./review-queue-panel";

describe("ReviewQueuePanel", () => {
  it("renders a retry surface when the queue fails", async () => {
    const user = userEvent.setup();
    const retryQueue = vi.fn();

    render(
      <ReviewQueuePanel
        queueItems={[]}
        queueLoading={false}
        queueError
        retryQueue={retryQueue}
        selectedSet={new Set<number>()}
        toggleSelected={vi.fn()}
        setActiveWordId={vi.fn()}
        isTransitionPending={false}
        transitionWord={vi.fn()}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Retry" }));
    expect(retryQueue).toHaveBeenCalledTimes(1);
  });

  it("forwards row interactions for select, history, and approval actions", async () => {
    const user = userEvent.setup();
    const toggleSelected = vi.fn();
    const setActiveWordId = vi.fn();
    const transitionWord = vi.fn();

    const { container } = render(
      <ReviewQueuePanel
        queueItems={[
          {
            id: 11,
            transliteration: "namaste",
            originalScript: "నమస్తే",
            english: "hello",
            partOfSpeech: "phrase",
            reviewStatus: "pending_review",
            submittedBy: "reviewer@example.com",
            submittedAt: "2026-03-10T10:00:00.000Z",
            reviewedBy: null,
            reviewedAt: null,
          },
        ]}
        queueLoading={false}
        queueError={false}
        retryQueue={vi.fn()}
        activeWordId={11}
        selectedSet={new Set<number>()}
        toggleSelected={toggleSelected}
        setActiveWordId={setActiveWordId}
        isTransitionPending={false}
        transitionWord={transitionWord}
      />,
    );

    await user.click(screen.getByRole("checkbox"));
    await user.click(screen.getByRole("button", { name: "View History" }));
    await user.click(screen.getByRole("button", { name: "Approve" }));

    expect(toggleSelected).toHaveBeenCalledWith(11);
    expect(setActiveWordId).toHaveBeenCalledWith(11);
    expect(transitionWord).toHaveBeenCalledWith({
      id: 11,
      toStatus: ReviewStatusEnum.APPROVED,
    });
    expect(container.querySelector(".md\\:max-h-\\[var\\(--pane-review-max-height\\)\\]")).toBeTruthy();
  });
});
