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

vi.mock("@/hooks/use-hybrid-audio", () => ({
  useHybridAudio: () => ({
    activeKey: null,
    play: vi.fn(),
  }),
}));

describe("QuizCard", () => {
  it("resets selected option styling when question changes", async () => {
    const user = userEvent.setup();
    const onAnswer = vi.fn();
    const baseProps = {
      pronunciation: null,
      imageUrl: null,
      type: QuizQuestionTypeEnum.TARGET_TO_SOURCE,
      showConfidenceControl: false,
      confidenceLevel: 2 as const,
      onConfidenceChange: vi.fn(),
      onAnswer,
      isSubmitting: false,
      submitError: null,
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
        showConfidenceControl={false}
        confidenceLevel={2}
        onConfidenceChange={vi.fn()}
        onAnswer={onAnswer}
        isSubmitting={false}
        submitError={null}
        result={null}
        onNext={vi.fn()}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Option namaste" }));
    expect(onAnswer).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "Check Answer" }));
    expect(onAnswer).toHaveBeenCalledWith(1, 2);
  });

  it("keeps mobile answer and feedback actions in sticky safe-area footers", async () => {
    const user = userEvent.setup();
    const { container, rerender } = render(
      <QuizCard
        question="hello"
        pronunciation={null}
        imageUrl={null}
        type={QuizQuestionTypeEnum.TARGET_TO_SOURCE}
        options={[
          { id: 1, text: "namaste" },
          { id: 2, text: "dhanyavaadalu" },
        ]}
        showConfidenceControl={false}
        confidenceLevel={2}
        onConfidenceChange={vi.fn()}
        onAnswer={vi.fn()}
        isSubmitting={false}
        submitError={null}
        result={null}
        onNext={vi.fn()}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Option namaste" }));

    expect(container.innerHTML.includes("sticky bottom-0")).toBe(true);
    expect(container.innerHTML.includes("env(safe-area-inset-bottom)+0.5rem")).toBe(true);

    rerender(
      <QuizCard
        question="hello"
        pronunciation={null}
        imageUrl={null}
        type={QuizQuestionTypeEnum.SOURCE_TO_TARGET}
        options={[
          { id: 1, text: "hello" },
          { id: 2, text: "thanks" },
        ]}
        showConfidenceControl={false}
        confidenceLevel={2}
        onConfidenceChange={vi.fn()}
        onAnswer={vi.fn()}
        isSubmitting={false}
        submitError={null}
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
        onNext={vi.fn()}
      />,
    );

    expect(container.innerHTML.includes("bg-background/95")).toBe(true);
  });

  it("fills the session frame instead of recalculating mobile viewport height", () => {
    const { container } = render(
      <QuizCard
        question="hello"
        pronunciation={null}
        imageUrl={null}
        type={QuizQuestionTypeEnum.TARGET_TO_SOURCE}
        options={[
          { id: 1, text: "namaste" },
          { id: 2, text: "dhanyavaadalu" },
        ]}
        showConfidenceControl={false}
        confidenceLevel={2}
        onConfidenceChange={vi.fn()}
        onAnswer={vi.fn()}
        isSubmitting={false}
        submitError={null}
        result={null}
        onNext={vi.fn()}
      />,
    );

    expect(container.innerHTML.includes("h-[calc(100vh-5.5rem)]")).toBe(false);
    expect(container.innerHTML.includes("min-h-[calc(100vh-5.5rem)]")).toBe(false);
    expect(container.innerHTML.includes("flex h-full min-h-0 w-full")).toBe(true);
    expect(container.innerHTML.includes("md:max-h-[var(--pane-quiz-session-max-height)]")).toBe(true);
    expect(container.innerHTML.includes("min-h-14")).toBe(true);
    expect(container.innerHTML.includes("overflow-hidden")).toBe(true);
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
        showConfidenceControl={false}
        confidenceLevel={2}
        onConfidenceChange={vi.fn()}
        onAnswer={vi.fn()}
        isSubmitting={false}
        submitError={null}
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
        showConfidenceControl={false}
        confidenceLevel={2}
        onConfidenceChange={vi.fn()}
        onAnswer={vi.fn()}
        isSubmitting={false}
        submitError={null}
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
        showConfidenceControl={false}
        confidenceLevel={2}
        onConfidenceChange={vi.fn()}
        onAnswer={vi.fn()}
        isSubmitting={false}
        submitError={null}
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

  it("shows confidence controls only when the preference is enabled", async () => {
    const user = userEvent.setup();
    const onAnswer = vi.fn();
    const onConfidenceChange = vi.fn();

    const { rerender } = render(
      <QuizCard
        question="hello"
        pronunciation={null}
        imageUrl={null}
        type={QuizQuestionTypeEnum.TARGET_TO_SOURCE}
        options={[
          { id: 1, text: "namaste" },
          { id: 2, text: "dhanyavaadalu" },
        ]}
        showConfidenceControl={false}
        confidenceLevel={2}
        onConfidenceChange={onConfidenceChange}
        onAnswer={onAnswer}
        isSubmitting={false}
        submitError={null}
        result={null}
        onNext={vi.fn()}
      />,
    );

    expect(screen.queryByLabelText("Answer confidence")).toBeNull();

    rerender(
      <QuizCard
        question="hello"
        pronunciation={null}
        imageUrl={null}
        type={QuizQuestionTypeEnum.TARGET_TO_SOURCE}
        options={[
          { id: 1, text: "namaste" },
          { id: 2, text: "dhanyavaadalu" },
        ]}
        showConfidenceControl
        confidenceLevel={3}
        onConfidenceChange={onConfidenceChange}
        onAnswer={onAnswer}
        isSubmitting={false}
        submitError={null}
        result={null}
        onNext={vi.fn()}
      />,
    );

    expect(screen.getByLabelText("Answer confidence")).toBeTruthy();

    await user.click(screen.getByText("Low"));
    expect(onConfidenceChange).toHaveBeenCalledWith(1);

    await user.click(screen.getByRole("button", { name: "Option namaste" }));
    await user.click(screen.getByRole("button", { name: "Check Answer" }));
    expect(onAnswer).toHaveBeenCalledWith(1, 3);
  });

  it("shows inline submit error messaging when answer submission fails", () => {
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
        showConfidenceControl={false}
        confidenceLevel={2}
        onConfidenceChange={vi.fn()}
        onAnswer={vi.fn()}
        isSubmitting={false}
        submitError="Could not submit your answer. Please try again."
        result={null}
        onNext={vi.fn()}
      />,
    );

    expect(screen.getByText("Could not submit your answer. Please try again.")).toBeTruthy();
  });

  it("keeps pronunciation prominent for source-to-target prompts", () => {
    render(
      <QuizCard
        question="వాళ్లు"
        pronunciation="vaallu"
        imageUrl={null}
        type={QuizQuestionTypeEnum.SOURCE_TO_TARGET}
        options={[
          { id: 1, text: "they" },
          { id: 2, text: "we (inclusive)" },
        ]}
        showConfidenceControl={false}
        confidenceLevel={2}
        onConfidenceChange={vi.fn()}
        onAnswer={vi.fn()}
        isSubmitting={false}
        submitError={null}
        result={null}
        onNext={vi.fn()}
      />,
    );

    expect(screen.getByText("వాళ్లు").className.includes("md:text-[3.25rem]")).toBe(true);
    expect(screen.getByText("vaallu").className.includes("md:text-3xl")).toBe(true);
    expect(screen.getByText("vaallu").className.includes("text-foreground/80")).toBe(true);
  });
});
