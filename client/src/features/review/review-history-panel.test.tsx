import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ReviewHistoryPanel } from "./review-history-panel";

describe("ReviewHistoryPanel", () => {
  it("renders the selection prompt before a queue item is active", () => {
    render(
      <ReviewHistoryPanel
        activeWordId={undefined}
        history={null}
        historyLoading={false}
        historyError={false}
      />,
    );

    expect(screen.getByText("Select an item to inspect source and transition history.")).toBeTruthy();
  });

  it("renders word, related words, and event details when history is available", () => {
    const { container } = render(
      <ReviewHistoryPanel
        activeWordId={11}
        historyLoading={false}
        historyError={false}
        history={{
          word: {
            transliteration: "namaste",
            originalScript: "నమస్తే",
            english: "hello",
            sourceUrl: "https://example.com/source",
            sourceCapturedAt: "2026-03-10T10:00:00.000Z",
          },
          clusters: [{ id: 2, name: "greetings" }],
          relatedClusterWords: [
            {
              id: 12,
              transliteration: "vandana",
              originalScript: "వందన",
              english: "greeting",
              reviewStatus: "approved",
            },
          ],
          events: [
            {
              id: 1,
              fromStatus: "draft",
              toStatus: "approved",
              changedBy: "reviewer@example.com",
              createdAt: "2026-03-10T11:00:00.000Z",
              sourceUrl: "https://example.com/review",
              sourceCapturedAt: "2026-03-10T11:00:00.000Z",
              notes: "Verified against source",
            },
          ],
        }}
      />,
    );

    expect(screen.getByText("namaste (నమస్తే)")).toBeTruthy();
    expect(screen.getByText("greetings")).toBeTruthy();
    expect(screen.getByText(/vandana \(వందన\)/)).toBeTruthy();
    expect(screen.getByText("draft -> approved")).toBeTruthy();
    expect(screen.getByText("Verified against source")).toBeTruthy();
    expect(container.querySelector(".md\\:max-h-\\[var\\(--pane-review-max-height\\)\\]")).toBeTruthy();
  });
});
