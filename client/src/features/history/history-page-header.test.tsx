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

  it("keeps the refresh action mobile-safe with stacked responsive classes", () => {
    const { container } = render(<HistoryPageHeader isFetching={false} refresh={vi.fn()} />);

    expect(container.firstElementChild?.className.includes("flex-col")).toBe(true);
    expect(container.firstElementChild?.className.includes("sm:flex-row")).toBe(true);
    expect((screen.getByRole("button", { name: "Refresh" }) as HTMLButtonElement).className.includes("w-full")).toBe(
      true,
    );
  });
});
