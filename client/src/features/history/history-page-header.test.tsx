import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { HistoryPageHeader } from "./history-page-header";

describe("HistoryPageHeader", () => {
  it("renders analytics heading and refreshes on CTA click", async () => {
    const user = userEvent.setup();
    const refresh = vi.fn();

    render(<HistoryPageHeader isFetching={false} refresh={refresh} />);

    expect(screen.getByText("Analytics")).toBeTruthy();
    expect(screen.getByText(/Attempt history with filters, trends, and paginated drill-down./)).toBeTruthy();

    await user.click(screen.getByRole("button", { name: "Refresh" }));

    expect(refresh).toHaveBeenCalledTimes(1);
  });

  it("shows pending refresh state", () => {
    render(<HistoryPageHeader isFetching refresh={vi.fn()} />);

    const button = screen.getByRole("button", { name: "Refreshing..." });
    expect((button as HTMLButtonElement).disabled).toBe(true);
  });
});
