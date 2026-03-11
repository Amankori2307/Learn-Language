import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { QuizDirectionEnum } from "@shared/domain/enums";
import { HistoryFilterPanel } from "./history-filter-panel";

describe("HistoryFilterPanel", () => {
  it("forwards search and filter changes through applyFilterReset", async () => {
    const user = userEvent.setup();
    const setSearch = vi.fn();
    const setResultFilter = vi.fn();
    const setDirectionFilter = vi.fn();
    const setSortBy = vi.fn();
    const applyFilterReset = vi.fn();

    render(
      <HistoryFilterPanel
        search=""
        setSearch={setSearch}
        resultFilter="all"
        setResultFilter={setResultFilter}
        directionFilter="all"
        setDirectionFilter={setDirectionFilter}
        sortBy="newest"
        setSortBy={setSortBy}
        applyFilterReset={applyFilterReset}
      />,
    );

    expect(screen.getByRole("option", { name: "Telugu -> English" })).toBeTruthy();
    expect(screen.getByRole("option", { name: "English -> Telugu" })).toBeTruthy();

    await user.type(screen.getByLabelText("Search"), "hello");
    await user.selectOptions(screen.getByLabelText("Result"), "wrong");
    await user.selectOptions(
      screen.getByLabelText("Direction"),
      QuizDirectionEnum.TARGET_TO_SOURCE,
    );
    await user.selectOptions(screen.getByLabelText("Sort"), "oldest");

    expect(applyFilterReset).toHaveBeenCalledWith(setSearch, "h");
    expect(applyFilterReset).toHaveBeenCalledWith(setResultFilter, "wrong");
    expect(applyFilterReset).toHaveBeenCalledWith(
      setDirectionFilter,
      QuizDirectionEnum.TARGET_TO_SOURCE,
    );
    expect(applyFilterReset).toHaveBeenCalledWith(setSortBy, "oldest");
  });
});
