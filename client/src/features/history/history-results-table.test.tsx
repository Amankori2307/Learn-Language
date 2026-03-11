import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { QuizDirectionEnum } from "@shared/domain/enums";
import { HistoryResultsTable } from "./history-results-table";

describe("HistoryResultsTable", () => {
  it("renders attempt rows and paginates through callbacks", async () => {
    const user = userEvent.setup();
    const setPage = vi.fn();

    render(
      <HistoryResultsTable
        pageAttempts={[
          {
            id: 1,
            isCorrect: true,
            direction: QuizDirectionEnum.SOURCE_TO_TARGET,
            confidenceLevel: 3,
            responseTimeMs: 2400,
            createdAt: "2026-03-10T10:00:00.000Z",
            word: {
              transliteration: "namaste",
              originalScript: "నమస్తే",
              english: "hello",
            },
          },
        ]}
        currentPage={2}
        totalPages={4}
        totalResults={17}
        setPage={setPage}
      />,
    );

    expect(screen.getByText("Correct")).toBeTruthy();
    expect(screen.getByText("namaste (నమస్తే)")).toBeTruthy();
    expect(screen.getByText("Source Language -> English")).toBeTruthy();
    expect(screen.getByText("Page 2 of 4 • 17 results")).toBeTruthy();

    await user.click(screen.getByRole("button", { name: "Prev" }));
    await user.click(screen.getByRole("button", { name: "Next" }));

    expect(setPage).toHaveBeenCalledTimes(2);
  });
});
