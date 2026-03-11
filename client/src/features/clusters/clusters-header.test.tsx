import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import { ClustersHeader } from "./clusters-header";
import { ClustersFilterPanel } from "./clusters-filter-panel";

describe("clusters presentation", () => {
  it("renders summary metrics and top-cluster data", () => {
    render(
      <ClustersHeader
        isLoading={false}
        topCluster={{ name: "Travel Basics", wordCount: 14 }}
        totalWords={120}
        nonEmptyClusters={18}
        totalResults={9}
      />,
    );

    expect(screen.getByText("Cluster Practice")).toBeTruthy();
    expect(screen.getByText(/Travel Basics/)).toBeTruthy();
    expect(screen.getByText("120 linked words")).toBeTruthy();
    expect(screen.getByText("18 active clusters")).toBeTruthy();
  });

  it("forwards filter and sort changes", async () => {
    const user = userEvent.setup();
    const updateQuery = vi.fn();

    render(
      <ClustersFilterPanel
        query=""
        typeFilter="all"
        sortBy="words_desc"
        clusterTypes={["all", "topic"]}
        updateQuery={updateQuery}
      />,
    );

    await user.type(screen.getByLabelText("Search"), "travel");
    await user.selectOptions(screen.getByLabelText("Type"), "topic");
    await user.selectOptions(screen.getByLabelText("Sort"), "name_asc");

    expect(updateQuery).toHaveBeenCalledWith({ q: "t", page: 1 });
    expect(updateQuery).toHaveBeenCalledWith({ type: "topic", page: 1 });
    expect(updateQuery).toHaveBeenCalledWith({ sort: "name_asc", page: 1 });
  });
});
