import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { QuizQuestionTypeEnum } from "@shared/domain/enums";
import { QuizCard } from "./quiz-card";

vi.mock("@/hooks/use-feedback-effects", () => ({
  useFeedbackEffects: () => ({
    enabled: false,
    toggle: vi.fn(),
  }),
}));

vi.mock("@/lib/feedback-effects", () => ({
  runSuccessEffects: vi.fn(),
  runErrorEffects: vi.fn(),
}));

describe("QuizCard", () => {
  it("resets selected option styling when question changes", async () => {
    const user = userEvent.setup();
    const baseProps = {
      pronunciation: null,
      imageUrl: null,
      type: QuizQuestionTypeEnum.TARGET_TO_SOURCE,
      confidenceLevel: 2 as const,
      onConfidenceChange: vi.fn(),
      onAnswer: vi.fn(),
      isSubmitting: false,
      result: null,
      onNext: vi.fn(),
    };

    const { rerender } = render(
      <QuizCard
        {...baseProps}
        question="hello"
        options={[
          { id: 1, text: "namaste" },
          { id: 2, text: "dhanyavaadalu" },
        ]}
      />,
    );

    const selectedButton = screen.getByRole("button", { name: "Option namaste" });
    await user.click(selectedButton);
    expect(selectedButton.className.includes("ring-primary")).toBe(true);

    rerender(
      <QuizCard
        {...baseProps}
        question="good night"
        options={[
          { id: 1, text: "shubharaatri" },
          { id: 2, text: "shubhodayam" },
        ]}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText("good night")).toBeTruthy();
    });
    const firstNewOption = screen.getByRole("button", { name: "Option shubharaatri" });
    expect(firstNewOption.className.includes("ring-primary")).toBe(false);
  });
});
