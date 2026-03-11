import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { LeaderboardHeader } from "./leaderboard-header";

describe("LeaderboardHeader", () => {
  it("renders window controls and forwards selection", async () => {
    const user = userEvent.setup();
    const setWindow = vi.fn();

    render(
      <LeaderboardHeader
        window="daily"
        setWindow={setWindow}
        isFetching={false}
        options={[
          { key: "daily", label: "Daily" },
          { key: "weekly", label: "Weekly" },
        ]}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Weekly" }));

    expect(screen.getByText("Leaderboard")).toBeTruthy();
    expect(setWindow).toHaveBeenCalledWith("weekly");
  });

  it("keeps leaderboard window controls responsive", () => {
    const { container } = render(
      <LeaderboardHeader
        window="daily"
        setWindow={vi.fn()}
        isFetching={false}
        options={[
          { key: "daily", label: "Daily" },
          { key: "weekly", label: "Weekly" },
        ]}
      />,
    );

    expect(container.firstElementChild?.className.includes("flex-col")).toBe(true);
    expect(container.firstElementChild?.className.includes("md:flex-row")).toBe(true);
    expect((screen.getByRole("button", { name: "Daily" }) as HTMLButtonElement).className.includes("w-full")).toBe(
      true,
    );
  });
});
