import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { LanguageEnum, QuizQuestionTypeEnum } from "@shared/domain/enums";
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
    const onAnswer = vi.fn();
    const baseProps = {
      pronunciation: null,
      imageUrl: null,
      type: QuizQuestionTypeEnum.TARGET_TO_SOURCE,
      confidenceLevel: 2 as const,
      onConfidenceChange: vi.fn(),
      onAnswer,
      isSubmitting: false,
      result: null,
      onNext: vi.fn(),
    };

    const { rerender } = render(
      <QuizCard
        {...baseProps}
        language={LanguageEnum.TELUGU}
        question="hello"
        options={[
          { id: 1, text: "namaste" },
          { id: 2, text: "dhanyavaadalu" },
        ]}
      />,
    );

    const selectedButton = screen.getByRole("button", { name: "Option namaste" });
    await user.click(selectedButton);
    expect(selectedButton.className.includes("bg-primary/8")).toBe(true);
    expect(onAnswer).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Check Answer" })).toBeTruthy();

    rerender(
      <QuizCard
        {...baseProps}
        language={LanguageEnum.TELUGU}
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
    expect(firstNewOption.className.includes("bg-primary/8")).toBe(false);
  });

  it("submits only after explicit confirmation", async () => {
    const user = userEvent.setup();
    const onAnswer = vi.fn();

    render(
      <QuizCard
        question="hello"
        pronunciation={null}
        imageUrl={null}
        type={QuizQuestionTypeEnum.TARGET_TO_SOURCE}
        options={[
          { id: 1, text: "namaste" },
          { id: 2, text: "dhanyavaadalu" },
        ]}
        confidenceLevel={2}
        onConfidenceChange={vi.fn()}
        onAnswer={onAnswer}
        isSubmitting={false}
        result={null}
        onNext={vi.fn()}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Option namaste" }));
    expect(onAnswer).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "Check Answer" }));
    expect(onAnswer).toHaveBeenCalledWith(1, 2);
  });

  it("supports arrow-key option navigation", async () => {
    const user = userEvent.setup();

    render(
      <QuizCard
        question="hello"
        pronunciation={null}
        imageUrl={null}
        type={QuizQuestionTypeEnum.TARGET_TO_SOURCE}
        options={[
          { id: 1, text: "namaste" },
          { id: 2, text: "dhanyavaadalu" },
          { id: 3, text: "shubharaatri" },
        ]}
        confidenceLevel={2}
        onConfidenceChange={vi.fn()}
        onAnswer={vi.fn()}
        isSubmitting={false}
        result={null}
        onNext={vi.fn()}
      />,
    );

    const firstOption = screen.getByRole("button", { name: "Option namaste" });
    const secondOption = screen.getByRole("button", { name: "Option dhanyavaadalu" });

    expect(firstOption.className.includes("bg-primary/8")).toBe(false);

    await user.keyboard("{ArrowDown}");
    await waitFor(() => {
      expect(firstOption.className.includes("bg-primary/8")).toBe(true);
    });

    await user.keyboard("{ArrowDown}");
    await waitFor(() => {
      expect(secondOption.className.includes("bg-primary/8")).toBe(true);
    });
    expect(firstOption.className.includes("bg-primary/8")).toBe(false);

    await user.keyboard("{ArrowUp}");
    await waitFor(() => {
      expect(firstOption.className.includes("bg-primary/8")).toBe(true);
    });
  });

  it("focuses continue on feedback so enter advances", async () => {
    const user = userEvent.setup();
    const onNext = vi.fn();

    render(
      <QuizCard
        question="hello"
        pronunciation={null}
        imageUrl={null}
        type={QuizQuestionTypeEnum.SOURCE_TO_TARGET}
        options={[
          { id: 1, text: "hello" },
          { id: 2, text: "thanks" },
        ]}
        confidenceLevel={2}
        onConfidenceChange={vi.fn()}
        onAnswer={vi.fn()}
        isSubmitting={false}
        result={{
          isCorrect: true,
          correctAnswer: {
            id: 1,
            originalScript: "నమస్తే",
            english: "hello",
            transliteration: "namaste",
            exampleSentences: [],
          },
          examples: [],
        }}
        onNext={onNext}
      />,
    );

    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Continue" }));
    await user.keyboard("{Enter}");
    expect(onNext).toHaveBeenCalledTimes(1);
  });

  it("renders multiple feedback examples after answer evaluation", () => {
    const { container } = render(
      <QuizCard
        question="hello"
        pronunciation={null}
        imageUrl={null}
        type={QuizQuestionTypeEnum.SOURCE_TO_TARGET}
        options={[
          { id: 1, text: "hello" },
          { id: 2, text: "thanks" },
        ]}
        confidenceLevel={2}
        onConfidenceChange={vi.fn()}
        onAnswer={vi.fn()}
        isSubmitting={false}
        result={{
          isCorrect: true,
          correctAnswer: {
            id: 1,
            originalScript: "నమస్తే",
            english: "hello",
            transliteration: "namaste",
            exampleSentences: [],
          },
          examples: [
            {
              originalScript: "నమస్తే, మీరు ఎలా ఉన్నారు?",
              pronunciation: "namaste, meeru ela unnaru?",
              meaning: "Hello, how are you?",
            },
            {
              originalScript: "అందరికీ నమస్తే.",
              pronunciation: "andariki namaste.",
              meaning: "Hello everyone.",
            },
          ],
        }}
        onNext={vi.fn()}
      />,
    );

    expect(screen.queryByText("How confident are you?")).toBeNull();
    expect(screen.getByText("Examples")).toBeTruthy();
    expect(screen.getByText("Hello, how are you?")).toBeTruthy();
    expect(screen.getByText("Hello everyone.")).toBeTruthy();
    expect(container.innerHTML.includes("border-transparent")).toBe(true);
    expect(container.innerHTML.includes("bg-transparent")).toBe(true);
    expect(container.innerHTML.includes("shadow-none")).toBe(true);
    expect(container.innerHTML.includes("md:border")).toBe(true);
    expect(container.innerHTML.includes("md:border-border/50")).toBe(true);
    expect(container.innerHTML.includes("md:bg-card/95")).toBe(true);
    expect(container.innerHTML.includes("md:shadow-2xl")).toBe(true);
  });
});
