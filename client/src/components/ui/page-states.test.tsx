import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Button } from "@/components/ui/button";
import {
  CardGridSkeleton,
  DashboardPageSkeleton,
  InlineLoading,
  SurfaceMessage,
  TableSurfaceSkeleton,
} from "./page-states";

describe("page state primitives", () => {
  it("renders a surface message with action content", () => {
    render(
      <SurfaceMessage
        title="Failed to load"
        description="Retry the request."
        tone="error"
        action={<Button>Retry</Button>}
      />,
    );

    expect(screen.getByText("Failed to load")).toBeTruthy();
    expect(screen.getByText("Retry the request.")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Retry" })).toBeTruthy();
  });

  it("renders inline loading feedback", () => {
    render(<InlineLoading label="Syncing data" />);

    expect(screen.getByText("Syncing data")).toBeTruthy();
  });

  it("renders dashboard and table skeleton containers without crashing", () => {
    const { container } = render(
      <div>
        <DashboardPageSkeleton />
        <CardGridSkeleton cards={2} />
        <TableSurfaceSkeleton rows={3} columns={4} />
      </div>,
    );

    expect(container.querySelectorAll(".animate-pulse").length).toBeGreaterThan(0);
  });
});
