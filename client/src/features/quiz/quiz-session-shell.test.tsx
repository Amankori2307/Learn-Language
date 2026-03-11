import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { QuizSessionFrame, QuizSessionHeader } from "./quiz-session-shell";

describe("quiz session shell", () => {
  it("renders progress and forwards exit actions", async () => {
    const user = userEvent.setup();
    const onExit = vi.fn();

    render(<QuizSessionHeader progress={65} onExit={onExit} />);

    await user.click(screen.getByRole("button"));

    expect(onExit).toHaveBeenCalledTimes(1);
    expect(document.querySelector('[style="width: 65%;"]')).toBeTruthy();
  });

  it("renders header and content inside the session frame", () => {
    render(
      <QuizSessionFrame header={<div>Header</div>}>
        <div>Question Card</div>
      </QuizSessionFrame>,
    );

    expect(screen.getByText("Header")).toBeTruthy();
    expect(screen.getByText("Question Card")).toBeTruthy();
  });
});
