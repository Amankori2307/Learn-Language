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
});
