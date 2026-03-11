import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ReviewStatusEnum } from "@shared/domain/enums";
import { ReviewBulkActions } from "./review-bulk-actions";

describe("ReviewBulkActions", () => {
  it("forwards notes and bulk action handlers", async () => {
    const user = userEvent.setup();
    const setNotes = vi.fn();
    const runBulk = vi.fn();
    const clearSelection = vi.fn();

    render(
      <ReviewBulkActions
        notes=""
        setNotes={setNotes}
        selectedCount={2}
        runBulk={runBulk}
        clearSelection={clearSelection}
        isBulkPending={false}
      />,
    );

    await user.type(screen.getByLabelText("Review Notes (applied to bulk action)"), "ok");
    await user.click(screen.getByRole("button", { name: "Bulk Approve" }));
    await user.click(screen.getByRole("button", { name: "Bulk Reject" }));
    await user.click(screen.getByRole("button", { name: "Clear Selection" }));

    expect(setNotes).toHaveBeenCalled();
    expect(runBulk).toHaveBeenNthCalledWith(1, ReviewStatusEnum.APPROVED);
    expect(runBulk).toHaveBeenNthCalledWith(2, ReviewStatusEnum.REJECTED);
    expect(clearSelection).toHaveBeenCalledTimes(1);
  });

  it("disables actions when no selection exists", () => {
    render(
      <ReviewBulkActions
        notes=""
        setNotes={vi.fn()}
        selectedCount={0}
        runBulk={vi.fn()}
        clearSelection={vi.fn()}
        isBulkPending={false}
      />,
    );

    expect((screen.getByRole("button", { name: "Bulk Approve" }) as HTMLButtonElement).disabled).toBe(
      true,
    );
    expect((screen.getByRole("button", { name: "Bulk Reject" }) as HTMLButtonElement).disabled).toBe(
      true,
    );
  });

  it("keeps bulk actions full width on mobile and auto width on larger screens", () => {
    render(
      <ReviewBulkActions
        notes=""
        setNotes={vi.fn()}
        selectedCount={1}
        runBulk={vi.fn()}
        clearSelection={vi.fn()}
        isBulkPending={false}
      />,
    );

    expect((screen.getByRole("button", { name: "Bulk Approve" }) as HTMLButtonElement).className.includes("w-full")).toBe(
      true,
    );
    expect((screen.getByRole("button", { name: "Bulk Reject" }) as HTMLButtonElement).className.includes("sm:w-auto")).toBe(
      true,
    );
    expect((screen.getByRole("button", { name: "Clear Selection" }) as HTMLButtonElement).className.includes("w-full")).toBe(
      true,
    );
  });
});
